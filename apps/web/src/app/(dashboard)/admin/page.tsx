"use client";

import { trpc } from "@/trpc/client";

const ADMIN_EMAILS = ["sitbon.ruben@gmail.com"];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const { data: me } = trpc.user.me.useQuery();
  const { data: stats, isLoading } = trpc.admin.stats.useQuery(undefined, {
    enabled: !!me && ADMIN_EMAILS.includes(me.email),
  });

  if (!me) return <div className="p-8 text-gray-500">Loading...</div>;

  if (!ADMIN_EMAILS.includes(me.email)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Access denied. Admin only.</p>
      </div>
    );
  }

  if (isLoading || !stats) {
    return <div className="p-8"><div className="h-96 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Platform overview — users, credits, content, and revenue.</p>

      {/* Top stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} />
        <StatCard label="Total organizations" value={stats.totalOrgs} />
        <StatCard label="Total posts" value={stats.totalPosts} sub={`${stats.publishedPosts} published`} />
        <StatCard label="Total analytics events" value={stats.totalEvents} />
      </div>

      {/* Credits */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Credits & Revenue</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Credits issued (all time)" value={stats.totalCreditsIssued} />
        <StatCard label="Credits used (all time)" value={stats.totalCreditsUsed} />
        <StatCard label="Credits remaining (all orgs)" value={stats.totalCreditsRemaining} />
        <StatCard label="Credit packs purchased" value={stats.creditPacksPurchased} sub={`$${stats.creditPackRevenue} revenue`} />
      </div>

      {/* Plans */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Plans</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <StatCard label="Free orgs" value={stats.planBreakdown.free} />
        <StatCard label="Pro orgs" value={stats.planBreakdown.pro} />
        <StatCard label="Enterprise orgs" value={stats.planBreakdown.enterprise} />
      </div>

      {/* Recent users */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credits</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Posts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {stats.recentUsers.map((u: { id: string; name: string | null; email: string; createdAt: string; plan: string; credits: number; postCount: number }) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <td className="px-4 py-3 text-gray-900 dark:text-white">{u.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    u.plan === "PRO" ? "bg-accent/15 text-accent" :
                    u.plan === "ENTERPRISE" ? "bg-purple-500/15 text-purple-400" :
                    "bg-gray-100 text-gray-500 dark:bg-gray-800"
                  }`}>{u.plan}</span>
                </td>
                <td className="px-4 py-3 text-right text-gray-500">{u.credits}</td>
                <td className="px-4 py-3 text-right text-gray-500">{u.postCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent credit transactions */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Recent Credit Transactions</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Org</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {stats.recentTransactions.map((t: { id: string; orgName: string; type: string; amount: number; balance: number; description: string | null; createdAt: string }) => (
              <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <td className="px-4 py-3 text-gray-900 dark:text-white">{t.orgName}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    t.type === "USAGE" ? "bg-red-500/15 text-red-400" :
                    t.type === "PURCHASE" ? "bg-green-500/15 text-green-400" :
                    "bg-blue-500/15 text-blue-400"
                  }`}>{t.type}</span>
                </td>
                <td className={`px-4 py-3 text-right font-mono ${t.amount < 0 ? "text-red-400" : "text-green-400"}`}>
                  {t.amount > 0 ? "+" : ""}{t.amount}
                </td>
                <td className="px-4 py-3 text-right text-gray-500 font-mono">{t.balance}</td>
                <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{t.description ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LLM Mentions */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">LLM Mentions (all orgs)</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total mentions" value={stats.totalMentions} />
        <StatCard label="Positive" value={stats.positiveMentions} />
        <StatCard label="This month" value={stats.mentionsThisMonth} />
      </div>
    </div>
  );
}
