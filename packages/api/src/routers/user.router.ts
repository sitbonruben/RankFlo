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

import { router, publicProcedure, protectedProcedure } from "../trpc";

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

      const user = await ctx.db.user.create({
        data: {
          email: input.email,
          name: input.name,
          passwordHash: hashPassword(input.password),
        },
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
