import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import type { SessionData } from "@rankflo/auth";
import type { PrismaClient } from "@rankflo/db";

export interface Context {
  db: PrismaClient;
  session: SessionData | null;
  headers: Headers;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

// Auth middleware
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuth);

// Org-scoped middleware
const enforceOrg = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (!ctx.session.membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No organization membership",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      organizationId: ctx.session.membership.organizationId,
      role: ctx.session.membership.role,
    },
  });
});

export const orgProcedure = t.procedure.use(enforceAuth).use(enforceOrg);
