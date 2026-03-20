<p align="center">
  <img src="apps/web/public/logo.png" alt="RankFlo" width="100" />
</p>

<h1 align="center">RankFlo</h1>

<p align="center">
  Open-source headless CMS built for SEO-driven content.<br/>
  Write with AI, audit SEO, track analytics, and deliver content via API — self-host free.
</p>

<p align="center">
  <a href="https://rankflo.io">Website</a> ·
  <a href="https://docs.rankflo.io">Docs</a> ·
  <a href="https://app.rankflo.io">Live Demo</a> ·
  <a href="#self-hosting">Self-Host</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-ELv2-blue" alt="ELv2 License" />
  <img src="https://img.shields.io/badge/Next.js-15-black" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Postgres-16-336791" alt="PostgreSQL 16" />
</p>

---

## What is RankFlo?

RankFlo is a **headless CMS** designed around one goal: ranking content on Google.

You write and manage content in RankFlo's editor. Your website fetches that content via a simple REST API. RankFlo handles the SEO work — auditing every post, generating sitemaps and OG images, tracking pageviews, and giving your writers AI tools to produce better content faster.

**The workflow:**
```
Write in RankFlo → Publish → Your site fetches via API → Google finds it
```

---

## Features

- **Block editor** — Tiptap-powered with `/` command menu (headings, images, callouts, code, tables, embeds)
- **AI writing** — Generate, rewrite, improve, SEO-optimize, and chat with AI about your content. Bring your own key (OpenAI / Anthropic / Google / KIE.ai) or use managed credits
- **SEO audit** — 9-point checklist with scores per post: meta title/description, canonical, H1, keyword density, image alt text, internal links, structured data
- **Content API** — REST endpoints for posts, search, tags, RSS, sitemap, OG images — ready for any frontend
- **Cookieless analytics** — Pageviews, UTM attribution, top posts, traffic sources. No GDPR banner needed
- **Scheduling** — Draft → Review → Scheduled → Published workflow with cron auto-publish
- **Webhooks** — HMAC-SHA256 signed payloads on `post.published` / `post.updated`
- **Multi-tenant** — Organizations, projects, RBAC (Admin / Editor / Author / Viewer)
- **Chrome Extension** — Write and publish from any webpage via side panel (Cmd+Shift+Y)
- **MCP Server** — Publish posts from Claude Desktop with natural language
- **i18n** — Per-locale content and slugs

---

## Self-Hosting

### Requirements

- **Docker + Docker Compose** — that's it. Postgres and Redis are included.
- A server with 1 GB RAM minimum (2 GB recommended)
- A domain name (optional for local use)

### 1. Clone and configure

```bash
git clone https://github.com/sitbonruben/RankFlo.git
cd RankFlo
cp .env.example .env.production
```

Open `.env.production` and set the required values:

```env
DATABASE_URL="postgresql://rankflo:CHANGE_ME@postgres:5432/rankflo"
REDIS_URL="redis://redis:6379"

AUTH_SECRET=""           # openssl rand -hex 32
ENCRYPTION_KEY=""        # openssl rand -hex 32

NEXT_PUBLIC_APP_URL="https://cms.yourdomain.com"
ADMIN_EMAIL="you@yourdomain.com"
ADMIN_PASSWORD="choose-a-strong-password"
```

Generate the two secrets in one command:
```bash
echo "AUTH_SECRET=$(openssl rand -hex 32)"
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
```

### 2. Start

```bash
cd docker
docker compose up -d
```

This starts:
- `web` — the RankFlo app on port 3000
- `postgres` — PostgreSQL 16
- `redis` — Redis 7

First boot runs database migrations automatically and creates your admin account.

Open `http://localhost:3000` (or your domain) and sign in with the email/password you set.

### 3. Create your first project

1. Go to **Projects → New Project**
2. Enter your blog's name and slug
3. Copy the **Project API Key** — it starts with `blg_`

This key is all you need to fetch content on your website.

### 4. Connect your website

Fetch published posts from your site:

```js
// Any frontend — Next.js, Astro, Nuxt, plain HTML, etc.
const res = await fetch(
  'https://cms.yourdomain.com/api/v1/content?project_key=blg_xxx'
)
const { posts } = await res.json()
```

That's it. See the [API reference](https://docs.rankflo.io/docs/api-reference) for filtering, pagination, search, RSS, and more.

### Reverse proxy with Caddy (recommended)

