import Link from "next/link";
import type { Metadata } from "next";
import { ALTERNATIVES_PAGES, ALL_ALTERNATIVE_SLUGS } from "../_data/alternatives";
import { PRODUCTS } from "../_data/products";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export const metadata: Metadata = {
  title: "Best Alternatives to Every Blog & CMS Platform — RankFlo",
  description: "Comprehensive alternatives pages for WordPress, Ghost, Substack, Medium, Contentful, Sanity, Webflow, and 20+ more. Compare options and find your perfect platform.",
  alternates: { canonical: `${BASE_URL}/alternatives` },
  openGraph: {
    title: "Blog & CMS Alternatives — RankFlo",
    description: "Compare alternatives to 25+ blog and CMS platforms.",
    url: `${BASE_URL}/alternatives`,
    images: [`${BASE_URL}/api/og?title=${encodeURIComponent("Alternatives")}&description=${encodeURIComponent("Compare alternatives to 25+ platforms")}`],
  },
};

export default function AlternativesIndexPage() {
  const pages = ALL_ALTERNATIVE_SLUGS
    .map((slug) => ({ slug, product: PRODUCTS[slug], data: ALTERNATIVES_PAGES[slug] }))
    .filter((p) => p.product && p.data);

  const byCategory: Record<string, typeof pages> = {};
  for (const p of pages) {
    const cat = p.product!.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  }

  const categoryLabels: Record<string, string> = {
    "blog-cms": "Blog CMS",
    "headless-cms": "Headless CMS",
    "newsletter": "Newsletter",
    "website-builder": "Website Builder",
    "docs-platform": "Docs Platform",
    "static-site-generator": "Static Site Generator",
    "notes-publishing": "Notes Publishing",
  };

  return (
    <>
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-wide px-6">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Alternatives to every major platform
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-400">
            Whether you&apos;re replacing WordPress, Ghost, Substack, Medium, or any of {pages.length} other platforms — we&apos;ve compared the best options. Start with RankFlo, the open-source AI-powered blog platform.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-200/50 py-16 dark:border-gray-800/50">
        <div className="mx-auto max-w-wide px-6 space-y-16">
          {Object.entries(byCategory).map(([cat, list]) => (
            <div key={cat}>
              <h2 className="mb-6 text-2xl font-bold tracking-tight">{categoryLabels[cat] ?? cat}</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {list.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/alternatives/${p.slug}`}
                    className="group rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-accent/40 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-accent/40"
                  >
                    <p className="font-semibold text-gray-900 group-hover:text-green-700 dark:text-white dark:group-hover:text-accent">
                      Best {p.product!.name} alternatives
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">{p.data!.intro}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
