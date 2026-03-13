import { NextRequest, NextResponse } from "next/server";
import { db } from "@rankflo/db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Full-Text Search — Postgres-powered content search
 *
 * Search published posts by title, excerpt, and body text.
 * Uses Postgres tsvector/tsquery — no external search infra needed.
 *
 * GET /api/v1/search?project_key=blg_xxx&q=headless+cms
 *   &q=query        — search query (required)
 *   &locale=en      — filter by locale (optional)
 *   &limit=10       — max results (default 10, max 20)
 *   &tag=seo        — filter to a specific tag slug (optional)
 *
 * Response:
 *   { data: [{ id, slug, title, excerpt, featuredImage, publishedAt, readingTime, rank }], query }
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const authHeader = req.headers.get("authorization");
  const apiKey = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : url.searchParams.get("project_key");
  const query = url.searchParams.get("q")?.trim();

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }
  if (!query || query.length < 2) {
    return NextResponse.json({ error: "q must be at least 2 characters" }, { status: 400 });
  }

  // Stricter rate limit for search (heavier queries)
  const rl = rateLimit(`search:${apiKey}`, 30);
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
  const tag = url.searchParams.get("tag");
  const limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)));

  // Postgres full-text search with ranking
  // Weights: title (A), excerpt (B), body (C)
  type SearchRow = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    featured_image: string | null;
    published_at: Date | null;
    reading_time: number | null;
    rank: number;
  };

  // Build query — tag filter uses a subquery to avoid conditional JOINs
  const results = await (tag
    ? db.$queryRaw<SearchRow[]>`
        SELECT
          p.id, p.slug, p.title, p.excerpt,
          p."featuredImage" AS featured_image,
          p."publishedAt"   AS published_at,
          p."readingTime"   AS reading_time,
          ts_rank_cd(
            setweight(to_tsvector('english', COALESCE(p.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(p.excerpt, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(p."contentPlain", '')), 'C'),
            plainto_tsquery('english', ${query})
          ) AS rank
        FROM posts p
        WHERE p."projectId"      = ${project.id}
          AND p."organizationId" = ${project.organizationId}
          AND p.status           = 'PUBLISHED'
          AND p."deletedAt"      IS NULL
          AND (${locale ?? ""} = '' OR p.locale = ${locale ?? ""})
          AND EXISTS (
            SELECT 1 FROM post_tags pt
            INNER JOIN tags t ON t.id = pt."tagId"
            WHERE pt."postId" = p.id AND t.slug = ${tag}
          )
          AND (
            setweight(to_tsvector('english', COALESCE(p.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(p.excerpt, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(p."contentPlain", '')), 'C')
          ) @@ plainto_tsquery('english', ${query})
        ORDER BY rank DESC
        LIMIT ${limit}`
    : db.$queryRaw<SearchRow[]>`
        SELECT
          p.id, p.slug, p.title, p.excerpt,
          p."featuredImage" AS featured_image,
          p."publishedAt"   AS published_at,
          p."readingTime"   AS reading_time,
          ts_rank_cd(
            setweight(to_tsvector('english', COALESCE(p.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(p.excerpt, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(p."contentPlain", '')), 'C'),
            plainto_tsquery('english', ${query})
          ) AS rank
        FROM posts p
        WHERE p."projectId"      = ${project.id}
          AND p."organizationId" = ${project.organizationId}
          AND p.status           = 'PUBLISHED'
          AND p."deletedAt"      IS NULL
          AND (${locale ?? ""} = '' OR p.locale = ${locale ?? ""})
          AND (
            setweight(to_tsvector('english', COALESCE(p.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(p.excerpt, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(p."contentPlain", '')), 'C')
          ) @@ plainto_tsquery('english', ${query})
        ORDER BY rank DESC
        LIMIT ${limit}`);

  const data = results.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    featuredImage: r.featured_image,
    publishedAt: r.published_at,
    readingTime: r.reading_time,
    rank: Number(r.rank),
  }));

  return NextResponse.json(
    { data, query, total: data.length },
    {
      headers: {
        "Cache-Control": "no-store",
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
