import Link from "next/link";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export const metadata: Metadata = {
  title: "Blog",
  description: "Product updates, engineering insights, and best practices for modern blogging.",
  alternates: {
    canonical: `${BASE_URL}/blog`,
    types: {
      "application/rss+xml": `${BASE_URL}/feed.xml`,
    },
  },
};

const FEATURED_POST = {
  title: "Introducing RankFlo: The Open-Source Blogging Platform for Modern Teams",
  excerpt:
    "We built RankFlo because teams deserve a blogging platform that's powerful enough for enterprise, simple enough for solo creators, and open enough to self-host anywhere.",
  date: "2026-03-01",
  author: "RankFlo Team",
  slug: "introducing-rankflo",
  readTime: "8 min read",
  tag: "Announcement",
};

const POSTS = [
  {
    title: "Why We Chose PostgreSQL Full-Text Search Over Elasticsearch",
    excerpt:
      "The tradeoffs we considered, the benchmarks we ran, and why Postgres tsvector was the right default for 90% of use cases.",
    date: "2026-02-25",
    author: "Engineering",
    slug: "postgresql-full-text-search",
    readTime: "12 min read",
    tag: "Engineering",
  },
  {
    title: "Building an Analytics Engine Without Cookies",
    excerpt:
      "How we track meaningful metrics while respecting privacy — no cookies, no fingerprinting, no consent banners.",
    date: "2026-02-18",
    author: "Engineering",
    slug: "cookieless-analytics",
    readTime: "10 min read",
    tag: "Engineering",
  },
  {
    title: "Self-Hosting RankFlo: A Complete Guide",
    excerpt:
      "Deploy RankFlo on your own infrastructure with Docker in under 5 minutes. Full walkthrough with PostgreSQL, Redis, and optional Meilisearch.",
    date: "2026-02-10",
    author: "RankFlo Team",
    slug: "self-hosting-guide",
    readTime: "6 min read",
    tag: "Guide",
  },
  {
    title: "SEO Scoring: How We Grade Your Content",
    excerpt:
      "A deep dive into our 9-check SEO audit system, how each check is weighted, and what scores actually mean for your content.",
    date: "2026-02-03",
    author: "Product",
    slug: "seo-scoring-explained",
    readTime: "7 min read",
    tag: "Product",
  },
  {
    title: "Webhooks Done Right: Delivery, Retry, and Dead Letters",
    excerpt:
      "Our approach to reliable webhook delivery with HMAC-SHA256 signing, exponential backoff, and what happens when endpoints go dark.",
    date: "2026-01-28",
    author: "Engineering",
    slug: "webhooks-done-right",
    readTime: "9 min read",
    tag: "Engineering",
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPage() {
  return (
    <>
      {/* JSON-LD for Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "RankFlo Blog",
            description: "Product updates, engineering insights, and best practices for modern blogging.",
            url: `${BASE_URL}/blog`,
            publisher: {
              "@type": "Organization",
              name: "RankFlo",
              url: BASE_URL,
            },
            blogPost: [FEATURED_POST, ...POSTS].map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              url: `${BASE_URL}/blog/${post.slug}`,
              datePublished: post.date,
              author: {
                "@type": "Person",
                name: post.author,
              },
            })),
          }),
        }}
      />

      <section className="py-24">
        <div className="mx-auto max-w-wide px-6">
          {/* Header */}
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-green-600 dark:text-accent">Blog</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Updates & Insights
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Product updates, engineering deep dives, and best practices for
              modern publishing.
            </p>
          </div>

          {/* Featured post */}
          <Link
            href={`/blog/${FEATURED_POST.slug}`}
            className="group mt-16 block rounded-2xl border border-gray-200 bg-gray-50 p-8 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700 md:p-12"
          >
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="rounded-full border border-accent/20 bg-accent-light-1 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-accent-1 dark:text-accent">
                {FEATURED_POST.tag}
              </span>
              <span>{formatDate(FEATURED_POST.date)}</span>
              <span aria-hidden="true">&middot;</span>
              <span>{FEATURED_POST.readTime}</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-950 transition-colors group-hover:text-green-600 dark:text-white dark:group-hover:text-accent sm:text-3xl">
              {FEATURED_POST.title}
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-gray-600 dark:text-gray-400">
              {FEATURED_POST.excerpt}
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <span>{FEATURED_POST.author}</span>
            </div>
          </Link>

          {/* Posts grid */}
          <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800 md:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col justify-between bg-white p-8 transition-colors hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-950"
              >
                <div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-medium text-gray-600 dark:text-gray-400">{post.tag}</span>
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold leading-snug text-gray-950 transition-colors group-hover:text-green-600 dark:text-white dark:group-hover:text-accent">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
                  <span>{post.author}</span>
                  <span>{post.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