```
cms.yourdomain.com {
    reverse_proxy localhost:3000
}
```

Caddy handles SSL automatically. Nginx works too — just proxy to port 3000.

### Upgrade

```bash
cd docker
git pull
docker compose build web
docker compose up -d --force-recreate web
```

Migrations run automatically on startup.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `AUTH_SECRET` | ✅ | Random 32-byte hex — signs sessions |
| `ENCRYPTION_KEY` | ✅ | Random 32-byte hex — encrypts stored AI keys |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your public URL (no trailing slash) |
| `ADMIN_EMAIL` | ✅ | First admin account email |
| `ADMIN_PASSWORD` | ✅ | First admin account password |
| `ANTHROPIC_API_KEY` | optional | Server-wide AI key (users can also BYOK) |
| `OPENAI_API_KEY` | optional | Server-wide AI key |
| `GOOGLE_AI_API_KEY` | optional | Server-wide AI key |
| `SMTP_HOST` | optional | Outgoing email (invites, notifications) |
| `S3_BUCKET` | optional | S3-compatible storage for media uploads |
| `GOOGLE_CLIENT_ID` | optional | Google OAuth |
| `GITHUB_CLIENT_ID` | optional | GitHub OAuth |
| `RANKFLO_MODE` | optional | `oss` (default) or `saas` (enables Stripe billing) |

See [`.env.example`](.env.example) for all options with comments.

---

## Content API

All endpoints use your project key for authentication — either as `?project_key=blg_xxx` or `Authorization: Bearer blg_xxx`.

```bash
# List published posts (paginated)
GET /api/v1/content?project_key=blg_xxx

# Single post by slug
GET /api/v1/content?project_key=blg_xxx&slug=my-post

# Filter by tag
GET /api/v1/content?project_key=blg_xxx&tag=seo

# Full-text search
GET /api/v1/search?project_key=blg_xxx&q=your+query

# All tags with post counts
GET /api/v1/tags?project_key=blg_xxx

# RSS feed
GET /api/v1/feed.xml?project_key=blg_xxx

# Sitemap
GET /api/v1/sitemap.xml?project_key=blg_xxx

# Dynamic OG image
GET /api/v1/og?project_key=blg_xxx&slug=my-post
```

**Rate limit:** 120 requests/minute per IP.

Full docs at [docs.rankflo.io/docs/api-reference](https://docs.rankflo.io/docs/api-reference).

---

## Next.js Integration Example

```tsx
// app/blog/page.tsx
export const revalidate = 60 // ISR — revalidate every 60s

async function getPosts() {
  const res = await fetch(
    `${process.env.RANKFLO_URL}/api/v1/content?project_key=${process.env.RANKFLO_PROJECT_KEY}`,
    { next: { revalidate: 60 } }
  )
  return res.json()
}

export default async function BlogPage() {
  const { posts } = await getPosts()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug}>
          <a href={`/blog/${post.slug}`}>{post.title}</a>
        </li>
      ))}
    </ul>
  )
}
```

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const res = await fetch(`${process.env.RANKFLO_URL}/api/v1/content?project_key=${process.env.RANKFLO_PROJECT_KEY}&limit=100`)
  const { posts } = await res.json()
  return posts.map((p) => ({ slug: p.slug }))
}
```

---

## AI Setup

RankFlo supports **Bring Your Own Key** — no AI costs unless you use it.

Go to **Settings → AI** in the dashboard and paste your key from any of:

| Provider | Models | Get a key |
|---|---|---|
| Anthropic | Claude 3.5 Sonnet, Claude 3 Opus | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| OpenAI | GPT-4o, GPT-4 Turbo | [platform.openai.com](https://platform.openai.com/api-keys) |
| Google | Gemini 1.5 Pro/Flash | [aistudio.google.com](https://aistudio.google.com/apikey) |
| KIE.ai | Multi-model + image gen | [kie.ai](https://kie.ai) |

Keys are encrypted at rest with AES-256-GCM. You can also set `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` as server-wide defaults so users don't need to bring their own.

---

## Development

```bash
# Prerequisites: Node 20+, pnpm 9+, PostgreSQL, Redis

git clone https://github.com/sitbonruben/RankFlo.git
cd RankFlo

pnpm install

cp .env.example .env
# Edit .env with your local Postgres/Redis URLs

pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations
pnpm db:seed        # Create admin user

