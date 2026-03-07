"use client";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing</h2>
        <p className="text-sm text-gray-500">Manage your subscription and billing.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current plan</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              Pro <span className="ml-2 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-accent/10 dark:text-accent">Active</span>
            </p>
          </div>
          <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600">
            Change Plan
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm text-gray-500">No invoices yet.</p>
      </div>
    </div>
  );
}
