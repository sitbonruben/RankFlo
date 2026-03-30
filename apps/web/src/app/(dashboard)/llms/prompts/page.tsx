"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

const CATEGORIES = ["brand", "product", "topic", "competitor"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_STYLES: Record<Category, string> = {
  brand: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  product: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  topic: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  competitor: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
};

const STARTER_PROMPTS = [
  { prompt: "What is [your brand]?", category: "brand" },
  { prompt: "What does [your brand] do?", category: "brand" },
  { prompt: "Is [your brand] any good?", category: "brand" },
  { prompt: "What are the best tools for [your category]?", category: "topic" },
  { prompt: "Top alternatives to [competitor]", category: "competitor" },
  { prompt: "How to [solve problem your product solves]?", category: "topic" },
];

function timeAgo(date: Date | string | null) {
  if (!date) return null;
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function PromptsPage() {
  const [showModal, setShowModal] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("brand");
  const [newNotes, setNewNotes] = useState("");
  const [filterCat, setFilterCat] = useState<Category | "">("");
  const utils = trpc.useUtils();

  const { data: prompts, isLoading } = trpc.llm.promptList.useQuery({
    ...(filterCat ? { category: filterCat } : {}),
  });

  const createPrompt = trpc.llm.promptCreate.useMutation({
    onSuccess: () => {
      void utils.llm.promptList.invalidate();
      setShowModal(false);
      setNewPrompt("");
      setNewNotes("");
    },
  });

  const markTested = trpc.llm.promptMarkTested.useMutation({
    onSuccess: () => void utils.llm.promptList.invalidate(),
  });

  const deletePrompt = trpc.llm.promptDelete.useMutation({
    onSuccess: () => void utils.llm.promptList.invalidate(),
  });

  const tested = prompts?.filter((p) => p.lastTestedAt) ?? [];
  const untested = prompts?.filter((p) => !p.lastTestedAt) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/llms" className="hover:text-gray-700 dark:hover:text-gray-300">LLM Search</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">Prompt Strategy</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Prompt Strategy</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Build a library of test prompts. Run them regularly to track how AI talks about you.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add prompt
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total prompts", value: prompts?.length ?? 0 },
          { label: "Tested", value: tested.length, accent: tested.length > 0 },
          { label: "Not yet tested", value: untested.length },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.accent ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20" : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"}`}>
            <p className={`text-sm font-medium ${s.accent ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>{s.label}</p>
            {isLoading ? (
              <div className="mt-2 h-8 w-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            ) : (
              <p className={`mt-1 text-3xl font-bold tracking-tight ${s.accent ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>{s.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCat("")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${!filterCat ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"}`}
        >All</button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filterCat === cat ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"}`}
          >{cat}</button>
        ))}
      </div>

      {/* Prompt list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : (prompts?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No prompts yet</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start with one of these:</p>
          <div className="mt-3 flex flex-col gap-2">
            {STARTER_PROMPTS.map((sp, i) => (
              <button
                key={i}
                onClick={() => {
                  createPrompt.mutate({ prompt: sp.prompt, category: sp.category });
                }}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600"
              >
                <span>{sp.prompt}</span>
                <span className={`ml-3 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize ${CATEGORY_STYLES[sp.category as Category]}`}>{sp.category}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your prompts</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-900">
            {prompts!.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{p.prompt}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    {p.category && (
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize ${CATEGORY_STYLES[p.category as Category] ?? "bg-gray-100 text-gray-600"}`}>
                        {p.category}
                      </span>
                    )}
                    {p.lastTestedAt ? (
                      <span className="text-xs text-gray-400 dark:text-gray-600">Tested {timeAgo(p.lastTestedAt)}</span>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400">Not tested yet</span>
                    )}
                    {p.notes && <span className="text-xs text-gray-400 dark:text-gray-600 truncate max-w-xs">{p.notes}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => markTested.mutate({ id: p.id })}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-green-700 dark:hover:bg-green-950/30 dark:hover:text-green-400"
                  >
                    Mark tested
                  </button>
                  <Link
                    href="/llms/mentions"
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900"
                  >
                    Log result
                  </Link>
                  <button
                    onClick={() => deletePrompt.mutate({ id: p.id })}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Prompt strategy tips</h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-900">
          {[
            { title: "Test weekly", tip: "AI models are updated frequently. A prompt that returns no mention today might return one next week as your content gets indexed." },
            { title: "Use category prompts", tip: "\"Best tools for X\" and \"How to Y\" prompts often get your content cited even when brand prompts don't." },
            { title: "Vary the phrasing", tip: "The same question phrased differently returns different AI responses. Test multiple variants." },
            { title: "Log every result", tip: "Even a non-mention is data. It tells you which prompts your competitors are winning and where you need to improve." },
          ].map((item, i) => (
            <div key={i} className="px-5 py-3.5">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add prompt</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (newPrompt.trim()) createPrompt.mutate({ prompt: newPrompt, category: newCategory, notes: newNotes || undefined }); }} className="flex flex-col gap-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Prompt <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  required
                  placeholder='e.g. "Best SEO tools for bloggers"'
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Category)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm capitalize dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Optional context"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={createPrompt.isPending || !newPrompt.trim()} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 dark:bg-accent dark:text-black">
                  {createPrompt.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
