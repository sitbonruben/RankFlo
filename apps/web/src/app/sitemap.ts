import type { MetadataRoute } from "next";
import { db } from "@rankflo/db";
import { getAllComparisonSlugs } from "./(marketing)/_data/comparisons";
import { ALL_TOPIC_SLUGS } from "./(marketing)/_data/topics";
import { ALL_ALTERNATIVE_SLUGS } from "./(marketing)/_data/alternatives";
import { ALL_INTEGRATION_SLUGS } from "./(marketing)/_data/integrations";
import { ALL_GLOSSARY_SLUGS } from "./(marketing)/_data/glossary";
import { ALL_MIGRATION_SLUGS } from "./(marketing)/_data/migrations";
import { ALL_USE_CASE_SLUGS } from "./(marketing)/_data/use-cases";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";
const RANKFLO_PROJECT_ID = process.env.NEXT_PUBLIC_SELF_PROJECT_ID ?? "";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let posts: { slug: string; updatedAt: Date; publishedAt: Date | null }[] = [];
  let tags: { slug: string }[] = [];
  let authors: { id: string; updatedAt: Date }[] = [];
  try {
    [posts, tags, authors] = await Promise.all([
      db.post.findMany({
        where: { projectId: RANKFLO_PROJECT_ID, status: "PUBLISHED", deletedAt: null },
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
      }),
      db.tag.findMany({
        where: { posts: { some: { post: { projectId: RANKFLO_PROJECT_ID, status: "PUBLISHED", deletedAt: null } } } },
        select: { slug: true },
      }),
      db.user.findMany({
        where: {
          posts: { some: { projectId: RANKFLO_PROJECT_ID, status: "PUBLISHED", deletedAt: null } },
        },
        select: { id: true, updatedAt: true },
      }),
    ]);
  } catch {
    // DB not available at build time — serve static pages only
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/alternatives`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/integrations`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/glossary`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/migrate`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/use-cases`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/docs`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/tools`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  const docPages: MetadataRoute.Sitemap = [
    "getting-started",
    "self-hosting",
    "api-reference",
    "user-guide",
    "webhooks",
    "analytics-setup",
    "llm-visibility",
  ].map((slug) => ({
    url: `${BASE_URL}/docs/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const toolPages: MetadataRoute.Sitemap = [
    "blog-title-generator",
    "meta-description-generator",
    "reading-time-calculator",
    "schema-generator",
    "og-preview",
    "robots-txt-generator",
    "heading-checker",
    "word-counter",
    "slug-generator",
    "markdown-to-html",
    "keyword-density-checker",
    "hreflang-generator",
    "sitemap-generator",
  ].map((slug) => ({
    url: `${BASE_URL}/tools/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt ?? now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${BASE_URL}/blog/tag/${tag.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const authorPages: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${BASE_URL}/blog/author/${author.id}`,
    lastModified: author.updatedAt ?? now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const topicPages: MetadataRoute.Sitemap = ALL_TOPIC_SLUGS.map((topic) => ({
    url: `${BASE_URL}/for/${topic}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const comparisonPages: MetadataRoute.Sitemap = getAllComparisonSlugs().map((slug) => ({
    url: `${BASE_URL}/compare/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const alternativesPages: MetadataRoute.Sitemap = ALL_ALTERNATIVE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/alternatives/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const integrationPages: MetadataRoute.Sitemap = ALL_INTEGRATION_SLUGS.map((slug) => ({
    url: `${BASE_URL}/integrations/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const glossaryPages: MetadataRoute.Sitemap = ALL_GLOSSARY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/glossary/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const migratePages: MetadataRoute.Sitemap = ALL_MIGRATION_SLUGS.map((slug) => ({
    url: `${BASE_URL}/migrate/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const useCasePages: MetadataRoute.Sitemap = ALL_USE_CASE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/use-cases/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...docPages,
    ...toolPages,
    ...blogPages,
    ...tagPages,
    ...authorPages,
    ...topicPages,
    ...comparisonPages,
    ...alternativesPages,
    ...integrationPages,
    ...glossaryPages,
    ...migratePages,
    ...useCasePages,
  ];
}
