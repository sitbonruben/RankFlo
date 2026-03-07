"use client";

import Link from "next/link";

interface GenerationResult {
  postId: string;
  title: string;
  slug: string;
  excerpt: string;
  wordCount: number;
  seoScore: number;
  readTime: number;
}

export function QuickGenerate({
  result,
  isGenerating,
  topic,
}: {
  result: GenerationResult | null;
  isGenerating: boolean;
  topic: string | null;
}) {
  if (!isGenerating && !result) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-black/95 sm:p-6">
      <div className="mx-auto max-w-3xl">
        {isGenerating ? (
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <svg className="h-5 w-5 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Generating content...
              </p>
              <p className="mt-0.5 text-xs text-gray-500 truncate">
                {topic}
              </p>
            </div>
          </div>
        ) : result ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-accent/20">
                <svg className="h-5 w-5 text-green-600 dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {result.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {result.wordCount} words &middot; {result.readTime} min read &middot; SEO {result.seoScore}/100
                </p>
              </div>
            </div>
            <Link
              href={`/posts/${result.postId}/edit`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-accent-9"
            >
              Open in Editor
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
