import { NextRequest, NextResponse } from "next/server";
import { db } from "@rankflo/db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * RSS Feed — Per-Project Content Delivery
 *
 * Returns a valid RSS 2.0 feed for all published posts in a project.
 * Add <link rel="alternate" type="application/rss+xml" href="..."> to your <head>.
 *
 * GET /api/v1/feed.xml?project_key=blg_xxx
 *   &locale=en          — filter by locale (optional)
 *   &limit=50           — max items (default 50, max 100)
 *
 * Usage in your Next.js app:
 *   // app/feed.xml/route.ts
 *   export async function GET() {
 *     const res = await fetch(`${RANKFLO_URL}/api/v1/feed.xml?project_key=${API_KEY}`)
 *     return new Response(await res.text(), {
 *       headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
 *     })
 *   }
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const authHeader = req.headers.get("authorization");
  const apiKey = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : url.searchParams.get("project_key");

  if (!apiKey) {
    return new NextResponse("Missing API key", { status: 401 });
  }

  // Rate limit: 60 req/min per key
  const rl = rateLimit(`feed:${apiKey}`, 60);
  if (!rl.allowed) {
    return new NextResponse("Rate limit exceeded", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    });
  }

  const project = await db.project.findUnique({
    where: { apiKey },
    select: { id: true, organizationId: true, name: true, url: true, description: true, status: true },
  });

  if (!project) return new NextResponse("Invalid API key", { status: 401 });
  if (project.status === "ARCHIVED") return new NextResponse("Project archived", { status: 403 });

  const locale = url.searchParams.get("locale");
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)));

  const posts = await db.post.findMany({
    where: {
      projectId: project.id,
      organizationId: project.organizationId,
      status: "PUBLISHED",
      deletedAt: null,
      ...(locale ? { locale } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      updatedAt: true,
      author: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
      seoMeta: { select: { metaDescription: true, ogImage: true } },
    },
  });

  const siteUrl = project.url?.replace(/\/$/, "") ?? "";
  const selfUrl = `https://app.rankflo.io/api/v1/feed.xml?project_key=${apiKey}`;

  const items = posts
    .map((post) => {
      const desc = post.seoMeta?.metaDescription ?? post.excerpt ?? "";
      const image = post.seoMeta?.ogImage ?? post.featuredImage;
      const categories = post.tags
        .map((pt) => `      <category>${escapeXml(pt.tag.name)}</category>`)
        .join("\n");
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(desc)}</description>
      <pubDate>${new Date(post.publishedAt ?? new Date()).toUTCString()}</pubDate>
${post.author?.name ? `      <author>${escapeXml(post.author.name)}</author>\n` : ""}${categories ? `${categories}\n` : ""}${image ? `      <enclosure url="${escapeXml(image)}" type="image/jpeg" length="0" />\n` : ""}    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(project.name)}</title>
    <link>${siteUrl || "https://app.rankflo.io"}</link>
    <description>${escapeXml(project.description ?? `${project.name} — powered by RankFlo`)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET" },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
