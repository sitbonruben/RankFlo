import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore everything RankFlo offers: AI content generation, built-in analytics, SEO tools, headless CMS API, and more.",
};

const INTEGRATIONS = [
  {
    name: "GitHub / GitLab / Bitbucket",
    desc: "Push content directly to your repository. Auto-sync drafts and published posts.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l-1.757 1.757a4.5 4.5 0 01-6.364 6.364l4.5-4.5a4.5 4.5 0 017.244 1.242" />
      </svg>
    ),
  },
  {
    name: "Shopify",
    desc: "Publish blog content to your Shopify storefront. Drive organic traffic to products.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    name: "WordPress",
    desc: "Migrate from or publish to WordPress. Bi-directional content sync.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
      </svg>
    ),
  },
  {
    name: "Webflow / Wix",
    desc: "Design-first platforms. Push optimized content to any visual builder.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    name: "REST API / GraphQL",
    desc: "Headless CMS endpoints. Fetch content from any frontend or service.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    name: "TypeScript SDK",
    desc: "First-class TypeScript client. Type-safe queries, mutations, and webhooks.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
];

const SEO_FEATURES = [
  { title: "Real-time SEO scoring", desc: "Live score as you write. Keyword density, readability, meta quality." },
  { title: "Meta optimization", desc: "Auto-generate titles, descriptions, and Open Graph tags." },
  { title: "Structured data", desc: "JSON-LD schema markup generated automatically for every post." },
  { title: "Keyword density analysis", desc: "Track primary and secondary keyword usage across your content." },
  { title: "Internal linking suggestions", desc: "AI recommends links between your posts to boost authority." },
];

const ANALYTICS_FEATURES = [
  { title: "Page views & visitors", desc: "Real-time traffic data. No cookies, fully privacy-friendly." },
  { title: "Referrer tracking", desc: "See where your traffic comes from. Social, search, direct." },
  { title: "Device & browser breakdown", desc: "Understand your audience across desktop, tablet, and mobile." },
  { title: "Geographic insights", desc: "Country and city-level visitor data without invasive tracking." },
  { title: "Search analytics", desc: "See what visitors search for on your site. Find content gaps." },
];

const MORE_FEATURES = [
  {
    title: "Multi-language (i18n)",
    desc: "Publish in any language. All UI strings externalized. RTL support ready.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
  },
  {
    title: "Team collaboration & RBAC",
    desc: "Invite team members with granular roles: admin, editor, author, viewer.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: "Custom domains",
    desc: "Connect your own domain with automatic SSL. CNAME setup in minutes.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    title: "Block editor with 14+ types",
    desc: "Rich text, code, embeds, images, callouts, toggles, tables, and more.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    title: "Post versioning & revisions",
    desc: "Full revision history. Compare diffs, restore any previous version instantly.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
    ),
  },
  {
    title: "Scheduled publishing",
    desc: "Set publish dates in the future. Content goes live automatically.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Media management",
    desc: "Upload, organize, and optimize images. Automatic WebP conversion and CDN delivery.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 18.75h18a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H3a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 003 18.75z" />
      </svg>
    ),
  },
  {
    title: "Comment system",
    desc: "Built-in threaded comments. Moderation queue, spam filtering, and Markdown support.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    title: "Audit logs",
    desc: "Track every action across your project. Who changed what, and when.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    title: "Feature flags (OSS/SaaS)",
    desc: "Toggle features per environment. Run RankFlo as OSS or full SaaS product.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
      </svg>
    ),
  },
];

