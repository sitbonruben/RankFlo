import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

// Topic clusters for programmatic SEO pages
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

// Static blog posts (in production, fetch from DB)
const BLOG_SLUGS = [
  "introducing-rankflo",
  "postgresql-full-text-search",
  "cookieless-analytics",
  "self-hosting-guide",
  "seo-scoring-explained",
  "webhooks-done-right",
];

export default function sitemap(): MetadataRoute.Sitemap {
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
      priority: 0.6,
    },
  ];

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = BLOG_SLUGS.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Topic landing pages for programmatic SEO
  const topicPages: MetadataRoute.Sitemap = TOPICS.map((topic) => ({
    url: `${BASE_URL}/for/${topic}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Comparison pages
  const comparisonPages: MetadataRoute.Sitemap = COMPARISONS.map((slug) => ({
    url: `${BASE_URL}/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...topicPages, ...comparisonPages];
}
