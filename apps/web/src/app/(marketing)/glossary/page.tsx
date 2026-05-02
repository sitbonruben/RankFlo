import Link from "next/link";
import type { Metadata } from "next";
import { GLOSSARY, ALL_GLOSSARY_SLUGS, GLOSSARY_CATEGORIES } from "../_data/glossary";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export const metadata: Metadata = {
  title: "Content, SEO & CMS Glossary — RankFlo",
  description: `Clear definitions of ${ALL_GLOSSARY_SLUGS.length}+ terms in SEO, CMS, content marketing, and AI. The definitive glossary for modern publishers.`,
  alternates: { canonical: `${BASE_URL}/glossary` },
  openGraph: {
    title: "RankFlo Glossary",
    description: `${ALL_GLOSSARY_SLUGS.length}+ terms in SEO, CMS, and content marketing.`,
    url: `${BASE_URL}/glossary`,
    images: [`${BASE_URL}/api/og?title=${encodeURIComponent("Glossary")}&description=${encodeURIComponent(`${ALL_GLOSSARY_SLUGS.length}+ terms defined`)}`],
  },
};

export default function GlossaryIndexPage() {
  const categoryLabels: Record<string, string> = {
    seo: "SEO",
    content: "Content Marketing",
    cms: "CMS & Publishing",
    analytics: "Analytics",
    ai: "AI & LLMs",
    technical: "Technical",
    marketing: "Marketing",
  };

  // Group by category, sort alphabetically within
  const grouped = GLOSSARY_CATEGORIES.map((cat) => ({
    category: cat,
    terms: ALL_GLOSSARY_SLUGS
      .map((s) => GLOSSARY[s])
      .filter((t) => t && t.category === cat)
      .sort((a, b) => a!.term.localeCompare(b!.term)),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTermSet",
            name: "RankFlo Glossary",
            url: `${BASE_URL}/glossary`,
            description: `Comprehensive glossary of ${ALL_GLOSSARY_SLUGS.length}+ terms in SEO, CMS, content marketing, and AI.`,
            hasDefinedTerm: ALL_GLOSSARY_SLUGS.slice(0, 100).map((s) => ({
              "@type": "DefinedTerm",
              name: GLOSSARY[s]?.term,
              url: `${BASE_URL}/glossary/${s}`,
            })),
          }),
        }}
      />

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-wide px-6">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Glossary</h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-400">
            Clear definitions of {ALL_GLOSSARY_SLUGS.length}+ terms in SEO, CMS, content marketing, and AI. The definitive glossary for modern publishers.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-200/50 py-16 dark:border-gray-800/50">
        <div className="mx-auto max-w-wide px-6 space-y-16">
          {grouped.map(({ category, terms }) => (
            terms.length > 0 && (
              <div key={category}>
                <h2 className="mb-6 text-2xl font-bold tracking-tight">{categoryLabels[category] ?? category}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {terms.map((t) => (
                    t && (
                      <Link
                        key={t.slug}
                        href={`/glossary/${t.slug}`}
                        className="group rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-accent/40 dark:border-gray-800 dark:bg-gray-950"
                      >
                        <p className="font-semibold text-gray-900 group-hover:text-green-700 dark:text-white dark:group-hover:text-accent">{t.term}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{t.shortDef}</p>
                      </Link>
                    )
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </section>
    </>
  );
}
