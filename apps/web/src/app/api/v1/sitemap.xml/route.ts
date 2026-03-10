import { NextRequest, NextResponse } from "next/server";
import { db } from "@rankflo/db";

/**
 * Sitemap XML — SEO Discoverability Endpoint
 *
 * Returns a valid XML sitemap for all published posts in a project.
 * Add this to your site's sitemap so Google indexes your blog.
 *
 * GET /api/v1/sitemap.xml?project_key=blg_xxx
 *
 * Usage in your Next.js app:
 *   // app/sitemap.xml/route.ts
 *   export async function GET() {
 *     const res = await fetch(`${RANKFLO_URL}/api/v1/sitemap.xml?project_key=${API_KEY}`)
 *     return new Response(await res.text(), {
 *       headers: { 'Content-Type': 'application/xml' }
 *     })
 *   }
 *
 *   // Or include in your own sitemap:
 *   // app/sitemap.ts  →  fetch + parse posts, return MetadataRoute.Sitemap[]
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

  const project = await db.project.findUnique({
    where: { apiKey },
    select: { id: true, organizationId: true, name: true, url: true, status: true },
  });

  if (!project) {
    return new NextResponse("Invalid API key", { status: 401 });
  }

  if (project.status === "ARCHIVED") {
    return new NextResponse("Project archived", { status: 403 });
  }

  const posts = await db.post.findMany({
    where: {
      projectId: project.id,
      organizationId: project.organizationId,
      status: "PUBLISHED",
      deletedAt: null,
    },
    orderBy: { publishedAt: "desc" },
    take: 1000,
    select: { slug: true, publishedAt: true, updatedAt: true },
  });

  const siteUrl = project.url?.replace(/\/$/, "") ?? "";

  const urls = posts
    .map((post) => {
      const loc = siteUrl ? `${siteUrl}/blog/${post.slug}` : `/blog/${post.slug}`;
      const lastmod = (post.updatedAt ?? post.publishedAt ?? new Date())
        .toISOString()
        .split("T")[0];
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    })
    .join("\n");

  // Include the blog index page itself
  const indexUrl = siteUrl ? `${siteUrl}/blog` : "/blog";
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(indexUrl)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${urls}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
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
