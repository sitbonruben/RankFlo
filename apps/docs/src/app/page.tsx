import Link from "next/link";

interface QuickStartCard {
  title: string;
  description: string;
  href: string;
  badge?: string;
}

const cards: QuickStartCard[] = [
  {
    title: "Getting Started",
    description:
      "Install RankFlo, configure your environment, and launch the dev server in under five minutes.",
    href: "/docs/getting-started",
    badge: "Start here",
  },
  {
    title: "Self-Hosting",
    description:
      "Deploy RankFlo on your own infrastructure with Docker Compose, environment variables, and production best practices.",
    href: "/docs/self-hosting",
  },
  {
    title: "API Reference",
    description:
      "Authenticate, query endpoints, handle pagination, and manage resources through the RankFlo REST API.",
    href: "/docs/api-reference",
  },
  {
    title: "Webhooks",
    description:
      "Subscribe to real-time events, verify payloads with HMAC-SHA256 signatures, and build integrations.",
    href: "/docs/webhooks",
  },
];

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="transition-transform group-hover:translate-x-1"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DocsHome() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white">
              RankFlo
            </span>
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
            <span className="ml-1 rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
              docs
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/docs/getting-started"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Guides
            </Link>
            <Link
              href="/docs/api-reference"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              API
            </Link>
            <a
              href="https://github.com/rankflo/rankflo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-neutral-800">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-accent-1 px-3 py-1 text-xs font-medium text-accent">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Open Source
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.1] tracking-tight text-white">
            RankFlo Documentation
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-400">
            Everything you need to build, deploy, and extend RankFlo — the
            open-source platform for developer communities. From first install
            to production-ready webhooks.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-9"
            >
              Get Started
              <ArrowIcon />
            </Link>
            <Link
              href="/docs/api-reference"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
            >
              API Reference
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Start Cards */}
      <section className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Quick Links
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group relative rounded-xl border border-neutral-800 bg-neutral-950 p-6 transition-all hover:border-neutral-700 hover:bg-neutral-900/50"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-white">
                    {card.title}
                  </h3>
                  {card.badge && (
                    <span className="rounded-full bg-accent-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                      {card.badge}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {card.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent">
                  Read more
                  <ArrowIcon />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <p className="text-xs text-neutral-600">
            RankFlo &mdash; Open Source Community Platform
          </p>
          <p className="text-xs text-neutral-600">v0.0.1</p>
        </div>
      </footer>
    </div>
  );
}
