import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "RankFlo",
            applicationCategory: "WebApplication",
            operatingSystem: "Web",
            description:
              "Open-source blog platform with AI content generation, built-in analytics, SEO scoring, and headless CMS API.",
            url: process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "127",
            },
          }),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Gradient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.07)_0%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-wide px-6">
          <div className="grid min-h-[85vh] grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left: headline */}
            <div className="lg:col-span-7 xl:col-span-6">
              <div className="flex items-center gap-2 mb-8">
                <span className="inline-flex h-6 items-center rounded-full border border-accent/20 bg-accent-light-1 px-3 text-xs font-medium text-green-800 dark:bg-accent-1 dark:text-accent">
                  Open Source
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-600">v0.1.0</span>
              </div>

              <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl 3xl:text-display">
                The blog platform
                <br />
                built for
                <br />
                <span className="text-green-600 dark:text-accent">what&apos;s next</span>
              </h1>

              <p className="mt-6 max-w-lg text-lg text-gray-600 leading-relaxed dark:text-gray-400">
                Publish, analyze, and grow. A modular platform with built-in
                analytics, SEO scoring, and full-text search. Self-host or let
                us handle it.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center rounded-xl bg-accent px-6 text-sm font-semibold text-black transition-all hover:bg-accent-9 hover:shadow-[0_0_24px_rgba(57,255,20,0.3)]"
                >
                  Start for free
                </Link>
                <a
                  href="https://github.com/rankflo/rankflo"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-gray-300 px-6 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-950 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
              </div>

              {/* Trust signal */}
              <div className="mt-12 flex items-center gap-6 text-xs text-gray-400 dark:text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(57,255,20,0.5)]" />
                  MIT License
                </span>
                <span>TypeScript</span>
                <span>Self-hostable</span>
              </div>
            </div>

            {/* Right: dashboard preview */}
            <div className="lg:col-span-5 xl:col-span-6">
              <div className="relative rounded-2xl border border-gray-200 bg-gray-50 p-1 shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:shadow-[0_0_60px_rgba(57,255,20,0.08)]">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <div className="ml-4 flex-1 rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-400 dark:bg-gray-900 dark:text-gray-600">
                    rankflo.io/dashboard
                  </div>
                </div>

                {/* Dashboard preview */}
                <div className="rounded-xl bg-white p-6 dark:bg-black">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-600">Overview</p>
                      <p className="text-sm font-medium text-gray-950 dark:text-white">Analytics Dashboard</p>
                    </div>
                    <div className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                      Last 7 days
                    </div>
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                      <p className="text-xs text-gray-400 dark:text-gray-600">Visitors</p>
                      <p className="mt-1 text-xl font-semibold text-gray-950 dark:text-white">12,847</p>
                      <p className="mt-0.5 text-xs text-green-600 dark:text-accent">+23%</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                      <p className="text-xs text-gray-400 dark:text-gray-600">Page views</p>
                      <p className="mt-1 text-xl font-semibold text-gray-950 dark:text-white">34,291</p>
                      <p className="mt-0.5 text-xs text-green-600 dark:text-accent">+18%</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                      <p className="text-xs text-gray-400 dark:text-gray-600">SEO Score</p>
                      <p className="mt-1 text-xl font-semibold text-green-600 dark:text-accent">94</p>
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">Excellent</p>
                    </div>
                  </div>

                  {/* Mini chart bars */}
                  <div className="flex items-end gap-1 h-20">
                    {[35, 45, 30, 55, 65, 50, 70, 60, 75, 85, 70, 90, 80, 95].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-accent/20"
                        style={{ height: `${h}%` }}
                      >
                        <div
                          className="w-full rounded-sm bg-accent transition-all"
                          style={{ height: `${h > 70 ? 100 : 60}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges divider */}
      <div className="pointer-events-none" aria-hidden="true">
        <div className="mx-auto h-px w-48 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />
      </div>

      {/* Features grid */}
      <section className="border-t border-gray-200/50 py-24 dark:border-gray-800/50">
        <div className="mx-auto max-w-wide px-6">
          <div className="mb-16">
            <p className="text-sm font-medium text-green-600 dark:text-accent">Platform</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight">
              Everything you need
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Rich editor",
                desc: "Block editor with markdown, embeds, code blocks, and live preview. Content stored as structured JSON.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                ),
              },
              {
                title: "Built-in analytics",
                desc: "Privacy-friendly, cookieless tracking. SEO scoring, search analytics, and custom dashboards.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
              {
                title: "API first",
                desc: "Type-safe tRPC and REST APIs. Webhooks for every event. Build anything on top.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                ),
              },
              {
                title: "Full-text search",
                desc: "Instant search with autocomplete, faceted filtering, and built-in search analytics.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
              },
              {
                title: "Multi-language",
                desc: "Publish in any language. All UI strings externalized. RTL support ready.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                  </svg>
                ),
              },
              {
                title: "Self-hostable",
                desc: "Deploy anywhere with Docker. PostgreSQL + Redis. Own your data completely.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-white p-8 transition-all hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-950 dark:hover:shadow-[inset_0_1px_0_0_rgba(57,255,20,0.1)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-green-600 dark:bg-gray-900 dark:text-accent">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-gray-950 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="pointer-events-none" aria-hidden="true">
        <div className="mx-auto h-px w-48 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />
      </div>

      {/* CTA */}
      <section className="relative border-t border-gray-200/50 py-24 dark:border-gray-800/50">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.05)_0%,transparent_60%)]" />
        </div>

        <div className="relative mx-auto max-w-content px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Ready to ship?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Start for free. Self-host or use our cloud. No credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent px-8 text-sm font-semibold text-black transition-all hover:bg-accent-9 hover:shadow-[0_0_24px_rgba(57,255,20,0.3)] sm:w-auto"
            >
              Get started
            </Link>
            <a
              href="https://dev.rankflo.io"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-gray-300 px-8 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-950 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white sm:w-auto"
            >
              Read the docs
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
