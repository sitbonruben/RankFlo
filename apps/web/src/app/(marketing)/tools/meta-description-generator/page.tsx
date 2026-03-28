"use client";

import { useState } from "react";
import Link from "next/link";

const MAX_CHARS = 160;

const TEMPLATES = [
  (title: string, kw: string) =>
    `Learn everything about ${kw} in this comprehensive guide. Discover proven strategies, tips, and tools to help you get results fast.`,
  (title: string, kw: string) =>
    `Looking for the best ${kw} advice? This guide covers everything you need to know — step by step, with real examples.`,
  (title: string, kw: string) =>
    `Master ${kw} with this in-depth breakdown. We cover the top strategies, common mistakes to avoid, and how to get started today.`,
  (title: string, kw: string) =>
    `Discover the best ${kw} techniques used by top professionals. Updated for ${new Date().getFullYear()} with actionable tips you can use right now.`,
  (title: string, kw: string) =>
    `Everything you need to know about ${kw} — explained simply. Read this guide and start seeing results immediately.`,
];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function MetaDescriptionGeneratorPage() {
  const [title, setTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [custom, setCustom] = useState("");

  function generate() {
    if (!title.trim() && !keyword.trim()) return;
    const kw = capitalize((keyword || title).trim());
    const t = capitalize(title.trim());
    const out = TEMPLATES.map((fn) => fn(t, kw).slice(0, MAX_CHARS));
    setResults(out);
  }

  function copy(text: string, i: number) {
    void navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  }

  const charCount = custom.length;
  const charColor = charCount > MAX_CHARS ? "text-red-500" : charCount > 140 ? "text-yellow-500" : "text-green-600 dark:text-accent";

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/tools" className="hover:text-gray-600 dark:hover:text-gray-300">Tools</Link>
        <span>/</span>
        <span className="text-gray-600 dark:text-gray-300">Meta Description Generator</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Free Meta Description Generator
        </h1>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
          Generate click-worthy meta descriptions under 160 characters. Improve your CTR in Google search results.
        </p>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Blog post title (e.g. How to Write Better Blog Posts)"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600"
        />
        <div className="flex gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="Target keyword (optional)"
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600"
          />
          <button
            onClick={generate}
            disabled={!title.trim() && !keyword.trim()}
            className="inline-flex h-12 items-center rounded-xl bg-accent px-6 text-sm font-semibold text-black transition-all hover:bg-accent-9 disabled:opacity-50"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-8 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Generated descriptions</p>
          {results.map((desc, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-sm text-gray-900 dark:text-white">{desc}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs ${desc.length > MAX_CHARS ? "text-red-500" : "text-gray-400"}`}>
                  {desc.length} / {MAX_CHARS} chars
                </span>
                <button
                  onClick={() => copy(desc, i)}
                  className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:border-accent/40 hover:text-accent dark:border-gray-700"
                >
                  {copied === i ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live character counter */}
      <div className="mt-10 border-t border-gray-200 pt-10 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Character counter</h2>
        <p className="text-xs text-gray-400 mb-3">Paste or type your meta description to check the length in real time.</p>
        <textarea
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          rows={3}
          placeholder="Paste your meta description here…"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600"
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {charCount === 0 ? "0 characters" : charCount > MAX_CHARS ? `${charCount - MAX_CHARS} characters over limit` : `${MAX_CHARS - charCount} characters remaining`}
          </p>
          <span className={`text-sm font-semibold tabular-nums ${charColor}`}>{charCount} / {MAX_CHARS}</span>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-10 border-t border-gray-200 pt-10 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Meta description best practices</h2>
        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex gap-2"><span className="text-accent font-bold">→</span> Keep it between 120–160 characters. Longer descriptions get truncated in search results.</li>
          <li className="flex gap-2"><span className="text-accent font-bold">→</span> Include your primary keyword naturally — Google bolds it when it matches the search query.</li>
          <li className="flex gap-2"><span className="text-accent font-bold">→</span> Write for humans, not bots. A good description gets clicks, which improves rankings.</li>
          <li className="flex gap-2"><span className="text-accent font-bold">→</span> Include a clear benefit or CTA: &quot;Learn how to…&quot;, &quot;Discover…&quot;, &quot;Find out…&quot;</li>
          <li className="flex gap-2"><span className="text-accent font-bold">→</span> Make every description unique — duplicate meta descriptions dilute SEO signals.</li>
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm font-medium text-gray-900 dark:text-white">Manage SEO for your whole blog in one place</p>
        <p className="mt-1 text-sm text-gray-500">RankFlo includes per-post SEO fields, AI meta generation, and live SEO scoring.</p>
        <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">
          Start for free
        </Link>
      </div>
    </div>
  );
}
