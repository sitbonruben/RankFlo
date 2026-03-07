"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

// ─── Constants ──────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

// ─── Helpers ────────────────────────────────────────────────
type SubscriberStatus = "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatChartDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function statusBadgeClasses(status: SubscriberStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-50 text-green-700 border border-green-200 dark:bg-accent-1 dark:text-accent dark:border-accent/20";
    case "UNSUBSCRIBED":
      return "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    case "BOUNCED":
      return "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40";
  }
}

function statusDotClasses(status: SubscriberStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500 dark:bg-accent";
    case "UNSUBSCRIBED":
      return "bg-gray-400 dark:bg-gray-600";
    case "BOUNCED":
      return "bg-red-500 dark:bg-red-400";
  }
}

// ─── Skeleton Components ────────────────────────────────────
function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="mt-2">
        <div className="h-9 w-16 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-5 py-4">
        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="hidden px-5 py-4 sm:table-cell">
        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="hidden px-5 py-4 md:table-cell">
        <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="px-5 py-4">
        <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </td>
      <td className="hidden px-5 py-4 lg:table-cell">
        <div className="flex gap-1">
          <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      </td>
      <td className="hidden px-5 py-4 text-right xl:table-cell">
        <div className="ml-auto h-4 w-24 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </td>
    </tr>
  );
}

// ─── Component ──────────────────────────────────────────────
export default function SubscribersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"All" | SubscriberStatus>("All");

  // tRPC queries
  const statsQuery = trpc.subscriber.stats.useQuery();
  const listQuery = trpc.subscriber.list.useQuery({
    page,
    limit: ITEMS_PER_PAGE,
    status: statusFilter !== "All" ? statusFilter : undefined,
    search: search || undefined,
  });

  const stats = statsQuery.data;
  const subscribers = listQuery.data?.subscribers ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 1;
  const currentPage = Math.min(page, totalPages);

  const maxGrowth = stats?.growthByDay?.length
    ? Math.max(...stats.growthByDay.map((d) => d.count))
    : 0;

  // Generate chart axis labels (evenly spaced across growthByDay)
  const chartLabels = (() => {
    if (!stats?.growthByDay?.length) return [];
    const days = stats.growthByDay;
    const count = 5;
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const index = Math.round((i / (count - 1)) * (days.length - 1));
      labels.push(formatChartDate(days[index]!.date));
    }
    return labels;
  })();

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Subscribers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your email list and lead capture
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 dark:text-gray-600">
            {stats ? stats.total.toLocaleString() : "\u2014"} total
          </span>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-gray-900">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          [
            {
              label: "Total Subscribers",
              value: (stats?.total ?? 0).toLocaleString(),
              icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
            },
            {
              label: "Active",
              value: (stats?.active ?? 0).toLocaleString(),
              icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
            },
            {
              label: "This Month",
              value: (stats?.thisMonth ?? 0).toLocaleString(),
              icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
            },
            {
              label: "Top Source",
              value: stats?.topSources[0]?.source?.replace(/-/g, " ") ?? "---",
              icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
              isText: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <svg
                  className="h-5 w-5 text-gray-300 dark:text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
              <div className="mt-2">
                <span
                  className={`text-3xl font-semibold tracking-tight text-gray-900 dark:text-white ${
                    "isText" in stat && stat.isText ? "text-xl capitalize" : ""
                  }`}
                >
                  {stat.value}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Subscriber table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-950">
        {/* Table header bar */}
        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex items-center gap-2">
            {(["All", "ACTIVE", "UNSUBSCRIBED", "BOUNCED"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setStatusFilter(filter);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  statusFilter === filter
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {filter === "All" ? "All" : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search subscribers..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 w-64 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:placeholder-gray-600 dark:focus:border-accent/50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell">
                  Name
                </th>
                <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
                  Source
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell">
                  Tags
                </th>
                <th className="hidden px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 xl:table-cell">
                  Subscribed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {listQuery.isLoading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : (
                <>
                  {subscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {sub.email}
                        </span>
                        <p className="text-xs text-gray-400 dark:text-gray-600 sm:hidden">
                          {sub.name}
                        </p>
                      </td>
                      <td className="hidden px-5 py-4 sm:table-cell">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{sub.name}</span>
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        <span className="inline-flex rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {sub.source}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${statusBadgeClasses(sub.status as SubscriberStatus)}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusDotClasses(sub.status as SubscriberStatus)}`}
                          />
                          {sub.status.charAt(0) + sub.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {sub.tags.length > 0 ? (
                            sub.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-300 dark:text-gray-700">---</span>
                          )}
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 text-right xl:table-cell">
                        <span className="text-sm text-gray-400 dark:text-gray-600">
                          {formatDate(typeof sub.subscribedAt === "string" ? sub.subscribedAt : new Date(sub.subscribedAt).toISOString())}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {subscribers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <svg
                          className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                          />
                        </svg>
                        <p className="mt-3 text-sm text-gray-500">No subscribers found</p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
                          Try adjusting your search or filter
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 dark:border-gray-800">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>
              {" "}-{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {Math.min(currentPage * ITEMS_PER_PAGE, total)}
              </span>
              {" "}of{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {total}
              </span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors ${
                    p === currentPage
                      ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-white"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Growth chart + Source breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Growth chart */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">
              Subscriber growth
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-600">Last 30 days</span>
          </div>
          <div className="mt-6 flex items-end gap-[3px] h-48">
            {statsQuery.isLoading ? (
              <div className="flex-1 flex items-end gap-[3px] w-full animate-pulse">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gray-200 dark:bg-gray-800"
                    style={{ height: `${20 + Math.random() * 60}%` }}
                  />
                ))}
              </div>
            ) : (
              stats?.growthByDay?.map((day, i) => (
                <div
                  key={i}
                  className="group relative flex-1 rounded-t-sm bg-green-100 transition-all hover:bg-green-200 dark:bg-accent/20 dark:hover:bg-accent/30"
                  style={{ height: `${maxGrowth > 0 ? (day.count / maxGrowth) * 100 : 0}%` }}
                >
                  <div
                    className="w-full rounded-t-sm bg-green-500 dark:bg-accent"
                    style={{ height: "100%" }}
                  />
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700 whitespace-nowrap">
                    {formatChartDate(day.date)}: {day.count}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400 dark:text-gray-600">
            {chartLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>

        {/* Top sources breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/50">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">Top sources</h2>
          </div>
          <div className="p-5 space-y-4">
            {statsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-800" />
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
                  <div className="mt-1 h-3 w-20 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              ))
            ) : (
              stats?.topSources?.map((src) => {
                const percentage = stats.total > 0 ? Math.round((src.count / stats.total) * 100) : 0;
                return (
                  <div key={src.source}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{src.source}</span>
                      <span className="text-gray-500">{percentage}%</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all dark:bg-accent"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
                      {src.count} subscribers
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
