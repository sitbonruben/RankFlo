# Contributing to RankFlo

Thanks for your interest in contributing. Here's how to get started.

## Development setup

```bash
git clone https://github.com/sitbonruben/RankFlo.git
cd RankFlo
pnpm install
cp .env.example .env
# Edit .env with your local Postgres + Redis URLs
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Before submitting a PR

- Run `pnpm lint` — no lint errors
- Run `pnpm type-check` — no TypeScript errors
- Test your changes manually in the browser

## How to contribute

1. **Fork** the repo
2. **Create a branch**: `git checkout -b feat/your-feature` or `fix/your-bug`
3. **Make your changes**
4. **Open a pull request** against `main` with a clear description

For significant changes (new features, breaking changes), open an issue first so we can discuss the approach before you invest time building it.

## Project structure

```
apps/web/        — Next.js app (dashboard + marketing)
apps/docs/       — Documentation site
apps/extension/  — Chrome extension
packages/api/    — tRPC routers
packages/db/     — Prisma schema + migrations
packages/ai/     — AI provider abstraction
```

## Reporting bugs

Use the [bug report template](https://github.com/sitbonruben/RankFlo/issues/new?template=bug_report.md).

## License

By contributing, you agree your code will be licensed under the [Elastic License 2.0](LICENSE).
