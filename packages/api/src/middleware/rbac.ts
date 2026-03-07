import { TRPCError } from "@trpc/server";
import { experimental_standaloneMiddleware } from "@trpc/server";

import { hasPermission, type Permission, type Role } from "@rankflo/auth";

import type { Context } from "../trpc";

export function requirePermission(permission: Permission) {
  return experimental_standaloneMiddleware<{
    ctx: Context & {
      session: NonNullable<Context["session"]>;
      organizationId: string;
      role: Role;
    };
  }>().create(({ ctx, next }) => {
    if (!hasPermission(ctx.role, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Missing permission: ${permission}`,
      });
    }
    return next({ ctx });
  });
}

export function requireRole(minimumRole: Role) {
  const hierarchy: Record<Role, number> = {
    ADMIN: 100,
    EDITOR: 75,
    AUTHOR: 50,
    VIEWER: 25,
  };

  return experimental_standaloneMiddleware<{
    ctx: Context & {
      session: NonNullable<Context["session"]>;
      role: Role;
    };
  }>().create(({ ctx, next }) => {
    if (hierarchy[ctx.role] < hierarchy[minimumRole]) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Requires at least ${minimumRole} role`,
      });
    }
    return next({ ctx });
  });
}
