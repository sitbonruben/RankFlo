"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

type StatusFilter = "All" | "PUBLISHED" | "DRAFT" | "SCHEDULED" | "ARCHIVED";

function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "Just now" : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const STATUS_LABELS: Record<string, string> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  ARCHIVED: "Archived",
};

export default function PostsPage() {
  const [filter, setFilter] = useState<StatusFilter>("All");

  const { data, isLoading } = trpc.post.list.useQuery({
    page: 1,
    pageSize: 50,
    sort: "newest",
    status: filter === "All" ? undefined : (filter as never),
  });

  const posts = data?.items ?? [];

  // Fetch 30-day view counts for all loaded slugs
  const slugs = useMemo(() => posts.map((p) => p.slug), [posts]);
  const from30d = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; }, []);
  const viewsQ = trpc.analytics.postViews.useQuery(
    { from: from30d, to: new Date(), slugs },
    { enabled: slugs.length > 0, staleTime: 60_000 },
  );
  const viewsMap: Record<string, number> = viewsQ.data ?? {};

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Posts</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data?.total ? `${data.total} posts` : "Manage your blog posts."}
          </p>
        </div>
        <Link
          href="/posts/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["All", "PUBLISHED", "DRAFT", "SCHEDULED", "ARCHIVED"] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              filter === f
                ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {f === "All" ? "All" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Posts table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-950">
        {isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-4 w-64 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900">
              <svg className="h-6 w-6 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No posts yet</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-600">
              {filter !== "All" ? `No ${STATUS_LABELS[filter]?.toLowerCase()} posts` : "Create your first post to get started"}
            </p>
            {filter === "All" && (
              <Link
                href="/posts/new"
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
              >
                Create first post
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="hidden px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell">
                  Views <span className="font-normal normal-case tracking-normal text-gray-400">(30d)</span>
                </th>
                <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {posts.map((post) => {
                const views = viewsMap[post.slug];
                return (
                  <tr key={post.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-5 py-4">
                      <Link
                        href={`/posts/${post.slug}/edit`}
                        className="text-sm font-medium text-gray-900 hover:text-green-600 dark:text-white dark:hover:text-accent"
                      >
                        {post.title || "Untitled"}
                      </Link>
                      <p className="text-xs text-gray-400 dark:text-gray-600">/{post.slug}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
                          post.status === "PUBLISHED"
                            ? "bg-green-50 text-green-700 border border-green-200 dark:bg-accent-1 dark:text-accent dark:border-accent/20"
                            : post.status === "SCHEDULED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/20"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          post.status === "PUBLISHED" ? "bg-green-500 dark:bg-accent"
                          : post.status === "SCHEDULED" ? "bg-blue-400"
                          : "bg-gray-400 dark:bg-gray-600"
                        }`} />
                        {STATUS_LABELS[post.status] ?? post.status}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 text-right sm:table-cell">
                      {viewsQ.isLoading ? (
                        <span className="inline-block h-4 w-10 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                      ) : views != null && views > 0 ? (
                        <span className="text-sm font-medium tabular-nums text-gray-900 dark:text-white">
                          {views.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300 dark:text-gray-700">—</span>
                      )}
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <span className="text-sm text-gray-400 dark:text-gray-600">{timeAgo(post.updatedAt)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
