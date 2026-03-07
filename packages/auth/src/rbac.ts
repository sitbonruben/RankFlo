import { hasPermission, type Role, type Permission } from "@rankflo/core/constants";

export { hasPermission, type Role, type Permission };

export function requireRole(userRole: Role, minimumRole: Role): boolean {
  const hierarchy: Record<Role, number> = {
    ADMIN: 100,
    EDITOR: 75,
    AUTHOR: 50,
    VIEWER: 25,
  };
  return hierarchy[userRole] >= hierarchy[minimumRole];
}

export function checkOwnership(
  userRole: Role,
  permission: Permission,
  userId: string,
  entityOwnerId: string,
): boolean {
  // Admins and editors can access anything
  if (requireRole(userRole, "EDITOR")) {
    return hasPermission(userRole, permission);
  }

  // For :own permissions, check ownership
  if (permission.includes(":own") || hasPermission(userRole, `${permission}:own`)) {
    return userId === entityOwnerId;
  }

  return hasPermission(userRole, permission);
}
