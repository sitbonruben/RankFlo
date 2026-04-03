import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "RankFlo is the open-source blog platform built for organic growth. AI-powered content, built-in analytics, and a developer-first architecture.",
};

const STEPS = [
  {
    number: "01",
    title: "Connect your project",
    desc: "Link your repository, website, or storefront. RankFlo integrates with your existing stack in minutes — GitHub, Shopify, WordPress, or any custom frontend via API.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l-1.757 1.757a4.5 4.5 0 01-6.364 6.364l4.5-4.5a4.5 4.5 0 017.244 1.242" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "AI learns your brand",
    desc: "Paste your URL and RankFlo extracts your brand profile: colors, fonts, tone of voice, and industry context. Every piece of content matches your identity from day one.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Content drives growth",
    desc: "Publish AI-generated, SEO-optimized content on autopilot. Track performance with built-in analytics. Watch your organic traffic grow week over week.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
];

const TECH_STACK = [
  { name: "Next.js", desc: "React framework" },
  { name: "TypeScript", desc: "Type safety" },
  { name: "Prisma", desc: "Database ORM" },
  { name: "tRPC", desc: "End-to-end types" },
  { name: "Tailwind CSS", desc: "Utility-first CSS" },
  { name: "PostgreSQL", desc: "Relational database" },
];

export default function AboutPage() {
  return (
    <>
      {/* Decorative vertical lines */}
      <div className="pointer-events-none fixed inset-0 z-0 mx-auto max-w-wide px-6">
        <div className="relative h-full w-full">
          <div className="absolute left-1/4 top-0 h-full w-px bg-gray-800/30" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-gray-800/30" />
          <div className="absolute left-3/4 top-0 h-full w-px bg-gray-800/30" />
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.06)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-wide px-6 text-center">
          <p className="text-sm font-medium text-accent">About</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            The open-source blog platform
            <br />
            <span className="text-accent">built for growth</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 leading-relaxed">
            RankFlo helps every business drive organic traffic through
            intelligent, AI-powered content. From first draft to first page of
            Google — with the tools, analytics, and integrations to scale.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-gray-800/50 py-24 md:py-32">
        <div className="mx-auto max-w-content px-6">
          <p className="text-sm font-medium text-accent">Our Mission</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Democratizing content marketing
          </h2>

          <div className="mt-8 space-y-6 text-gray-400 leading-relaxed">
            <p>
              Content marketing is the most effective long-term growth channel
              for any business. But creating high-quality, SEO-optimized content
              consistently is hard. It requires expertise in writing, search
              engine optimization, analytics, and distribution — skills that most
              teams don&apos;t have in-house.
            </p>
            <p>
              RankFlo exists to close that gap. We combine the best of modern
              web technology with artificial intelligence to give every team —
              from solo founders to enterprise organizations — the tools they
              need to create content that ranks, converts, and compounds over
              time.
            </p>
            <p>
              We believe the future of content is open. That&apos;s why RankFlo
              is open source, self-hostable, and built on a modular architecture
              that you can extend, customize, and make your own.
            </p>
          </div>

          {/* Quote block */}
          <blockquote className="mt-10 border-l-2 border-accent pl-6">
            <p className="text-lg font-medium text-white leading-relaxed">
              &ldquo;Every business deserves a blog that works as hard as they
              do. RankFlo makes that possible — without the agency fees, without
              the complexity, and without giving up control of your data.&rdquo;
            </p>
          </blockquote>
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-t border-gray-800/50 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(57,255,20,0.04)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-wide px-6">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-accent">How It Works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps to organic growth
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-800 bg-gray-800 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="bg-black p-8 transition-colors hover:bg-gray-950"
              >
                <div className="mb-6 flex items-center gap-4">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-1 border border-accent/20 text-xs font-bold text-accent">
                    {step.number}
                  </span>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-accent">
                    {step.icon}
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="border-t border-gray-800/50 py-24 md:py-32">
        <div className="mx-auto max-w-wide px-6">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-accent">Technology</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Built with the modern stack
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
              Battle-tested technologies chosen for performance, developer
              experience, and long-term maintainability.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-800 bg-gray-800 sm:grid-cols-3 lg:grid-cols-6">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="bg-black p-6 text-center transition-colors hover:bg-gray-950"
              >
                <p className="text-sm font-semibold text-white">{tech.name}</p>
                <p className="mt-1 text-xs text-gray-600">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section className="relative border-t border-gray-800/50 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(57,255,20,0.04)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-wide px-6">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-accent">Open Source</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Transparent. Extensible. Yours.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
              RankFlo is committed to open source. Inspect the code, contribute
              features, deploy on your own infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-800 bg-gray-800 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "MIT License",
                desc: "Use RankFlo for any purpose — personal, commercial, or enterprise. No restrictions.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
              {
                title: "Self-hostable",
                desc: "Deploy with Docker Compose. PostgreSQL + Redis. Own your data and infrastructure completely.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                  </svg>
                ),
              },
              {
                title: "Community-driven",
                desc: "Feature requests, bug reports, and pull requests welcome. Built in the open, shaped by users.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
              },
              {
                title: "Fully extensible",
                desc: "Plugin architecture, custom block types, and a headless API. Build anything on top of RankFlo.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-black p-8 transition-colors hover:bg-gray-950"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-accent">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href="https://github.com/sitbonruben/RankFlo"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-gray-700 px-8 text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800/50 py-24 md:py-32">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Ready to grow?
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Start for free. Self-host or use our cloud. No credit card required.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-xl bg-accent px-8 text-sm font-semibold text-black transition-all hover:bg-accent-9 hover:shadow-[0_0_24px_rgba(57,255,20,0.3)]"
            >
              Start for free
            </Link>
            <a
              href="/docs"
              className="inline-flex h-12 items-center rounded-xl border border-gray-700 px-8 text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
            >
              Read the docs
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
