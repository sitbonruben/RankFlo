"use client";

import { useGrowthStore } from "@/stores/growth-store";

const STAT_ICONS = {
  posts: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  published: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  drafts: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10",
};

interface OverviewData {
  project: { id: string; name: string; url: string | null };
  stats: { totalPosts: number; published: number; drafts: number };
  brand: {
    industry?: string;
    targetAudience?: string;
    tone?: string[];
    writingStyle?: string;
  } | null;
}

export function GrowthOverview({ data }: { data: OverviewData | undefined }) {
  const scanResult = useGrowthStore((s) => s.scanResult);
  const brand = data?.brand ?? scanResult?.brandVoice;

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Posts",
            value: data?.stats.totalPosts ?? 0,
            icon: STAT_ICONS.posts,
          },
          {
            label: "Published",
            value: data?.stats.published ?? 0,
            icon: STAT_ICONS.published,
          },
          {
            label: "Drafts",
            value: data?.stats.drafts ?? 0,
            icon: STAT_ICONS.drafts,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-900">
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={stat.icon}
                />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Brand summary */}
      {brand && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <svg
              className="h-4 w-4 text-green-600 dark:text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
            Brand Profile
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {brand.industry && (
              <div>
                <p className="text-xs font-medium text-gray-400">Industry</p>
                <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                  {brand.industry}
                </p>
              </div>
            )}
            {brand.targetAudience && (
              <div>
                <p className="text-xs font-medium text-gray-400">Target Audience</p>
                <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                  {brand.targetAudience}
                </p>
              </div>
            )}
            {brand.writingStyle && (
              <div>
                <p className="text-xs font-medium text-gray-400">Writing Style</p>
                <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                  {brand.writingStyle}
                </p>
              </div>
            )}
            {brand.tone && brand.tone.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400">Tone</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {brand.tone.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-accent"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Recommended next steps
        </h3>
        <div className="mt-4 space-y-3">
          {[
            {
              label: "Research topics",
              desc: "Find high-traffic topic opportunities",
              tab: "research" as const,
            },
            {
              label: "Run SEO audit",
              desc: "Check your content health score",
              tab: "seo" as const,
            },
            {
              label: "Create strategy",
              desc: "Generate an 8-week content plan",
              tab: "strategy" as const,
            },
          ].map((action) => (
            <button
              key={action.tab}
              onClick={() => useGrowthStore.getState().setActiveTab(action.tab)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-100 p-4 text-left transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.label}
                </p>
                <p className="text-xs text-gray-500">{action.desc}</p>
              </div>
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
