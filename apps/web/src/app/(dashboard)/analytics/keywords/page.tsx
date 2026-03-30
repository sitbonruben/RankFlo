"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;

function BarRow({ label, value, max, sub }: { label: string; value: number; max: number; sub?: string }) {
  return (
    <div className="relative px-5 py-3">
      <div
        className="absolute inset-y-0 left-0 bg-green-50 dark:bg-green-950/20"
        style={{ width: `${(value / max) * 100}%`, opacity: 0.7 }}
      />
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          {sub && <p className="text-xs text-gray-400 dark:text-gray-600">{sub}</p>}
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
          {value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function KeywordsPage() {
  const [rangeIdx, setRangeIdx] = useState(1);
  const days = RANGES[rangeIdx].days;

  const { data: keywords, isLoading } = trpc.analytics.topSearchQueries.useQuery({ days, limit: 50 });

  const hasData = (keywords?.length ?? 0) > 0;
  const maxSearches = keywords ? Math.max(...keywords.map((k) => k.searches), 1) : 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/analytics" className="hover:text-gray-700 dark:hover:text-gray-300">Analytics</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">Keywords</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Keywords</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            What visitors search for on your blog — powered by your site search data.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
          {RANGES.map((r, i) => (
            <button
              key={i}
              onClick={() => setRangeIdx(i)}
              className={[
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                rangeIdx === i
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400",
              ].join(" ")}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total searches", value: keywords?.reduce((s, k) => s + k.searches, 0) ?? 0 },
          { label: "Unique keywords", value: keywords?.length ?? 0 },
          { label: "Avg results shown", value: keywords ? Math.round(keywords.reduce((s, k) => s + k.avgResults, 0) / Math.max(keywords.length, 1)) : 0 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
            {isLoading ? (
              <div className="mt-2 h-8 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            ) : (
              <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {stat.value.toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top search queries</h3>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">Queries entered in your blog&apos;s search box</p>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-gray-100 dark:bg-gray-800" style={{ width: `${80 - i * 7}%` }} />
            ))}
          </div>
        ) : !hasData ? (
          <div className="px-5 py-12 text-center">
            <svg className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">No search data yet</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
              Make sure your blog has search enabled and the tracker snippet is installed.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-600">
              <span>Query</span>
              <span>Searches</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-900">
              {keywords!.map((kw, i) => (
                <BarRow
                  key={i}
                  label={kw.query}
                  value={kw.searches}
                  max={maxSearches}
                  sub={
                    kw.avgResults > 0 || kw.avgClickPosition
                      ? [
                          kw.avgResults > 0 && `${kw.avgResults} avg results`,
                          kw.avgClickPosition && `clicked pos ${kw.avgClickPosition}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      : undefined
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tip */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm font-medium text-gray-900 dark:text-white">Turn searches into content</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Queries with many searches but low results or no click position are gaps — write posts targeting those exact phrases.
        </p>
        <Link
          href="/posts/new"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 dark:text-accent dark:hover:text-accent-9"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Write a new post
        </Link>
      </div>
    </div>
  );
}
