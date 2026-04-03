"use client";

import { useState } from "react";
import Link from "next/link";

export default function SitemapGeneratorPage() {
  const [urls, setUrls] = useState("https://yoursite.com/\nhttps://yoursite.com/blog\nhttps://yoursite.com/pricing");
  const [freq, setFreq] = useState("weekly");
  const [copied, setCopied] = useState(false);

  const lines = urls.split("\n").map((u) => u.trim()).filter(Boolean);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.map((url, i) => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${i === 0 ? "1.0" : "0.8"}</priority>
  </url>`).join("\n")}
</urlset>`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">XML Sitemap Generator</h1>
      <p className="mt-2 text-gray-400">Generate a valid XML sitemap for your website. Enter your URLs, configure change frequency, and download or copy the output.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div>
            <label className="text-xs font-medium text-gray-400">URLs (one per line)</label>
            <textarea value={urls} onChange={(e) => setUrls(e.target.value)} rows={12}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm font-mono text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400">Change frequency</label>
            <select value={freq} onChange={(e) => setFreq(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-white focus:border-accent/50 focus:outline-none">
              <option value="always">Always</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <p className="text-xs text-gray-600">{lines.length} URL{lines.length !== 1 ? "s" : ""} in sitemap</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#0a0a0a]">
          <div className="flex items-center justify-between border-b border-gray-800/60 px-4 py-2">
            <span className="text-[11px] font-medium text-gray-500">sitemap.xml</span>
            <button onClick={() => { navigator.clipboard.writeText(xml); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="text-[11px] text-gray-500 hover:text-gray-300">{copied ? "Copied!" : "Copy"}</button>
          </div>
          <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed text-gray-300 max-h-[400px]"><code>{xml}</code></pre>
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-gray-800 bg-gray-950 p-8 text-center">
        <h2 className="text-lg font-bold text-white">RankFlo generates sitemaps dynamically</h2>
        <p className="mt-2 text-sm text-gray-400">Every published post is automatically included in your project sitemap with correct lastmod dates.</p>
        <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">Start free</Link>
      </div>
    </div>
  );
}
