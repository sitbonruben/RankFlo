import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Getting Started — RankFlo Docs",
  description: "Install RankFlo, configure your environment, and publish your first post in under 10 minutes.",
};

export default function GettingStartedPage() {
  return (
    <div>
      <h1>Getting Started</h1>
      <p>RankFlo is an open-source headless CMS and blog platform built for SEO. This guide gets you up and running in minutes.</p>
      <hr />
      <h2>Two ways to use RankFlo</h2>
      <p><strong>Cloud (managed)</strong> — Create a free account at <Link href="/signup">app.rankflo.io</Link>. No setup required.</p>
      <p><strong>Self-hosted</strong> — Run RankFlo on your own server. See <Link href="/docs/self-hosting">Self-Hosting</Link>.</p>
      <hr />
      <h2>Quick start (self-hosted)</h2>
      <h3>Prerequisites</h3>
      <ul>
        <li>Docker + Docker Compose</li>
        <li>A server with 1 GB RAM minimum</li>
      </ul>
      <h3>1. Clone and configure</h3>
      <pre><code>{`git clone https://github.com/sitbonruben/RankFlo.git
cd RankFlo/docker

cp ../.env.example .env.production`}</code></pre>
      <p>Open <code>.env.production</code> and fill in the required values:</p>
      <pre><code>{`# Required
DATABASE_URL="postgresql://rankflo:yourpassword@postgres:5432/rankflo"
REDIS_URL="redis://redis:6379"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
ADMIN_EMAIL="admin@your-domain.com"
ADMIN_PASSWORD="choose-a-strong-password"

# Generate these with: openssl rand -hex 32
AUTH_SECRET="..."
ENCRYPTION_KEY="..."`}</code></pre>
      <h3>2. Start</h3>
      <pre><code>docker compose up -d</code></pre>
      <p>Open <code>http://localhost:3000</code> and sign in with the credentials you set.</p>
      <h3>3. Create your first project</h3>
      <ol>
        <li>Go to <strong>Projects → New Project</strong></li>
        <li>Enter a name (e.g. &quot;My Blog&quot;)</li>
        <li>Copy the <strong>Project API Key</strong> — you&apos;ll use this to fetch posts from your site</li>
      </ol>
      <hr />
      <h2>Connecting your site</h2>
      <p>Use the <Link href="/docs/api-reference">Content API</Link> to fetch posts from any framework.</p>
      <p><strong>Next.js example:</strong></p>
      <pre><code>{`// lib/rankflo.ts
const KEY = process.env.RANKFLO_PROJECT_KEY;

export async function getPosts() {
  const res = await fetch(
    \`https://app.rankflo.io/api/v1/content?project_key=\${KEY}&limit=20\`,
    { next: { revalidate: 300 } }
  );
  return (await res.json()).data ?? [];
}`}</code></pre>
      <hr />
      <h2>Development setup</h2>
      <p>If you want to contribute or run from source:</p>
      <pre><code>{`# Node 22+ and pnpm 9+ required
pnpm install

cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, AUTH_SECRET, ENCRYPTION_KEY

pnpm db:generate
pnpm db:migrate dev
pnpm db:seed     # creates the admin account

pnpm dev         # starts at http://localhost:3000`}</code></pre>
      <hr />
      <h2>Next steps</h2>
      <ul>
        <li><Link href="/docs/user-guide">User Guide</Link> — Learn the dashboard, editor, and AI tools</li>
        <li><Link href="/docs/api-reference">API Reference</Link> — Content delivery API docs</li>
        <li><Link href="/docs/self-hosting">Self-Hosting</Link> — Production deployment guide</li>
        <li><Link href="/docs/webhooks">Webhooks</Link> — Real-time post event subscriptions</li>
      </ul>
    </div>
  );
}
