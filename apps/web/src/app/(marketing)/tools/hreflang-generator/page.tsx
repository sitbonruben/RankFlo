"use client";

import { useState } from "react";
import Link from "next/link";

const LANGS = ["en","es","fr","de","it","pt","nl","ja","ko","zh","ar","ru","hi","sv","pl","da","no","fi","tr","th"];

export default function HreflangGeneratorPage() {
  const [rows, setRows] = useState([{ lang: "en", url: "" }, { lang: "es", url: "" }]);
  const [defaultUrl, setDefaultUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const addRow = () => setRows([...rows, { lang: "", url: "" }]);
  const updateRow = (i: number, field: "lang" | "url", val: string) => {
    const next = [...rows]; next[i] = { ...next[i], [field]: val }; setRows(next);
  };
  const removeRow = (i: number) => setRows(rows.filter((_, j) => j !== i));

  const output = rows.filter((r) => r.lang && r.url).map((r) =>
    `<link rel="alternate" hreflang="${r.lang}" href="${r.url}" />`
  ).concat(defaultUrl ? [`<link rel="alternate" hreflang="x-default" href="${defaultUrl}" />`] : []).join("\n");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Hreflang Tag Generator</h1>
      <p className="mt-2 text-gray-400">Generate hreflang tags for international SEO. Tell Google which language version of your page to show in each country.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div>
            <label className="text-xs font-medium text-gray-400">Default URL (x-default)</label>
            <input value={defaultUrl} onChange={(e) => setDefaultUrl(e.target.value)} placeholder="https://yoursite.com/blog/my-post"
              className="mt-1 w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none" />
          </div>

          {rows.map((row, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="w-24">
                <label className="text-xs font-medium text-gray-400">Lang</label>
                <select value={row.lang} onChange={(e) => updateRow(i, "lang", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-black px-2 py-2 text-sm text-white focus:border-accent/50 focus:outline-none">
                  <option value="">--</option>
                  {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-400">URL</label>
                <input value={row.url} onChange={(e) => updateRow(i, "url", e.target.value)} placeholder={`https://yoursite.com/${row.lang}/blog/my-post`}
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none" />
              </div>
              {rows.length > 1 && (
                <button onClick={() => removeRow(i)} className="mb-0.5 text-gray-600 hover:text-red-400 text-sm">✕</button>
              )}
            </div>
          ))}
          <button onClick={addRow} className="text-sm text-accent hover:underline">+ Add language</button>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0a0a0a]">
          <div className="flex items-center justify-between border-b border-gray-800/60 px-4 py-2">
            <span className="text-[11px] font-medium text-gray-500">html</span>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="text-[11px] text-gray-500 hover:text-gray-300">{copied ? "Copied!" : "Copy"}</button>
          </div>
          <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-gray-300"><code>{output || "<!-- Add languages to generate hreflang tags -->"}</code></pre>
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-gray-800 bg-gray-950 p-8 text-center">
        <h2 className="text-lg font-bold text-white">RankFlo supports multi-language blogs</h2>
        <p className="mt-2 text-sm text-gray-400">Publish in multiple locales with automatic hreflang tags and locale-based API filtering.</p>
        <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">Start free</Link>
      </div>
    </div>
  );
}
