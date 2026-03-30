"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

const RANGES = [
  { label: "7d",  days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1yr", days: 365 },
] as const;

function dateRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from, to };
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-xs text-gray-400">—</span>;
  const positive = delta > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${positive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
      {positive ? "↑" : "↓"}{Math.abs(delta)}%
    </span>
  );
}

export default function ContentPerformancePage() {
  const [rangeIdx, setRangeIdx] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [sortBy, setSortBy] = useState<"views" | "delta">("views");

  const range = useMemo(() => dateRange(RANGES[rangeIdx].days), [rangeIdx]);
  const projectsQuery = trpc.project.list.useQuery({});
  const projects = projectsQuery.data?.items ?? [];

  const queryBase = { ...range, ...(selectedProjectId ? { projectId: selectedProjectId } : {}) };
  const { data: rows, isLoading } = trpc.analytics.contentPerformance.useQuery(queryBase);

  const sorted = useMemo(() => {
    if (!rows) return [];
    return [...rows].sort((a, b) =>
      sortBy === "views" ? b.views - a.views : b.delta - a.delta
    );
  }, [rows, sortBy]);

  const gainers = sorted.filter((r) => r.delta > 10);
  const decliners = sorted.filter((r) => r.delta < -10);
  const maxViews = sorted.length > 0 ? Math.max(...sorted.map((r) => r.views), 1) : 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/analytics" className="hover:text-gray-700 dark:hover:text-gray-300">Analytics</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">Content Performance</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Content Performance</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Period-over-period growth for each post — find what&apos;s rising and what&apos;s fading.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
            {RANGES.map((r, i) => (
              <button
                key={i}
                onClick={() => setRangeIdx(i)}
                className={[
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  rangeIdx === i
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
                ].join(" ")}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total posts tracked",
            value: rows?.length ?? 0,
            sub: "across selected range",
            accent: false,
          },
          {
            label: "Growing posts",
            value: gainers.length,
            sub: ">10% growth vs prev period",
            accent: gainers.length > 0,
          },
          {
            label: "Declining posts",
            value: decliners.length,
            sub: ">10% decline vs prev period",
            accent: false,
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.accent ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20" : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"}`}>
            <p className={`text-sm font-medium ${s.accent ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>{s.label}</p>
            {isLoading ? (
              <div className="mt-2 h-8 w-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            ) : (
              <>
                <p className={`mt-1 text-3xl font-bold tracking-tight ${s.accent ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>{s.value}</p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">{s.sub}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Top gainers / decliners */}
      {!isLoading && (gainers.length > 0 || decliners.length > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {gainers.length > 0 && (
            <div className="rounded-xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900/30 dark:bg-green-950/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">Top gainers</p>
              <div className="mt-3 space-y-2">
                {gainers.slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3">
                    <Link href={`/posts/${r.slug}/edit`} className="min-w-0 truncate text-sm font-medium text-gray-900 hover:text-green-600 dark:text-white dark:hover:text-accent">{r.title}</Link>
                    <DeltaBadge delta={r.delta} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {decliners.length > 0 && (
            <div className="rounded-xl border border-red-100 bg-red-50/50 p-5 dark:border-red-900/20 dark:bg-red-950/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">Needs attention</p>
              <div className="mt-3 space-y-2">
                {decliners.slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3">
                    <Link href={`/posts/${r.slug}/edit`} className="min-w-0 truncate text-sm font-medium text-gray-900 hover:text-red-600 dark:text-white dark:hover:text-red-400">{r.title}</Link>
                    <DeltaBadge delta={r.delta} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">All posts</h3>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-800 dark:bg-gray-900">
            {(["views", "delta"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={[
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  sortBy === s
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
                ].join(" ")}
              >
                Sort by {s === "views" ? "views" : "growth"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No content data for this period</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">Make sure the tracking snippet is installed and posts have been visited.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-900">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-600">
              <span>Post</span>
              <span className="text-right">Views</span>
              <span className="text-right">Prev</span>
              <span className="text-right w-16">Change</span>
            </div>
            {sorted.map((row) => (
              <div key={row.id} className="relative grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3">
                <div
                  className="absolute inset-y-0 left-0 rounded-l-xl"
                  style={{
                    width: `${(row.views / maxViews) * 100}%`,
                    background: row.delta > 10 ? "rgba(34,197,94,0.06)" : row.delta < -10 ? "rgba(239,68,68,0.05)" : "rgba(243,244,246,0.7)",
                  }}
                />
                <div className="relative min-w-0">
                  <Link href={`/posts/${row.slug}/edit`} className="group block">
                    <p className="truncate text-sm font-medium text-gray-900 group-hover:text-green-600 dark:text-white dark:group-hover:text-accent">{row.title}</p>
                    <p className="truncate text-xs text-gray-400 dark:text-gray-600">/{row.slug}</p>
                  </Link>
                </div>
                <span className="relative text-sm font-semibold tabular-nums text-gray-900 dark:text-white text-right">{row.views.toLocaleString()}</span>
                <span className="relative text-sm tabular-nums text-gray-400 dark:text-gray-600 text-right">{row.prevViews.toLocaleString()}</span>
                <div className="relative text-right w-16">
                  {row.prevViews === 0 && row.views > 0 ? (
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">New</span>
                  ) : (
                    <DeltaBadge delta={row.delta} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
