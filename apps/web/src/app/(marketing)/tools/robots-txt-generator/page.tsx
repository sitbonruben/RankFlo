"use client";

import { useState } from "react";
import Link from "next/link";

const CRAWLERS = [
  { id: "all", label: "All crawlers", default: true },
  { id: "Googlebot", label: "Googlebot", default: true },
  { id: "GPTBot", label: "GPTBot (ChatGPT)", default: true },
  { id: "ClaudeBot", label: "ClaudeBot", default: true },
  { id: "PerplexityBot", label: "PerplexityBot", default: true },
  { id: "Bingbot", label: "Bingbot", default: true },
  { id: "Google-Extended", label: "Google AI training", default: false },
  { id: "Meta-ExternalAgent", label: "Meta AI", default: false },
];

export default function RobotsTxtGeneratorPage() {
  const [domain, setDomain] = useState("");
  const [allowed, setAllowed] = useState<Record<string, boolean>>(
    Object.fromEntries(CRAWLERS.map((c) => [c.id, c.default]))
  );
  const [blockPaths, setBlockPaths] = useState("/admin\n/api/\n/dashboard");
  const [sitemap, setSitemap] = useState(true);
  const [copied, setCopied] = useState(false);

  const output = CRAWLERS.filter((c) => c.id !== "all").map((c) => {
    if (allowed[c.id]) {
      return `User-Agent: ${c.id}\nAllow: /\n${blockPaths.split("\n").filter(Boolean).map((p) => `Disallow: ${p.trim()}`).join("\n")}`;
    }
    return `User-Agent: ${c.id}\nDisallow: /`;
  }).join("\n\n") + (sitemap && domain ? `\n\nSitemap: https://${domain.replace(/^https?:\/\//, "")}/sitemap.xml` : "");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Robots.txt Generator</h1>
      <p className="mt-2 text-gray-400">Generate a robots.txt file that controls which crawlers can access your site — including AI bots like GPTBot, ClaudeBot, and PerplexityBot.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div>
            <label className="text-xs font-medium text-gray-400">Your domain</label>
            <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yoursite.com"
              className="mt-1 w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none" />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-gray-400">Allow these crawlers</p>
            <div className="space-y-2">
              {CRAWLERS.filter((c) => c.id !== "all").map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={allowed[c.id] ?? false} onChange={(e) => setAllowed({ ...allowed, [c.id]: e.target.checked })}
                    className="rounded border-gray-700 bg-black text-accent focus:ring-accent/20" />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400">Block these paths (one per line)</label>
            <textarea value={blockPaths} onChange={(e) => setBlockPaths(e.target.value)} rows={4}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm font-mono text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none resize-none" />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input type="checkbox" checked={sitemap} onChange={(e) => setSitemap(e.target.checked)}
              className="rounded border-gray-700 bg-black text-accent focus:ring-accent/20" />
            Include sitemap reference
          </label>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0a0a0a]">
          <div className="flex items-center justify-between border-b border-gray-800/60 px-4 py-2">
            <span className="text-[11px] font-medium text-gray-500">robots.txt</span>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-800 hover:text-gray-300">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-gray-300"><code>{output}</code></pre>
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-gray-800 bg-gray-950 p-8 text-center">
        <h2 className="text-lg font-bold text-white">RankFlo generates robots.txt automatically</h2>
        <p className="mt-2 text-sm text-gray-400">AI-friendly robots.txt with support for GPTBot, ClaudeBot, PerplexityBot, and more — built in.</p>
        <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">Start free</Link>
      </div>
    </div>
  );
}
