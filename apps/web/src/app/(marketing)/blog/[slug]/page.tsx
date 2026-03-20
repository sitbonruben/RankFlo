import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@rankflo/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";
const RANKFLO_PROJECT_ID = process.env.NEXT_PUBLIC_SELF_PROJECT_ID ?? "";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string) {
  return db.post.findFirst({
    where: {
      projectId: RANKFLO_PROJECT_ID,
      slug,
      status: "PUBLISHED",
      deletedAt: null,
    },
    include: {
      author: { select: { name: true, avatarUrl: true } },
      seoMeta: true,
      tags: { include: { tag: { select: { name: true, slug: true } } } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };

  const title = post.seoMeta?.metaTitle ?? post.title;
  const description = post.seoMeta?.metaDescription ?? post.excerpt ?? "";
  const ogImage = post.seoMeta?.ogImage ?? post.featuredImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author?.name ?? "RankFlo Team"],
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    alternates: {
      canonical: post.seoMeta?.canonicalUrl ?? `${BASE_URL}/blog/${slug}`,
    },
  };
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const authorInitials = (post.author?.name ?? "RT")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            url: `${BASE_URL}/blog/${slug}`,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            author: {
              "@type": "Person",
              name: post.author?.name ?? "RankFlo Team",
            },
            publisher: {
              "@type": "Organization",
              name: "RankFlo",
              url: BASE_URL,
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${BASE_URL}/blog/${slug}`,
            },
          }),
        }}
      />

      <article className="py-24">
        <div className="mx-auto max-w-content px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/blog" className="transition-colors hover:text-gray-950 dark:hover:text-white">
              Blog
            </Link>
            <span aria-hidden="true">/</span>
            <span className="truncate text-gray-600 dark:text-gray-400">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mt-8 border-b border-gray-200 pb-10 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {post.tags[0]?.tag && (
                <span className="rounded-full border border-accent/20 bg-accent-light-1 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-accent-1 dark:text-accent">
                  {post.tags[0].tag.name}
                </span>
              )}
              {post.publishedAt && (
                <time dateTime={post.publishedAt.toISOString()}>
                  {formatDate(post.publishedAt)}
                </time>
              )}
              {post.readingTime && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span>{post.readingTime} min read</span>
                </>
              )}
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-xl leading-relaxed text-gray-600 dark:text-gray-400">
                {post.excerpt}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3">
              {post.author?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.name ?? "Author"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                  {authorInitials}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-950 dark:text-white">
                  {post.author?.name ?? "RankFlo Team"}
                </p>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-gray mt-10 max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-green-600 dark:prose-a:text-accent prose-code:rounded prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-pre:rounded-xl">
            {post.contentHtml ? (
              <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">{post.contentPlain}</p>
            )}
          </div>

          {/* Footer nav */}
          <div className="mt-16 flex items-center justify-between border-t border-gray-200 pt-8 dark:border-gray-800">
            <Link
              href="/blog"
              className="text-sm text-gray-500 transition-colors hover:text-gray-950 dark:hover:text-white"
            >
              &larr; Back to blog
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
