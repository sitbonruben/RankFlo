"use client";

export default function SearchAnalyticsPage() {
  const stats = [
    { label: "Total queries", value: "12,847", change: "+12.3%" },
    { label: "Zero results", value: "342", change: "-5.1%" },
    { label: "CTR", value: "24.8%", change: "+2.4%" },
    { label: "Avg position", value: "3.2", change: "-0.8" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Search Analytics</h1>
        <p className="text-sm text-gray-500">Understand how users search your content.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{stat.value}</p>
            <p
              className={`mt-1 text-xs font-medium ${
                stat.change.startsWith("+")
                  ? "text-green-600 dark:text-accent"
                  : stat.change.startsWith("-")
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-500"
              }`}
            >
              {stat.change} from last month
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm text-gray-500">Search query trends chart placeholder</p>
      </div>
    </div>
  );
}
