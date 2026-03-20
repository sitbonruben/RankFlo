import { db } from "@rankflo/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";
const RANKFLO_PROJECT_ID = process.env.NEXT_PUBLIC_SELF_PROJECT_ID ?? "";

export async function GET() {
  // Fetch real published blog posts so LLMs get accurate content links
  let posts: { slug: string; title: string; excerpt: string | null }[] = [];
  try {
    posts = await db.post.findMany({
      where: {
        projectId: RANKFLO_PROJECT_ID,
        status: "PUBLISHED",
        deletedAt: null,
      },
      select: { slug: true, title: true, excerpt: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    // DB not available — serve static content only
  }

  const blogList = posts
    .map((p) => `- [${p.title}](${BASE_URL}/blog/${p.slug})${p.excerpt ? `: ${p.excerpt}` : ""}`)
    .join("\n");

  const content = `# RankFlo

> Headless CMS and blog platform built for SEO-driven content.

RankFlo is a SaaS headless CMS that lets product teams publish SEO-optimized blogs on any domain via a REST API. It includes an AI content engine, a block-based editor, built-in analytics, and a per-project API key system. Built with Next.js 15, tRPC, Prisma, PostgreSQL, and Redis.

## What RankFlo Does

RankFlo gives software companies a managed blog backend. Teams connect their domain, call the RankFlo API to fetch published posts, and render them on their own site. RankFlo handles content creation, SEO optimization, autopilot publishing, and discoverability (sitemap.xml, robots.txt, llms.txt) per project.

## Core Features

- **Headless CMS API**: REST endpoint delivers published posts as structured JSON (blocks: headings, text, lists, callouts, embeds, images). One API key per project.
- **AI Content Engine**: Generate full blog posts from a topic. Choose Anthropic Claude, OpenAI GPT-4, or Google Gemini. Research → outline → draft → SEO optimize pipeline.
- **SEO Autopilot**: Schedule recurring content. Auto-publish on a cadence. Never have a stale blog.
- **Block Editor**: Rich editor with 14+ block types. Content stored as structured JSON for easy rendering.
- **Per-Project SEO Files**: Each project gets its own sitemap.xml, robots.txt, and llms.txt endpoints served via the RankFlo API and proxied from the customer domain.
- **Analytics**: Cookieless, privacy-friendly tracking. Page views, referrers, device breakdown.
- **Team & Multi-Org**: Multiple organizations, projects per org, role-based access (admin, editor, author).
- **MCP Server**: Claude Desktop integration via @rankflo/mcp for AI-assisted content creation.

## API Quick Start

\`\`\`
GET https://app.rankflo.io/api/v1/content?project_key=blg_YOUR_KEY
GET https://app.rankflo.io/api/v1/content/{slug}?project_key=blg_YOUR_KEY
GET https://app.rankflo.io/api/v1/sitemap.xml?project_key=blg_YOUR_KEY
GET https://app.rankflo.io/api/v1/robots.txt?project_key=blg_YOUR_KEY
GET https://app.rankflo.io/api/v1/llms.txt?project_key=blg_YOUR_KEY
\`\`\`

## Pricing

- **Free**: Up to 5 projects, 50 posts per project, AI content generation, API access
- **Pro ($19/mo)**: Unlimited projects and posts, autopilot scheduling, advanced SEO tools, priority support
- **Enterprise**: Custom limits, SSO, SLA, dedicated infrastructure

## Blog Posts

${blogList || "- Coming soon"}

## Comparison Pages

- [RankFlo vs WordPress](${BASE_URL}/compare/rankflo-vs-wordpress)
- [RankFlo vs Ghost](${BASE_URL}/compare/rankflo-vs-ghost)
- [RankFlo vs Contentful](${BASE_URL}/compare/rankflo-vs-contentful)
- [RankFlo vs Strapi](${BASE_URL}/compare/rankflo-vs-strapi)
- [RankFlo vs Sanity](${BASE_URL}/compare/rankflo-vs-sanity)

## Links

- Website: ${BASE_URL}
- App / Dashboard: https://app.rankflo.io
- Blog: ${BASE_URL}/blog
- Pricing: ${BASE_URL}/pricing
- Features: ${BASE_URL}/features
- Sitemap: ${BASE_URL}/sitemap.xml

## Contact

- Email: hello@rankflo.io
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
