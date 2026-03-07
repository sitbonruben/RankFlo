import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title,
    openGraph: {
      title,
      type: "article",
      images: [`/api/og?title=${encodeURIComponent(title)}&type=Blog`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [`/api/og?title=${encodeURIComponent(title)}&type=Blog`],
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      {/* JSON-LD for BlogPosting */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: title,
            url: `${BASE_URL}/blog/${slug}`,
            datePublished: "2026-03-01",
            dateModified: "2026-03-01",
            author: {
              "@type": "Person",
              name: "RankFlo Team",
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
          {/* Breadcrumb with schema */}
          <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/blog" className="transition-colors hover:text-gray-950 dark:hover:text-white">
              Blog
            </Link>
            <span aria-hidden="true">/</span>
            <span className="truncate text-gray-600 dark:text-gray-400">{title}</span>
          </nav>

          {/* Header */}
          <header className="mt-8 border-b border-gray-200 pb-10 dark:border-gray-800">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="rounded-full border border-accent/20 bg-accent-light-1 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-accent-1 dark:text-accent">
                Article
              </span>
              <time dateTime="2026-03-01">Mar 1, 2026</time>
              <span aria-hidden="true">&middot;</span>
              <span>8 min read</span>
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {title}
            </h1>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                BT
              </div>
              <div>
                <p className="text-sm font-medium text-gray-950 dark:text-white">RankFlo Team</p>
                <p className="text-xs text-gray-500">Engineering</p>
              </div>
            </div>
          </header>

          {/* Content placeholder */}
          <div className="prose prose-gray mt-10 max-w-none dark:prose-invert">
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              This is a placeholder for blog post content. In production, this
              would render the full post content from the database, including rich
              text formatting, code blocks, images, and embedded media.
            </p>

            <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-950">
              <p className="text-sm text-gray-500">
                Post content will be rendered here from the Tiptap editor output.
              </p>
            </div>
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
