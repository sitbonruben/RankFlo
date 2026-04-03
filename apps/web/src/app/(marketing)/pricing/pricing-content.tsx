"use client";

import Link from "next/link";
import { useState } from "react";
import { PLAN_PRICES, CREDIT_PACKS, TRIAL_DAYS } from "@rankflo/core/constants";

// ─── Check Icon ───────────────────────────────────────────────────────────────

function Check() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

// ─── Plan feature lists ───────────────────────────────────────────────────────

const FREE_FEATURES = [
  "50 posts",
  "10 pages",
  "3 team members",
  "500 MB media storage",
  "10 AI credits / month",
  "Built-in analytics (30 days)",
  "Full-text search",
  "2 API keys · 3 webhooks",
  "Community support",
];

const PRO_FEATURES = [
  "Unlimited posts & pages",
  "20 team members",
  "10 GB media storage",
  "200 AI credits / month",
  "AI content generation",
  "AI brand voice analysis",
  "Growth scan & strategy",
  "Analytics (1 year retention)",
  "Custom domain",
  "Advanced search (Meilisearch)",
  "10 API keys · 20 webhooks",
  "Priority support",
  "SEO audit tools",
];

const ENTERPRISE_FEATURES = [
  "Everything in Pro",
  "Unlimited AI credits",
  "Unlimited team members",
  "Unlimited storage & analytics",
  "SSO / SAML",
  "Unlimited API keys & webhooks",
  "SLA guarantee",
  "Dedicated support & onboarding",
  "Custom integrations",
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function PricingContent() {
  const [annual, setAnnual] = useState(false);

  const proMonthlyPrice = PLAN_PRICES.PRO_MONTHLY;
  const proAnnualRate = PLAN_PRICES.PRO_ANNUAL_MONTHLY_RATE;
  const proAnnualTotal = PLAN_PRICES.PRO_ANNUAL;
  const savings = (proMonthlyPrice * 12 - proAnnualTotal).toFixed(0);

  const proHref = annual
    ? `/signup?plan=pro&billing=annual`
    : `/signup?plan=pro&billing=monthly`;

  return (
    <>
      {/* ── Header ── */}
      <div className="relative text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.06)_0%,transparent_70%)]" />
        </div>
        <div className="relative">
          <p className="text-sm font-medium text-green-600 dark:text-accent">Pricing</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Start free. Scale when you&apos;re ready. {TRIAL_DAYS}-day free trial on Pro — no card required.
          </p>
        </div>
      </div>

      {/* ── Monthly / Annual Toggle ── */}
      <div className="mt-10 flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${!annual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
          Monthly
        </span>
        <button
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            annual ? "bg-accent" : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              annual ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${annual ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
          Annual
        </span>
        {annual && (
          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            Save ${savings}/yr
          </span>
        )}
      </div>

      {/* ── Plans Grid ── */}
      <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-800 bg-gray-200 dark:bg-gray-800 md:grid-cols-3">
        {/* FREE */}
        <div className="flex flex-col justify-between bg-white p-8 dark:bg-black">
          <div>
            <h3 className="text-lg font-semibold text-gray-950 dark:text-white">Free</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-gray-950 dark:text-white">$0</span>
              <span className="text-sm text-gray-500">/ forever</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">For personal blogs and side projects.</p>
            <ul className="mt-8 flex flex-col gap-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/signup"
            className="mt-8 flex h-11 items-center justify-center rounded-lg border border-gray-700 text-sm font-semibold text-gray-300 transition-all hover:border-gray-600 hover:text-white"
          >
            Start free
          </Link>
        </div>

        {/* PRO */}
        <div className="flex flex-col justify-between border-t-2 border-t-accent bg-gray-50 p-8 shadow-[0_0_40px_rgba(57,255,20,0.08)] dark:bg-gray-950">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-950 dark:text-white">Pro</h3>
              <span className="rounded-full border border-accent/20 bg-accent-1 px-2 py-0.5 text-[10px] font-medium text-accent">
                Popular
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-gray-950 dark:text-white">
                ${annual ? proAnnualRate.toFixed(2) : proMonthlyPrice}
              </span>
              <span className="text-sm text-gray-500">/ month</span>
            </div>
            {annual && (
              <p className="mt-0.5 text-xs text-gray-400">
                Billed ${proAnnualTotal}/year · saves ${savings}/yr
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              For growing teams and businesses. Includes a {TRIAL_DAYS}-day free trial.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={proHref}
            className="mt-8 flex h-11 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-black transition-all hover:bg-accent-9 hover:shadow-[0_0_24px_rgba(57,255,20,0.2)]"
          >
            Start {TRIAL_DAYS}-day free trial
          </Link>
        </div>

        {/* ENTERPRISE */}
        <div className="flex flex-col justify-between bg-white p-8 dark:bg-black">
          <div>
            <h3 className="text-lg font-semibold text-gray-950 dark:text-white">Enterprise</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-gray-950 dark:text-white">Custom</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">For large organizations with advanced needs.</p>
            <ul className="mt-8 flex flex-col gap-3">
              {ENTERPRISE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <a
            href="mailto:sales@rankflo.io"
            className="mt-8 flex h-11 items-center justify-center rounded-lg border border-gray-700 text-sm font-semibold text-gray-300 transition-all hover:border-gray-600 hover:text-white"
          >
            Contact sales
          </a>
        </div>
      </div>

      {/* ── AI Credits Section ── */}
      <div className="mt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">AI Credits</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Every plan includes monthly AI credits. Need more? Buy packs — they never expire.
          </p>
        </div>

        {/* Credit costs reference */}
        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Credit costs per action</h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { action: "Generate full blog post", cost: 3 },
              { action: "Quick generate / Growth scan", cost: 3 },
              { action: "Content strategy", cost: 2 },
              { action: "Improve content", cost: 2 },
              { action: "Analyze brand voice", cost: 2 },
              { action: "SEO audit (AI-assisted)", cost: 2 },
              { action: "Topic suggestions / Research", cost: 1 },
              { action: "AI chat message", cost: 1 },
              { action: "SEO analysis (algorithmic)", cost: 0 },
            ].map(({ action, cost }) => (
              <div key={action} className="flex items-center justify-between py-3 text-sm">
                <span className="text-gray-700 dark:text-gray-300">{action}</span>
                <span className={`font-semibold ${cost === 0 ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                  {cost === 0 ? "Free" : `${cost} credit${cost !== 1 ? "s" : ""}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Credit packs */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.name}
              className={`relative rounded-2xl border p-6 text-center ${
                pack.name === "Growth"
                  ? "border-accent/30 bg-accent/5 dark:bg-accent/5"
                  : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
              }`}
            >
              {pack.name === "Growth" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-black">
                  Best value
                </span>
              )}
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{pack.name} Pack</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${pack.price}</p>
              <p className="text-lg font-medium text-accent">{pack.credits} credits</p>
              <p className="mt-1 text-xs text-gray-400">${(pack.price / pack.credits).toFixed(3)} per credit</p>
              <p className="mt-2 text-sm text-gray-500">{pack.description}</p>
              <Link
                href="/signup"
                className={`mt-5 block h-10 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  pack.name === "Growth"
                    ? "bg-accent text-black hover:bg-accent-9"
                    : "border border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
                }`}
              >
                Buy {pack.name} Pack
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-gray-400">
          Credits never expire. One-time purchase — no subscription required.
        </p>
      </div>

      {/* ── FAQ ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "What is an AI credit?", acceptedAnswer: { "@type": "Answer", text: "One credit represents one AI action. Generating a full blog post costs 3 credits. Writing a meta description or improving content costs 1–2 credits. Credits are deducted only when an action succeeds." } },
              { "@type": "Question", name: "Do AI credits roll over?", acceptedAnswer: { "@type": "Answer", text: "Monthly credits (included with your plan) expire at the end of each billing cycle. Credits purchased in packs never expire and are consumed first." } },
              { "@type": "Question", name: "Is there a free trial?", acceptedAnswer: { "@type": "Answer", text: `Yes. The Pro plan includes a ${TRIAL_DAYS}-day free trial with no credit card required. You get full Pro access plus 30 bonus AI credits during the trial.` } },
              { "@type": "Question", name: "Can I cancel anytime?", acceptedAnswer: { "@type": "Answer", text: "Yes. Cancel anytime from your billing settings. You keep access until the end of your billing period. No cancellation fees." } },
              { "@type": "Question", name: "Can I self-host instead of paying?", acceptedAnswer: { "@type": "Answer", text: "Yes. RankFlo is open source (AGPL-3.0). Self-host on any server with Docker for free, forever. All core features are included with no limits." } },
              { "@type": "Question", name: "What payment methods do you accept?", acceptedAnswer: { "@type": "Answer", text: "We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. Bank transfers are available on Enterprise plans." } },
            ],
          }),
        }}
      />
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Pricing questions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { q: "What is an AI credit?", a: "One credit = one AI action. Full post generation costs 3 credits. Meta descriptions and improvements cost 1–2 credits. Credits deduct only on success." },
            { q: "Do credits roll over?", a: "Monthly plan credits expire at cycle end. Credits bought in packs never expire and are consumed first." },
            { q: `Is there a free trial?`, a: `Yes — ${TRIAL_DAYS} days free on Pro, no card required. You get full access plus 30 bonus credits.` },
            { q: "Can I cancel anytime?", a: "Yes. Cancel from billing settings, keep access until period ends. No fees." },
            { q: "Can I self-host instead?", a: "Yes. RankFlo is open source (AGPL-3.0). Self-host with Docker for free, forever, with no limits." },
            { q: "What payment methods?", a: "All major cards via Stripe. Bank transfer available on Enterprise." },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{q}</h3>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── OSS Callout ── */}
      <div className="relative mt-20 overflow-hidden rounded-2xl border border-gray-800 bg-gray-50 p-8 text-center dark:bg-gray-950">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.04)_0%,transparent_70%)]" />
        </div>
        <div className="relative">
          <h3 className="text-lg font-semibold text-gray-950 dark:text-white">Self-host for free, forever</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-500">
            RankFlo is open source. Deploy on your own infrastructure with Docker.
            All core features included. No limits.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a
              href="/docs/self-hosting"
              className="inline-flex h-10 items-center rounded-lg border border-gray-700 px-4 text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
            >
              Self-hosting guide
            </a>
            <a
              href="https://github.com/sitbonruben/RankFlo"
              className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              View source
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
