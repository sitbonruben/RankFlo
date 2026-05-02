import Link from "next/link";
import type { Metadata } from "next";
import {
  ALTERNATIVES_PAGES,
  ALL_ALTERNATIVE_SLUGS,
} from "../../_data/alternatives";
import { PRODUCTS } from "../../_data/products";

type Props = {
  params: Promise<{ product: string }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product } = await params;
  const data = ALTERNATIVES_PAGES[product];
  if (!data) return { title: "Not Found" };
  const target = PRODUCTS[data.targetProductSlug];
  if (!target) return { title: "Not Found" };

  const title = `${data.headline} (${new Date().getFullYear()}) — 10 Modern Options`;
  const description = `Looking for a ${target.name} alternative? Here are 10 modern options for replacing ${target.name} — ranked, compared, and explained. Starting with RankFlo.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/alternatives/${product}`,
      images: [
        `${BASE_URL}/api/og?title=${encodeURIComponent(data.headline)}&description=${encodeURIComponent("10 modern options")}`,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: { canonical: `${BASE_URL}/alternatives/${product}` },
  };
}

export function generateStaticParams() {
  return ALL_ALTERNATIVE_SLUGS.map((product) => ({ product }));
}

export default async function AlternativesPage({ params }: Props) {
  const { product } = await params;
  const data = ALTERNATIVES_PAGES[product];
  if (!data) {
    return (
      <section className="py-24 text-center">
        <h1 className="text-4xl font-bold">Page not found</h1>
      </section>
    );
  }
  const target = PRODUCTS[data.targetProductSlug]!;

  // JSON-LD: ItemList schema for ranked listicle (great for rich results)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: data.headline,
    url: `${BASE_URL}/alternatives/${product}`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: data.alternatives.length + 1,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "RankFlo",
        url: `${BASE_URL}`,
      },
      ...data.alternatives.map((a) => ({
        "@type": "ListItem",
        position: a.rank,
        name: PRODUCTS[a.productSlug]?.name ?? a.productSlug,
        url: `${BASE_URL}/compare/${a.productSlug}-vs-${data.targetProductSlug}`,
      })),
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Alternatives", item: `${BASE_URL}/alternatives` },
      { "@type": "ListItem", position: 3, name: `${target.name} Alternatives`, item: `${BASE_URL}/alternatives/${product}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200/50 py-4 dark:border-gray-800/50">
        <div className="mx-auto max-w-wide px-6">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-300">Home</Link>
            <span>/</span>
            <Link href="/alternatives" className="hover:text-gray-900 dark:hover:text-gray-300">Alternatives</Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-400">{target.name} Alternatives</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.06)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-wide px-6">
          <p className="text-sm font-medium text-green-600 dark:text-accent">Alternatives</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {data.headline} <span className="text-gray-400 dark:text-gray-600">({new Date().getFullYear()})</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-gray-600 leading-relaxed dark:text-gray-400">
            {data.intro}
          </p>
        </div>
      </section>

      {/* #1 — RankFlo */}
      <section className="border-t border-gray-200/50 py-12 dark:border-gray-800/50">
        <div className="mx-auto max-w-wide px-6">
          <div className="rounded-2xl border border-accent/30 bg-accent-light-1/30 p-8 dark:bg-accent-1/20 md:p-10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-lg font-bold text-black">1</div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">RankFlo</h2>
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-accent">Editor&apos;s pick</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  The modern, open-source, AI-powered blog &amp; headless CMS platform. Built-in AI content, real-time SEO scoring, cookieless analytics, and self-hosting with Docker. Starts free.
                </p>
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-green-700 dark:text-accent">Why migrate from {target.name}</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                    {data.whyMigrate.map((reason) => (
                      <li key={reason} className="flex gap-2">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex h-10 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9"
                  >
                    Start free
                  </Link>
                  <Link
                    href={`/compare/rankflo-vs-${target.slug}`}
                    className="inline-flex h-10 items-center rounded-xl border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300"
                  >
                    RankFlo vs {target.name}
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex h-10 items-center rounded-xl border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300"
                  >
                    View pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ranked alternatives */}
      <section className="py-16">
        <div className="mx-auto max-w-wide px-6">
          <h2 className="mb-10 text-3xl font-bold tracking-tight">More {target.name} alternatives</h2>
          <div className="space-y-6">
            {data.alternatives.map((alt) => {
              const p = PRODUCTS[alt.productSlug];
              if (!p) return null;
              return (
                <div
                  key={alt.productSlug}
                  className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {alt.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h3 className="text-xl font-bold">{p.name}</h3>
                      <span className="text-xs text-gray-500">{p.tagline}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{alt.whyItsAnAlternative}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Best for:</span> {alt.bestFor}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <Link
                        href={`/compare/${p.slug}-vs-${target.slug}`}
                        className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-gray-600 hover:border-accent/40 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
                      >
                        {p.name} vs {target.name}
                      </Link>
                      <Link
                        href={`/compare/rankflo-vs-${p.slug}`}
                        className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-gray-600 hover:border-accent/40 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
                      >
                        RankFlo vs {p.name}
                      </Link>
                      <Link
                        href={`/alternatives/${p.slug}`}
                        className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-gray-600 hover:border-accent/40 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
                      >
                        {p.name} alternatives
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gray-200/50 py-24 dark:border-gray-800/50">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight">Ready to leave {target.name}?</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Start with RankFlo for free. AI content, SEO tools, and self-hosting — all included. Import your {target.name} content in one click.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent px-8 text-sm font-semibold text-black transition-all hover:bg-accent-9 sm:w-auto"
            >
              Start free
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
