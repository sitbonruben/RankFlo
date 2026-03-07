import { z } from "zod";

// ─── Connection Config per Integration Type ─────────────────────

/** Configuration for Git-based integrations (GitHub, GitLab, Bitbucket). */
export interface GitConfig {
  provider: "github" | "gitlab" | "bitbucket";
  owner: string;
  repo: string;
  branch: string;
  token: string;
  contentDir: string;
  format: "markdown" | "mdx" | "html" | "json";
}

/** Configuration for Shopify Admin API integration. */
export interface ShopifyConfig {
  shop: string;
  accessToken: string;
  apiVersion: string;
}

/** Configuration for WordPress REST API integration. */
export interface WordPressConfig {
  siteUrl: string;
  username: string;
  applicationPassword: string;
}

/** Configuration for Webflow CMS API integration. */
export interface WebflowConfig {
  siteId: string;
  collectionId: string;
  token: string;
}

/** Configuration for Wix Blog API integration. */
export interface WixConfig {
  siteId: string;
  apiKey: string;
}

/** Configuration for a generic REST API integration. */
export interface RestApiConfig {
  baseUrl: string;
  authType: "bearer" | "api-key" | "basic" | "none";
  authToken?: string;
  apiKeyHeader?: string;
  apiKeyValue?: string;
  username?: string;
  password?: string;
  endpoints: {
    list: string;
    get: string;
    create: string;
    update: string;
    delete: string;
  };
}

/** Configuration for a generic GraphQL API integration. */
export interface GraphQLConfig {
  endpoint: string;
  authType: "bearer" | "api-key" | "none";
  authToken?: string;
  headers?: Record<string, string>;
}

/**
 * Discriminated union of all supported integration configurations.
 * The `type` field aligns with the IntegrationType enum in the Prisma schema.
 */
export type IntegrationConfig =
  | { type: "GITHUB" | "GITLAB" | "BITBUCKET"; config: GitConfig }
  | { type: "SHOPIFY_API"; config: ShopifyConfig }
  | { type: "WORDPRESS_API"; config: WordPressConfig }
  | { type: "WEBFLOW_API"; config: WebflowConfig }
  | { type: "WIX_API"; config: WixConfig }
  | { type: "REST_API"; config: RestApiConfig }
  | { type: "GRAPHQL_API"; config: GraphQLConfig }
  | { type: "SDK"; config: Record<string, never> };

// ─── Content Item (universal content model) ─────────────────────

/** A universal content item that all connectors normalize their data into. */
export interface ContentItem {
  /** ID in the external system (file path, post ID, article ID, etc.) */
  externalId: string;
  title: string;
  slug: string;
  /** Raw content (markdown, HTML, JSON string, etc.) */
  content: string;
  /** Rendered HTML if available */
  contentHtml?: string;
  format: "markdown" | "mdx" | "html" | "json";
  status: "draft" | "published" | "scheduled";
  author?: string;
  tags?: string[];
  featuredImage?: string;
  excerpt?: string;
  publishedAt?: Date;
  updatedAt?: Date;
  /** Arbitrary additional metadata from the source system */
  metadata?: Record<string, unknown>;
}

// ─── Deploy Result ──────────────────────────────────────────────

/** The result of a deployment operation. */
export interface DeployResult {
  success: boolean;
  url?: string;
  commitSha?: string;
  commitUrl?: string;
  deployedItems: number;
  error?: string;
  details?: string;
}

// ─── Project Detection ──────────────────────────────────────────

/** Information about a detected project and its content setup. */
export interface ProjectInfo {
  name: string;
  description?: string;
  url?: string;
  /** Detected framework: "nextjs", "gatsby", "hugo", "jekyll", "astro", etc. */
  framework?: string;
  /** Primary language: "typescript", "javascript", "ruby", "go", etc. */
  language?: string;
  /** Detected content directory path */
  contentDir?: string;
  hasExistingContent: boolean;
  contentCount: number;
  detectedFormat?: "markdown" | "mdx" | "html" | "json";
}

