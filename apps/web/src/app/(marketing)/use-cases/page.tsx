import Link from "next/link";
import type { Metadata } from "next";
import { USE_CASES, ALL_USE_CASE_SLUGS } from "../_data/use-cases";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export const metadata: Metadata = {
  title: "RankFlo Use Cases — Built for Every Content Role",
  description: "How content marketers, SEO consultants, indie hackers, SaaS founders, agencies, technical writers, and DevRel teams use RankFlo. Real workflows, real metrics.",
  alternates: { canonical: `${BASE_URL}/use-cases` },
  openGraph: {
    title: "RankFlo Use Cases",
    description: "Workflows for every content role.",
    url: `${BASE_URL}/use-cases`,
    images: [`${BASE_URL}/api/og?title=${encodeURIComponent("Use Cases")}&description=${encodeURIComponent("Built for every content role")}`],
  },
};

export default function UseCasesLandingPage() {
  const useCases = ALL_USE_CASE_SLUGS.map((slug) => USE_CASES[slug]!).sort((a, b) =>
    a.role.localeCompare(b.role),
  );

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "RankFlo Use Cases",
    url: `${BASE_URL}/use-cases`,
    hasPart: useCases.map((u) => ({
      "@type": "WebPage",
      name: u.headline,
      url: `${BASE_URL}/use-cases/${u.slug}`,
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
          <p className="text-sm font-medium text-accent">Use cases</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Built for every content role
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
            How content marketers, SEO consultants, founders, agencies, and writers use RankFlo. Real workflows, real metrics.
          </p>
        </div>
      </section>

      <section className="bg-black pb-24">
        <div className="mx-auto max-w-wide px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((u) => (
              <Link
                key={u.slug}
                href={`/use-cases/${u.slug}` as never}
                className="group rounded-xl border border-gray-800 bg-gray-950 p-6 transition-all hover:border-gray-700"
              >
                <h2 className="text-base font-semibold text-white group-hover:text-accent">
                  RankFlo for {u.role}s
                </h2>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed line-clamp-3">{u.intro}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent">
                  See workflow →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
