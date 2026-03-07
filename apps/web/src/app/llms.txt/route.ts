const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export async function GET() {
  const content = `# RankFlo

> The open-source blog platform built for what's next.

RankFlo is a modular, open-source blogging platform with AI content generation, built-in analytics, SEO scoring, full-text search, and a headless CMS API. Built with Next.js, TypeScript, PostgreSQL, and Redis. Self-host with Docker or use our managed cloud.

## Core Features

- **AI Content Engine**: Generate SEO-optimized blog posts matching your brand voice. Multi-step pipeline: research, outline, draft, optimize.
- **Built-in Analytics**: Privacy-friendly, cookieless tracking. Page views, visitors, referrers, device breakdown, geographic insights, and search analytics.
- **SEO Toolkit**: Real-time SEO scoring, meta optimization, structured data (JSON-LD), keyword density analysis, and internal linking suggestions.
- **Rich Block Editor**: 14+ block types including text, code, embeds, images, callouts, toggles, and tables. Content stored as structured JSON.
- **Full-Text Search**: Instant search with autocomplete and faceted filtering. PostgreSQL tsvector (default) or Meilisearch.
- **Headless CMS API**: Type-safe tRPC and REST APIs. Webhooks for every event. OpenAPI documentation.
- **TypeScript SDK**: Auto-generated types from schema. Zero guesswork, full IntelliSense.
- **Multi-Language (i18n)**: Publish in any language. All UI strings externalized. RTL support.
- **Team Collaboration**: Granular RBAC with admin, editor, author, and viewer roles.
- **Self-Hostable**: Deploy anywhere with Docker Compose. PostgreSQL + Redis. Own your data.

## Integrations

- GitHub / GitLab / Bitbucket (content sync)
- Shopify (storefront publishing)
- WordPress (bi-directional sync)
- Webflow / Wix (visual builder publishing)
- REST API and GraphQL endpoints
- Webhook system with HMAC-SHA256 signing

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4
- Prisma ORM (PostgreSQL)
- tRPC 11
- Redis
- Docker

## Pricing

- **Free**: 50 posts, 10 pages, 3 team members, 500 MB storage, 30-day analytics
- **Pro ($19/mo)**: Unlimited posts/pages, 20 team members, 10 GB storage, 1-year analytics, advanced search, SEO audit tools
- **Enterprise (Custom)**: Unlimited everything, SSO/SAML, SLA, dedicated support

## Links

- Website: ${BASE_URL}
- Documentation: https://docs.rankflo.io
- GitHub: https://github.com/rankflo/rankflo
- Blog: ${BASE_URL}/blog
- Pricing: ${BASE_URL}/pricing
- Features: ${BASE_URL}/features
- RSS Feed: ${BASE_URL}/feed.xml
- API Reference: https://docs.rankflo.io/api

## Contact

- Email: hello@rankflo.io
- Twitter/X: @rankflo
- GitHub Issues: https://github.com/rankflo/rankflo/issues
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
