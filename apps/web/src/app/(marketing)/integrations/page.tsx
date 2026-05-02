import Link from "next/link";
import type { Metadata } from "next";
import { INTEGRATIONS, ALL_INTEGRATION_SLUGS } from "../_data/integrations";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export const metadata: Metadata = {
  title: "RankFlo Integrations — 30+ Platforms",
  description: "RankFlo works with Next.js, Astro, Vercel, Netlify, Zapier, Stripe, and 25+ more platforms. Browse all integrations.",
  alternates: { canonical: `${BASE_URL}/integrations` },
  openGraph: {
    title: "RankFlo Integrations",
    description: "30+ integrations with frameworks, hosting, automation, and tools.",
    url: `${BASE_URL}/integrations`,
    images: [`${BASE_URL}/api/og?title=${encodeURIComponent("Integrations")}&description=${encodeURIComponent("30+ platforms")}`],
  },
};

export default function IntegrationsIndexPage() {
  const byCategory: Record<string, string[]> = {};
  for (const slug of ALL_INTEGRATION_SLUGS) {
    const data = INTEGRATIONS[slug];
    if (!data) continue;
    const bucket = byCategory[data.category] ?? [];
    bucket.push(slug);
    byCategory[data.category] = bucket;
  }

  const categoryLabels: Record<string, string> = {
    framework: "Frameworks",
    hosting: "Hosting",
    automation: "Automation",
    tool: "Tools",
    migration: "Migrations",
  };

  return (
    <>
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-wide px-6">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Integrations
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-400">
            RankFlo connects with {ALL_INTEGRATION_SLUGS.length}+ platforms — frameworks, hosts, automation, and tools. Build the content stack that fits your workflow.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-200/50 py-16 dark:border-gray-800/50">
        <div className="mx-auto max-w-wide px-6 space-y-16">
          {Object.entries(byCategory).map(([cat, slugs]) => (
            <div key={cat}>
              <h2 className="mb-6 text-2xl font-bold tracking-tight">{categoryLabels[cat] ?? cat}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slugs.map((slug) => {
                  const data = INTEGRATIONS[slug];
                  if (!data) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/integrations/${slug}`}
                      className="group rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-accent/40 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-accent/40"
                    >
                      <p className="font-semibold text-gray-900 group-hover:text-green-700 dark:text-white dark:group-hover:text-accent">
                        {data.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{data.tagline}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
