import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ topic: string }>;
};

const TOPIC_DATA: Record<string, { title: string; headline: string; description: string; features: string[]; useCases: string[] }> = {
  "blog-platform": {
    title: "Blog Platform",
    headline: "The modern blog platform for teams and creators",
    description: "RankFlo is an open-source blog platform with AI content generation, built-in analytics, SEO scoring, and a headless CMS API. Start free or self-host.",
    features: ["AI-powered content generation", "Built-in analytics dashboard", "Real-time SEO scoring", "Headless CMS API", "Full-text search", "Team collaboration with RBAC"],
    useCases: ["Company blogs", "Personal blogs", "Developer documentation", "Product updates", "Content marketing"],
  },
  "headless-cms": {
    title: "Headless CMS",
    headline: "A headless CMS that developers actually love",
    description: "RankFlo provides type-safe tRPC and REST APIs, a TypeScript SDK, webhooks, and full self-hosting support. Build anything on top of your content.",
    features: ["Type-safe tRPC API", "REST + OpenAPI endpoints", "TypeScript SDK", "Webhook system", "GraphQL support", "Content versioning"],
    useCases: ["Next.js sites", "React applications", "Static site generators", "Mobile apps", "E-commerce storefronts"],
  },
  "content-management": {
    title: "Content Management System",
    headline: "Content management that scales with your team",
    description: "RankFlo offers a rich block editor, team collaboration with granular roles, scheduled publishing, and media management. All open source.",
    features: ["14+ block types", "Drag-and-drop editor", "Version history", "Scheduled publishing", "Media optimization", "Multi-language support"],
    useCases: ["Marketing teams", "Editorial workflows", "Multi-author blogs", "Content agencies", "Enterprise publishing"],
  },
  "seo-tools": {
    title: "SEO Tools for Bloggers",
    headline: "Built-in SEO tools that rank your content higher",
    description: "Real-time SEO scoring, meta optimization, structured data generation, keyword analysis, and internal linking suggestions. All built into your editor.",
    features: ["Real-time SEO score", "Meta tag optimization", "JSON-LD structured data", "Keyword density analysis", "Internal linking suggestions", "Search analytics"],
    useCases: ["Content marketers", "SEO professionals", "Growth teams", "Bloggers", "Affiliate marketers"],
  },
  "ai-content-generation": {
    title: "AI Content Generation",
    headline: "AI that writes content matching your brand voice",
    description: "Generate SEO-optimized blog posts with RankFlo's AI pipeline. Research, outline, draft, and optimize — all automated while maintaining your unique voice.",
    features: ["Brand voice matching", "Multi-step AI pipeline", "Keyword targeting", "Readability optimization", "Topic research", "Content calendar generation"],
    useCases: ["Content scaling", "Idea generation", "First drafts", "SEO content", "Product descriptions"],
  },
  "self-hosted-blog": {
    title: "Self-Hosted Blog Platform",
    headline: "Self-host your blog. Own your data completely.",
    description: "Deploy RankFlo on your own infrastructure with Docker in under 5 minutes. PostgreSQL, Redis, and optional Meilisearch. MIT licensed, forever free.",
    features: ["Docker Compose setup", "PostgreSQL + Redis", "Optional Meilisearch", "MIT License", "Full data ownership", "No vendor lock-in"],
    useCases: ["Privacy-conscious teams", "Enterprise deployments", "Developer blogs", "On-premise requirements", "Data sovereignty"],
  },
  "blogging-software": {
    title: "Blogging Software",
    headline: "Modern blogging software for the AI era",
    description: "RankFlo combines a powerful editor, AI content generation, built-in analytics, and developer-friendly APIs into one open-source platform.",
    features: ["Rich text editor", "AI writing assistant", "Built-in analytics", "SEO optimization", "Custom domains", "API access"],
    useCases: ["Professional bloggers", "Tech companies", "Content creators", "Developer advocates", "Thought leaders"],
  },
  "content-marketing": {
    title: "Content Marketing Platform",
    headline: "The content marketing engine that drives organic growth",
    description: "Plan, create, optimize, and measure your content marketing with RankFlo. AI topic research, content calendars, SEO scoring, and traffic analytics.",
    features: ["AI topic research", "Content calendar", "Competitor analysis", "Traffic analytics", "Conversion tracking", "Team workflows"],
    useCases: ["B2B marketing", "SaaS companies", "E-commerce brands", "Agencies", "Startups"],
  },
  "technical-writing": {
    title: "Technical Writing Platform",
    headline: "Technical writing made beautiful and discoverable",
    description: "Code blocks with syntax highlighting, API documentation, version control, and SEO optimization. Built for developers who write.",
    features: ["Syntax highlighting", "Code block support", "API documentation", "Version history", "Full-text search", "Custom domains"],
    useCases: ["Engineering blogs", "API documentation", "Tutorials", "Changelogs", "Knowledge bases"],
  },
  "developer-blog": {
    title: "Developer Blog Platform",
    headline: "The blog platform built by developers, for developers",
    description: "Type-safe APIs, self-hosting, open source, and a modern stack. RankFlo is the developer blog platform that respects your workflow.",
    features: ["TypeScript-first", "Open source (MIT)", "Self-hostable", "tRPC + REST API", "CLI tools", "Git integration"],
    useCases: ["Personal dev blogs", "Company engineering blogs", "Open source projects", "Developer portfolios", "Tech newsletters"],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const data = TOPIC_DATA[topic];

  if (!data) {
    return { title: "Not Found" };
  }

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

  return {
    title: `Best ${data.title} — RankFlo`,
    description: data.description,
    openGraph: {
      title: `Best ${data.title} — RankFlo`,
      description: data.description,
      url: `${BASE_URL}/for/${topic}`,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(`Best ${data.title}`)}&description=${encodeURIComponent(data.description.slice(0, 100))}`],
    },
    alternates: {
      canonical: `${BASE_URL}/for/${topic}`,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(TOPIC_DATA).map((topic) => ({ topic }));
}

export default async function TopicPage({ params }: Props) {
  const { topic } = await params;
  const data = TOPIC_DATA[topic];

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
            name: `Best ${data.title} — RankFlo`,
            description: data.description,
            url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io"}/for/${topic}`,
            mainEntity: {
              "@type": "SoftwareApplication",
              name: "RankFlo",
              applicationCategory: "WebApplication",
              description: data.description,
            },
          }),
        }}
      />

      {/* Hero */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.06)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-wide px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-green-600 dark:text-accent">
              {data.title}
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              {data.headline}
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed dark:text-gray-400">
              {data.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center rounded-xl bg-accent px-6 text-sm font-semibold text-black transition-all hover:bg-accent-9 hover:shadow-[0_0_24px_rgba(57,255,20,0.3)]"
              >
                Start for free
              </Link>
              <Link
                href="/features"
                className="inline-flex h-12 items-center rounded-xl border border-gray-300 px-6 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
              >
                See all features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-200/50 py-24 dark:border-gray-800/50">
        <div className="mx-auto max-w-wide px-6">
          <h2 className="mb-12 text-3xl font-bold tracking-tight">
            Key features
          </h2>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800 sm:grid-cols-2 lg:grid-cols-3">
            {data.features.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 bg-white p-8 dark:bg-black"
              >
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-t border-gray-200/50 py-24 dark:border-gray-800/50">
        <div className="mx-auto max-w-wide px-6">
          <h2 className="mb-12 text-3xl font-bold tracking-tight">
            Perfect for
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.useCases.map((useCase) => (
              <span
                key={useCase}
                className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200/50 py-24 dark:border-gray-800/50">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Ready to try RankFlo?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Start for free. No credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent px-8 text-sm font-semibold text-black transition-all hover:bg-accent-9 sm:w-auto"
            >
              Get started free
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
