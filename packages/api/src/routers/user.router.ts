import { TRPCError } from "@trpc/server";
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

import { router, publicProcedure, protectedProcedure } from "../trpc";

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
});
