"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

type StatusFilter = "All" | "PUBLISHED" | "DRAFT" | "REVIEW" | "SCHEDULED" | "ARCHIVED";

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
  REVIEW: "In Review",
  SCHEDULED: "Scheduled",
  ARCHIVED: "Archived",
};

function BulkImageModal({
  posts,
  onClose,
  onDone,
}: {
  posts: { id: string; title: string }[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const cancelRef = { current: false };

  const generateImage = trpc.ai.generateImage.useMutation();
  const updatePost = trpc.post.update.useMutation();

  const start = useCallback(async () => {
    setRunning(true);
    setCurrent(0);
    setErrors([]);
    cancelRef.current = false;

    for (let i = 0; i < posts.length; i++) {
      if (cancelRef.current) break;
      const post = posts[i]!;
      setCurrent(i + 1);
      try {
        const prompt = `Professional blog header image for article titled "${post.title}". Modern, clean, photorealistic, no text overlay.`;
        const { url } = await generateImage.mutateAsync({ prompt, aspectRatio: "16:9" });
        await updatePost.mutateAsync({ id: post.id, featuredImage: url });
      } catch (err) {
        setErrors((prev) => [
          ...prev,
          `"${post.title.slice(0, 40)}…": ${err instanceof Error ? err.message : "Failed"}`,
        ]);
      }
    }

    setRunning(false);
    setDone(true);
    onDone();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const cancel = () => {
    cancelRef.current = true;
    setCancelled(true);
  };

  const pct = posts.length > 0 ? Math.round((current / posts.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Auto-fill missing images</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {posts.length} posts need images · using KIE.ai
            </p>
          </div>
          {!running && (
            <button onClick={onClose} className="text-gray-600 hover:text-gray-400 text-lg leading-none">×</button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-gray-500">
            <span>{done ? "Done!" : running ? `Generating ${current} / ${posts.length}…` : cancelled ? "Cancelled" : `Ready to generate ${posts.length} images`}</span>
            <span>{pct}%</span>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-4 max-h-28 overflow-y-auto rounded-lg bg-red-950/30 border border-red-800/30 p-3 space-y-1">
            {errors.map((e, i) => (
              <p key={i} className="text-xs text-red-400">{e}</p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {!running && !done && !cancelled && (
            <>
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void start()}
                className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-black hover:bg-accent-9 transition-colors"
              >
                Start generating
              </button>
            </>
          )}
          {running && (
            <button
              onClick={cancel}
              className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              Stop
            </button>
          )}
          {(done || cancelled) && (
            <button
              onClick={onClose}
              className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-black hover:bg-accent-9 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostsPage() {
  const [filter, setFilter] = useState<StatusFilter>("PUBLISHED");
  const [showBulkModal, setShowBulkModal] = useState(false);

  const { data, isLoading, refetch } = trpc.post.list.useQuery({
    page: 1,
    pageSize: 100,
    sort: "newest",
    status: filter === "All" ? undefined : (filter as never),
  });

  const posts = data?.items ?? [];

  const postsWithoutImages = useMemo(
    () => posts.filter((p) => !p.featuredImage).map((p) => ({ id: p.id, title: p.title ?? "Untitled" })),
    [posts],
  );

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
      {showBulkModal && (
        <BulkImageModal
          posts={postsWithoutImages}
          onClose={() => setShowBulkModal(false)}
          onDone={() => void refetch()}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Posts</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data?.total ? `${data.total} posts` : "Manage your blog posts."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {postsWithoutImages.length > 0 && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 text-sm font-medium text-gray-300 transition-colors hover:border-accent/50 hover:text-white"
              title={`${postsWithoutImages.length} posts missing featured images`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Fill {postsWithoutImages.length} images
            </button>
          )}
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
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["All", "PUBLISHED", "DRAFT", "REVIEW", "SCHEDULED", "ARCHIVED"] as StatusFilter[]).map((f) => (
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
                      <div className="flex items-center gap-3">
                        {post.featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={post.featuredImage} alt="" className="h-8 w-12 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-8 w-12 rounded bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                            <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/posts/${post.slug}/edit`}
                            className="text-sm font-medium text-gray-900 hover:text-green-600 dark:text-white dark:hover:text-accent"
                          >
                            {post.title || "Untitled"}
                          </Link>
                          <div className="mt-0.5 flex items-center gap-2">
                            <p className="text-xs text-gray-400 dark:text-gray-600">/{post.slug}</p>
                            {(post as { project?: { id: string; name: string } | null }).project ? (
                              <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                                  <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
                                  <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" />
                                  <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" />
                                  <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.4" />
                                </svg>
                                {(post as { project?: { id: string; name: string } | null }).project!.name}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded bg-yellow-50 px-1.5 py-0.5 text-[10px] text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-500">
                                No project
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
                          post.status === "PUBLISHED"
                            ? "bg-green-50 text-green-700 border border-green-200 dark:bg-accent-1 dark:text-accent dark:border-accent/20"
                            : post.status === "SCHEDULED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/20"
                            : post.status === "REVIEW"
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-400/10 dark:text-yellow-400 dark:border-yellow-400/20"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          post.status === "PUBLISHED" ? "bg-green-500 dark:bg-accent"
                          : post.status === "SCHEDULED" ? "bg-blue-400"
                          : post.status === "REVIEW" ? "bg-yellow-400"
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
