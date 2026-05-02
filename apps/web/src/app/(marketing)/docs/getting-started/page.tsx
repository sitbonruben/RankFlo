import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/marketing/docs-code";
import { Callout } from "@/components/marketing/docs-callout";

export const metadata: Metadata = {
  title: "Getting Started — RankFlo Docs",
  description: "Install RankFlo, configure your environment, and publish your first post in under 10 minutes.",
  alternates: { canonical: "/docs/getting-started" },
};

export default function GettingStartedPage() {
  return (
    <div>
      <h1>Getting Started</h1>
      <p>RankFlo is an open-source headless CMS and blog platform built for SEO. This guide gets you up and running in minutes.</p>

      <hr />

      <h2 id="two-ways">Two ways to use RankFlo</h2>
      <p><strong>Cloud (managed)</strong> — Create a free account at <Link href="/signup">app.rankflo.io</Link>. No setup required.</p>
      <p><strong>Self-hosted</strong> — Run RankFlo on your own server with Docker. See <Link href="/docs/self-hosting">Self-Hosting</Link>.</p>

      <hr />

      <h2 id="quick-start">Quick start (self-hosted)</h2>

      <h3>Prerequisites</h3>
      <ul>
        <li>Docker + Docker Compose</li>
        <li>A server with 1 GB RAM minimum</li>
      </ul>

      <h3>1. Clone and configure</h3>
      <CodeBlock
        language="bash"
        code={`git clone https://github.com/sitbonruben/RankFlo.git
cd RankFlo/docker

cp ../.env.example .env.production`}
      />

      <p>Open <code>.env.production</code> and fill in the required values:</p>

      <CodeBlock
        language="bash"
        code={`# Required
DATABASE_URL="postgresql://rankflo:yourpassword@postgres:5432/rankflo"
REDIS_URL="redis://redis:6379"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
ADMIN_EMAIL="admin@your-domain.com"
ADMIN_PASSWORD="choose-a-strong-password"

# Generate these with: openssl rand -hex 32
AUTH_SECRET="..."
ENCRYPTION_KEY="..."`}
      />

      <h3>2. Start</h3>
      <CodeBlock language="bash" code="docker compose up -d" />
      <p>Open <code>http://localhost:3000</code> and sign in with the credentials you set.</p>

      <h3>3. Create your first project</h3>
      <ol>
        <li>Go to <strong>Projects → New Project</strong></li>
        <li>Enter a name (e.g. &quot;My Blog&quot;)</li>
        <li>Copy the <strong>Project API Key</strong> — you&apos;ll use this to fetch posts from your site</li>
      </ol>

      <Callout type="tip">
        <p>Your project key (<code>blg_xxx</code>) is read-only. It only returns <strong>published</strong> posts — drafts and scheduled posts are never exposed.</p>
      </Callout>

      <hr />

      <h2 id="connecting">Connecting your site</h2>
      <p>Use the <Link href="/docs/api-reference">Content API</Link> to fetch posts from any framework.</p>

      <CodeBlock
        language="typescript"
        code={`// lib/rankflo.ts
const KEY = process.env.RANKFLO_PROJECT_KEY;

export async function getPosts() {
  const res = await fetch(
    \`https://app.rankflo.io/api/v1/content?project_key=\${KEY}&limit=20\`,
    { next: { revalidate: 300 } }
  );
  return (await res.json()).data ?? [];
}`}
      />

      <hr />

      <h2 id="dev-setup">Development setup</h2>
      <p>If you want to contribute or run from source:</p>

      <CodeBlock
        language="bash"
        code={`# Node 22+ and pnpm 9+ required
pnpm install

cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, AUTH_SECRET, ENCRYPTION_KEY

pnpm db:generate
pnpm db:migrate dev
pnpm db:seed     # creates the admin account

pnpm dev         # starts at http://localhost:3000`}
      />

      <hr />

      <h2 id="next-steps">Next steps</h2>
      <div className="grid gap-3 sm:grid-cols-2 not-prose my-4">
        {[
          { href: "/docs/user-guide", title: "User Guide", desc: "Dashboard, editor, AI tools" },
          { href: "/docs/api-reference", title: "API Reference", desc: "Content delivery API" },
          { href: "/docs/self-hosting", title: "Self-Hosting", desc: "Production deployment" },
          { href: "/docs/webhooks", title: "Webhooks", desc: "Real-time events" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-xl border border-gray-800 bg-gray-950 p-4 transition-all hover:border-gray-700 no-underline"
          >
            <p className="text-sm font-semibold text-white group-hover:text-accent">{card.title}</p>
            <p className="mt-1 text-xs text-gray-500">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
