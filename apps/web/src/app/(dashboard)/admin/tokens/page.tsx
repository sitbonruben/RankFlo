"use client";

import { trpc } from "@/trpc/client";

const ADMIN_EMAILS = ["sitbon.ruben@gmail.com"];

const PROJECT_COLORS: Record<string, string> = {
  helpzen: "bg-purple-500",
  leadsterhub: "bg-blue-500",
  mailpanda: "bg-orange-500",
  bugwizz: "bg-red-500",
  doxly: "bg-cyan-500",
  rankflo: "bg-accent",
  widersales: "bg-pink-500",
};

export default function TokenUsagePage() {
  const { data: me } = trpc.user.me.useQuery();
  const { data: internal, isLoading: l1 } = trpc.admin.apiUsage.useQuery(undefined, {
    enabled: !!me && ADMIN_EMAILS.includes(me.email),
  });
  const { data: cross, isLoading: l2 } = trpc.admin.aiUsageByProject.useQuery(undefined, {
    enabled: !!me && ADMIN_EMAILS.includes(me.email),
  });

  if (!me || !ADMIN_EMAILS.includes(me.email)) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-gray-500">Admin only.</p></div>;
  }

  const isLoading = l1 || l2;
  if (isLoading || !internal) {
    return <div className="p-8"><div className="h-96 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900" /></div>;
  }

  const hasCrossData = cross && cross.byProject.length > 0;
  const totalCost = (internal.totalCostMonth || 0) + (cross?.totals.costUsd || 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Token Usage</h1>
      <p className="mt-1 text-sm text-gray-500">Track AI costs across all your projects in one place.</p>

      {/* Total cost banner */}
      <div className="mt-6 rounded-xl border border-red-800/30 bg-red-950/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-red-400">Total AI cost (30 days, all projects)</p>
            <p className="mt-1 text-4xl font-bold text-red-400">${totalCost.toFixed(4)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total requests</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{(cross?.totals.requests ?? 0) + internal.recentAiUsage.length}</p>
          </div>
        </div>
      </div>

      {/* Per-project breakdown */}
      {hasCrossData && (
        <>
          <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Cost by Project (30 days)</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cross.byProject.map((p) => (
              <div key={p.project} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${PROJECT_COLORS[p.project] ?? "bg-gray-500"}`} />
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{p.project}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-500">Cost</p>
                    <p className="text-lg font-bold text-red-400">${p.cost.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Requests</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{p.requests}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Input tokens</p>
                    <p className="text-sm font-mono text-gray-500">{(p.inputTokens / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Output tokens</p>
                    <p className="text-sm font-mono text-gray-500">{(p.outputTokens / 1000).toFixed(1)}K</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Per-model breakdown */}
      {hasCrossData && cross.byModel.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Cost by Model</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Requests</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Input tokens</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Output tokens</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {cross.byModel.map((m) => (
                  <tr key={m.model} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white">{m.model}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{m.requests}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-500">{(m.inputTokens / 1000).toFixed(1)}K</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-500">{(m.outputTokens / 1000).toFixed(1)}K</td>
                    <td className="px-4 py-3 text-right font-mono text-red-400">${m.cost.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Per-provider breakdown */}
      {hasCrossData && cross.byProvider.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Cost by Provider</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {cross.byProvider.map((p) => (
              <div key={p.provider} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                <p className="text-xs text-gray-500 capitalize">{p.provider}</p>
                <p className="mt-1 text-xl font-bold text-red-400">${p.cost.toFixed(4)}</p>
                <p className="text-xs text-gray-400">{p.requests} requests</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* RankFlo internal AI usage (today) */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">RankFlo Internal AI (Today)</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Cost today</p>
          <p className="mt-1 text-xl font-bold text-red-400">${internal.totalCostMonth.toFixed(4)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Credits used today</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{internal.creditsUsedToday}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Credits used this month</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{internal.creditsUsedMonth}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Tokens this month</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{(internal.totalTokensMonth / 1000).toFixed(1)}K</p>
        </div>
      </div>

      {/* Recent logs */}
      {hasCrossData && cross.recentLogs.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Recent AI Requests (All Projects)</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">In</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">Out</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {cross.recentLogs.slice(0, 30).map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${PROJECT_COLORS[l.project] ?? "bg-gray-500"}`} />
                        <span className="text-xs text-gray-900 dark:text-white capitalize">{l.project}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">{l.feature}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-gray-500">{l.model}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-[11px] text-gray-500">{l.inputTokens.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-[11px] text-gray-500">{l.outputTokens.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-[11px] text-red-400">${l.costUsd.toFixed(5)}</td>
                    <td className="px-3 py-2.5 text-right text-[11px] text-gray-400">{new Date(l.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!hasCrossData && (
        <div className="mt-8 rounded-xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-sm text-gray-500">No cross-project AI usage data yet.</p>
          <p className="mt-1 text-xs text-gray-600">Add the tracking snippet to your projects to start seeing data here.</p>
          <pre className="mt-4 rounded-lg bg-gray-900 p-4 text-left text-xs text-gray-300 overflow-x-auto">
{`// Add after every AI API call in your project:
await fetch("https://rankflo.io/api/v1/ai-usage", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer rf_track_8f3a2c5b6e1f4a7d"
  },
  body: JSON.stringify({
    project: "helpzen",  // your project name
    feature: "chat",     // what feature used AI
    provider: "google",  // ai provider
    model: "gemini-2.5-flash",
    inputTokens: 1500,
    outputTokens: 800,
    costUsd: 0.0007
  })
});`}
          </pre>
        </div>
      )}
    </div>
  );
}
