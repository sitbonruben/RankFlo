"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

const PLATFORMS = ["chatgpt", "claude", "gemini", "perplexity", "copilot", "grok", "other"];
const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini",
  perplexity: "Perplexity", copilot: "Copilot", grok: "Grok", other: "Other",
};
const SENTIMENTS = ["positive", "neutral", "negative"] as const;
type Sentiment = typeof SENTIMENTS[number];

const SENTIMENT_STYLES: Record<Sentiment, { dot: string; badge: string }> = {
  positive: {
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  },
  neutral: {
    dot: "bg-gray-400 dark:bg-gray-600",
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  negative: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  },
};

const PLATFORM_STYLES: Record<string, string> = {
  chatgpt: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  claude: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  gemini: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  perplexity: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  copilot: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400",
  grok: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function timeAgo(date: Date | string) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" });
}

interface FormState {
  platform: string;
  query: string;
  snippet: string;
  url: string;
  brandName: string;
  sentiment: Sentiment;
  rank: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  platform: "chatgpt",
  query: "",
  snippet: "",
  url: "",
  brandName: "",
  sentiment: "neutral",
  rank: "",
  notes: "",
};

export default function MentionsPage() {
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterSentiment, setFilterSentiment] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.llm.mentionList.useQuery({
    page: 1,
    pageSize: 50,
    ...(filterPlatform ? { platform: filterPlatform } : {}),
    ...(filterSentiment ? { sentiment: filterSentiment } : {}),
  });

  const createMention = trpc.llm.mentionCreate.useMutation({
    onSuccess: () => {
      void utils.llm.mentionList.invalidate();
      void utils.llm.mentionStats.invalidate();
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
  });

  const deleteMention = trpc.llm.mentionDelete.useMutation({
    onSuccess: () => {
      void utils.llm.mentionList.invalidate();
      void utils.llm.mentionStats.invalidate();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.query.trim()) return;
    createMention.mutate({
      platform: form.platform,
      query: form.query,
      snippet: form.snippet || undefined,
      url: form.url || undefined,
      brandName: form.brandName,
      sentiment: form.sentiment,
      rank: form.rank ? parseInt(form.rank, 10) : undefined,
      notes: form.notes || undefined,
    });
  }

  const mentions = data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/llms" className="hover:text-gray-700 dark:hover:text-gray-300">LLM Search</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">AI Mentions</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">AI Mentions</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Log every time an AI mentions your brand — build a picture of your LLM presence.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Log mention
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
        >
          <option value="">All platforms</option>
          {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
        </select>
        <select
          value={filterSentiment}
          onChange={(e) => setFilterSentiment(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
        >
          <option value="">All sentiment</option>
          {SENTIMENTS.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        {(filterPlatform || filterSentiment) && (
          <button
            onClick={() => { setFilterPlatform(""); setFilterSentiment(""); }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto self-center text-sm text-gray-400 dark:text-gray-600">
          {data?.total ?? 0} mention{data?.total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : mentions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="h-10 w-10 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">No mentions logged yet</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
              Ask ChatGPT, Claude, or Gemini about your brand and log what they say.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:underline dark:text-accent"
            >
              Log your first mention →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-900">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-600">
              <span>Query / Response</span>
              <span>Platform</span>
              <span>Sentiment</span>
              <span></span>
            </div>
            {mentions.map((m) => (
              <div key={m.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-start px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{m.query}</p>
                  {m.snippet && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500 line-clamp-2 italic">&ldquo;{m.snippet}&rdquo;</p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-600">{timeAgo(m.mentionedAt)}</span>
                    {m.brandName && <span className="text-xs text-gray-400 dark:text-gray-600">· {m.brandName}</span>}
                    {m.url && (
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline dark:text-accent truncate max-w-[200px]">
                        {m.url.replace(/^https?:\/\//, "").split("/")[0]}
                      </a>
                    )}
                  </div>
                </div>
                <span className={`shrink-0 self-center rounded-md px-2 py-0.5 text-xs font-medium ${PLATFORM_STYLES[m.platform] ?? PLATFORM_STYLES.other}`}>
                  {PLATFORM_LABELS[m.platform] ?? m.platform}
                </span>
                <div className="shrink-0 self-center flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${SENTIMENT_STYLES[m.sentiment as Sentiment]?.dot ?? "bg-gray-400"}`} />
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${SENTIMENT_STYLES[m.sentiment as Sentiment]?.badge ?? "bg-gray-100 text-gray-600"}`}>
                    {m.sentiment}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Delete this mention?")) {
                      deleteMention.mutate({ id: m.id });
                    }
                  }}
                  className="shrink-0 self-center rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm font-medium text-gray-900 dark:text-white">How to find mentions</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Search your brand name in ChatGPT, Claude, Gemini, and Perplexity. Ask things like &ldquo;What is [your brand]?&rdquo; or &ldquo;Best tools for [your category]&rdquo;. Log every result — positive or negative.
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Log AI mention</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">AI Platform</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Sentiment</label>
                  <select
                    value={form.sentiment}
                    onChange={(e) => setForm({ ...form, sentiment: e.target.value as Sentiment })}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm capitalize dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    {SENTIMENTS.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Prompt / Question asked <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.query}
                  onChange={(e) => setForm({ ...form, query: e.target.value })}
                  placeholder='e.g. "What are the best SEO tools?"'
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Response snippet</label>
                <textarea
                  value={form.snippet}
                  onChange={(e) => setForm({ ...form, snippet: e.target.value })}
                  placeholder="Paste what the AI said about your brand…"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Brand name (if competitor)</label>
                  <input
                    type="text"
                    value={form.brandName}
                    onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                    placeholder="Leave blank for your brand"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Cited URL</label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://…"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMention.isPending || !form.query.trim()}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
                >
                  {createMention.isPending ? "Saving…" : "Save mention"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
