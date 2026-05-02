"use client";

import { trpc } from "@/trpc/client";

const ADMIN_EMAILS = ["sitbon.ruben@gmail.com"];

export default function RevenuePage() {
  const { data: me } = trpc.user.me.useQuery();
  const { data: stats, isLoading } = trpc.admin.stats.useQuery(undefined, {
    enabled: !!me && ADMIN_EMAILS.includes(me.email),
  });

  if (!me || !ADMIN_EMAILS.includes(me.email)) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-gray-500">Admin only.</p></div>;
  }

  if (isLoading || !stats) {
    return <div className="p-8"><div className="h-96 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900" /></div>;
  }

  const costPerCredit = stats.totalCreditsUsed > 0 ? stats.tokenCostMonth / stats.totalCreditsUsed : 0;
  const revenuePerCredit = stats.creditPackRevenue > 0 ? stats.creditPackRevenue / (stats.creditPacksPurchased * 60) : 0; // rough avg

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue & Profitability</h1>
      <p className="mt-1 text-sm text-gray-500">MRR, ARR, AI costs, and profit margins.</p>

      {/* Revenue */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
          <p className="text-xs text-accent">MRR</p>
          <p className="mt-1 text-3xl font-bold text-accent">${stats.mrr}</p>
          <p className="mt-0.5 text-xs text-gray-400">{stats.activeSubscriptionCount} subscriptions</p>
        </div>
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
          <p className="text-xs text-accent">ARR</p>
          <p className="mt-1 text-3xl font-bold text-accent">${stats.arr}</p>
          <p className="mt-0.5 text-xs text-gray-400">{stats.trialingCount} in trial</p>
        </div>
        <div className="rounded-xl border border-red-800/30 bg-red-950/10 p-5">
          <p className="text-xs text-red-400">AI cost (this month)</p>
          <p className="mt-1 text-3xl font-bold text-red-400">${stats.tokenCostMonth.toFixed(4)}</p>
          <p className="mt-0.5 text-xs text-gray-400">{stats.aiRequestsMonth} requests</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Profit margin</p>
          <p className={`mt-1 text-3xl font-bold ${stats.profitMargin >= 70 ? "text-green-400" : stats.profitMargin >= 40 ? "text-yellow-400" : "text-red-400"}`}>{stats.profitMargin}%</p>
          <p className="mt-0.5 text-xs text-gray-400">revenue vs AI cost</p>
        </div>
      </div>

      {/* Unit economics */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Unit Economics</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Cost per credit</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">${costPerCredit.toFixed(4)}</p>
          <p className="mt-0.5 text-xs text-gray-400">actual AI cost per credit used</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Avg cost per AI request</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">${stats.aiRequestsMonth > 0 ? (stats.tokenCostMonth / stats.aiRequestsMonth).toFixed(4) : "0"}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Input tokens (month)</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{(stats.inputTokensMonth / 1000).toFixed(1)}K</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Output tokens (month)</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{(stats.outputTokensMonth / 1000).toFixed(1)}K</p>
        </div>
      </div>

      {/* Revenue breakdown */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Revenue Sources</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Subscription revenue (monthly)</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">${stats.mrr}</p>
          <p className="mt-0.5 text-xs text-gray-400">{stats.activeSubscriptionCount} active · {stats.trialingCount} trialing</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Credit pack revenue (lifetime)</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">${stats.creditPackRevenue}</p>
          <p className="mt-0.5 text-xs text-gray-400">{stats.creditPacksPurchased} packs sold</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Total revenue (estimated)</p>
          <p className="mt-1 text-2xl font-bold text-accent">${(stats.mrr + stats.creditPackRevenue).toFixed(2)}</p>
        </div>
      </div>

      {/* Plans */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Plan Distribution</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Free</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.planBreakdown.free}</p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-2 rounded-full bg-gray-400" style={{ width: `${stats.totalOrgs > 0 ? (stats.planBreakdown.free / stats.totalOrgs * 100) : 0}%` }} />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <p className="text-xs text-accent">Pro</p>
            <p className="text-2xl font-bold text-accent">{stats.planBreakdown.pro}</p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-2 rounded-full bg-accent" style={{ width: `${stats.totalOrgs > 0 ? (stats.planBreakdown.pro / stats.totalOrgs * 100) : 0}%` }} />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <p className="text-xs text-purple-400">Enterprise</p>
            <p className="text-2xl font-bold text-purple-400">{stats.planBreakdown.enterprise}</p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-2 rounded-full bg-purple-400" style={{ width: `${stats.totalOrgs > 0 ? (stats.planBreakdown.enterprise / stats.totalOrgs * 100) : 0}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
