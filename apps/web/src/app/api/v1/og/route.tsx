import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { db } from "@rankflo/db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * OG Image Generator — Auto-generate social preview cards
 *
 * Returns a 1200×630 PNG suitable for og:image / twitter:image.
 * Falls back gracefully to a branded card when no featuredImage exists.
 *
 * GET /api/v1/og?project_key=blg_xxx&slug=my-post
 *   &slug=my-post       — post slug (required)
 *   &project_key=blg_xxx — project API key
 *
 * Usage in your Next.js generateMetadata():
 *   openGraph: {
 *     images: [`${RANKFLO_URL}/api/v1/og?project_key=${API_KEY}&slug=${slug}`]
 *   }
 *
 * Or let the content API handle it — seo.ogImage is auto-set if featuredImage exists,
 * and falls back to this endpoint URL automatically.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const authHeader = req.headers.get("authorization");
  const apiKey = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : url.searchParams.get("project_key");
  const slug = url.searchParams.get("slug");

  if (!apiKey) {
    return new Response("Missing API key", { status: 401 });
  }
  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  // Rate limit: 60 req/min
  const rl = rateLimit(`og:${apiKey}`, 60);
  if (!rl.allowed) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  const project = await db.project.findUnique({
    where: { apiKey },
    select: { id: true, organizationId: true, name: true, brandLogo: true, status: true },
  });

  if (!project) return new Response("Invalid API key", { status: 401 });
  if (project.status === "ARCHIVED") return new Response("Project archived", { status: 403 });

  const post = await db.post.findFirst({
    where: {
      projectId: project.id,
      organizationId: project.organizationId,
      slug,
      deletedAt: null,
    },
    select: {
      title: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      readingTime: true,
      author: { select: { name: true, avatarUrl: true } },
      tags: { include: { tag: { select: { name: true } } } },
      seoMeta: { select: { ogImage: true, metaDescription: true } },
    },
  });

  if (!post) return new Response("Post not found", { status: 404 });

  const title = post.title;
  const description = post.seoMeta?.metaDescription ?? post.excerpt ?? "";
  const bgImage = post.seoMeta?.ogImage ?? post.featuredImage;
  const authorName = post.author?.name ?? "";
  const tags = post.tags.slice(0, 3).map((pt) => pt.tag.name);
  const readingTime = post.readingTime ? `${post.readingTime} min read` : "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "1200px",
          height: "630px",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
        }}
      >
        {/* Background image with overlay */}
        {bgImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgImage}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.25,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 100%)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px",
            width: "100%",
          }}
        >
          {/* Top: project name + tags */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#a0a0a0",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {project.name}
            </span>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "14px",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#c0c0c0",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Middle: title + description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                fontSize: title.length > 60 ? "40px" : "52px",
                fontWeight: 700,
                lineHeight: 1.15,
                color: "#ffffff",
                maxWidth: "900px",
              }}
            >
              {title.length > 100 ? `${title.slice(0, 97)}…` : title}
            </div>
            {description && (
              <div
                style={{
                  fontSize: "22px",
                  color: "#a0a0a0",
                  lineHeight: 1.4,
                  maxWidth: "800px",
                }}
              >
                {description.length > 120 ? `${description.slice(0, 117)}…` : description}
              </div>
            )}
          </div>

          {/* Bottom: author + reading time */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {post.author?.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.avatarUrl}
                  alt={authorName}
                  style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                />
              )}
              {authorName && (
                <span style={{ fontSize: "18px", color: "#c0c0c0" }}>{authorName}</span>
              )}
              {readingTime && (
                <span style={{ fontSize: "16px", color: "#707070" }}>· {readingTime}</span>
              )}
            </div>

            {/* RankFlo badge */}
            <span style={{ fontSize: "14px", color: "#505050" }}>powered by RankFlo</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET" },
  });
}
