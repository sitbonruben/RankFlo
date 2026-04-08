import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@rankflo/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";
const RANKFLO_PROJECT_ID = process.env.NEXT_PUBLIC_SELF_PROJECT_ID ?? "";

export const dynamic = "force-dynamic";

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

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function readingTime(mins: number | null | undefined) {
  return mins ? `${mins} min read` : "5 min read";
}

export default async function BlogPage() {
  const posts = await db.post.findMany({
    where: {
      projectId: RANKFLO_PROJECT_ID,
      status: "PUBLISHED",
      deletedAt: null,
    },
    orderBy: { publishedAt: "desc" },
    take: 200,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      readingTime: true,
      featuredImage: true,
      author: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } }, take: 1 },
    },
  });

  const [featured, ...rest] = posts;

  return (
    <>
      {featured && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              name: "RankFlo Blog",
              description: "Product updates, engineering insights, and best practices for modern blogging.",
              url: `${BASE_URL}/blog`,
              publisher: { "@type": "Organization", name: "RankFlo", url: BASE_URL },
              blogPost: posts.map((p) => ({
                "@type": "BlogPosting",
                headline: p.title,
                description: p.excerpt,
                url: `${BASE_URL}/blog/${p.slug}`,
                datePublished: p.publishedAt,
                author: { "@type": "Person", name: p.author?.name ?? "RankFlo Team" },
              })),
            }),
          }}
        />
      )}

      <section className="py-24">
        <div className="mx-auto max-w-wide px-6">
          {/* Header */}
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-green-600 dark:text-accent">Blog</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Updates &amp; Insights
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Product updates, engineering deep dives, and best practices for
              modern publishing.
            </p>
          </div>

          {/* Featured post */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group mt-16 block overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
            >
              {featured.featuredImage && (
                <div className="aspect-[21/9] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.featuredImage} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
              )}
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  {featured.tags[0]?.tag && (
                    <span className="rounded-full border border-accent/20 bg-accent-light-1 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-accent-1 dark:text-accent">
                      {featured.tags[0].tag.name}
                    </span>
                  )}
                  {featured.publishedAt && <span>{formatDate(featured.publishedAt)}</span>}
                  <span aria-hidden="true">&middot;</span>
                  <span>{readingTime(featured.readingTime)}</span>
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-950 transition-colors group-hover:text-green-600 dark:text-white dark:group-hover:text-accent sm:text-3xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-3 max-w-3xl leading-relaxed text-gray-600 dark:text-gray-400">
                    {featured.excerpt}
                  </p>
                )}
                <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                  <span>{featured.author?.name ?? "RankFlo Team"}</span>
                </div>
              </div>
            </Link>
          )}

          {/* Posts grid */}
          {rest.length > 0 && (
            <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white transition-colors hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-950"
                >
                  {post.featuredImage && (
                    <div className="aspect-video overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.featuredImage} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          {post.tags[0]?.tag?.name ?? "Article"}
                        </span>
                        {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold leading-snug text-gray-950 transition-colors group-hover:text-green-600 dark:text-white dark:group-hover:text-accent">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
                      <span>{post.author?.name ?? "RankFlo Team"}</span>
                      <span>{readingTime(post.readingTime)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {posts.length === 0 && (
            <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-24 dark:border-gray-800">
              <p className="text-gray-500">No posts yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
