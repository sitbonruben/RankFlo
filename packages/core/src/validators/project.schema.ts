import { z } from "zod";
import { PAGINATION } from "../constants/limits";

export const platformSchema = z.enum([
  "NEXTJS", "REACT", "VUE", "ANGULAR", "SVELTE",
  "SHOPIFY", "WIX", "WORDPRESS", "SQUARESPACE", "WEBFLOW",
  "HUGO", "GATSBY", "ASTRO", "REMIX", "NUXT", "CUSTOM",
]);
export type PlatformInput = z.infer<typeof platformSchema>;

export const projectStatusSchema = z.enum(["SETUP", "ACTIVE", "PAUSED", "ARCHIVED"]);

export const integrationTypeSchema = z.enum([
  "GITHUB", "GITLAB", "BITBUCKET",
  "SHOPIFY_API", "WIX_API", "WORDPRESS_API", "WEBFLOW_API",
  "REST_API", "GRAPHQL_API", "SDK",
]);

export const contentFormatSchema = z.enum(["MARKDOWN", "MDX", "HTML", "JSON"]);

export const brandColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string().optional(),
  accent: z.string().optional(),
  background: z.string(),
  surface: z.string().optional(),
  text: z.string(),
  muted: z.string().optional(),
});

export const brandFontsSchema = z.object({
  heading: z.object({ family: z.string(), weight: z.string().optional() }).optional(),
  body: z.object({ family: z.string(), weight: z.string().optional() }).optional(),
  mono: z.object({ family: z.string() }).optional(),
});

export const brandStyleSchema = z.object({
  borderRadius: z.string().optional(),
  spacing: z.string().optional(),
  shadowStyle: z.enum(["none", "subtle", "medium", "dramatic"]).optional(),
  layoutStyle: z.enum(["minimal", "classic", "modern", "bold"]).optional(),
});

export const integrationConfigSchema = z.object({
  // Git
  repoOwner: z.string().optional(),
  repoName: z.string().optional(),
  branch: z.string().optional(),
  accessToken: z.string().optional(),
  webhookSecret: z.string().optional(),
  // Shopify
  shopDomain: z.string().optional(),
  shopifyAccessToken: z.string().optional(),
  blogId: z.string().optional(),
  // WordPress
  wpUrl: z.string().optional(),
  wpUsername: z.string().optional(),
  wpAppPassword: z.string().optional(),
  // Wix
  wixSiteId: z.string().optional(),
  wixApiKey: z.string().optional(),
  // Webflow
  webflowSiteId: z.string().optional(),
  webflowCollectionId: z.string().optional(),
  webflowApiToken: z.string().optional(),
  // Custom API
  apiEndpoint: z.string().url().optional(),
  apiToken: z.string().optional(),
  apiHeaders: z.record(z.string()).optional(),
  // SDK
  sdkKey: z.string().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  url: z.string().url().optional(),
  platform: platformSchema.default("CUSTOM"),
  integrationType: integrationTypeSchema.optional(),
  integrationConfig: integrationConfigSchema.optional(),
  contentDir: z.string().max(200).optional(),
  contentFormat: contentFormatSchema.default("MARKDOWN"),
  brandColors: brandColorsSchema.optional(),
  brandFonts: brandFontsSchema.optional(),
  brandLogo: z.string().url().optional(),
  brandStyle: brandStyleSchema.optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  url: z.string().url().nullable().optional(),
  platform: platformSchema.optional(),
  status: projectStatusSchema.optional(),
  integrationType: integrationTypeSchema.nullable().optional(),
  integrationConfig: integrationConfigSchema.nullable().optional(),
  contentDir: z.string().max(200).nullable().optional(),
  contentFormat: contentFormatSchema.optional(),
  brandColors: brandColorsSchema.nullable().optional(),
  brandFonts: brandFontsSchema.nullable().optional(),
  brandLogo: z.string().url().nullable().optional(),
  brandStyle: brandStyleSchema.nullable().optional(),
});
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const listProjectsSchema = z.object({
  status: projectStatusSchema.optional(),
  platform: platformSchema.optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(PAGINATION.maxPageSize).default(PAGINATION.defaultPageSize),
  sort: z.enum(["newest", "oldest", "name", "most-posts", "most-views"]).default("newest"),
});
export type ListProjectsInput = z.infer<typeof listProjectsSchema>;

export const getProjectSchema = z.object({
  id: z.string().cuid(),
});
export type GetProjectInput = z.infer<typeof getProjectSchema>;

export const deleteProjectSchema = z.object({
  id: z.string().cuid(),
});
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;

export const deployToProjectSchema = z.object({
  projectId: z.string().cuid(),
  postIds: z.array(z.string().cuid()).min(1).max(50),
});
export type DeployToProjectInput = z.infer<typeof deployToProjectSchema>;

export const listDeploymentsSchema = z.object({
  projectId: z.string().cuid(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(50).default(20),
});
export type ListDeploymentsInput = z.infer<typeof listDeploymentsSchema>;
