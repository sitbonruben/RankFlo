import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { INTEGRATIONS, ALL_INTEGRATION_SLUGS } from "../../_data/integrations";

type Props = {
  params: Promise<{ platform: string }>;
};

export const dynamicParams = false;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { platform } = await params;
  const data = INTEGRATIONS[platform];
  if (!data) return { title: "Not Found", robots: { index: false, follow: false } };

  const title = `${data.name} Integration — ${data.tagline} | RankFlo`;
  const description = data.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/integrations/${platform}`,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(`RankFlo + ${data.name}`)}&description=${encodeURIComponent(data.tagline)}`],
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `${BASE_URL}/integrations/${platform}` },
  };
}

export function generateStaticParams() {
  return ALL_INTEGRATION_SLUGS.map((platform) => ({ platform }));
}

export default async function IntegrationPage({ params }: Props) {
  const { platform } = await params;
  const data = INTEGRATIONS[platform];
  if (!data) notFound();

  // Pick related integrations in same category
  const related = ALL_INTEGRATION_SLUGS
    .filter((s) => {
      const other = INTEGRATIONS[s];
      return other && other.slug !== platform && other.category === data.category;
    })
    .slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: data.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
              { "@type": "ListItem", position: 2, name: "Integrations", item: `${BASE_URL}/integrations` },
              { "@type": "ListItem", position: 3, name: data.name, item: `${BASE_URL}/integrations/${platform}` },
            ],
          }),
        }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200/50 py-4 dark:border-gray-800/50">
        <div className="mx-auto max-w-wide px-6">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-300">Home</Link>
            <span>/</span>
            <Link href="/integrations" className="hover:text-gray-900 dark:hover:text-gray-300">Integrations</Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-400">{data.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.06)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-wide px-6">
          <p className="text-sm font-medium text-green-600 dark:text-accent">Integration · {data.category.charAt(0).toUpperCase() + data.category.slice(1)}</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            RankFlo + {data.name}
          </h1>
          <p className="mt-4 text-xl text-green-700 dark:text-accent">{data.tagline}</p>
          <p className="mt-6 max-w-3xl text-lg text-gray-600 leading-relaxed dark:text-gray-400">
            {data.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-xl bg-accent px-6 text-sm font-semibold text-black transition-all hover:bg-accent-9"
            >
              Start free
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-12 items-center rounded-xl border border-gray-300 px-6 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 dark:border-gray-700 dark:text-gray-300"
            >
              View docs
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-gray-200/50 py-20 dark:border-gray-800/50">
        <div className="mx-auto max-w-wide px-6">
          <h2 className="mb-10 text-3xl font-bold tracking-tight">Why use RankFlo with {data.name}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
              >
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code example */}
      {data.codeExample && (
        <section className="border-t border-gray-200/50 py-20 dark:border-gray-800/50">
          <div className="mx-auto max-w-wide px-6">
            <h2 className="mb-8 text-3xl font-bold tracking-tight">Quick start</h2>
            <pre className="overflow-x-auto rounded-2xl border border-gray-200 bg-gray-900 p-6 text-sm text-gray-100 dark:border-gray-800">
              <code>{data.codeExample}</code>
            </pre>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="border-t border-gray-200/50 py-20 dark:border-gray-800/50">
        <div className="mx-auto max-w-wide px-6">
          <h2 className="mb-10 text-3xl font-bold tracking-tight">FAQ</h2>
          <div className="space-y-6">
            {data.faq.map((f) => (
              <div key={f.q} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                <h3 className="font-semibold text-gray-900 dark:text-white">{f.q}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related integrations */}
      {related.length > 0 && (
        <section className="border-t border-gray-200/50 py-20 dark:border-gray-800/50">
          <div className="mx-auto max-w-wide px-6">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">Other {data.category} integrations</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {related.map((slug) => {
                const i = INTEGRATIONS[slug];
                if (!i) return null;
                return (
                  <Link
                    key={slug}
                    href={`/integrations/${slug}`}
                    className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-colors hover:border-accent/40 dark:border-gray-800 dark:bg-gray-950"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{i.name}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-gray-200/50 py-24 dark:border-gray-800/50">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight">Start building</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            RankFlo + {data.name} — free to start, AI content included.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup" className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent px-8 text-sm font-semibold text-black transition-all hover:bg-accent-9 sm:w-auto">
              Start free
            </Link>
            <Link href="/pricing" className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-gray-300 px-8 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300 sm:w-auto">
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
