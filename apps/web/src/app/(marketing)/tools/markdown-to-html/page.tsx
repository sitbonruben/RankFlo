"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function mdToHtml(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^\- (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^---$/gm, "<hr>")
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />');

  // Wrap loose lines in paragraphs
  html = html.split("\n").map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("<h") || trimmed.startsWith("<li") || trimmed.startsWith("<blockquote") || trimmed.startsWith("<hr") || trimmed.startsWith("<img")) return trimmed;
    return `<p>${trimmed}</p>`;
  }).filter(Boolean).join("\n");

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>\n${match}</ul>\n`);

  return html;
}

export default function MarkdownToHtmlPage() {
  const [md, setMd] = useState("");
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"code" | "preview">("code");
  const html = useMemo(() => mdToHtml(md), [md]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Markdown to HTML Converter</h1>
      <p className="mt-2 text-gray-400">Paste Markdown and get clean HTML output. Supports headings, bold, italic, links, lists, code, blockquotes, and images.</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <div>
          <label className="text-xs font-medium text-gray-400">Markdown input</label>
          <textarea value={md} onChange={(e) => setMd(e.target.value)} rows={20} placeholder={"# My Blog Post\n\nThis is a **bold** statement.\n\n- Item one\n- Item two\n\n[Read more](https://rankflo.io)"}
            className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm font-mono text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none resize-none leading-relaxed" />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => setTab("code")} className={`text-xs font-medium px-2 py-1 rounded ${tab === "code" ? "text-accent bg-accent/10" : "text-gray-500"}`}>HTML Code</button>
              <button onClick={() => setTab("preview")} className={`text-xs font-medium px-2 py-1 rounded ${tab === "preview" ? "text-accent bg-accent/10" : "text-gray-500"}`}>Preview</button>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="text-[11px] text-gray-500 hover:text-gray-300">
              {copied ? "Copied!" : "Copy HTML"}
            </button>
          </div>
          {tab === "code" ? (
            <pre className="mt-1 h-[480px] overflow-auto rounded-xl border border-gray-800 bg-[#0a0a0a] p-4 text-[13px] leading-relaxed text-gray-300"><code>{html || "HTML output will appear here..."}</code></pre>
          ) : (
            <div className="mt-1 h-[480px] overflow-auto rounded-xl border border-gray-800 bg-white p-4 text-sm text-gray-900 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html || '<p class="text-gray-400">Preview will appear here...</p>' }} />
          )}
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-gray-800 bg-gray-950 p-8 text-center">
        <h2 className="text-lg font-bold text-white">RankFlo converts content automatically</h2>
        <p className="mt-2 text-sm text-gray-400">Write in the block editor, publish as HTML via API. No manual conversion needed.</p>
        <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">Start free</Link>
      </div>
    </div>
  );
}
