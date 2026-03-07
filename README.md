# RankFlo

Next-generation blogging platform with built-in analytics, SEO tools, and full-text search.

**Open source. Self-hostable. Enterprise-ready.**

## Features

- **Rich Post Editor** — Tiptap-powered editor with live preview, scheduling, and revision history
- **Built-in Analytics** — Cookieless, privacy-first pageview tracking with UTM support
- **SEO Audit Engine** — 9-check scoring system with actionable recommendations
- **Full-Text Search** — PostgreSQL tsvector (default) or Meilisearch (optional)
- **Search Analytics** — Query tracking, CTR measurement, zero-results detection
- **Webhooks** — HMAC-SHA256 signed, exponential backoff retry, dead letter queue
- **REST + tRPC API** — Type-safe internal API with auto-generated REST endpoints
- **Multi-Tenant** — Organizations, teams, RBAC (Admin/Editor/Author/Viewer)
- **OAuth** — Google + GitHub sign-in
- **i18n** — Runtime translation system with typed dictionaries
- **Mobile App** — React Native / Expo companion app

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) |
| API | tRPC + REST (OpenAPI) |
| Database | PostgreSQL + Prisma |
| Cache | Redis |
| Auth | Custom session-based |
| UI | Radix UI + Tailwind CSS v4 |
| Mobile | React Native + Expo |
| Search | PostgreSQL / Meilisearch |
| Email | React Email + SMTP |
| Deploy | Vercel / Docker |

## Quick Start

```bash
# Clone and install
git clone https://github.com/rankflo/rankflo.git
cd rankflo
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Set up database
pnpm db:generate
pnpm db:migrate dev
pnpm db:seed

# Start development
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Default admin credentials are set via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`.

## Self-Hosting with Docker

```bash
cd docker
cp ../.env.example .env
# Edit .env

docker compose up -d
```

See the [self-hosting guide](https://dev.rankflo.io/docs/self-hosting) for production setup.

## Project Structure

```
rankflo/
├── apps/
│   ├── web/            # SaaS platform (Next.js 15)
│   ├── docs/           # Developer documentation
│   └── mobile/         # React Native / Expo
├── packages/
│   ├── api/            # tRPC routers + REST
│   ├── auth/           # Sessions, OAuth, RBAC
│   ├── analytics/      # Analytics engine
│   ├── core/           # Types, validators, constants
│   ├── db/             # Prisma schema + client
│   ├── email/          # Email templates + sending
│   ├── feature-flags/  # OSS/SaaS feature gating
│   ├── i18n/           # Internationalization
│   ├── sdk/            # Public SDK
│   ├── search/         # Search abstraction
│   ├── ui/             # Component library
│   └── webhooks/       # Webhook delivery
├── tooling/
│   ├── eslint/         # ESLint config
│   ├── tailwind/       # Design tokens
│   └── typescript/     # Shared tsconfig
└── docker/             # Docker setup
```

## Scripts

```bash
pnpm dev           # Start all apps in dev mode
pnpm build         # Build all packages and apps
pnpm lint          # Lint all packages
pnpm type-check    # TypeScript check all packages
pnpm db:generate   # Generate Prisma client
pnpm db:migrate    # Run database migrations
pnpm db:seed       # Seed database with admin user
pnpm db:studio     # Open Prisma Studio
```

## API

RankFlo exposes both tRPC (internal) and REST (public) APIs.

**REST API** is available at `/api/v1/*` with Bearer token authentication via API keys.

**tRPC** is used internally by the web and mobile apps.

See the [API documentation](https://dev.rankflo.io/docs/api-reference) for details.

## Contributing

We welcome contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
