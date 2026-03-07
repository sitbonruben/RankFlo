const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

const POSTS = [
  {
    title: "Introducing RankFlo: The Open-Source Blogging Platform for Modern Teams",
    slug: "introducing-rankflo",
    excerpt: "We built RankFlo because teams deserve a blogging platform that's powerful enough for enterprise, simple enough for solo creators, and open enough to self-host anywhere.",
    date: "2026-03-01T00:00:00Z",
    author: "RankFlo Team",
  },
  {
    title: "Why We Chose PostgreSQL Full-Text Search Over Elasticsearch",
    slug: "postgresql-full-text-search",
    excerpt: "The tradeoffs we considered, the benchmarks we ran, and why Postgres tsvector was the right default for 90% of use cases.",
    date: "2026-02-25T00:00:00Z",
    author: "Engineering",
  },
  {
    title: "Building an Analytics Engine Without Cookies",
    slug: "cookieless-analytics",
    excerpt: "How we track meaningful metrics while respecting privacy — no cookies, no fingerprinting, no consent banners.",
    date: "2026-02-18T00:00:00Z",
    author: "Engineering",
  },
  {
    title: "Self-Hosting RankFlo: A Complete Guide",
    slug: "self-hosting-guide",
    excerpt: "Deploy RankFlo on your own infrastructure with Docker in under 5 minutes.",
    date: "2026-02-10T00:00:00Z",
    author: "RankFlo Team",
  },
  {
    title: "SEO Scoring: How We Grade Your Content",
    slug: "seo-scoring-explained",
    excerpt: "A deep dive into our 9-check SEO audit system.",
    date: "2026-02-03T00:00:00Z",
    author: "Product",
  },
  {
    title: "Webhooks Done Right: Delivery, Retry, and Dead Letters",
    slug: "webhooks-done-right",
    excerpt: "Our approach to reliable webhook delivery with HMAC-SHA256 signing and exponential backoff.",
    date: "2026-01-28T00:00:00Z",
    author: "Engineering",
  },
];

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const items = POSTS.map(
    (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${escapeXml(post.author)}</author>
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