pnpm dev            # Start all apps
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

```bash
pnpm dev            # Start all apps in dev mode (hot reload)
pnpm build          # Build everything
pnpm lint           # Lint all packages
pnpm type-check     # TypeScript check all packages
pnpm db:studio      # Open Prisma Studio (database GUI)
pnpm db:migrate     # Run pending migrations
pnpm db:seed        # Re-seed admin user
```

### Project structure

```
rankflo/
├── apps/
│   ├── web/            # Next.js 15 — dashboard + marketing site
│   ├── docs/           # Documentation site (docs.rankflo.io)
│   └── extension/      # Chrome extension (Manifest V3)
├── packages/
│   ├── ai/             # AI provider abstraction
│   ├── api/            # tRPC routers
│   ├── auth/           # Sessions, OAuth, RBAC
│   ├── core/           # Shared types and validators
│   ├── db/             # Prisma schema + migrations
│   ├── email/          # Email templates
│   ├── feature-flags/  # OSS vs SaaS feature gating
│   ├── mcp/            # Claude Desktop MCP server
│   └── ui/             # Shared component library
└── docker/             # Docker Compose + Dockerfiles
```

---

## Chrome Extension

Write and publish from any webpage without switching tabs.

**Install from source:**
```bash
cd apps/extension
pnpm build
```
Load `dist/` as an unpacked extension in Chrome (`chrome://extensions` → Developer mode → Load unpacked).

Press **Cmd+Shift+Y** (Mac) or **Ctrl+Shift+Y** (Windows) to open the side panel on any page.

---

## MCP Server (Claude Desktop)

Control RankFlo from Claude Desktop with natural language.

**Build:**
```bash
cd packages/mcp
pnpm build
```

**Configure** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "rankflo": {
      "command": "node",
      "args": ["/path/to/RankFlo/packages/mcp/dist/index.js"],
      "env": {
        "RANKFLO_API_KEY": "sk_live_...",
        "RANKFLO_URL": "https://cms.yourdomain.com"
      }
    }
  }
}
```

**Example prompts:**
- *"Write a 1200-word post about B2B SaaS pricing strategies and save it as a draft"*
- *"List my last 10 published posts"*
- *"Publish the draft about email marketing"*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| API | tRPC v11 + REST |
| Database | PostgreSQL 16 + Prisma v6 |
| Cache / Queue | Redis 7 |
| Auth | iron-session (custom sessions) + OAuth |
| UI | Radix UI + Tailwind CSS v4 |
| Editor | Tiptap |
| AI | OpenAI / Anthropic / Google / KIE.ai |
| Email | SMTP / MailPanda |
| Storage | S3-compatible |
| Deploy | Docker Compose |

---

## Contributing

Pull requests are welcome. For significant changes, open an issue first to discuss the approach.

```bash
# 1. Fork the repo and clone your fork
git clone https://github.com/YOUR_USERNAME/RankFlo.git

# 2. Create a branch
git checkout -b feat/your-feature

# 3. Make your changes and test them
pnpm dev

# 4. Open a pull request against main
```

**Good first issues:** look for the `good first issue` label on GitHub.

---

## FAQ

**Can I use RankFlo for a commercial project?**
Yes. You can self-host and use it for your own commercial product. You just can't offer RankFlo itself as a hosted service to third parties (that's what ELv2 prevents).

**Do I need an AI API key?**
No. AI features are optional. The editor, API, SEO audit, analytics, and scheduling all work without any AI keys.

**Can I use my own database?**
Yes. Set `DATABASE_URL` to any PostgreSQL 16+ instance. The compose file includes one for convenience.

**How do I back up my data?**
Back up the `pgdata` Docker volume, or use `pg_dump`:
```bash
docker exec rankflo-postgres-1 pg_dump -U rankflo rankflo > backup.sql
```

**What's the difference between OSS and SaaS mode?**
`RANKFLO_MODE=oss` (default) — all features, no billing. `RANKFLO_MODE=saas` enables Stripe billing, managed AI credit packs, and subscription plans.

---

## License

RankFlo is licensed under the **[Elastic License 2.0 (ELv2)](LICENSE)**.

- ✅ Free to self-host, modify, and use for your own projects
- ✅ Build commercial products on top of it
- ❌ You may not provide RankFlo as a managed hosted service to third parties

For commercial licensing or exceptions: [hello@rankflo.io](mailto:hello@rankflo.io)
