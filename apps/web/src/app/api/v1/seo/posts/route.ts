import { NextRequest, NextResponse } from "next/server";
import { db } from "@rankflo/db";
import { renderBlocksToHtml, renderBlocksToPlainText } from "@/lib/blocks-to-html";

/**
 * SEO Posts Endpoint — alias of /api/v1/content for project-based post fetching.
 *
 * GET /api/v1/seo/posts
 *   ?project_key=blg_xxx     — Project API key
 *   &slug=my-post            — Fetch single post by slug
 *   &status=PUBLISHED        — Filter by status (default: PUBLISHED)
 *   &tag=seo                 — Filter by tag slug
 *   &locale=en               — Filter by locale
 *   &page=1                  — Pagination
 *   &limit=20                — Items per page (max 100)
 *   &sort=newest             — newest | oldest | title | updated
 *   &format=html             — html (default) | json
 *   &fields=title,slug,...   — Sparse fieldsets
 */
export async function GET(req: NextRequest) {
  try {
    // ─── AUTH ──────────────────────────────────────
    const url = new URL(req.url);
    const authHeader = req.headers.get("authorization");
    const queryKey = url.searchParams.get("project_key");

    const apiKey = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : queryKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API key. Provide Authorization: Bearer blg_xxx or ?project_key=blg_xxx" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const project = await db.project.findUnique({
      where: { apiKey },
      select: { id: true, organizationId: true, status: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Invalid API key. Project not found." },
        { status: 401, headers: corsHeaders() }
      );
    }

    if (project.status === "ARCHIVED") {
      return NextResponse.json(
        { error: "Project is archived." },
        { status: 403, headers: corsHeaders() }
      );
    }

    // ─── PARAMS ──────────────────────────────────
    const slug = url.searchParams.get("slug");
    // Status is always PUBLISHED — the ?status param is intentionally ignored for security.
    const tag = url.searchParams.get("tag");
    const locale = url.searchParams.get("locale");
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
    const sort = url.searchParams.get("sort") || "newest";
    const format = url.searchParams.get("format") || "html";
    const fieldsParam = url.searchParams.get("fields");
    const fields = fieldsParam ? fieldsParam.split(",").map((f) => f.trim()) : null;

    // ─── SINGLE POST ─────────────────────────────
    if (slug) {
      const post = await db.post.findFirst({
        where: {
          projectId: project.id,
          organizationId: project.organizationId,
          slug,
          status: "PUBLISHED",
          deletedAt: null,
        },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          tags: { include: { tag: { select: { name: true, slug: true, color: true } } } },
          seoMeta: true,
        },
      });

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404, headers: corsHeaders() });
      }

      return NextResponse.json(
        { data: formatPost(post, format, fields) },
        { status: 200, headers: corsHeaders() }
      );
    }

    // ─── LIST POSTS ──────────────────────────────
    const where: Record<string, unknown> = {
      projectId: project.id,
      organizationId: project.organizationId,
      status: "PUBLISHED",
      deletedAt: null,
    };

    if (locale) where.locale = locale;
    if (tag) where.tags = { some: { tag: { slug: tag } } };

    const orderBy: Record<string, unknown> = (
      {
        newest: { publishedAt: "desc" },
        oldest: { publishedAt: "asc" },
        title: { title: "asc" },
        updated: { updatedAt: "desc" },
      } as Record<string, Record<string, string>>
    )[sort] ?? { publishedAt: "desc" };

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where: where as never,
        orderBy: orderBy as never,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          tags: { include: { tag: { select: { name: true, slug: true, color: true } } } },
          seoMeta: true,
        },
      }),
      db.post.count({ where: where as never }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        data: posts.map((p) => formatPost(p, format, fields)),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("SEO Posts API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
  };
}

function formatPost(post: any, format: string, fields: string[] | null) {
  const blocks: any[] = post.content?.blocks ?? [];

  const contentHtml =
    post.contentHtml && post.contentHtml.length > 200
      ? post.contentHtml
      : renderBlocksToHtml(blocks);

  const contentPlain =
    post.contentPlain && post.contentPlain.length > 50
      ? post.contentPlain
      : renderBlocksToPlainText(blocks);

  const base: Record<string, any> = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    status: post.status,
    excerpt: post.excerpt,
    content: format === "html" ? contentHtml : post.content,
    contentPlain,
    featuredImage: post.featuredImage,
    locale: post.locale,
    readingTime: post.readingTime,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    author: post.author,
    tags: post.tags?.map((pt: any) => pt.tag) || [],
    seo: post.seoMeta
      ? {
          metaTitle: post.seoMeta.metaTitle,
          metaDescription: post.seoMeta.metaDescription,
          ogImage: post.seoMeta.ogImage,
          canonicalUrl: post.seoMeta.canonicalUrl,
          structuredData: post.seoMeta.structuredData,
        }
      : null,
  };

  if (fields && fields.length > 0) {
    const sparse: Record<string, any> = { id: base.id, slug: base.slug };
    for (const field of fields) {
      if (field in base) sparse[field] = base[field];
    }
    return sparse;
  }

  return base;
}
