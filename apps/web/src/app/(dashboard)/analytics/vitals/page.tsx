"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

type Strategy = "mobile" | "desktop";

interface Metric {
  value: string;
  score: number;
}

function scoreColor(score: number | null | undefined) {
  if (score == null) return "text-gray-400";
  if (score >= 0.9) return "text-green-600 dark:text-green-400";
  if (score >= 0.5) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function scoreBg(score: number | null | undefined) {
  if (score == null) return "bg-gray-100 dark:bg-gray-800";
  if (score >= 0.9) return "bg-green-50 dark:bg-green-950/30";
  if (score >= 0.5) return "bg-amber-50 dark:bg-amber-950/30";
  return "bg-red-50 dark:bg-red-950/30";
}

function scoreLabel(score: number | null | undefined) {
  if (score == null) return "—";
  if (score >= 0.9) return "Good";
  if (score >= 0.5) return "Needs work";
  return "Poor";
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24">
      <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-100 dark:text-gray-800" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="55" textAnchor="middle" className="text-xl font-bold" fill={color} fontSize="22" fontWeight="700">
        {score}
      </text>
    </svg>
  );
}

function MetricCard({ label, metric, goodThreshold, description }: {
  label: string;
  metric: Metric | null;
  goodThreshold: string;
  description: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${metric ? scoreBg(metric.score) : "bg-white dark:bg-gray-950"} border-gray-200 dark:border-gray-800`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        {metric && (
          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${scoreColor(metric.score)}`}>
            {scoreLabel(metric.score)}
          </span>
        )}
      </div>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${metric ? scoreColor(metric.score) : "text-gray-300 dark:text-gray-700"}`}>
        {metric?.value ?? "—"}
      </p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
        Good: &lt; {goodThreshold} · {description}
      </p>
    </div>
  );
}

export default function VitalsPage() {
  const [url, setUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [strategy, setStrategy] = useState<Strategy>("mobile");

  const { data, isLoading, error, mutate } = trpc.analytics.pageSpeed.useMutation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let normalized = inputUrl.trim();
    if (!normalized.startsWith("http")) normalized = "https://" + normalized;
    setUrl(normalized);
    mutate({ url: normalized, strategy });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/analytics" className="hover:text-gray-700 dark:hover:text-gray-300">Analytics</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Core Web Vitals</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Core Web Vitals</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Test any page with Google PageSpeed Insights — LCP, CLS, TBT, FCP, TTFB.
        </p>
      </div>

      {/* URL form */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://yourblog.com/post-slug"
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-accent"
          />
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
            {(["mobile", "desktop"] as Strategy[]).map((s) => (
              <button
                key={s} type="button"
                onClick={() => setStrategy(s)}
                className={[
                  "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  strategy === s
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={!inputUrl.trim() || isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing…
              </>
            ) : "Analyze"}
          </button>
        </form>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error.message}</p>
        )}
      </div>

      {/* Results */}
      {data && (
        <>
          {/* Score + URL */}
          <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 sm:flex-row">
            <ScoreRing score={data.score} />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                Performance score: {data.score}/100
              </p>
              <p className="mt-0.5 truncate text-sm text-gray-400 dark:text-gray-600">{url}</p>
              <p className="mt-0.5 text-xs capitalize text-gray-400 dark:text-gray-600">{strategy} · via Google PageSpeed Insights</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {(["mobile", "desktop"] as Strategy[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStrategy(s); mutate({ url, strategy: s }); }}
                    className={`rounded-md border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                      strategy === s
                        ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard label="Largest Contentful Paint" metric={data.lcp} goodThreshold="2.5s" description="How fast main content loads" />
            <MetricCard label="Total Blocking Time" metric={data.tbt} goodThreshold="200ms" description="Proxy for FID / responsiveness" />
            <MetricCard label="Cumulative Layout Shift" metric={data.cls} goodThreshold="0.1" description="Visual stability" />
            <MetricCard label="First Contentful Paint" metric={data.fcp} goodThreshold="1.8s" description="Time to first visible content" />
            <MetricCard label="Time to First Byte" metric={data.ttfb} goodThreshold="800ms" description="Server response speed" />
            <MetricCard label="Speed Index" metric={data.si} goodThreshold="3.4s" description="How quickly page looks complete" />
          </div>

          {/* Opportunities */}
          {data.opportunities.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
              <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top opportunities</h3>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">Fixes with the biggest performance impact</p>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-900">
                {data.opportunities.map((opp, i) => (
                  <div key={i} className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${opp.score < 0.5 ? "bg-red-500" : "bg-amber-500"}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{opp.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{opp.description}</p>
                        {opp.savingsMs > 0 && (
                          <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">
                            ~{(opp.savingsMs / 1000).toFixed(1)}s potential saving
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!data && !isLoading && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <svg className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">Enter a URL to get started</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
            Paste any public page — your homepage, a blog post, a landing page.
          </p>
        </div>
      )}
    </div>
  );
}
