import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

interface ComparisonData {
  competitor: string;
  tagline: string;
  description: string;
  rankfloAdvantages: string[];
  competitorAdvantages: string[];
  comparison: { feature: string; rankflo: string; competitor: string }[];
}

const COMPARISONS: Record<string, ComparisonData> = {
  "rankflo-vs-wordpress": {
    competitor: "WordPress",
    tagline: "Modern, type-safe, and AI-powered",
    description: "Compare RankFlo and WordPress. See why teams are choosing a modern, open-source blog platform with AI content generation, built-in analytics, and a developer-first architecture.",
    rankfloAdvantages: ["AI content generation built-in", "Type-safe API (tRPC)", "Built-in analytics (no plugins)", "Modern stack (Next.js, React, TypeScript)", "No plugin security vulnerabilities", "Real-time SEO scoring in editor"],
    competitorAdvantages: ["Massive plugin ecosystem", "Decades of community support", "More themes available", "Lower learning curve for non-developers"],
    comparison: [
      { feature: "AI Content Generation", rankflo: "Built-in", competitor: "Plugin required" },
      { feature: "Analytics", rankflo: "Built-in, cookieless", competitor: "Plugin required" },
      { feature: "SEO Tools", rankflo: "Built-in, real-time", competitor: "Plugin required (Yoast)" },
      { feature: "API", rankflo: "Type-safe tRPC + REST", competitor: "REST only" },
      { feature: "Self-hosting", rankflo: "Docker (5 min)", competitor: "LAMP stack" },
      { feature: "TypeScript SDK", rankflo: "Yes", competitor: "No" },
    ],
  },
  "rankflo-vs-ghost": {
    competitor: "Ghost",
    tagline: "More features, fully open source",
    description: "Compare RankFlo and Ghost. Both are modern publishing platforms, but RankFlo adds AI content generation, headless CMS API, and a more flexible architecture.",
    rankfloAdvantages: ["AI content generation", "Headless CMS with tRPC", "Team RBAC built-in", "i18n / multi-language support", "Webhook system", "Programmatic SEO tools"],
    competitorAdvantages: ["More mature platform", "Built-in newsletter/subscriptions", "Established brand", "Simpler setup"],
    comparison: [
      { feature: "AI Content", rankflo: "Built-in", competitor: "Not available" },
      { feature: "Headless API", rankflo: "tRPC + REST + SDK", competitor: "Content API only" },
      { feature: "Analytics", rankflo: "Built-in", competitor: "Basic built-in" },
      { feature: "i18n", rankflo: "Full support", competitor: "Limited" },
      { feature: "Webhooks", rankflo: "HMAC-signed, retry logic", competitor: "Basic" },
      { feature: "License", rankflo: "MIT", competitor: "MIT" },
    ],
  },
  "rankflo-vs-medium": {
    competitor: "Medium",
    tagline: "Own your content, own your audience",
    description: "Compare RankFlo and Medium. Stop renting your audience on someone else's platform. Self-host, use your own domain, and keep full control.",
    rankfloAdvantages: ["Full data ownership", "Custom domain included", "No paywall restrictions", "Built-in analytics", "SEO optimization tools", "API access to your content"],
    competitorAdvantages: ["Built-in audience network", "Zero setup required", "Social features", "Partner program monetization"],
    comparison: [
      { feature: "Data Ownership", rankflo: "Full ownership", competitor: "Platform-owned" },
      { feature: "Custom Domain", rankflo: "Yes", competitor: "Paid feature" },
      { feature: "SEO Control", rankflo: "Full control", competitor: "Limited" },
      { feature: "API Access", rankflo: "Full API", competitor: "Read-only" },
      { feature: "Analytics", rankflo: "Full dashboard", competitor: "Basic stats" },
      { feature: "Monetization", rankflo: "Your choice", competitor: "Partner program" },
    ],
  },
  "rankflo-vs-substack": {
    competitor: "Substack",
    tagline: "Blog + newsletter, fully under your control",
    description: "Compare RankFlo and Substack. Get the publishing power of Substack with full ownership, custom domains, and developer-friendly APIs.",
    rankfloAdvantages: ["Full data ownership", "Custom domain", "AI content generation", "Developer API", "Self-hostable", "No platform fees"],
    competitorAdvantages: ["Built-in email delivery", "Subscription management", "Discovery network", "Simple pricing"],
    comparison: [
      { feature: "AI Writing", rankflo: "Built-in", competitor: "Not available" },
      { feature: "Data Ownership", rankflo: "Full", competitor: "Platform-dependent" },
      { feature: "Custom Domain", rankflo: "Free", competitor: "Paid" },
      { feature: "API", rankflo: "Full tRPC + REST", competitor: "Limited" },
      { feature: "Self-hosting", rankflo: "Yes", competitor: "No" },
      { feature: "SEO Tools", rankflo: "Built-in", competitor: "Basic" },
    ],
  },
  "rankflo-vs-hashnode": {
    competitor: "Hashnode",
    tagline: "Open source, self-hostable, AI-powered",
    description: "Compare RankFlo and Hashnode for developer blogging. Both target developers, but RankFlo is fully open source, self-hostable, and includes AI content generation.",
    rankfloAdvantages: ["Fully open source (MIT)", "Self-hostable with Docker", "AI content generation", "Headless CMS API", "Team RBAC", "Custom integrations"],
    competitorAdvantages: ["Developer community network", "Free hosting", "GitHub-backed auth", "Newsletter built-in"],
    comparison: [
      { feature: "Open Source", rankflo: "MIT License", competitor: "Closed source" },
      { feature: "Self-hosting", rankflo: "Docker", competitor: "Not available" },
      { feature: "AI Content", rankflo: "Built-in", competitor: "Limited" },
      { feature: "API", rankflo: "tRPC + REST + SDK", competitor: "GraphQL" },
      { feature: "Analytics", rankflo: "Full dashboard", competitor: "Basic" },
      { feature: "SEO Tools", rankflo: "Real-time scoring", competitor: "Basic SEO" },
    ],
  },
  "rankflo-vs-contentful": {
    competitor: "Contentful",
    tagline: "Blog-first CMS with AI superpowers",
    description: "Compare RankFlo and Contentful. While Contentful is a general-purpose headless CMS, RankFlo is purpose-built for blogging with AI, analytics, and SEO built in.",
    rankfloAdvantages: ["Purpose-built for blogs", "AI content generation", "Built-in analytics", "SEO scoring", "Much simpler pricing", "Self-hostable"],
    competitorAdvantages: ["General-purpose CMS", "Enterprise-grade infrastructure", "Richer content modeling", "Larger ecosystem"],
    comparison: [
      { feature: "AI Content", rankflo: "Built-in", competitor: "Third-party" },
      { feature: "Analytics", rankflo: "Built-in", competitor: "Not included" },
      { feature: "SEO Tools", rankflo: "Built-in", competitor: "Not included" },
      { feature: "Pricing", rankflo: "Free + $19/mo", competitor: "Free + $300/mo" },
      { feature: "Self-hosting", rankflo: "Yes", competitor: "No" },
      { feature: "Open Source", rankflo: "MIT", competitor: "Proprietary" },
    ],
  },
  "rankflo-vs-strapi": {
    competitor: "Strapi",
    tagline: "Blog-optimized with AI and analytics built in",
    description: "Compare RankFlo and Strapi. Both are open-source, but RankFlo is purpose-built for blogging with AI content generation, analytics, and SEO tools included.",
    rankfloAdvantages: ["Blog-optimized editor", "AI content generation", "Built-in analytics", "SEO scoring", "Purpose-built for publishing", "Simpler setup"],
    competitorAdvantages: ["General-purpose CMS", "Content type builder", "More flexible data modeling", "Plugin marketplace"],
    comparison: [
      { feature: "Focus", rankflo: "Blog-first", competitor: "General CMS" },
      { feature: "AI Content", rankflo: "Built-in", competitor: "Plugin" },
      { feature: "Analytics", rankflo: "Built-in", competitor: "Not included" },
      { feature: "SEO", rankflo: "Real-time scoring", competitor: "Not included" },
      { feature: "License", rankflo: "MIT", competitor: "MIT (with EE)" },
      { feature: "Setup Time", rankflo: "5 minutes", competitor: "15+ minutes" },
    ],
  },
  "rankflo-vs-sanity": {
    competitor: "Sanity",
    tagline: "Blog-ready with zero configuration",
    description: "Compare RankFlo and Sanity. Sanity is a powerful structured content platform, while RankFlo gives you a complete blogging solution out of the box.",
    rankfloAdvantages: ["Zero-config blog setup", "AI content generation", "Built-in analytics", "SEO tools included", "Self-hostable", "Simpler pricing"],
    competitorAdvantages: ["Flexible content modeling", "Real-time collaboration", "GROQ query language", "Customizable Studio"],
    comparison: [
      { feature: "Setup", rankflo: "Ready in 5 min", competitor: "Requires configuration" },
      { feature: "AI Content", rankflo: "Built-in", competitor: "Third-party" },
      { feature: "Analytics", rankflo: "Built-in", competitor: "Not included" },
      { feature: "SEO Tools", rankflo: "Built-in", competitor: "Not included" },
      { feature: "Self-hosting", rankflo: "Docker", competitor: "Cloud only" },
      { feature: "Open Source", rankflo: "MIT", competitor: "Partially open" },
    ],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = COMPARISONS[slug];

  if (!data) return { title: "Not Found" };

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";
  const title = `RankFlo vs ${data.competitor} — ${data.tagline}`;

  return {
    title,
    description: data.description,
    openGraph: {
      title,
      description: data.description,
      url: `${BASE_URL}/compare/${slug}`,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(`RankFlo vs ${data.competitor}`)}&description=${encodeURIComponent(data.tagline)}`],
    },
    alternates: {
      canonical: `${BASE_URL}/compare/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(COMPARISONS).map((slug) => ({ slug }));
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const data = COMPARISONS[slug];

  if (!data) {
    return (
      <section className="py-24 text-center">
        <h1 className="text-4xl font-bold">Page not found</h1>
      </section>
    );
  }

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `RankFlo vs ${data.competitor}`,
            description: data.description,
            url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io"}/compare/${slug}`,
          }),
        }}
      />

      {/* Hero */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.06)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-wide px-6 text-center">
          <p className="text-sm font-medium text-green-600 dark:text-accent">Comparison</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            RankFlo vs {data.competitor}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            {data.description}
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-t border-gray-200/50 py-24 dark:border-gray-800/50">
        <div className="mx-auto max-w-wide px-6">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">Feature comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="pb-4 pr-6 text-left font-semibold text-gray-950 dark:text-white">Feature</th>
                  <th className="pb-4 pr-6 text-left font-semibold text-green-600 dark:text-accent">RankFlo</th>
                  <th className="pb-4 text-left font-semibold text-gray-500">{data.competitor}</th>
                </tr>
              </thead>
              <tbody>
                {data.comparison.map((row) => (
                  <tr key={row.feature} className="border-b border-gray-100 dark:border-gray-800/50">
                    <td className="py-4 pr-6 font-medium text-gray-700 dark:text-gray-300">{row.feature}</td>
                    <td className="py-4 pr-6 text-gray-600 dark:text-gray-400">{row.rankflo}</td>
                    <td className="py-4 text-gray-500">{row.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="border-t border-gray-200/50 py-24 dark:border-gray-800/50">
        <div className="mx-auto max-w-wide px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* RankFlo advantages */}
            <div>
              <h3 className="mb-6 text-xl font-bold text-green-600 dark:text-accent">Why choose RankFlo</h3>
              <ul className="space-y-3">
                {data.rankfloAdvantages.map((adv) => (
                  <li key={adv} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {adv}
                  </li>
                ))}
              </ul>
            </div>

            {/* Competitor advantages */}
            <div>
              <h3 className="mb-6 text-xl font-bold text-gray-500">Where {data.competitor} excels</h3>
              <ul className="space-y-3">
                {data.competitorAdvantages.map((adv) => (
                  <li key={adv} className="flex items-start gap-3 text-sm text-gray-500">
                    <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {adv}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200/50 py-24 dark:border-gray-800/50">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Try RankFlo free
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            See why teams are switching from {data.competitor} to RankFlo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent px-8 text-sm font-semibold text-black transition-all hover:bg-accent-9 sm:w-auto"
            >
              Start for free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-gray-300 px-8 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300 sm:w-auto"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