// ─── Brand Profile ──────────────────────────────────────────────

/** Color palette extracted from a website. */
export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

/** Typography settings extracted from a website. */
export interface BrandFonts {
  heading: string;
  body: string;
  mono?: string;
  headingWeight: string;
  bodyWeight: string;
}

/** Complete brand profile extracted from a website. */
export interface BrandProfile {
  colors: BrandColors;
  fonts: BrandFonts;
  /** Descriptive tone keywords, e.g. ["professional", "friendly", "technical"] */
  tone: string[];
  industry?: string;
  logoUrl?: string;
  faviconUrl?: string;
  siteName?: string;
  tagline?: string;
}

// ─── Connector Interface ────────────────────────────────────────

/** Options for listing content from a connector. */
export interface ListContentOptions {
  status?: string;
  limit?: number;
  offset?: number;
}

/**
 * The universal connector interface that every integration must implement.
 * Provides a consistent API for connecting to any content platform.
 */
export interface Connector {
  readonly type: string;

  // Lifecycle
  /** Establish a connection to the external service. Validates credentials. */
  connect(): Promise<void>;
  /** Test whether the connection is alive and credentials are valid. */
  testConnection(): Promise<{ ok: boolean; error?: string }>;
  /** Tear down the connection and clean up any resources. */
  disconnect(): Promise<void>;

  // Project info
  /** Detect project details: framework, language, content directory, etc. */
  getProjectInfo(): Promise<ProjectInfo>;

  // Content CRUD
  /** List content items from the external system. */
  listContent(options?: ListContentOptions): Promise<ContentItem[]>;
  /** Retrieve a single content item by its external ID. */
  getContent(externalId: string): Promise<ContentItem | null>;
  /** Create a new content item in the external system. */
  createContent(item: Omit<ContentItem, "externalId">): Promise<ContentItem>;
  /** Update an existing content item. */
  updateContent(
    externalId: string,
    updates: Partial<Omit<ContentItem, "externalId">>,
  ): Promise<ContentItem>;
  /** Delete a content item from the external system. */
  deleteContent(externalId: string): Promise<boolean>;

  // Deployment
  /** Deploy one or more content items atomically. */
  deploy(items: ContentItem[]): Promise<DeployResult>;
}

// ─── Zod Schemas (for runtime validation) ───────────────────────

export const gitConfigSchema = z.object({
  provider: z.enum(["github", "gitlab", "bitbucket"]),
  owner: z.string().min(1),
  repo: z.string().min(1),
  branch: z.string().min(1),
  token: z.string().min(1),
  contentDir: z.string().min(1),
  format: z.enum(["markdown", "mdx", "html", "json"]),
});

export const shopifyConfigSchema = z.object({
  shop: z.string().min(1),
  accessToken: z.string().min(1),
  apiVersion: z.string().min(1),
});

export const wordpressConfigSchema = z.object({
  siteUrl: z.string().url(),
  username: z.string().min(1),
  applicationPassword: z.string().min(1),
});

export const webflowConfigSchema = z.object({
  siteId: z.string().min(1),
  collectionId: z.string().min(1),
  token: z.string().min(1),
});

export const wixConfigSchema = z.object({
  siteId: z.string().min(1),
  apiKey: z.string().min(1),
});

export const restApiConfigSchema = z.object({
  baseUrl: z.string().url(),
  authType: z.enum(["bearer", "api-key", "basic", "none"]),
  authToken: z.string().optional(),
  apiKeyHeader: z.string().optional(),
  apiKeyValue: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  endpoints: z.object({
    list: z.string().min(1),
    get: z.string().min(1),
    create: z.string().min(1),
    update: z.string().min(1),
    delete: z.string().min(1),
  }),
});

export const graphqlConfigSchema = z.object({
  endpoint: z.string().url(),
  authType: z.enum(["bearer", "api-key", "none"]),
  authToken: z.string().optional(),
  headers: z.record(z.string()).optional(),
});
