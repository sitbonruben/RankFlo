"use client";

import { trpc } from "@/trpc/client";

const ADMIN_EMAILS = ["sitbon.ruben@gmail.com"];

export default function CreditLedgerPage() {
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

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Credit Ledger</h1>
      <p className="mt-1 text-sm text-gray-500">All credit transactions across all organizations.</p>

      {/* Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-green-800/30 bg-green-950/10 p-5">
          <p className="text-xs text-green-400">Credits issued</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{stats.totalCreditsIssued}</p>
        </div>
        <div className="rounded-xl border border-red-800/30 bg-red-950/10 p-5">
          <p className="text-xs text-red-400">Credits used</p>
          <p className="mt-1 text-2xl font-bold text-red-400">{stats.totalCreditsUsed}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Remaining (all orgs)</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCreditsRemaining}</p>
        </div>
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
          <p className="text-xs text-accent">Pack revenue</p>
          <p className="mt-1 text-2xl font-bold text-accent">${stats.creditPackRevenue}</p>
          <p className="mt-0.5 text-xs text-gray-400">{stats.creditPacksPurchased} packs</p>
        </div>
      </div>

      {/* Transaction table */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">All Transactions</h2>
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
                    t.type === "MONTHLY_GRANT" ? "bg-blue-500/15 text-blue-400" :
                    "bg-gray-500/15 text-gray-400"
                  }`}>{t.type.replace('_', ' ')}</span>
                </td>
                <td className={`px-4 py-3 text-right font-mono ${t.amount < 0 ? "text-red-400" : "text-green-400"}`}>
                  {t.amount > 0 ? "+" : ""}{t.amount}
                </td>
                <td className="px-4 py-3 text-right text-gray-500 font-mono">{t.balance}</td>
                <td className="px-4 py-3 text-gray-500 truncate max-w-[250px]">{t.description ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
