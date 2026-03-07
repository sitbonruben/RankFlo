export const ROLES = {
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
  AUTHOR: "AUTHOR",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 100,
  EDITOR: 75,
  AUTHOR: 50,
  VIEWER: 25,
};

export const PERMISSIONS = {
  ADMIN: ["*"],
  EDITOR: [
    "post:create",
    "post:read",
    "post:update",
    "post:delete",
    "post:publish",
    "page:create",
    "page:read",
    "page:update",
    "page:delete",
    "page:publish",
    "media:upload",
    "media:read",
    "media:delete",
    "comment:read",
    "comment:moderate",
    "tag:create",
    "tag:read",
    "tag:update",
    "tag:delete",
    "analytics:read",
    "search:read",
    "seo:read",
    "seo:update",
  ],
  AUTHOR: [
    "post:create",
    "post:read",
    "post:update:own",
    "post:delete:own",
    "media:upload",
    "media:read",
    "comment:read",
    "comment:moderate:own",
    "tag:read",
    "analytics:read:own",
    "seo:read",
  ],
  VIEWER: [
    "post:read",
    "page:read",
    "media:read",
    "analytics:read",
    "search:read",
  ],
} as const;

export type Permission = string;

export function hasPermission(
  role: Role,
  permission: Permission,
): boolean {
  const perms = PERMISSIONS[role];
  if (perms.includes("*")) return true;
  if (perms.includes(permission as never)) return true;

  const basePermission = permission.replace(":own", "");
  return perms.includes(basePermission as never);
}

export function isRoleAtLeast(role: Role, minimumRole: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole];
}
