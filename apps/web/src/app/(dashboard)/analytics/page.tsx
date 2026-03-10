"use client";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your blog&apos;s traffic and performance.
          </p>
        </div>
      </div>

      {/* Empty state — analytics integration not yet connected */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-24 text-center dark:border-gray-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900">
          <svg className="h-7 w-7 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">No analytics data yet</h3>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Connect your project and start publishing to see traffic, page views, and SEO performance here.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <a
            href="/projects/new"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
          >
            Connect a project
          </a>
          <a
            href="/posts/new"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            Create a post
          </a>
        </div>
      </div>
    </div>
  );
}
