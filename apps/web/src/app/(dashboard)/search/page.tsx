"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;

function BarRow({ label, value, max, sub }: { label: string; value: number; max: number; sub?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="relative px-5 py-3">
      <div className="absolute inset-y-0 left-0 rounded-l-xl bg-green-50 dark:bg-green-950/20" style={{ width: `${pct}%` }} />
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
          {value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function SearchAnalyticsPage() {
  const [days, setDays] = useState<7 | 30 | 90>(30);

  const { data: queries, isLoading } = trpc.analytics.topSearchQueries.useQuery({ days, limit: 25 });

  const total = queries?.reduce((s, q) => s + q.searches, 0) ?? 0;
  const zeroResults = queries?.filter((q) => q.avgResults === 0).length ?? 0;
  const withClicks = queries?.filter((q) => q.avgClickPosition != null).length ?? 0;
  const ctr = total > 0 ? Math.round((withClicks / (queries?.length ?? 1)) * 100) : 0;
  const avgPos = queries?.length
    ? queries.filter((q) => q.avgClickPosition != null).reduce((s, q) => s + (q.avgClickPosition ?? 0), 0) /
      Math.max(1, queries.filter((q) => q.avgClickPosition != null).length)
    : 0;

  const maxSearches = Math.max(...(queries?.map((q) => q.searches) ?? [1]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Search Analytics</h1>
          <p className="text-sm text-gray-500">What visitors are searching for on your blog.</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-950">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days as 7 | 30 | 90)}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                days === r.days
                  ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total searches", value: total.toLocaleString(), sub: `Last ${days} days` },
          { label: "Zero results", value: zeroResults.toLocaleString(), sub: "Queries with no hits" },
          { label: "CTR (click rate)", value: `${ctr}%`, sub: "Queries that got a click" },
          { label: "Avg click position", value: avgPos > 0 ? avgPos.toFixed(1) : "—", sub: "Result position clicked" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{isLoading ? "—" : s.value}</p>
            <p className="mt-1 text-xs text-gray-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Top queries */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">Top search queries</h2>
          <p className="text-xs text-gray-500">Most searched terms in the last {days} days</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-500">Loading…</div>
        ) : !queries?.length ? (
          <div className="py-16 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="mt-4 text-sm text-gray-500">No search data yet for this period.</p>
            <p className="mt-1 text-xs text-gray-400">Searches on your blog are tracked automatically via the Content API.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {queries.map((q) => (
              <BarRow
                key={q.query}
                label={q.query}
                value={q.searches}
                max={maxSearches}
                sub={
                  q.avgResults === 0
                    ? "0 results — consider adding content"
                    : q.avgClickPosition != null
                    ? `Avg position clicked: ${q.avgClickPosition}`
                    : `Avg ${q.avgResults} results`
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Zero results callout */}
      {!isLoading && (queries?.filter((q) => q.avgResults === 0).length ?? 0) > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-950/10">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                {queries!.filter((q) => q.avgResults === 0).length} queries returned zero results
              </p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-500">
                These are content gaps — consider writing posts targeting:{" "}
                <strong>{queries!.filter((q) => q.avgResults === 0).slice(0, 3).map((q) => `"${q.query}"`).join(", ")}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
