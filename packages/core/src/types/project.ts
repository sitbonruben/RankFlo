export type Platform =
  | "NEXTJS"
  | "REACT"
  | "VUE"
  | "ANGULAR"
  | "SVELTE"
  | "SHOPIFY"
  | "WIX"
  | "WORDPRESS"
  | "SQUARESPACE"
  | "WEBFLOW"
  | "HUGO"
  | "GATSBY"
  | "ASTRO"
  | "REMIX"
  | "NUXT"
  | "CUSTOM";

export type ProjectStatus = "SETUP" | "ACTIVE" | "PAUSED" | "ARCHIVED";

export type IntegrationType =
  | "GITHUB"
  | "GITLAB"
  | "BITBUCKET"
  | "SHOPIFY_API"
  | "WIX_API"
  | "WORDPRESS_API"
  | "WEBFLOW_API"
  | "REST_API"
  | "GRAPHQL_API"
  | "SDK";

export type ContentFormat = "MARKDOWN" | "MDX" | "HTML" | "JSON";

export type DeploymentStatus = "PENDING" | "DEPLOYING" | "SUCCESS" | "FAILED";

export interface BrandColors {
  primary: string;
  secondary?: string;
  accent?: string;
  background: string;
  surface?: string;
  text: string;
  muted?: string;
}

export interface BrandFonts {
  heading?: { family: string; weight?: string };
  body?: { family: string; weight?: string };
  mono?: { family: string };
}

export interface BrandStyle {
  borderRadius?: string;
  spacing?: string;
  shadowStyle?: "none" | "subtle" | "medium" | "dramatic";
  layoutStyle?: "minimal" | "classic" | "modern" | "bold";
}

export interface IntegrationConfig {
  // GitHub/GitLab/Bitbucket
  repoOwner?: string;
  repoName?: string;
  branch?: string;
  accessToken?: string;
  webhookSecret?: string;

  // Shopify
  shopDomain?: string;
  shopifyAccessToken?: string;
  blogId?: string;

  // WordPress
  wpUrl?: string;
  wpUsername?: string;
  wpAppPassword?: string;

  // Wix
  wixSiteId?: string;
  wixApiKey?: string;

  // Webflow
  webflowSiteId?: string;
  webflowCollectionId?: string;
  webflowApiToken?: string;

  // Custom REST/GraphQL API
  apiEndpoint?: string;
  apiToken?: string;
  apiHeaders?: Record<string, string>;

  // SDK
  sdkKey?: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  url: string | null;
  platform: Platform;
  status: ProjectStatus;
  brandColors: BrandColors | null;
  brandFonts: BrandFonts | null;
  brandLogo: string | null;
  brandStyle: BrandStyle | null;
  integrationType: IntegrationType | null;
  integrationConfig: IntegrationConfig | null;
  contentDir: string | null;
  contentFormat: ContentFormat;
  apiKey: string | null;
  postCount: number;
  totalViews: number;
  lastDeployedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deployment {
  id: string;
  projectId: string;
  postId: string | null;
  status: DeploymentStatus;
  deployedAt: Date | null;
  commitSha: string | null;
  commitUrl: string | null;
  deployUrl: string | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export const PLATFORM_INFO: Record<Platform, { label: string; icon: string; category: "framework" | "ecommerce" | "cms" | "static" | "other" }> = {
  NEXTJS: { label: "Next.js", icon: "nextjs", category: "framework" },
  REACT: { label: "React", icon: "react", category: "framework" },
  VUE: { label: "Vue.js", icon: "vue", category: "framework" },
  ANGULAR: { label: "Angular", icon: "angular", category: "framework" },
  SVELTE: { label: "Svelte", icon: "svelte", category: "framework" },
  REMIX: { label: "Remix", icon: "remix", category: "framework" },
  NUXT: { label: "Nuxt", icon: "nuxt", category: "framework" },
  SHOPIFY: { label: "Shopify", icon: "shopify", category: "ecommerce" },
  WIX: { label: "Wix", icon: "wix", category: "cms" },
  WORDPRESS: { label: "WordPress", icon: "wordpress", category: "cms" },
  SQUARESPACE: { label: "Squarespace", icon: "squarespace", category: "cms" },
  WEBFLOW: { label: "Webflow", icon: "webflow", category: "cms" },
  HUGO: { label: "Hugo", icon: "hugo", category: "static" },
  GATSBY: { label: "Gatsby", icon: "gatsby", category: "static" },
  ASTRO: { label: "Astro", icon: "astro", category: "static" },
  CUSTOM: { label: "Custom", icon: "code", category: "other" },
};

export const INTEGRATION_INFO: Record<IntegrationType, { label: string; description: string }> = {
  GITHUB: { label: "GitHub", description: "Deploy content via Git commits" },
  GITLAB: { label: "GitLab", description: "Deploy content via Git commits" },
  BITBUCKET: { label: "Bitbucket", description: "Deploy content via Git commits" },
  SHOPIFY_API: { label: "Shopify API", description: "Publish directly to your Shopify blog" },
  WIX_API: { label: "Wix API", description: "Publish directly to your Wix site" },
  WORDPRESS_API: { label: "WordPress API", description: "Publish via WordPress REST API" },
  WEBFLOW_API: { label: "Webflow API", description: "Publish to Webflow CMS collections" },
  REST_API: { label: "REST API", description: "Push content to any REST endpoint" },
  GRAPHQL_API: { label: "GraphQL API", description: "Push content via GraphQL mutations" },
  SDK: { label: "RankFlo SDK", description: "Fetch content client-side with our SDK" },
};
