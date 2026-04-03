import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Everything you need to build, deploy, and extend RankFlo — from first install to production webhooks.",
};

const cards = [
  { title: "Getting Started", description: "Install RankFlo, configure your environment, and publish your first post in under 10 minutes.", href: "/docs/getting-started", badge: "Start here" },
  { title: "Self-Hosting", description: "Deploy RankFlo on your own infrastructure with Docker Compose and production best practices.", href: "/docs/self-hosting" },
  { title: "API Reference", description: "Authenticate, query content endpoints, handle pagination, and integrate with any frontend.", href: "/docs/api-reference" },
  { title: "User Guide", description: "Learn the dashboard, editor, AI tools, analytics, team management, and more.", href: "/docs/user-guide" },
  { title: "Webhooks", description: "Subscribe to real-time events and verify payloads with HMAC-SHA256 signatures.", href: "/docs/webhooks" },
];

export default function DocsPage() {
  return (
    <div>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-800 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Open Source
      </div>
      <h1 className="text-4xl font-bold text-white">RankFlo Documentation</h1>
      <p className="mt-4 text-lg text-gray-400 leading-relaxed">
        Everything you need to build, deploy, and extend RankFlo — the open-source headless CMS with built-in SEO, analytics, and AI.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link href="/docs/getting-started" className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-black hover:bg-accent-9">
          Get Started
        </Link>
        <Link href="/docs/api-reference" className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 hover:border-gray-500 hover:text-white">
          API Reference
        </Link>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-xl border border-gray-800 bg-gray-950 p-6 transition-all hover:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold text-white">{card.title}</h3>
              {card.badge && (
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">{card.badge}</span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">{card.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
              Read more →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
