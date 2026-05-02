import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@rankflo/db";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";
const RANKFLO_PROJECT_ID = process.env.NEXT_PUBLIC_SELF_PROJECT_ID ?? "";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

async function getTagData(slug: string, locale: string) {
  try {
    const tag = await db.tag.findFirst({ where: { slug } });
    if (!tag) return null;

    const posts = await db.post.findMany({
      where: {
        projectId: RANKFLO_PROJECT_ID,
        status: "PUBLISHED",
        deletedAt: null,
        locale,
        tags: { some: { tagId: tag.id } },
      },
      orderBy: { publishedAt: "desc" },
      take: 100,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        readingTime: true,
        featuredImage: true,
        author: { select: { name: true } },
      },
    });

    return { tag, posts };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getTagData(slug, "en");
  if (!result) return { title: "Tag Not Found" };

  const title = `${result.tag.name} — Articles & Guides | RankFlo Blog`;
  const description = `Browse ${result.posts.length} articles tagged ${result.tag.name}. Latest insights, tutorials, and guides from the RankFlo team.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/blog/tag/${slug}`,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(result.tag.name)}&description=${encodeURIComponent(`${result.posts.length} articles`)}`],
    },
    alternates: { canonical: `${BASE_URL}/blog/tag/${slug}` },
  };
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = lang && ["en", "fr", "es", "de", "it", "pt", "nl", "ja", "zh"].includes(lang) ? lang : "en";
  const result = await getTagData(slug, locale);
  if (!result) return notFound();
  const { tag, posts } = result;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${tag.name} Articles`,
            url: `${BASE_URL}/blog/tag/${slug}`,
            hasPart: posts.slice(0, 20).map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `${BASE_URL}/blog/${p.slug}`,
              datePublished: p.publishedAt,
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
              { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
              { "@type": "ListItem", position: 3, name: tag.name, item: `${BASE_URL}/blog/tag/${slug}` },
            ],
          }),
        }}
      />

      <section className="py-16">
        <div className="mx-auto max-w-wide px-6">
          <nav className="mb-8 flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-300">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-gray-900 dark:hover:text-gray-300">Blog</Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-400">Tag: {tag.name}</span>
          </nav>

          <p className="text-sm font-medium text-green-600 dark:text-accent">Tag</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            {tag.name}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {posts.length} articles tagged {tag.name}.
          </p>

          {posts.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-gray-200 p-12 text-center dark:border-gray-800">
              <p className="text-gray-500">No posts yet for this tag.</p>
              <Link href="/blog" className="mt-4 inline-block text-sm text-green-700 underline dark:text-accent">Back to blog</Link>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
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
                        {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold leading-snug text-gray-950 transition-colors group-hover:text-green-600 dark:text-white dark:group-hover:text-accent">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">{post.excerpt}</p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                      <span>{post.author?.name ?? "RankFlo Team"}</span>
                      <span>{post.readingTime ? `${post.readingTime} min read` : "5 min read"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
