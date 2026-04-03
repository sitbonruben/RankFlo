import type { Metadata } from "next";
import { CodeBlock } from "@/components/marketing/docs-code";
import { Callout } from "@/components/marketing/docs-callout";

export const metadata: Metadata = {
  title: "Self-Hosting — RankFlo Docs",
  description: "Deploy RankFlo on your own infrastructure with Docker Compose, environment variables, and production best practices.",
};

export default function SelfHostingPage() {
  return (
    <div>
      <h1>Self-Hosting</h1>
      <p>Run RankFlo on your own infrastructure. This guide covers Docker Compose setup, required environment variables, and production best practices.</p>

      <h2 id="docker-compose">Docker Compose</h2>
      <p>The fastest way to self-host RankFlo:</p>
      <CodeBlock language="yaml" code={`version: "3.9"

services:
  web:
    image: ghcr.io/rankflo/rankflo:latest
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: rankflo
      POSTGRES_PASSWORD: rankflo
      POSTGRES_DB: rankflo
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rankflo"]
      interval: 5s
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:`} />
      <CodeBlock language="bash" code="docker compose up -d" />

      <h2 id="env-vars">Environment Variables</h2>
      <h3>Required</h3>
      <table>
        <thead><tr><th>Variable</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>DATABASE_URL</code></td><td>PostgreSQL connection string</td></tr>
          <tr><td><code>REDIS_URL</code></td><td>Redis connection string</td></tr>
          <tr><td><code>AUTH_SECRET</code></td><td>Random secret for signing sessions (min 32 chars)</td></tr>
          <tr><td><code>AUTH_URL</code></td><td>Public URL of your RankFlo instance</td></tr>
        </tbody>
      </table>

      <h3>Optional</h3>
      <table>
        <thead><tr><th>Variable</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>PORT</code></td><td>3000</td><td>HTTP server port</td></tr>
          <tr><td><code>GITHUB_CLIENT_ID</code></td><td>—</td><td>GitHub OAuth client ID</td></tr>
          <tr><td><code>GITHUB_CLIENT_SECRET</code></td><td>—</td><td>GitHub OAuth client secret</td></tr>
          <tr><td><code>SMTP_HOST</code></td><td>—</td><td>SMTP server for email</td></tr>
          <tr><td><code>S3_BUCKET</code></td><td>—</td><td>S3-compatible bucket for media</td></tr>
          <tr><td><code>S3_REGION</code></td><td>us-east-1</td><td>S3 region</td></tr>
          <tr><td><code>S3_ACCESS_KEY</code></td><td>—</td><td>S3 access key</td></tr>
          <tr><td><code>S3_SECRET_KEY</code></td><td>—</td><td>S3 secret key</td></tr>
          <tr><td><code>WEBHOOK_SECRET</code></td><td>—</td><td>Secret for signing outbound webhooks</td></tr>
        </tbody>
      </table>

      <h2 id="checklist">Production Checklist</h2>
      <Callout type="warning">
        <p>Verify all items before going live.</p>
      </Callout>
      <ul>
        <li><code>AUTH_SECRET</code> is a cryptographically random string (min 32 chars)</li>
        <li>PostgreSQL has connection pooling (PgBouncer)</li>
        <li>Redis persistence enabled (<code>appendonly yes</code>)</li>
        <li>HTTPS terminated at reverse proxy (nginx, Caddy)</li>
        <li>S3 or compatible storage configured for media</li>
        <li>Transactional email configured (SMTP or Resend/Postmark)</li>
        <li>PostgreSQL backups scheduled</li>
      </ul>

      <h2 id="reverse-proxy">Reverse Proxy</h2>
      <p>A minimal nginx configuration:</p>
      <CodeBlock language="nginx" code={`server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/ssl/certs/your-domain.pem;
    ssl_certificate_key /etc/ssl/private/your-domain.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`} />

      <h2 id="updating">Updating</h2>
      <CodeBlock language="bash" code={`docker compose pull
docker compose up -d`} />
      <Callout type="info">
        <p>Database migrations run automatically on startup. Always back up your database before upgrading.</p>
      </Callout>
    </div>
  );
}
