import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MIGRATIONS, ALL_MIGRATION_SLUGS } from "../../_data/migrations";

type Props = {
  params: Promise<{ from: string }>;
};

export const dynamicParams = false;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { from } = await params;
  const data = MIGRATIONS[from];
  if (!data) return { title: "Not Found", robots: { index: false, follow: false } };

  const title = `How to Migrate from ${data.fromName} to RankFlo (${new Date().getFullYear()} Guide)`;
  const description = `Step-by-step guide to migrate from ${data.fromName} to RankFlo. Includes importer setup, asset re-hosting, redirects, and post-migration SEO checklist.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/migrate/${from}`,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(`Migrate from ${data.fromName}`)}&description=${encodeURIComponent("Step-by-step guide")}`],
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `${BASE_URL}/migrate/${from}` },
  };
}

export function generateStaticParams() {
  return ALL_MIGRATION_SLUGS.map((from) => ({ from }));
}

export default async function MigratePage({ params }: Props) {
  const { from } = await params;
  const data = MIGRATIONS[from];
  if (!data) notFound();

  const totalSteps = data.steps.length;

  // HowTo schema — strong rich result candidate for "how to migrate" queries
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to migrate from ${data.fromName} to RankFlo`,
    description: data.fromTagline,
    totalTime: "PT2H",
    step: data.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.description,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <article className="bg-black">
        <section className="relative py-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(57,255,20,0.06)_0%,transparent_60%)]" />
          <div className="relative mx-auto max-w-content px-6">
            <p className="text-xs font-medium uppercase tracking-wider text-accent">Migration guide</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Migrate from {data.fromName} to RankFlo
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-gray-400 leading-relaxed">{data.fromTagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9"
              >
                Start free trial
              </Link>
              <Link
                href="/docs/getting-started"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-700 px-5 text-sm font-medium text-gray-300 hover:border-gray-500 hover:text-white"
              >
                Read docs
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-800/50 py-16">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-2xl font-bold text-white">Why move from {data.fromName}</h2>
            <ul className="mt-6 space-y-3">
              {data.whyMigrate.map((reason, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-gray-800/50 py-16">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-2xl font-bold text-white">Things to plan for</h2>
            <p className="mt-2 text-sm text-gray-500">Edge cases that come up on most {data.fromName} → RankFlo migrations.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {data.challenges.map((c, i) => (
                <div key={i} className="rounded-xl border border-gray-800 bg-gray-950 p-5">
                  <h3 className="text-sm font-semibold text-white">{c.title}</h3>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-gray-800/50 py-16">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-2xl font-bold text-white">Step-by-step migration</h2>
            <p className="mt-2 text-sm text-gray-500">{totalSteps} steps. Export format: <strong className="text-gray-300">{data.exportFormat}</strong></p>
            <ol className="mt-8 space-y-4">
              {data.steps.map((s, i) => (
                <li key={i} className="rounded-xl border border-gray-800 bg-gray-950 p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-white">{s.title}</h3>
                        {s.estimatedTime && (
                          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                            {s.estimatedTime}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-400 leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-gray-800/50 py-16">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-2xl font-bold text-white">After the migration</h2>
            <p className="mt-2 text-sm text-gray-500">SEO and operational checklist — don&apos;t skip these.</p>
            <ul className="mt-6 space-y-3">
              {data.postMigration.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-gray-800/50 py-16">
          <div className="mx-auto max-w-content px-6 text-center">
            <h2 className="text-2xl font-bold text-white">Ready to leave {data.fromName}?</h2>
            <p className="mt-3 text-sm text-gray-400">{data.ctaCopy ?? "Start a free trial — the importer ships with every plan."}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/signup" className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-6 text-sm font-semibold text-black hover:bg-accent-9">
                Start free
              </Link>
              <Link href="/migrate" className="inline-flex h-11 items-center gap-2 rounded-lg border border-gray-700 px-6 text-sm font-medium text-gray-300 hover:border-gray-500 hover:text-white">
                See all migration guides
              </Link>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
