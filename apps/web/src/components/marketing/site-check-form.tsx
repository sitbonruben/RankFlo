"use client";

import { useState } from "react";
import Link from "next/link";
import type { SiteCheckResult } from "@/app/api/site-check/route";

const STATUS_ICON = {
  good: (
    <svg className="h-4 w-4 text-green-500 dark:text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  warn: (
    <svg className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  bad: (
    <svg className="h-4 w-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

function ScoreRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 70 ? "#39FF14" : score >= 40 ? "#F59E0B" : "#EF4444";
  const grade = score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-gray-200 dark:text-gray-800" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={circ - fill}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-bold leading-none" style={{ color }}>{grade}</div>
        <div className="text-[10px] text-gray-400">{score}</div>
      </div>
    </div>
  );
}

export function SiteCheckForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SiteCheckResult | null>(null);
  const [error, setError] = useState("");

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch(`/api/site-check?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json() as SiteCheckResult & { error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Analysis failed. Make sure the URL is public.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Could not reach the URL. Make sure it's publicly accessible.");
    } finally {
      setLoading(false);
    }
  }

  const badCount = result?.checks.filter((c) => c.status === "bad").length ?? 0;
  const warnCount = result?.checks.filter((c) => c.status === "warn").length ?? 0;

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={analyze} className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourwebsite.com"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="h-12 shrink-0 rounded-xl bg-accent px-5 text-sm font-semibold text-black transition-all hover:bg-accent-9 hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing…
            </span>
          ) : "Analyze site →"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-500">{error}</p>
      )}

      {result && (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-500">{result.url}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {badCount + warnCount === 0
                  ? "Your site looks great!"
                  : `${badCount + warnCount} issue${badCount + warnCount !== 1 ? "s" : ""} found — here's what to fix`}
              </p>
            </div>
            <ScoreRing score={result.score} />
          </div>

          {/* Checks */}
          <ul className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {result.checks.map((c) => (
              <li key={c.id} className="flex items-start gap-3 px-4 py-3">
                {STATUS_ICON[c.status]}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{c.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
            <Link
              href="/signup"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-black transition-all hover:bg-accent-9 hover:shadow-[0_0_16px_rgba(57,255,20,0.25)]"
            >
              Fix {badCount + warnCount > 0 ? `all ${badCount + warnCount} issues` : "everything"} with RankFlo — free
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {!result && !loading && (
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-600">
          Free instant analysis — no signup required
        </p>
      )}
    </div>
  );
}
