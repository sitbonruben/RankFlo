import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
});
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  logoUrl: z.string().url().nullable().optional(),
  settings: z.record(z.unknown()).optional(),
});
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR", "VIEWER"]),
  teamId: z.string().min(1).optional(),
});
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});
export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  description: z.string().max(500).optional(),
});
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).min(1),
  expiresAt: z.coerce.date().optional(),
});
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
