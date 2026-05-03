import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GLOSSARY, ALL_GLOSSARY_SLUGS } from "../../_data/glossary";

type Props = {
  params: Promise<{ term: string }>;
};

export const dynamicParams = false;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term } = await params;
  const data = GLOSSARY[term];
  if (!data) return { title: "Not Found", robots: { index: false, follow: false } };

  const title = `${data.term} — Definition & Meaning | RankFlo Glossary`;
  const description = data.shortDef;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/glossary/${term}`,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(data.term)}&description=${encodeURIComponent(data.shortDef)}`],
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `${BASE_URL}/glossary/${term}` },
  };
}

export function generateStaticParams() {
  return ALL_GLOSSARY_SLUGS.map((term) => ({ term }));
}

export default async function GlossaryTermPage({ params }: Props) {
  const { term } = await params;
  const data = GLOSSARY[term];
  if (!data) notFound();

  // Pick related terms — prefer explicit relatedTerms, fallback to same category
  let related = (data.relatedTerms ?? [])
    .map((slug) => GLOSSARY[slug])
    .filter(Boolean);
  if (related.length < 4) {
    const more = ALL_GLOSSARY_SLUGS
      .filter((s) => {
        const other = GLOSSARY[s];
        return other && other.slug !== term && other.category === data.category && !related.some((r) => r?.slug === s);
      })
      .slice(0, 4 - related.length)
      .map((s) => GLOSSARY[s])
      .filter(Boolean);
    related = [...related, ...more];
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTerm",
            name: data.term,
            description: data.definition,
            url: `${BASE_URL}/glossary/${term}`,
            inDefinedTermSet: {
              "@type": "DefinedTermSet",
              name: "RankFlo Glossary",
              url: `${BASE_URL}/glossary`,
            },
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
              { "@type": "ListItem", position: 2, name: "Glossary", item: `${BASE_URL}/glossary` },
              { "@type": "ListItem", position: 3, name: data.term, item: `${BASE_URL}/glossary/${term}` },
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
            <Link href="/glossary" className="hover:text-gray-900 dark:hover:text-gray-300">Glossary</Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-400">{data.term}</span>
          </nav>
        </div>
      </div>

      {/* Definition */}
      <article className="py-16">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-green-600 dark:text-accent">
            {data.category}
          </p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight">{data.term}</h1>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed dark:text-gray-400">
            {data.shortDef}
          </p>

          {/* TL;DR card for AI citation */}
          <div className="mt-8 rounded-2xl border-l-4 border-accent bg-accent-light-1/30 p-6 dark:bg-accent-1/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-accent">Definition</p>
            <p className="mt-2 text-base leading-relaxed text-gray-800 dark:text-gray-200">{data.definition}</p>
          </div>

          {data.example && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Example</h2>
              <p className="mt-2 text-base text-gray-700 dark:text-gray-300">{data.example}</p>
            </div>
          )}

          {/* Related terms */}
          {related.length > 0 && (
            <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Related terms</h2>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {related.map((rel) => (
                  rel && (
                    <Link
                      key={rel.slug}
                      href={`/glossary/${rel.slug}`}
                      className="group rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-accent/40 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <p className="font-semibold text-gray-900 group-hover:text-green-700 dark:text-white dark:group-hover:text-accent">{rel.term}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{rel.shortDef}</p>
                    </Link>
                  )
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-950">
            <p className="text-base font-semibold text-gray-900 dark:text-white">Put {data.term} to work</p>
            <p className="mt-2 text-sm text-gray-500">Build, publish, and rank your content with RankFlo. Free to start.</p>
            <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">
              Start for free
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
