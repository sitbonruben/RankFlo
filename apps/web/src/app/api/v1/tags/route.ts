import { NextRequest, NextResponse } from "next/server";
import { db } from "@rankflo/db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Tags — Published tag list with post counts
 *
 * Returns all tags used in published posts for a project, sorted by post count.
 * Use this to build /blog/tag/[slug] archive pages and navigation menus.
 *
 * GET /api/v1/tags?project_key=blg_xxx
 *   &locale=en   — filter to tags used in posts of this locale (optional)
 *
 * Response:
 *   { data: [{ id, name, slug, color, postCount }] }
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const authHeader = req.headers.get("authorization");
  const apiKey = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : url.searchParams.get("project_key");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const rl = rateLimit(`tags:${apiKey}`, 120);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    });
  }

  const project = await db.project.findUnique({
    where: { apiKey },
    select: { id: true, organizationId: true, status: true },
  });

  if (!project) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  if (project.status === "ARCHIVED") return NextResponse.json({ error: "Project archived" }, { status: 403 });

  const locale = url.searchParams.get("locale");

  const postTags = await db.postTag.findMany({
    where: {
      post: {
        projectId: project.id,
        organizationId: project.organizationId,
        status: "PUBLISHED",
        deletedAt: null,
        ...(locale ? { locale } : {}),
      },
    },
    select: {
      tag: { select: { id: true, name: true, slug: true, color: true } },
    },
  });

  // Aggregate counts
  const tagMap = new Map<
    string,
    { id: string; name: string; slug: string; color: string | null; postCount: number }
  >();
  for (const { tag } of postTags) {
    const existing = tagMap.get(tag.id);
    if (existing) {
      existing.postCount++;
    } else {
      tagMap.set(tag.id, { ...tag, postCount: 1 });
    }
  }

  const tags = Array.from(tagMap.values()).sort((a, b) => b.postCount - a.postCount);

  return NextResponse.json(
    { data: tags },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET" },
  });
}
