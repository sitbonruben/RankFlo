"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

function ScoreBar({ score }: { score: number }) {
  const clamped = Math.max(-100, Math.min(100, score));
  const positive = clamped > 0;
  const pct = Math.abs(clamped);
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-2 w-24 rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`absolute top-0 h-2 rounded-full ${positive ? "bg-green-500" : "bg-red-500"} ${positive ? "left-1/2" : "right-1/2"}`}
          style={{ width: `${pct / 2}%` }}
        />
        <div className="absolute left-1/2 top-0 h-2 w-px bg-gray-300 dark:bg-gray-700" />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${positive ? "text-green-600 dark:text-green-400" : score < 0 ? "text-red-600 dark:text-red-400" : "text-gray-500"}`}>
        {score > 0 ? "+" : ""}{score}
      </span>
    </div>
  );
}

export default function CompetitorsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [compQuery, setCompQuery] = useState("");
  const [compPlatform, setCompPlatform] = useState("chatgpt");
  const [compSnippet, setCompSnippet] = useState("");
  const [compSentiment, setCompSentiment] = useState("neutral");
  const utils = trpc.useUtils();

  const { data: competitors, isLoading } = trpc.llm.competitors.useQuery();

  const createMention = trpc.llm.mentionCreate.useMutation({
    onSuccess: () => {
      void utils.llm.competitors.invalidate();
      setShowAddModal(false);
      setCompQuery("");
      setCompSnippet("");
      setCompSentiment("neutral");
    },
  });

  const ownBrand = competitors?.find((c) => c.isOwn);
  const others = competitors?.filter((c) => !c.isOwn) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/llms" className="hover:text-gray-700 dark:hover:text-gray-300">LLM Search</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">Competitors</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Competitors</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Compare how often AI mentions you vs. your competitors, and with what sentiment.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Track competitor
        </button>
      </div>

      {/* Comparison table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : (competitors?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <svg className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">No comparison data yet</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
            Log mentions for your brand and competitors. Specify the brand name when logging to compare.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-3 inline-flex text-sm font-medium text-green-600 hover:underline dark:text-accent"
          >
            Track a competitor →
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Brand comparison</h3>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">Based on all logged AI mentions</p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-900">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-6 px-5 py-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-600">
              <span>Brand</span>
              <span className="text-right">Total</span>
              <span className="text-center w-16">Pos</span>
              <span className="text-center w-16">Neg</span>
              <span>Score</span>
            </div>
            {[ownBrand, ...others].filter(Boolean).map((brand) => (
              <div key={brand!.brandName} className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-6 items-center px-5 py-3.5 ${brand!.isOwn ? "bg-green-50/50 dark:bg-green-950/10" : ""}`}>
                <div className="min-w-0 flex items-center gap-2">
                  {brand!.isOwn && (
                    <span className="shrink-0 rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:bg-green-950/30 dark:text-green-400">You</span>
                  )}
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{brand!.brandName}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white text-right">{brand!.total}</span>
                <span className="text-sm font-semibold tabular-nums text-green-600 dark:text-green-400 text-center w-16">{brand!.positive}</span>
                <span className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-400 text-center w-16">{brand!.negative}</span>
                <ScoreBar score={brand!.score} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm font-medium text-gray-900 dark:text-white">How to use competitor tracking</p>
        <ol className="mt-2 list-decimal pl-4 space-y-1 text-sm text-gray-500 dark:text-gray-400">
          <li>Ask the same question in multiple AI platforms (e.g. &ldquo;What&apos;s the best tool for X?&rdquo;)</li>
          <li>Log the result — enter the brand name mentioned (yours or a competitor&apos;s)</li>
          <li>Track sentiment: is AI positive, neutral, or critical about each brand?</li>
          <li>Over time, identify gaps where competitors rank higher and adjust your content strategy</li>
        </ol>
      </div>

      {/* Add competitor mention modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Track competitor mention</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMention.mutate({
                  platform: compPlatform,
                  query: compQuery,
                  snippet: compSnippet || undefined,
                  brandName: (e.currentTarget.elements.namedItem("brandName") as HTMLInputElement).value,
                  sentiment: compSentiment as "positive" | "neutral" | "negative",
                });
              }}
              className="flex flex-col gap-4 px-6 py-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Brand name</label>
                  <input
                    name="brandName"
                    type="text"
                    required
                    placeholder="Competitor Inc."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">AI Platform</label>
                  <select
                    value={compPlatform}
                    onChange={(e) => setCompPlatform(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    {["chatgpt","claude","gemini","perplexity","copilot","grok","other"].map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Prompt asked <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={compQuery}
                  onChange={(e) => setCompQuery(e.target.value)}
                  required
                  placeholder='e.g. "What are the best SEO tools?"'
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Response snippet</label>
                <textarea
                  value={compSnippet}
                  onChange={(e) => setCompSnippet(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Sentiment</label>
                <select
                  value={compSentiment}
                  onChange={(e) => setCompSentiment(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm capitalize dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={createMention.isPending || !compQuery.trim()} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 dark:bg-accent dark:text-black">
                  {createMention.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
