import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference — RankFlo Docs",
  description: "Content Delivery API: fetch published posts, search content, and embed analytics tracking into any website or app.",
};

export default function ApiReferencePage() {
  return (
    <div>
      <h1>API Reference</h1>
      <p>The RankFlo <strong>Content Delivery API</strong> lets you fetch published posts, search content, and embed analytics tracking into any website or app. All endpoints are public, CORS-enabled, and require only a Project API Key.</p>

      <hr />
      <h2>Authentication</h2>
      <p>Every request needs your <strong>Project API Key</strong> (<code>blg_xxx</code>). Get yours from <strong>Dashboard → Projects</strong>.</p>
      <pre><code>{`# Query parameter (simplest — safe for frontend)
GET /api/v1/content?project_key=blg_xxx

# Authorization header
GET /api/v1/content
Authorization: Bearer blg_xxx`}</code></pre>
      <p>Project keys only return <strong>published</strong> posts. Drafts and scheduled posts are never exposed.</p>

      <hr />
      <h2>Base URL</h2>
      <pre><code>https://app.rankflo.io</code></pre>
      <p>For self-hosted instances, replace with your own domain. All endpoints are at <code>/api/v1/</code>.</p>

      <hr />
      <h2>Rate Limits</h2>
      <p><strong>120 requests per minute</strong> per project key (sliding window). Returns <code>429 Too Many Requests</code> with <code>Retry-After</code> header when exceeded.</p>

      <hr />
      <h2 id="get-content">GET /api/v1/content</h2>
      <p>Fetch published posts for a project.</p>
      <pre><code>{`curl "https://app.rankflo.io/api/v1/content?project_key=blg_xxx"`}</code></pre>

      <h3>Query parameters</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>project_key</code></td><td>string</td><td>—</td><td><strong>Required.</strong> Your project API key</td></tr>
          <tr><td><code>slug</code></td><td>string</td><td>—</td><td>Fetch a single post by slug</td></tr>
          <tr><td><code>page</code></td><td>number</td><td>1</td><td>Page number</td></tr>
          <tr><td><code>limit</code></td><td>number</td><td>20</td><td>Posts per page (max 100)</td></tr>
          <tr><td><code>sort</code></td><td>string</td><td>newest</td><td><code>newest</code> / <code>oldest</code> / <code>title</code> / <code>updated</code></td></tr>
          <tr><td><code>tag</code></td><td>string</td><td>—</td><td>Filter by tag slug</td></tr>
          <tr><td><code>locale</code></td><td>string</td><td>—</td><td>Filter by locale (e.g. <code>en</code>, <code>fr</code>)</td></tr>
          <tr><td><code>format</code></td><td>string</td><td>html</td><td><code>html</code> or <code>json</code> (raw Tiptap blocks)</td></tr>
          <tr><td><code>fields</code></td><td>string</td><td>—</td><td>Sparse fieldset (e.g. <code>title,slug,excerpt</code>)</td></tr>
          <tr><td><code>updated_since</code></td><td>string</td><td>—</td><td>ISO 8601 timestamp for incremental sync</td></tr>
        </tbody>
      </table>

      <h3>Response</h3>
      <pre><code>{`{
  "data": [{
    "id": "abc123",
    "slug": "my-first-post",
    "title": "My First Post",
    "excerpt": "A short summary.",
    "content": "<p>Full HTML content...</p>",
    "featuredImage": "https://...",
    "readingTime": 5,
    "publishedAt": "2026-03-15T09:00:00.000Z",
    "author": { "name": "Jane Smith" },
    "tags": [{ "name": "SEO", "slug": "seo" }],
    "seo": {
      "metaTitle": "My First Post",
      "metaDescription": "A short summary.",
      "ogImage": "https://..."
    }
  }],
  "meta": { "page": 1, "limit": 20, "total": 47, "totalPages": 3 }
}`}</code></pre>

      <hr />
      <h2 id="get-search">GET /api/v1/search</h2>
      <p>Full-text search across published posts using Postgres FTS.</p>
      <pre><code>{`curl "https://app.rankflo.io/api/v1/search?project_key=blg_xxx&q=headless+cms"`}</code></pre>
      <table>
        <thead><tr><th>Parameter</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>q</code></td><td><strong>Required.</strong> Search query</td></tr>
          <tr><td><code>limit</code></td><td>Max results (default 10, max 50)</td></tr>
          <tr><td><code>tag</code></td><td>Filter results by tag slug</td></tr>
        </tbody>
      </table>

      <hr />
      <h2 id="get-tags">GET /api/v1/tags</h2>
      <p>List all tags for a project with post counts.</p>
      <pre><code>{`curl "https://app.rankflo.io/api/v1/tags?project_key=blg_xxx"`}</code></pre>

      <hr />
      <h2 id="webhooks">Webhooks</h2>
      <p>RankFlo fires webhooks when posts are published or updated. See the <a href="/docs/webhooks">Webhooks guide</a> for payload format and signature verification.</p>

      <hr />
      <h2 id="nextjs">Next.js Integration</h2>
      <pre><code>{`// lib/rankflo.ts
const KEY = process.env.RANKFLO_PROJECT_KEY!;
const URL = "https://app.rankflo.io";

export async function getPosts(opts?: { tag?: string; limit?: number }) {
  const params = new URLSearchParams({ project_key: KEY });
  if (opts?.tag) params.set("tag", opts.tag);
  if (opts?.limit) params.set("limit", String(opts.limit));

  const res = await fetch(\`\${URL}/api/v1/content?\${params}\`, {
    next: { revalidate: 60 },
  });
  return res.json();
}

export async function getPost(slug: string) {
  const res = await fetch(
    \`\${URL}/api/v1/content?project_key=\${KEY}&slug=\${slug}\`,
    { next: { revalidate: 60 } }
  );
  const { data } = await res.json();
  return data;
}`}</code></pre>

      <pre><code>{`// app/blog/page.tsx
import { getPosts } from "@/lib/rankflo";

export default async function BlogPage() {
  const { data: posts } = await getPosts({ limit: 20 });
  return (
    <main>
      {posts.map((post) => (
        <article key={post.slug}>
          <a href={\`/blog/\${post.slug}\`}>{post.title}</a>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </main>
  );
}`}</code></pre>
    </div>
  );
}