const STRATEGY_FEATURES = [
  {
    title: "AI-powered topic research",
    desc: "Discover high-potential topics your audience is searching for. Analyze search volume, competition, and relevance.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    title: "Content calendar generation",
    desc: "AI builds a publishing schedule based on your goals, seasonality, and content gaps.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    title: "Competitor analysis",
    desc: "See what your competitors rank for. Identify content opportunities they&apos;re missing.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
  },
  {
    title: "Quick win identification",
    desc: "Find low-effort, high-impact content improvements. Optimize existing posts for better rankings.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "Traffic growth planning",
    desc: "Set traffic goals and get AI-generated plans with timelines, milestones, and content recommendations.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
];

const DX_FEATURES = [
  {
    title: "Headless CMS API",
    desc: "RESTful and tRPC endpoints for every resource. Paginated, filterable, fully documented.",
  },
  {
    title: "TypeScript SDK",
    desc: "Auto-generated types from your schema. Zero guesswork, full IntelliSense.",
  },
  {
    title: "Webhook system",
    desc: "Real-time event notifications. Post published, updated, deleted, and more.",
  },
  {
    title: "API key management",
    desc: "Scoped keys with granular permissions. Rotate, revoke, and audit from the dashboard.",
  },
  {
    title: "Self-hosting",
    desc: "Docker Compose up. PostgreSQL + Redis. Deploy anywhere in under five minutes.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Decorative vertical lines */}
      <div className="pointer-events-none fixed inset-0 z-0 mx-auto max-w-wide px-6">
        <div className="relative h-full w-full">
          <div className="absolute left-1/4 top-0 h-full w-px bg-gray-200/40 dark:bg-gray-800/30" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-gray-200/40 dark:bg-gray-800/30" />
          <div className="absolute left-3/4 top-0 h-full w-px bg-gray-200/40 dark:bg-gray-800/30" />
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.06)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-wide px-6 text-center">
          <p className="text-sm font-medium text-green-600 dark:text-accent">Features</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Everything you need to{" "}
            <span className="text-accent">grow organically</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            A modular, open-source blog platform with AI content generation,
            built-in analytics, SEO scoring, and integrations for every stack.
            From first draft to first page of Google.
          </p>
        </div>
      </section>

      {/* Section 1 — AI Content Engine */}
      <section className="relative border-t border-gray-200 dark:border-gray-800/50 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(57,255,20,0.04)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-wide px-6">
          <div className="mb-16">
            <p className="text-sm font-medium text-green-600 dark:text-accent">Hero Feature</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              AI Content Engine
            </h2>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left: description */}
            <div>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Generate SEO-optimized blog posts that match your brand voice.
                RankFlo&apos;s AI pipeline handles research, outlining, drafting,
                and optimization — so you can focus on strategy.
              </p>
              <ul className="mt-8 flex flex-col gap-4">
                {[
                  "Generate SEO-optimized content",
                  "Match your brand voice automatically",
                  "Multi-step pipeline: research \u2192 outline \u2192 draft \u2192 optimize",
                  "Smart keyword targeting",
                  "Readability optimization",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: mock AI editor UI */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 p-1 shadow-2xl shadow-accent/5">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="ml-4 flex-1 rounded-md bg-gray-100 dark:bg-gray-900 px-3 py-1 text-xs text-gray-400 dark:text-gray-600">
                  rankflo.io/ai/generate
                </div>
              </div>

              <div className="rounded-xl bg-white dark:bg-black p-6">
                {/* Prompt input */}
                <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">
                    Prompt
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Write a blog post about sustainable packaging trends for
                    e-commerce brands targeting Gen Z buyers
                  </p>
                </div>

                {/* Pipeline steps */}
                <div className="mb-4 flex items-center gap-2">
                  {["Research", "Outline", "Draft", "Optimize"].map(
                    (step, i) => (
                      <div key={step} className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-1 text-[10px] font-medium ${
                            i <= 2
                              ? "bg-accent-light-1 text-green-700 dark:bg-accent-1 dark:text-accent"
                              : "bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600"
                          }`}
                        >
                          {step}
                        </span>
                        {i < 3 && (
                          <svg
                            className="h-3 w-3 text-gray-300 dark:text-gray-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        )}
                      </div>
                    )
                  )}
                </div>

                {/* Generated content preview */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-medium text-accent">
                      Generated Draft
                    </p>
                    <span className="rounded-full bg-accent-light-1 border border-green-200 dark:bg-accent-1 dark:border-accent/20 px-2 py-0.5 text-[10px] text-accent">
                      SEO Score: 92
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-2.5 w-full rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-2.5 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-2.5 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="mt-3 h-2.5 w-full rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-2.5 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Universal Integrations */}
      <section className="border-t border-gray-200 dark:border-gray-800/50 py-24 md:py-32">
        <div className="mx-auto max-w-wide px-6">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-accent">Integrations</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Connect to anything
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
              One platform, every framework. Deploy content to any tech stack.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800 sm:grid-cols-2 lg:grid-cols-3">
            {INTEGRATIONS.map((integration) => (
              <div
                key={integration.name}
                className="bg-white p-8 transition-colors hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-950"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-green-600 dark:bg-gray-900 dark:text-accent">
                  {integration.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-950 dark:text-white">
                  {integration.name}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {integration.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Brand Intelligence */}
      <section className="relative border-t border-gray-200 dark:border-gray-800/50 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(57,255,20,0.04)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-wide px-6">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-accent">Brand Intelligence</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Your brand. Perfectly replicated.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
              Paste a URL and RankFlo extracts your full brand profile
              automatically. Colors, fonts, tone of voice, and industry context.
            </p>
          </div>

          {/* Brand profile card visualization */}
          <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 p-1 shadow-2xl shadow-accent/5">
            <div className="flex items-center gap-1.5 px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="ml-4 flex-1 rounded-md bg-gray-100 dark:bg-gray-900 px-3 py-1 text-xs text-gray-400 dark:text-gray-600">
                rankflo.io/brand/profile
              </div>
            </div>

            <div className="rounded-xl bg-white dark:bg-black p-6">
              {/* URL input */}
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 px-4 py-3">
                <svg
                  className="h-4 w-4 shrink-0 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  https://your-company.com
                </span>
                <span className="ml-auto rounded-md bg-accent px-3 py-1 text-xs font-semibold text-black">
                  Analyze
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Colors */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <p className="mb-3 text-xs font-medium text-gray-500">
                    Brand Colors
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-blue-600" />
                    <div className="h-8 w-8 rounded-md bg-slate-900" />
                    <div className="h-8 w-8 rounded-md bg-white border border-gray-200 dark:border-gray-700" />
                    <div className="h-8 w-8 rounded-md bg-amber-400" />
                  </div>
                </div>

                {/* Fonts */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <p className="mb-3 text-xs font-medium text-gray-500">
                    Typography
                  </p>
                  <p className="text-sm font-semibold text-gray-950 dark:text-white">Inter</p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    Heading &middot; Body
                  </p>
                </div>

                {/* Tone */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <p className="mb-3 text-xs font-medium text-gray-500">
                    Tone of Voice
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Professional", "Friendly", "Concise"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-accent-light-1 border border-green-200 dark:bg-accent-1 dark:border-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Industry */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
                  <p className="mb-3 text-xs font-medium text-gray-500">
                    Industry Context
                  </p>
                  <p className="text-sm font-semibold text-gray-950 dark:text-white">
                    SaaS / Technology
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    B2B &middot; Developer tools
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — SEO & Analytics */}
      <section className="border-t border-gray-200 dark:border-gray-800/50 py-24 md:py-32">
        <div className="mx-auto max-w-wide px-6">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-accent">
              Performance
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              SEO &amp; Analytics, built in
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
              Every tool you need to measure, optimize, and grow your organic
              traffic. No third-party scripts required.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800 md:grid-cols-2">
            {/* SEO side */}
            <div className="bg-white p-8 transition-colors hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-950">
              <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-green-600 dark:bg-gray-900 dark:text-accent">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-950 dark:text-white">
                SEO Toolkit
              </h3>
              <p className="mb-6 text-sm text-gray-500">
                Optimize every post for search engines before you hit publish.
              </p>
              <ul className="flex flex-col gap-3">
                {SEO_FEATURES.map((f) => (
                  <li key={f.title}>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {f.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">{f.desc}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Analytics side */}
            <div className="bg-white p-8 transition-colors hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-950">
              <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-green-600 dark:bg-gray-900 dark:text-accent">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-950 dark:text-white">
                Analytics Dashboard
              </h3>
              <p className="mb-6 text-sm text-gray-500">
                Privacy-friendly, cookieless tracking. Understand your audience
                without invasive scripts.
              </p>
              <ul className="flex flex-col gap-3">
                {ANALYTICS_FEATURES.map((f) => (
                  <li key={f.title}>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {f.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">{f.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — Developer Experience */}
      <section className="relative border-t border-gray-200 dark:border-gray-800/50 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.04)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-wide px-6">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-accent">
              Developer Experience
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Built for developers
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
              Headless CMS API, TypeScript SDK, webhooks, and full
              self-hosting support. Build anything on top of RankFlo.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Feature list */}
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800">
              {DX_FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="bg-white p-6 transition-colors hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-950"
                >
                  <h3 className="mb-1 text-sm font-semibold text-gray-950 dark:text-white">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Code example */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 p-1 shadow-2xl shadow-accent/5">
              <div className="flex items-center gap-1.5 px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="ml-4 rounded-md bg-gray-100 dark:bg-gray-900 px-3 py-1 text-xs text-gray-400 dark:text-gray-600">
                  app.ts
                </div>
              </div>

              <div className="rounded-xl bg-white dark:bg-black p-6">
                <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed">
                  <code>
                    <span className="text-gray-400 dark:text-gray-500">
                      {`// Fetch published posts with the RankFlo SDK\n`}
                    </span>
                    <span className="text-accent">import</span>
                    <span className="text-gray-700 dark:text-gray-300">{` { RankFlo } `}</span>
                    <span className="text-accent">from</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {` `}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {`'@rankflo/sdk'`}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{`;\n\n`}</span>
                    <span className="text-accent">const</span>
                    <span className="text-gray-700 dark:text-gray-300">{` client = `}</span>
                    <span className="text-accent">new</span>
                    <span className="text-gray-700 dark:text-gray-300">{` RankFlo({\n`}</span>
                    <span className="text-gray-700 dark:text-gray-300">{`  apiKey: process.env.`}</span>
                    <span className="text-amber-600 dark:text-amber-400">RANKFLO_API_KEY</span>
                    <span className="text-gray-700 dark:text-gray-300">{`,\n});\n\n`}</span>
                    <span className="text-accent">const</span>
                    <span className="text-gray-700 dark:text-gray-300">{` posts = `}</span>
                    <span className="text-accent">await</span>
                    <span className="text-gray-700 dark:text-gray-300">{` client.posts.list({\n`}</span>
                    <span className="text-gray-700 dark:text-gray-300">{`  status: `}</span>
                    <span className="text-amber-600 dark:text-amber-400">{`'published'`}</span>
                    <span className="text-gray-700 dark:text-gray-300">{`,\n`}</span>
                    <span className="text-gray-700 dark:text-gray-300">{`  limit: `}</span>
                    <span className="text-accent">10</span>
                    <span className="text-gray-700 dark:text-gray-300">{`,\n`}</span>
                    <span className="text-gray-700 dark:text-gray-300">{`  orderBy: `}</span>
                    <span className="text-amber-600 dark:text-amber-400">{`'publishedAt'`}</span>
                    <span className="text-gray-700 dark:text-gray-300">{`,\n});\n\n`}</span>
                    <span className="text-gray-400 dark:text-gray-500">
                      {`// Type-safe response\n`}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{`posts.data.`}</span>
                    <span className="text-accent">forEach</span>
                    <span className="text-gray-700 dark:text-gray-300">{`((post) => {\n`}</span>
                    <span className="text-gray-700 dark:text-gray-300">{`  console.log(post.title, post.seoScore);\n`}</span>
                    <span className="text-gray-700 dark:text-gray-300">{`});`}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 — Content Strategy */}
      <section className="border-t border-gray-200 dark:border-gray-800/50 py-24 md:py-32">
        <div className="mx-auto max-w-wide px-6">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-accent">Strategy</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Content strategy, automated
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
              AI-powered research and planning tools that turn data into a
              publishing roadmap.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800 sm:grid-cols-2 lg:grid-cols-3">
            {STRATEGY_FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className={`bg-white p-8 transition-colors hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-950 ${
                  i === STRATEGY_FEATURES.length - 1 &&
                  STRATEGY_FEATURES.length % 3 !== 0
                    ? "sm:col-span-2 lg:col-span-1"
                    : ""
                }`}
              >
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
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 — More Features */}
      <section className="relative border-t border-gray-200 dark:border-gray-800/50 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(57,255,20,0.03)_0%,transparent_50%)]" />
        <div className="relative mx-auto max-w-wide px-6">
          <div className="mb-16 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-accent">
              And more
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything else you&apos;d expect
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
              A comprehensive platform that covers collaboration, content
              management, publishing workflows, and operational tooling.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MORE_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-8 transition-colors hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-950"
              >
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
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 dark:border-gray-800/50 py-24 md:py-32">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Ready to grow?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
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
              href="https://github.com/rankflo/rankflo"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-gray-300 px-8 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-950 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white"
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
    </>
  );
}
