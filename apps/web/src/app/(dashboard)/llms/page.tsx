"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";

const PLATFORMS: Record<string, { label: string; color: string }> = {
  chatgpt:   { label: "ChatGPT",   color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" },
  claude:    { label: "Claude",    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
  gemini:    { label: "Gemini",    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
  perplexity:{ label: "Perplexity",color: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400" },
  copilot:   { label: "Copilot",   color: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400" },
  grok:      { label: "Grok",      color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  other:     { label: "Other",     color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

function PlatformBadge({ platform }: { platform: string }) {
  const cfg = PLATFORMS[platform.toLowerCase()] ?? PLATFORMS.other;
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
      {cfg.label ?? platform}
    </span>
  );
}

function SentimentDot({ sentiment }: { sentiment: string }) {
  const colors = {
    positive: "bg-green-500",
    negative: "bg-red-500",
    neutral: "bg-gray-400 dark:bg-gray-600",
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[sentiment as keyof typeof colors] ?? colors.neutral}`} />;
}

function timeAgo(date: Date | string) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/* ── Visibility score ring ─────────────────────────────────────────────────── */
function VisibilityRing({ score, isLoading }: { score: number; isLoading: boolean }) {
  const R = 52, C = 2 * Math.PI * R;
  const dashOffset = C - (score / 100) * C;

  const color = score >= 60 ? "#22c55e" : score >= 30 ? "#f59e0b" : "#ef4444";
  const label = score >= 60 ? "Strong" : score >= 30 ? "Building" : "Weak";

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {isLoading ? (
        <div className="h-36 w-36 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
      ) : (
        <div className="relative">
          <svg width="144" height="144" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r={R} fill="none" stroke="currentColor" strokeWidth={10} className="text-gray-100 dark:text-gray-800" />
            <circle
              cx="72" cy="72" r={R}
              fill="none"
              stroke={color}
              strokeWidth={10}
              strokeDasharray={C}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 72 72)"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white" style={{ color }}>{score}</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">/ 100</span>
          </div>
        </div>
      )}
      <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">AI Visibility Score</p>
      {!isLoading && <p className="text-xs text-gray-400 dark:text-gray-600">{label} — based on mentions, sentiment & citations</p>}
    </div>
  );
}

/* ── Weekly trend bars ─────────────────────────────────────────────────────── */
function WeeklyTrendBars({ data, isLoading }: { data: { week: string; count: number }[]; isLoading: boolean }) {
  const max = data.length > 0 ? Math.max(...data.map((w) => w.count), 1) : 1;

  if (isLoading) {
    return (
      <div className="flex items-end gap-1 h-20 px-1">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex-1 animate-pulse rounded-t bg-gray-100 dark:bg-gray-800" style={{ height: `${30 + Math.random() * 50}%` }} />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return <p className="py-6 text-center text-xs text-gray-400 dark:text-gray-600">No data yet</p>;
  }

  return (
    <div className="flex items-end gap-1 h-20 px-1">
      {data.map((w, i) => {
        const pct = max > 0 ? (w.count / max) * 100 : 0;
        const isLast = i === data.length - 1;
        return (
          <div key={w.week} className="group relative flex flex-1 flex-col items-center justify-end">
            <div
              className={`w-full rounded-t transition-all ${isLast ? "bg-green-500" : "bg-green-200 dark:bg-green-900/50"} group-hover:bg-green-400`}
              style={{ height: `${Math.max(pct, 4)}%` }}
            />
            {/* tooltip */}
            <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded bg-gray-900 px-2 py-1 text-[10px] text-white group-hover:block whitespace-nowrap">
              {w.week}: {w.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LlmsOverviewPage() {
  const { data: stats, isLoading: statsLoading } = trpc.llm.mentionStats.useQuery({ days: 30 });
  const { data: recentData } = trpc.llm.mentionList.useQuery({ page: 1, pageSize: 6 });
  const { data: visibilityData, isLoading: visLoading } = trpc.llm.visibilityScore.useQuery();
  const { data: weeklyData, isLoading: weeklyLoading } = trpc.llm.weeklyTrend.useQuery();
  const recent = recentData?.items ?? [];
  const weeklyTrend = weeklyData ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">LLM Search</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track when AI mentions your brand — and improve how you show up.
          </p>
        </div>
        <Link
          href="/llms/mentions"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Log mention
        </Link>
      </div>

      {/* Top section: visibility score + weekly trend */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Visibility score ring */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <VisibilityRing score={visibilityData?.total ?? 0} isLoading={visLoading} />
          {!visLoading && visibilityData && (
            <div className="border-t border-gray-100 px-5 py-3 dark:border-gray-800">
              <div className="space-y-1.5">
                {Object.values(visibilityData.components).map((b) => (
                  <div key={b.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{b.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-full rounded-full bg-green-500" style={{ width: `${(b.score / b.max) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold tabular-nums text-gray-900 dark:text-white w-8 text-right">{b.score}/{b.max}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Weekly trend */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">8-week trend</h3>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">AI mention volume per week</p>
          </div>
          <div className="px-4 py-4">
            <WeeklyTrendBars data={weeklyTrend} isLoading={weeklyLoading} />
            <div className="mt-2 flex justify-between text-[10px] text-gray-400 dark:text-gray-600">
              <span>{weeklyTrend[0]?.week ?? ""}</span>
              <span>This week</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-rows-2 gap-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Mentions (30d)", value: stats?.total ?? 0, sub: stats ? (stats.trend > 0 ? `+${stats.trend}% vs prev` : stats.trend < 0 ? `${stats.trend}% vs prev` : "same as prev") : null, accent: (stats?.total ?? 0) > 0 },
              { label: "Sentiment score", value: stats ? `${stats.sentimentScore > 0 ? "+" : ""}${stats.sentimentScore}` : "—", sub: "positive − negative", accent: (stats?.sentimentScore ?? 0) > 0 },
            ].map((card) => (
              <div key={card.label} className={`rounded-xl border p-4 ${card.accent ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20" : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"}`}>
                <p className={`text-xs font-medium ${card.accent ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>{card.label}</p>
                {statsLoading ? (
                  <div className="mt-1.5 h-7 w-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                ) : (
                  <>
                    <p className={`mt-1 text-2xl font-bold tracking-tight ${card.accent ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>{card.value}</p>
                    {card.sub && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">{card.sub}</p>}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Positive", value: stats?.positive ?? 0 },
              { label: "Negative", value: stats?.negative ?? 0 },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                {statsLoading ? (
                  <div className="mt-1.5 h-7 w-8 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                ) : (
                  <p className={`mt-1 text-2xl font-bold tracking-tight ${card.label === "Positive" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>{card.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent mentions */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/50">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">Recent mentions</h2>
            <Link href="/llms/mentions" className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">View all</Link>
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-5">
              <svg className="h-8 w-8 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <p className="mt-3 text-sm text-gray-500">No mentions logged yet</p>
              <Link href="/llms/mentions" className="mt-2 text-xs font-medium text-green-600 hover:underline dark:text-accent">
                Log your first mention →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {recent.map((m) => (
                <div key={m.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <SentimentDot sentiment={m.sentiment} />
                      <PlatformBadge platform={m.platform} />
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-600 shrink-0">{timeAgo(m.mentionedAt)}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                    <span className="text-gray-400 dark:text-gray-600">Q: </span>{m.query}
                  </p>
                  {m.snippet && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500 line-clamp-2 italic">&ldquo;{m.snippet}&rdquo;</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform breakdown + quick nav */}
        <div className="flex flex-col gap-4">
          {/* Platform breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/50">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">By platform</h2>
            </div>
            {(stats?.byPlatform.length ?? 0) === 0 ? (
              <p className="px-5 py-6 text-center text-xs text-gray-400 dark:text-gray-600">No data yet</p>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-900">
                {stats!.byPlatform.map((p) => (
                  <div key={p.platform} className="flex items-center justify-between px-5 py-2.5">
                    <PlatformBadge platform={p.platform} />
                    <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white">{p.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/50">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">Explore</h2>
            </div>
            <div className="p-3 flex flex-col gap-1">
              {[
                { label: "Track AI mentions", href: "/llms/mentions", icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" },
                { label: "See cited posts", href: "/llms/citations", icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" },
                { label: "Compare competitors", href: "/llms/competitors", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
                { label: "Prompt strategy", href: "/llms/prompts", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
                { label: "Topic coverage", href: "/llms/topics", icon: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                >
                  <svg className="h-4 w-4 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                  </svg>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
