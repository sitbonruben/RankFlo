import { TRPCError } from "@trpc/server";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";

import {
  signUpSchema,
  signInSchema,
  updateUserSchema,
} from "@rankflo/core/validators";
import {
  hashPassword,
  verifyPassword,
  createSession,
  invalidateSession,
} from "@rankflo/auth";
import { PLAN_MONTHLY_CREDITS } from "@rankflo/core/constants";
import { sendEmail } from "@rankflo/email";

import { router, publicProcedure, protectedProcedure } from "../trpc";

const RESET_SECRET = process.env.SESSION_SECRET ?? process.env.SECRET_KEY ?? "rankflo-reset-secret";
const RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function makeResetToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + RESET_EXPIRY_MS })).toString("base64url");
  const sig = createHmac("sha256", RESET_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyResetToken(token: string): { email: string } {
  const parts = token.split(".");
  if (parts.length !== 2) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid reset token" });
  const [payload, sig] = parts as [string, string];
  const expected = createHmac("sha256", RESET_SECRET).update(payload).digest("base64url");
  const sigBuf = Buffer.from(sig, "base64url");
  const expBuf = Buffer.from(expected, "base64url");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid reset token" });
  }
  let data: { email: string; exp: number };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid reset token" });
  }
  if (Date.now() > data.exp) throw new TRPCError({ code: "BAD_REQUEST", message: "Reset link has expired" });
  return { email: data.email };
}

/** Turn a name/email into a URL-safe slug with a random suffix to avoid collisions */
function makeSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "org";
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export const userRouter = router({
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already in use",
        });
      }

      // Create user + personal organization + admin membership in one transaction
      const freeCredits = PLAN_MONTHLY_CREDITS["FREE"] ?? 10;
      const orgName = `${input.name}'s workspace`;
      const slug = makeSlug(input.name);

      const user = await ctx.db.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: input.email,
            name: input.name,
            passwordHash: hashPassword(input.password),
          },
        });

        const org = await tx.organization.create({
          data: {
            name: orgName,
            slug,
            plan: "FREE",
            aiCreditsBalance: freeCredits,
          },
        });

        await tx.membership.create({
          data: {
            userId: newUser.id,
            organizationId: org.id,
            role: "ADMIN",
          },
        });

        // Seed the credit ledger with the initial free grant
        await tx.creditLedger.create({
          data: {
            organizationId: org.id,
            type: "MONTHLY_GRANT",
            amount: freeCredits,
            balance: freeCredits,
            description: `Free plan starting credits (${freeCredits})`,
          },
        });

        return newUser;
      });

      const ipAddress = ctx.headers.get("x-forwarded-for") ?? undefined;
      const userAgent = ctx.headers.get("user-agent") ?? undefined;
      const { token, session } = await createSession(
        user.id,
        ipAddress,
        userAgent,
      );

      return { token, session };
    }),

  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      if (user.deletedAt) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Account disabled",
        });
      }

      const valid = verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const ipAddress = ctx.headers.get("x-forwarded-for") ?? undefined;
      const userAgent = ctx.headers.get("user-agent") ?? undefined;
      const { token, session } = await createSession(
        user.id,
        ipAddress,
        userAgent,
      );

      return { token, session };
    }),

  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    await invalidateSession(ctx.session.id);
    return { success: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        locale: true,
        createdAt: true,
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                plan: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return user;
  }),

  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          locale: true,
        },
      });

      return user;
    }),

  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      // Always return success to prevent email enumeration
      const user = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (!user || user.deletedAt) return { success: true };

      const token = makeResetToken(input.email);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.rankflo.io";
      const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

      await sendEmail({
        to: input.email,
        subject: "Reset your RankFlo password",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
            <div style="padding:32px 24px;background:#000;color:#fff">
              <h1 style="margin:0;font-size:22px"><span style="color:#39FF14">RankFlo</span></h1>
            </div>
            <div style="padding:32px 24px;background:#fff;color:#09090B">
              <h2 style="margin:0 0 12px;font-size:20px">Reset your password</h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#52525B">
                Hi ${user.name ?? "there"}, we received a request to reset your password.
                Click the button below — the link expires in 1 hour.
              </p>
              <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#000;color:#39FF14;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">
                Reset password
              </a>
              <p style="margin:24px 0 0;font-size:13px;color:#A1A1AA">
                If you didn't request this, ignore this email — your password won't change.
              </p>
            </div>
          </div>
        `,
      });

      return { success: true };
    }),

  resetPassword: publicProcedure
    .input(z.object({ token: z.string(), password: z.string().min(8, "Password must be at least 8 characters") }))
    .mutation(async ({ ctx, input }) => {
      const { email } = verifyResetToken(input.token);

      const user = await ctx.db.user.findUnique({ where: { email } });
      if (!user || user.deletedAt) throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });

      await ctx.db.user.update({
        where: { email },
        data: { passwordHash: hashPassword(input.password) },
      });

      return { success: true };
    }),
});
