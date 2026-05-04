import Link from "next/link";
import type { Metadata } from "next";
import { MIGRATIONS, ALL_MIGRATION_SLUGS } from "../_data/migrations";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export const metadata: Metadata = {
  title: "Migrate to RankFlo — Step-by-Step Guides for Every Platform",
  description: "Step-by-step guides to migrate from WordPress, Ghost, Medium, Substack, Webflow, Notion, Hashnode, Contentful, Sanity, and more to RankFlo. With importers, redirects, and SEO checklists.",
  alternates: { canonical: `${BASE_URL}/migrate` },
  openGraph: {
    title: "Migrate to RankFlo",
    description: "Migration guides for every major blog and CMS platform.",
    url: `${BASE_URL}/migrate`,
    images: [`${BASE_URL}/api/og?title=${encodeURIComponent("Migrate to RankFlo")}&description=${encodeURIComponent("Step-by-step guides for every platform")}`],
  },
};

export default function MigrateLandingPage() {
  const migrations = ALL_MIGRATION_SLUGS.map((slug) => MIGRATIONS[slug]!).sort((a, b) =>
    a.fromName.localeCompare(b.fromName),
  );

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Migration Guides",
    url: `${BASE_URL}/migrate`,
    hasPart: migrations.map((m) => ({
      "@type": "WebPage",
      name: `Migrate from ${m.fromName} to RankFlo`,
      url: `${BASE_URL}/migrate/${m.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <section className="relative bg-black py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(57,255,20,0.06)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-content px-6 text-center">
          <p className="text-sm font-medium text-accent">Migration</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Move your content to RankFlo
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
            Step-by-step guides for every major blog and CMS — including importers, asset re-hosting, redirect setup, and post-migration SEO checklists.
          </p>
        </div>
      </section>

      <section className="bg-black pb-24">
        <div className="mx-auto max-w-wide px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {migrations.map((m) => (
              <Link
                key={m.slug}
                href={`/migrate/${m.slug}` as never}
                className="group rounded-xl border border-gray-800 bg-gray-950 p-5 transition-all hover:border-gray-700"
              >
                <h2 className="text-base font-semibold text-white group-hover:text-accent">
                  Migrate from {m.fromName}
                </h2>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed line-clamp-2">{m.fromTagline}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent">
                  See guide →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
