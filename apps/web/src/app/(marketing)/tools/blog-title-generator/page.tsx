"use client";

import { useState } from "react";
import Link from "next/link";

const TEMPLATES = [
  (t: string) => `How to ${t}: A Step-by-Step Guide`,
  (t: string) => `The Ultimate Guide to ${t} in ${new Date().getFullYear()}`,
  (t: string) => `${t}: Everything You Need to Know`,
  (t: string) => `10 Proven ${t} Strategies That Actually Work`,
  (t: string) => `Why Most People Get ${t} Wrong (And How to Fix It)`,
  (t: string) => `${t} for Beginners: Start Here`,
  (t: string) => `The Complete ${t} Checklist`,
  (t: string) => `${t} Best Practices You're Probably Ignoring`,
  (t: string) => `What Nobody Tells You About ${t}`,
  (t: string) => `${t} in ${new Date().getFullYear()}: Trends, Tips & Tools`,
  (t: string) => `How I Improved My ${t} Results by 300%`,
  (t: string) => `The ${t} Mistakes That Are Costing You Traffic`,
  (t: string) => `${t} vs. Traditional Methods: Which Is Better?`,
  (t: string) => `A Beginner's Blueprint for ${t}`,
  (t: string) => `The Truth About ${t} No One Is Talking About`,
];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function BlogTitleGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [titles, setTitles] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  function generate() {
    if (!topic.trim()) return;
    const t = capitalize(topic.trim());
    const shuffled = [...TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 10);
    setTitles(shuffled.map((fn) => fn(t)));
  }

  function copy(title: string, i: number) {
    void navigator.clipboard.writeText(title);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/tools" className="hover:text-gray-600 dark:hover:text-gray-300">Tools</Link>
        <span>/</span>
        <span className="text-gray-600 dark:text-gray-300">Blog Title Generator</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Free Blog Title Generator
        </h1>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
          Enter your topic and instantly get 10 proven, SEO-friendly blog titles. No account needed.
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="e.g. email marketing, React performance, content strategy"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600"
        />
        <button
          onClick={generate}
          disabled={!topic.trim()}
          className="inline-flex h-12 items-center rounded-xl bg-accent px-6 text-sm font-semibold text-black transition-all hover:bg-accent-9 disabled:opacity-50"
        >
          Generate
        </button>
      </div>

      {/* Results */}
      {titles.length > 0 && (
        <div className="mt-8 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">10 title ideas</p>
          {titles.map((title, i) => (
            <div
              key={i}
              className="group flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
              <button
                onClick={() => copy(title, i)}
                className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-accent/40 hover:text-accent dark:border-gray-700 dark:hover:border-accent/40"
              >
                {copied === i ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
          <button
            onClick={generate}
            className="mt-2 text-xs text-gray-400 underline hover:text-gray-600 dark:hover:text-gray-300"
          >
            Regenerate for different ideas
          </button>
        </div>
      )}

      {/* How it works */}
      <div className="mt-16 border-t border-gray-200 pt-12 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">How to write great blog titles</h2>
        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex gap-2"><span className="text-accent font-bold">→</span> Use numbers (e.g. &quot;10 ways&quot;) — they get 36% more clicks than non-number titles.</li>
          <li className="flex gap-2"><span className="text-accent font-bold">→</span> Include your target keyword near the start of the title.</li>
          <li className="flex gap-2"><span className="text-accent font-bold">→</span> Keep titles under 60 characters to avoid truncation in search results.</li>
          <li className="flex gap-2"><span className="text-accent font-bold">→</span> Use power words like &quot;Ultimate&quot;, &quot;Proven&quot;, &quot;Complete&quot;, &quot;Free&quot;.</li>
          <li className="flex gap-2"><span className="text-accent font-bold">→</span> Match search intent — informational, commercial, or navigational.</li>
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm font-medium text-gray-900 dark:text-white">Write, publish, and rank — all in one place</p>
        <p className="mt-1 text-sm text-gray-500">RankFlo includes AI title generation, SEO scoring, and a full blog platform.</p>
        <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">
          Start for free
        </Link>
      </div>
    </div>
  );
}
