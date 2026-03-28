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

const TOOLS = [
  {
    href: "/tools/blog-title-generator",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    label: "Blog Title Generator",
    description: "Generate 10 compelling, SEO-optimized blog titles from your topic in seconds.",
    badge: "Popular",
  },
  {
    href: "/tools/meta-description-generator",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    label: "Meta Description Generator",
    description: "Write click-worthy meta descriptions under 160 characters that rank and convert.",
    badge: null,
  },
  {
    href: "/tools/reading-time-calculator",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: "Reading Time Calculator",
    description: "Paste your article and get word count, reading time, and Flesch readability score.",
    badge: null,
  },
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
