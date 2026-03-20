import { db } from "@rankflo/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";
const RANKFLO_PROJECT_ID = process.env.NEXT_PUBLIC_SELF_PROJECT_ID ?? "";

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  // Fetch live published posts from the DB
  let posts: {
    slug: string;
    title: string;
    excerpt: string | null;
    publishedAt: Date | null;
    author: { name: string | null } | null;
  }[] = [];

  try {
    posts = await db.post.findMany({
      where: {
        projectId: RANKFLO_PROJECT_ID,
        status: "PUBLISHED",
        deletedAt: null,
      },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });
  } catch {
    // DB not available — return empty feed gracefully
  }

  const items = posts.map(
    (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt ?? "")}</description>
      <pubDate>${new Date(post.publishedAt ?? new Date()).toUTCString()}</pubDate>
      <author>${escapeXml(post.author?.name ?? "RankFlo")}</author>
    </item>`
  ).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RankFlo Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Product updates, engineering insights, and best practices for modern blogging.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
