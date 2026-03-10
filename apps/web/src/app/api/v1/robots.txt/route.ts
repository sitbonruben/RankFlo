import { NextRequest, NextResponse } from "next/server";
import { db } from "@rankflo/db";

/**
 * Robots.txt — Crawler Permission Endpoint
 *
 * Returns a robots.txt that allows all crawlers and points to your sitemap.
 * Use this if your site doesn't have its own robots.txt, or merge it in.
 *
 * GET /api/v1/robots.txt?project_key=blg_xxx
 *
 * Usage in your Next.js app:
 *   // app/robots.txt/route.ts
 *   export async function GET() {
 *     const res = await fetch(`${RANKFLO_URL}/api/v1/robots.txt?project_key=${API_KEY}`)
 *     return new Response(await res.text(), {
 *       headers: { 'Content-Type': 'text/plain' }
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

  const project = await db.project.findUnique({
    where: { apiKey },
    select: { url: true, status: true },
  });

  if (!project) {
    return new NextResponse("Invalid API key", { status: 401 });
  }

  if (project.status === "ARCHIVED") {
    return new NextResponse("Project archived", { status: 403 });
  }

  const siteUrl = project.url?.replace(/\/$/, "") ?? "";
  const sitemapUrl = siteUrl ? `${siteUrl}/sitemap.xml` : "/sitemap.xml";

  const content = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${sitemapUrl}

# AI crawlers — allow full indexing for discoverability
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Googlebot
Allow: /
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
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
