"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc as api } from "@/trpc/client";
import { PLAN_PRICES, TRIAL_DAYS } from "@rankflo/core/constants";

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Active", className: "bg-accent/10 text-accent dark:bg-accent/10 dark:text-accent" },
    TRIALING: { label: `Trial`, className: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    PAST_DUE: { label: "Past Due", className: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    CANCELED: { label: "Canceled", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
    PAUSED: { label: "Paused", className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  };
  const { label, className } = map[status] ?? map.ACTIVE!;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

// ─── Credit Progress Ring ─────────────────────────────────────────────────────

function CreditRing({
  used,
  total,
  size = 80,
}: {
  used: number;
  total: number;
  size?: number;
}) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? Math.min(used / total, 1) : 0;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={8} className="text-gray-100 dark:text-gray-800" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="text-accent transition-all duration-500"
      />
    </svg>
  );
}

// ─── OSS notice ───────────────────────────────────────────────────────────────

function OSSBillingNotice() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing</h2>
        <p className="text-sm text-gray-500">Subscription and payment settings.</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Billing is not available in self-hosted mode.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          All features are included — no subscription or payment required.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const isOSS = process.env.NEXT_PUBLIC_RANKFLO_MODE === "oss";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState<"monthly" | "annual" | null>(null);
  const [loadingCancel, setLoadingCancel] = useState(false);

  const subQuery = api.billing.getSubscription.useQuery();
  const creditsQuery = api.billing.getCredits.useQuery();
  const packsQuery = api.billing.getCreditPacks.useQuery();

  const createCheckout = api.billing.createCheckoutSession.useMutation();
  const createCreditCheckout = api.billing.createCreditCheckout.useMutation();
  const createPortal = api.billing.createPortalSession.useMutation();
  const cancelSub = api.billing.cancelSubscription.useMutation();
  const resumeSub = api.billing.resumeSubscription.useMutation();

  const sub = subQuery.data;
  const credits = creditsQuery.data;
  const packs = packsQuery.data ?? [];

  // Auto-start checkout when user arrives from pricing → signup → billing
  useEffect(() => {
    const autostart = searchParams.get("autostart");
    const billingParam = searchParams.get("billing") ?? "monthly";
    if (autostart === "pro" && sub && sub.plan === "FREE" && !subQuery.isLoading) {
      // Clear params from URL first
      router.replace("/settings/billing");
      handleUpgrade(billingParam === "annual" ? "annual" : "monthly");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub, subQuery.isLoading]);

  const isPro = sub?.plan === "PRO";
  const isEnterprise = sub?.plan === "ENTERPRISE";
  const isFree = !isPro && !isEnterprise;

  const trialEnd = sub?.subscription?.trialEnd;
  const isTrialing = sub?.subscription?.status === "TRIALING";
  const cancelAtPeriodEnd = sub?.subscription?.cancelAtPeriodEnd;
  const periodEnd = sub?.subscription?.currentPeriodEnd;

  const daysUntilTrialEnd = trialEnd
    ? Math.max(0, Math.ceil((new Date(trialEnd).getTime() - Date.now()) / 86_400_000))
    : null;

  async function handleUpgrade(interval: "monthly" | "annual") {
    setLoadingCheckout(interval);
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const priceId =
        interval === "monthly"
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? ""
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL ?? "";

      const res = await createCheckout.mutateAsync({
        priceId,
        successUrl: `${appUrl}/settings/billing?success=1`,
        cancelUrl: `${appUrl}/settings/billing`,
      });
      window.location.href = res.url;
    } finally {
      setLoadingCheckout(null);
    }
  }

  async function handleBuyPack(priceId: string) {
    setLoadingPack(priceId);
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const res = await createCreditCheckout.mutateAsync({
        packPriceId: priceId,
        successUrl: `${appUrl}/settings/billing?credits_success=1`,
        cancelUrl: `${appUrl}/settings/billing`,
      });
      window.location.href = res.url;
    } finally {
      setLoadingPack(null);
    }
  }

  async function handlePortal() {
    setLoadingPortal(true);
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const res = await createPortal.mutateAsync({
        returnUrl: `${appUrl}/settings/billing`,
      });
      window.location.href = res.url;
    } finally {
      setLoadingPortal(false);
    }
  }

  async function handleCancel() {
    setLoadingCancel(true);
    try {
      await cancelSub.mutateAsync();
      subQuery.refetch();
    } finally {
      setLoadingCancel(false);
    }
  }

  async function handleResume() {
    setLoadingCancel(true);
    try {
      await resumeSub.mutateAsync();
      subQuery.refetch();
    } finally {
      setLoadingCancel(false);
    }
  }

  if (isOSS) return <OSSBillingNotice />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing</h2>
        <p className="text-sm text-gray-500">Manage your subscription and AI credits.</p>
      </div>

      {/* ── Current Plan Card ── */}
      {subQuery.isLoading ? (
        <CardSkeleton />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Current Plan</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEnterprise ? "Enterprise" : isPro ? "Pro" : "Free"}
                </span>
                {sub?.subscription?.status && (
                  <StatusBadge status={sub.subscription.status} />
                )}
              </div>

              {isTrialing && daysUntilTrialEnd !== null && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  🎉 Trial ends in <strong>{daysUntilTrialEnd} day{daysUntilTrialEnd !== 1 ? "s" : ""}</strong>.
                  {" "}You won&apos;t be charged until then.
                </p>
              )}

              {isPro && !isTrialing && periodEnd && (
                <p className="text-sm text-gray-500">
                  {cancelAtPeriodEnd
                    ? `Cancels on ${new Date(periodEnd).toLocaleDateString()}`
                    : `Renews on ${new Date(periodEnd).toLocaleDateString()}`}
                </p>
              )}

              {isFree && (
                <p className="text-sm text-gray-500">
                  Upgrade to Pro for unlimited posts, 200 AI credits/mo, and priority support.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              {isPro && (
                <button
                  onClick={handlePortal}
                  disabled={loadingPortal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
                >
                  {loadingPortal ? "Loading…" : "Manage Subscription"}
                </button>
              )}

              {isFree && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpgrade("monthly")}
                    disabled={loadingCheckout !== null}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition-all hover:bg-accent-9 disabled:opacity-50"
                  >
                    {loadingCheckout === "monthly" ? "Loading…" : `Start Free Trial — $${PLAN_PRICES.PRO_MONTHLY}/mo`}
                  </button>
                  <button
                    onClick={() => handleUpgrade("annual")}
                    disabled={loadingCheckout !== null}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    {loadingCheckout === "annual" ? "Loading…" : `Annual — $${PLAN_PRICES.PRO_ANNUAL_MONTHLY_RATE}/mo`}
                  </button>
                </div>
              )}

              {isPro && !cancelAtPeriodEnd && (
                <button
                  onClick={handleCancel}
                  disabled={loadingCancel}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  {loadingCancel ? "Loading…" : "Cancel subscription"}
                </button>
              )}

              {isPro && cancelAtPeriodEnd && (
                <button
                  onClick={handleResume}
                  disabled={loadingCancel}
                  className="text-xs text-accent hover:underline disabled:opacity-50"
                >
                  {loadingCancel ? "Loading…" : "Resume subscription"}
                </button>
              )}
            </div>
          </div>

          {/* Plan comparison */}
          {isFree && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 sm:grid-cols-4">
              {[
                { label: "Posts", free: "50", pro: "Unlimited" },
                { label: "AI Credits/mo", free: "10", pro: "200" },
                { label: "Team members", free: "3", pro: "20" },
                { label: "Custom domain", free: "✗", pro: "✓" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
                    <span className="text-gray-400 line-through">{item.free}</span>
                    {" → "}
                    <span className="text-accent">{item.pro}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── AI Credits Card ── */}
      {creditsQuery.isLoading ? (
        <CardSkeleton />
      ) : credits ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Ring + balance */}
            <div className="flex items-center gap-4">
              {!credits.isEnterprise && (
                <div className="relative flex-shrink-0">
                  <CreditRing used={credits.usedThisCycle} total={credits.monthlyGrant} size={88} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {credits.balance}
                    </span>
                    <span className="text-[10px] text-gray-400">left</span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">AI Credits</p>
                {credits.isEnterprise ? (
                  <p className="text-xl font-bold text-gray-900 dark:text-white">Unlimited</p>
                ) : (
                  <>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {credits.balance} <span className="text-sm font-normal text-gray-500">remaining</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {credits.usedThisCycle} used · {credits.monthlyGrant} granted this month
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Credit cost reference */}
            <div className="flex-1 rounded-lg bg-gray-50 p-3 dark:bg-gray-900 sm:ml-auto sm:max-w-xs">
              <p className="mb-2 text-xs font-medium text-gray-500">Credit costs</p>
              <div className="space-y-1">
                {[
                  { action: "Generate full post", cost: 3 },
                  { action: "Quick generate / Scan", cost: 3 },
                  { action: "Strategy / Brand voice / SEO", cost: 2 },
                  { action: "Topics / Chat", cost: 1 },
                ].map(({ action, cost }) => (
                  <div key={action} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">{action}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{cost} cr</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent transactions */}
          {credits.transactions.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Recent activity</p>
              <div className="space-y-1.5">
                {credits.transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{tx.description ?? tx.type}</span>
                    <div className="flex items-center gap-3">
                      <span className={tx.amount > 0 ? "font-medium text-accent" : "font-medium text-red-500"}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* ── Credit Packs ── */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Buy AI Credits</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {packsQuery.isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                  <div className="space-y-3">
                    <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-6 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-9 rounded bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>
              ))
            : packs.map((pack) => (
                <div
                  key={pack.name}
                  className={`relative rounded-xl border p-5 transition-colors ${
                    pack.name === "Growth"
                      ? "border-accent/30 bg-accent/5 dark:bg-accent/5"
                      : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
                  }`}
                >
                  {pack.name === "Growth" && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-black">
                      Most popular
                    </span>
                  )}
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{pack.name}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    ${pack.price}
                  </p>
                  <p className="text-sm text-gray-500">{pack.credits} AI credits</p>
                  <p className="text-xs text-gray-400">${(pack.price / pack.credits).toFixed(3)}/credit</p>
                  <button
                    onClick={() => handleBuyPack(pack.priceId)}
                    disabled={loadingPack !== null || !pack.priceId}
                    className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
                      pack.name === "Growth"
                        ? "bg-accent text-black hover:bg-accent-9"
                        : "border border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {loadingPack === pack.priceId ? "Loading…" : `Buy ${pack.name}`}
                  </button>
                </div>
              ))}
        </div>
        <p className="mt-2 text-xs text-gray-400">Credits never expire. One-time purchase, no subscription required.</p>
      </div>

      {/* ── Billing Portal Link ── */}
      {sub?.stripeCustomerId && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Invoices & Payment Method</p>
              <p className="text-sm text-gray-500">View invoices, update your card, or download receipts.</p>
            </div>
            <button
              onClick={handlePortal}
              disabled={loadingPortal}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              {loadingPortal ? "Loading…" : "Open billing portal →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
