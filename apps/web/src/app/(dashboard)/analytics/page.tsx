"use client";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your blog performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                range === "7d"
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Visitors", value: "12,847", change: { value: 23, trend: "up" as const } },
          { label: "Page views", value: "34,291", change: { value: 18, trend: "up" as const } },
          { label: "Bounce rate", value: "42.3%", change: { value: -5, trend: "up" as const } },
          { label: "Avg. time", value: "2m 14s", change: { value: 8, trend: "up" as const } },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {stat.value}
              </span>
              <span className="mb-1 text-xs font-medium text-green-600 dark:text-accent">
                +{stat.change.value}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h2 className="text-sm font-medium text-gray-900 dark:text-white">Page views over time</h2>
        <div className="mt-6 flex items-end gap-1 h-48">
          {Array.from({ length: 28 }, (_, i) => {
            const h = 20 + Math.random() * 80;
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-green-100 transition-all hover:bg-green-200 dark:bg-accent/20 dark:hover:bg-accent/30"
                style={{ height: `${h}%` }}
              >
                <div
                  className="w-full rounded-t-sm bg-green-500 dark:bg-accent"
                  style={{ height: `${30 + Math.random() * 70}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-400 dark:text-gray-600">
          <span>Feb 6</span>
          <span>Feb 13</span>
          <span>Feb 20</span>
          <span>Feb 27</span>
          <span>Mar 5</span>
        </div>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top pages */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/50">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">Top pages</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {[
              { page: "/welcome-to-rankflo", views: 4521 },
              { page: "/getting-started-api", views: 2103 },
              { page: "/", views: 1876 },
              { page: "/self-hosting-guide", views: 982 },
              { page: "/pricing", views: 743 },
            ].map((row) => (
              <div key={row.page} className="flex items-center justify-between px-5 py-3">
                <span className="truncate text-sm text-gray-700 dark:text-gray-300">{row.page}</span>
                <span className="text-sm text-gray-500">{row.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top referrers */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/50">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">Top referrers</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {[
              { referrer: "google.com", views: 6234 },
              { referrer: "twitter.com", views: 1892 },
              { referrer: "github.com", views: 1245 },
              { referrer: "reddit.com", views: 876 },
              { referrer: "Direct", views: 3421 },
            ].map((row) => (
              <div key={row.referrer} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">{row.referrer}</span>
                <span className="text-sm text-gray-500">{row.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
