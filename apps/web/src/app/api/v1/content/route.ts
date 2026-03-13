import { NextRequest, NextResponse } from "next/server";
import { db } from "@rankflo/db";
import { renderBlocksToHtml, renderBlocksToPlainText } from "@/lib/blocks-to-html";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Headless CMS API — Content Delivery Endpoint
 *
 * External projects fetch published content using their project API key.
 * Authentication: Bearer token (project.apiKey) in Authorization header.
 *
 * GET /api/v1/content
 *   ?project_key=blg_xxx     — Project API key (alt to Bearer header)
 *   &status=PUBLISHED        — Filter by status (default: PUBLISHED)
 *   &slug=my-post            — Fetch single post by slug
 *   &tag=seo                 — Filter by tag slug
 *   &locale=en               — Filter by locale
 *   &page=1                  — Pagination page
 *   &limit=20                — Items per page (max 100)
 *   &sort=newest             — Sort: newest, oldest, title
 *   &format=json             — Response format: json (default), html
 *   &fields=title,slug,content — Sparse fieldsets
 *   &updated_since=ISO_DATE  — Only posts updated after this timestamp (incremental sync)
 */
export async function GET(req: NextRequest) {
  try {
    // ─── AUTH ──────────────────────────────────────
    const authHeader = req.headers.get("authorization");
    const url = new URL(req.url);
    const queryKey = url.searchParams.get("project_key");

    const apiKey = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : queryKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API key. Provide Authorization: Bearer rf_xxx or ?project_key=rf_xxx" },
        { status: 401 }
      );
    }

    // Rate limit: 120 req/min per API key
    const rl = rateLimit(`content:${apiKey}`);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      });
    }

    // Look up project by API key
    const project = await db.project.findUnique({
      where: { apiKey },
      select: { id: true, organizationId: true, status: true, url: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Invalid API key. Project not found." },
        { status: 401 }
      );
    }

    if (project.status === "ARCHIVED") {
      return NextResponse.json(
        { error: "Project is archived. Reactivate to access content." },
        { status: 403 }
      );
    }

    // ─── PARAMS ───────────────────────────────────
    const slug = url.searchParams.get("slug");
    const status = url.searchParams.get("status") || "PUBLISHED";
    const tag = url.searchParams.get("tag");
    const locale = url.searchParams.get("locale");
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
    const sort = url.searchParams.get("sort") || "newest";
    const format = url.searchParams.get("format") || "html";
    const fieldsParam = url.searchParams.get("fields");
    const fields = fieldsParam ? fieldsParam.split(",").map((f) => f.trim()) : null;
    const updatedSince = url.searchParams.get("updated_since");
    const siteUrl = project.url?.replace(/\/$/, "") ?? "";
    const ogBase = `https://app.rankflo.io/api/v1/og?project_key=${apiKey}`;

    // ─── SINGLE POST BY SLUG ──────────────────────
    if (slug) {
      const post = await db.post.findFirst({
        where: {
          projectId: project.id,
          organizationId: project.organizationId,
          slug,
          deletedAt: null,
        },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          tags: { include: { tag: { select: { name: true, slug: true, color: true } } } },
          seoMeta: true,
        },
      });

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      const formatted = formatPost(post, format, fields, siteUrl, ogBase);
      return NextResponse.json({ data: formatted }, {
        status: 200,
        headers: corsHeaders(),
      });
    }

    // ─── LIST POSTS ───────────────────────────────
    const where: any = {
      projectId: project.id,
      organizationId: project.organizationId,
      status,
      deletedAt: null,
    };

    if (locale) where.locale = locale;
    if (tag) {
      where.tags = { some: { tag: { slug: tag } } };
    }
    if (updatedSince) {
      const since = new Date(updatedSince);
      if (!isNaN(since.getTime())) {
        where.updatedAt = { gte: since };
      }
    }

    const orderBy: any = {
      newest: { publishedAt: "desc" },
      oldest: { publishedAt: "asc" },
      title: { title: "asc" },
      updated: { updatedAt: "desc" },
    }[sort] || { publishedAt: "desc" };

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          tags: { include: { tag: { select: { name: true, slug: true, color: true } } } },
          seoMeta: true,
        },
      }),
      db.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const formattedPosts = posts.map((p) => formatPost(p, format, fields, siteUrl, ogBase));

    return NextResponse.json(
      {
        data: formattedPosts,
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
    console.error("Content API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── OPTIONS (CORS preflight) ──────────────────
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// ─── HELPERS ────────────────────────────────────

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
  };
}

function formatPost(post: any, format: string, fields: string[] | null, siteUrl = "", ogBase = "") {
  // Derive blocks from the JSONB content field
  const blocks: any[] = post.content?.blocks ?? [];

  // Generate full HTML from blocks if contentHtml is missing or a stub (<200 chars)
  const contentHtml =
    post.contentHtml && post.contentHtml.length > 200
      ? post.contentHtml
      : renderBlocksToHtml(blocks);

  // Generate plain text from blocks if contentPlain is missing
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
    coverImage: post.featuredImage, // alias for wider framework compat
    seo: buildSeo(post, siteUrl, ogBase),
  };

  // Sparse fieldsets
  if (fields && fields.length > 0) {
    const sparse: Record<string, any> = {};
    for (const field of fields) {
      if (field in base) {
        sparse[field] = base[field];
      }
    }
    // Always include id and slug
    sparse.id = base.id;
    sparse.slug = base.slug;
    return sparse;
  }

  return base;
}

// ─── SEO + JSON-LD ──────────────────────────────────────────────────────────

function buildSeo(post: any, siteUrl: string, ogBase = "") {
  const postUrl = siteUrl ? `${siteUrl}/blog/${post.slug}` : undefined;
  // Use manual ogImage → featuredImage → auto-generated OG card
  const image =
    post.seoMeta?.ogImage ??
    post.featuredImage ??
    (ogBase ? `${ogBase}&slug=${post.slug}` : undefined);

  // Auto-generate BlogPosting structured data if not manually set
  const structuredData: Record<string, unknown> = post.seoMeta?.structuredData ?? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(image ? { image } : {}),
    ...(post.publishedAt ? { datePublished: new Date(post.publishedAt).toISOString() } : {}),
    ...(post.updatedAt ? { dateModified: new Date(post.updatedAt).toISOString() } : {}),
    ...(post.author?.name
      ? { author: { "@type": "Person", name: post.author.name } }
      : {}),
    ...(postUrl ? { url: postUrl, mainEntityOfPage: { "@type": "WebPage", "@id": postUrl } } : {}),
  };

  return {
    metaTitle: post.seoMeta?.metaTitle ?? null,
    metaDescription: post.seoMeta?.metaDescription ?? null,
    ogTitle: post.seoMeta?.ogTitle ?? null,
    ogDescription: post.seoMeta?.ogDescription ?? null,
    ogImage: image ?? null,
    twitterCard: post.seoMeta?.twitterCard ?? "summary_large_image",
    canonicalUrl: post.seoMeta?.canonicalUrl ?? postUrl ?? null,
    noIndex: post.seoMeta?.noIndex ?? false,
    noFollow: post.seoMeta?.noFollow ?? false,
    keywords: post.seoMeta?.keywords ?? [],
    structuredData,
  };
}
