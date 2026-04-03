import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free SEO & Blog Tools",
  description: "Free tools for bloggers and content marketers. Generate blog titles, write meta descriptions, calculate reading time, and more — no account required.",
  alternates: { canonical: "https://rankflo.io/tools" },
  openGraph: {
    title: "Free SEO & Blog Tools — RankFlo",
    description: "Free tools for bloggers and content marketers. No account required.",
  },
};

function Icon({ d }: { d: string }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const TOOLS = [
  { href: "/tools/blog-title-generator", icon: <Icon d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />, label: "Blog Title Generator", description: "Generate 10 compelling, SEO-optimized blog titles from your topic in seconds.", badge: "Popular" },
  { href: "/tools/schema-generator", icon: <Icon d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />, label: "JSON-LD Schema Generator", description: "Generate Article, FAQ, HowTo, and Organization structured data markup.", badge: "New" },
  { href: "/tools/og-preview", icon: <Icon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />, label: "Open Graph Preview", description: "See how your page looks when shared on Facebook, Twitter, and LinkedIn.", badge: "New" },
  { href: "/tools/meta-description-generator", icon: <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />, label: "Meta Description Generator", description: "Write click-worthy meta descriptions under 160 characters that rank and convert.", badge: null },
  { href: "/tools/robots-txt-generator", icon: <Icon d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />, label: "Robots.txt Generator", description: "Generate a robots.txt with AI bot rules for GPTBot, ClaudeBot, PerplexityBot.", badge: "New" },
  { href: "/tools/word-counter", icon: <Icon d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />, label: "Word Count & Readability", description: "Get word count, character count, reading time, and Flesch readability grade.", badge: null },
  { href: "/tools/heading-checker", icon: <Icon d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />, label: "Heading Structure Checker", description: "Check if your page has proper H1-H6 heading hierarchy for SEO.", badge: null },
  { href: "/tools/reading-time-calculator", icon: <Icon d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />, label: "Reading Time Calculator", description: "Paste your article and get word count, reading time, and readability score.", badge: null },
  { href: "/tools/slug-generator", icon: <Icon d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />, label: "URL Slug Generator", description: "Convert titles into clean, SEO-friendly URL slugs with best practices.", badge: "New" },
  { href: "/tools/markdown-to-html", icon: <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />, label: "Markdown to HTML Converter", description: "Paste Markdown and get clean HTML. Headings, bold, links, lists, code.", badge: "New" },
  { href: "/tools/keyword-density-checker", icon: <Icon d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />, label: "Keyword Density Checker", description: "Analyze keyword frequency, density percentage, and top keywords in your content.", badge: "New" },
  { href: "/tools/hreflang-generator", icon: <Icon d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />, label: "Hreflang Tag Generator", description: "Generate hreflang tags for international SEO and multi-language sites.", badge: "New" },
  { href: "/tools/sitemap-generator", icon: <Icon d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />, label: "XML Sitemap Generator", description: "Generate a valid XML sitemap from a list of URLs with change frequency.", badge: "New" },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-wide px-6 py-20">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center mb-16">
        <span className="inline-flex h-6 items-center rounded-full border border-accent/20 bg-accent-light-1 px-3 text-xs font-medium text-green-800 dark:bg-accent-1 dark:text-accent mb-4">
          100% Free
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Free SEO &amp; Blog Tools
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
          Tools for bloggers and content teams. No account, no credit card, no limits.
        </p>
      </div>

      {/* Tools grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-7 transition-all hover:border-accent/40 hover:shadow-[0_0_24px_rgba(57,255,20,0.08)] dark:border-gray-800 dark:bg-gray-950 dark:hover:border-accent/30"
          >
            {tool.badge && (
              <span className="absolute right-4 top-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold text-black">
                {tool.badge}
              </span>
            )}
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-green-600 dark:bg-gray-900 dark:text-accent">
              {tool.icon}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 group-hover:text-green-600 dark:text-white dark:group-hover:text-accent">
                {tool.label}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{tool.description}</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-accent">
              Open tool
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-20 rounded-2xl border border-gray-800 bg-gray-50 p-10 text-center dark:bg-gray-950">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Want the full toolkit?</h2>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          RankFlo includes AI content generation, SEO scoring, built-in analytics, and a full headless CMS — all in one platform.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center rounded-xl bg-accent px-6 text-sm font-semibold text-black transition-all hover:bg-accent-9"
          >
            Start for free
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center rounded-xl border border-gray-300 px-6 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 dark:border-gray-700 dark:text-gray-300"
          >
            View pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
