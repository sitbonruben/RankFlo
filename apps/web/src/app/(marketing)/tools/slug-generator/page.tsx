"use client";

import { useState } from "react";
import Link from "next/link";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export default function SlugGeneratorPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const slug = toSlug(input);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">URL Slug Generator</h1>
      <p className="mt-2 text-gray-400">Convert any title or text into a clean, SEO-friendly URL slug. Removes special characters, accents, and extra spaces.</p>

      <div className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-400">Enter your title or text</label>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="How to Build a Blog with Next.js and a Headless CMS"
            className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none" />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-400">Generated slug</label>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 rounded-xl border border-gray-800 bg-[#0a0a0a] px-4 py-3 font-mono text-sm text-accent">
              {slug || <span className="text-gray-600">your-slug-here</span>}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(slug); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              disabled={!slug}
              className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 transition-colors">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {slug && (
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
            <p className="text-xs text-gray-500 mb-2">Preview URL</p>
            <p className="text-sm text-gray-300">https://yoursite.com/blog/<span className="text-accent">{slug}</span></p>
            <div className="mt-3 flex gap-4 text-xs text-gray-500">
              <span>{slug.length} chars</span>
              <span>{slug.split("-").length} words</span>
              <span className={slug.length <= 60 ? "text-green-400" : "text-amber-400"}>
                {slug.length <= 60 ? "Good length" : "Consider shortening"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-gray-800 bg-gray-950/50 p-5">
        <h2 className="text-sm font-semibold text-white mb-2">URL slug best practices</h2>
        <ul className="space-y-1 text-sm text-gray-400">
          <li>• Keep slugs under 60 characters</li>
          <li>• Use hyphens, not underscores</li>
          <li>• Include your target keyword</li>
          <li>• Remove stop words (a, the, is, and)</li>
          <li>• Use lowercase only</li>
          <li>• Avoid changing slugs after publishing (breaks links)</li>
        </ul>
      </div>

      <div className="mt-12 rounded-xl border border-gray-800 bg-gray-950 p-8 text-center">
        <h2 className="text-lg font-bold text-white">RankFlo generates SEO slugs automatically</h2>
        <p className="mt-2 text-sm text-gray-400">Every post title auto-generates a clean slug. Edit it anytime before publishing.</p>
        <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">Start free</Link>
      </div>
    </div>
  );
}
