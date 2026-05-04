import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { USE_CASES, ALL_USE_CASE_SLUGS } from "../../_data/use-cases";

type Props = {
  params: Promise<{ role: string }>;
};

export const dynamicParams = false;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role } = await params;
  const data = USE_CASES[role];
  if (!data) return { title: "Not Found", robots: { index: false, follow: false } };

  const title = `${data.headline} — Workflow & Features`;
  const description = data.intro;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/use-cases/${role}`,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(data.headline)}&description=${encodeURIComponent(data.intro.slice(0, 100))}`],
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `${BASE_URL}/use-cases/${role}` },
  };
}

export function generateStaticParams() {
  return ALL_USE_CASE_SLUGS.map((role) => ({ role }));
}

export default async function UseCasePage({ params }: Props) {
  const { role } = await params;
  const data = USE_CASES[role];
  if (!data) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.headline,
    description: data.intro,
    url: `${BASE_URL}/use-cases/${role}`,
    author: { "@type": "Organization", name: "RankFlo" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="bg-black">
        <section className="relative py-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(57,255,20,0.06)_0%,transparent_60%)]" />
          <div className="relative mx-auto max-w-content px-6">
            <p className="text-xs font-medium uppercase tracking-wider text-accent">Use case</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">{data.headline}</h1>
            <p className="mt-5 max-w-2xl text-lg text-gray-400 leading-relaxed">{data.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">
                Start free
              </Link>
              <Link href="/pricing" className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-700 px-5 text-sm font-medium text-gray-300 hover:border-gray-500 hover:text-white">
                See pricing
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-800/50 py-16">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-2xl font-bold text-white">Pain points {data.role}s face</h2>
            <ul className="mt-6 space-y-3">
              {data.problems.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                  <span className="mt-0.5 text-red-400">✕</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-gray-800/50 py-16">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-2xl font-bold text-white">How RankFlo helps</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {data.features.map((f, i) => (
                <div key={i} className="rounded-xl border border-gray-800 bg-gray-950 p-5">
                  <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-gray-800/50 py-16">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-2xl font-bold text-white">A typical workflow</h2>
            <ol className="mt-6 space-y-3">
              {data.workflow.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-gray-800/50 py-16">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-2xl font-bold text-white">Metrics that matter</h2>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {data.metrics.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-gray-800/50 py-16">
          <div className="mx-auto max-w-content px-6 text-center">
            <h2 className="text-2xl font-bold text-white">Built for {data.role.toLowerCase()}s like you</h2>
            <p className="mt-3 text-sm text-gray-400">Free plan forever. 14-day Pro trial. Self-host for free.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/signup" className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-6 text-sm font-semibold text-black hover:bg-accent-9">
                Start free
              </Link>
              <Link href="/use-cases" className="inline-flex h-11 items-center gap-2 rounded-lg border border-gray-700 px-6 text-sm font-medium text-gray-300 hover:border-gray-500 hover:text-white">
                See other use cases
              </Link>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
