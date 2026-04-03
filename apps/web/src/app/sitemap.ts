import type { MetadataRoute } from "next";
import { db } from "@rankflo/db";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";
const RANKFLO_PROJECT_ID = process.env.NEXT_PUBLIC_SELF_PROJECT_ID ?? "";

// Topic cluster landing pages (programmatic SEO)
const TOPICS = [
  "blog-platform",
  "headless-cms",
  "content-management",
  "seo-tools",
  "ai-content-generation",
  "self-hosted-blog",
  "blogging-software",
  "content-marketing",
  "technical-writing",
  "developer-blog",
];

// Competitor comparison pages
const COMPARISONS = [
  "rankflo-vs-wordpress",
  "rankflo-vs-ghost",
  "rankflo-vs-medium",
  "rankflo-vs-substack",
  "rankflo-vs-hashnode",
  "rankflo-vs-contentful",
  "rankflo-vs-strapi",
  "rankflo-vs-sanity",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch real published blog posts from DB (graceful fallback if DB unavailable)
  let posts: { slug: string; updatedAt: Date; publishedAt: Date | null }[] = [];
  try {
    posts = await db.post.findMany({
      where: {
        projectId: RANKFLO_PROJECT_ID,
        status: "PUBLISHED",
        deletedAt: null,
      },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    // DB not available at build time — serve static pages only
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/features`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic blog posts from DB (always accurate, no stale slugs)
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Topic landing pages
  const topicPages: MetadataRoute.Sitemap = TOPICS.map((topic) => ({
    url: `${BASE_URL}/for/${topic}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Competitor comparison pages
  const comparisonPages: MetadataRoute.Sitemap = COMPARISONS.map((slug) => ({
    url: `${BASE_URL}/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Documentation pages
  const docPages: MetadataRoute.Sitemap = [
    "getting-started", "self-hosting", "api-reference", "user-guide", "webhooks", "analytics-setup", "llm-visibility",
  ].map((slug) => ({
    url: `${BASE_URL}/docs/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const docsLanding: MetadataRoute.Sitemap = [{
    url: `${BASE_URL}/docs`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }];

  // Free tool pages
  const toolPages: MetadataRoute.Sitemap = [
    "blog-title-generator", "meta-description-generator", "reading-time-calculator",
    "schema-generator", "og-preview", "robots-txt-generator", "heading-checker", "word-counter",
    "slug-generator", "markdown-to-html", "keyword-density-checker", "hreflang-generator", "sitemap-generator",
  ].map((slug) => ({
    url: `${BASE_URL}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const toolsLanding: MetadataRoute.Sitemap = [{
    url: `${BASE_URL}/tools`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }];

  return [...staticPages, ...docsLanding, ...docPages, ...toolsLanding, ...toolPages, ...blogPages, ...topicPages, ...comparisonPages];
}
