"use client";

import { useState } from "react";

const MODES = [
  {
    id: "seo",
    label: "Blog & SEO",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
      </svg>
    ),
    accentClass: "text-accent",
    pillClass: "bg-accent/10 text-accent",
    activeBorder: "border-accent/50",
    title: "Publish content that ranks",
    desc: "AI-powered editor that generates SEO-optimized posts in your brand voice. Built-in scoring, meta optimization, and structured data — without plugins.",
    bullets: [
      "AI content generation in your brand voice",
      "Real-time SEO scoring as you write",
      "Auto JSON-LD & Open Graph tags",
      "Full-text search API included",
      "Headless — deliver content anywhere",
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    accentClass: "text-blue-400",
    pillClass: "bg-blue-900/30 text-blue-400",
    activeBorder: "border-blue-500/50",
    title: "Know exactly what's working",
    desc: "Cookieless, privacy-first analytics with one line of JavaScript. See pageviews, traffic sources, top content, and AI referrers — all in one dashboard.",
    bullets: [
      "One-line tracker.js — no cookies",
      "Content performance & top posts",
      "Traffic source attribution by channel",
      "AI referrer tracking (ChatGPT, Perplexity…)",
      "Custom events API for conversions",
    ],
  },
  {
    id: "llm",
    label: "LLM Visibility",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    accentClass: "text-purple-400",
    pillClass: "bg-purple-900/30 text-purple-400",
    activeBorder: "border-purple-500/50",
    title: "Get cited by ChatGPT & Perplexity",
    desc: "Track when AI assistants mention your brand, monitor competitors, log citations, and optimize your content to appear in AI-generated answers.",
    bullets: [
      "Brand mention & citation tracking",
      "Share of Voice vs. competitors",
      "AI visibility score (0–100)",
      "Prompt testing & monitoring",
      "Content optimization checklist",
    ],
  },
] as const;

/* ── Dashboard mockups ─────────────────────────────────────────────────────── */

function SeoMockup() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Post editor card */}
      <div className="rounded-xl border border-gray-800 bg-black p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-300">AI Draft — "10 Ways to Improve Your SEO"</span>
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">Score 94</span>
        </div>
        <div className="space-y-1.5">
          {["Introduction (230 words)", "H2: Technical Foundations", "H2: Content Strategy", "H2: Link Building Basics"].map((h) => (
            <div key={h} className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-700" />
              <div className="h-2 rounded bg-gray-800" style={{ width: `${45 + Math.random() * 45}%` }}>
                <div className="text-[10px] leading-none text-gray-500 pl-1.5 pt-0.5 truncate">{h}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEO checks */}
      <div className="rounded-xl border border-gray-800 bg-black p-4">
        <p className="mb-3 text-xs text-gray-500 font-medium">SEO Checks</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Title tag", status: "good" },
            { label: "Meta description", status: "good" },
            { label: "JSON-LD schema", status: "good" },
            { label: "Open Graph", status: "good" },
            { label: "Reading time", status: "good" },
            { label: "Keyword density", status: "warn" },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-1.5">
              <span className={c.status === "good" ? "text-accent" : "text-amber-400"}>
                {c.status === "good" ? "✓" : "~"}
              </span>
              <span className="text-[11px] text-gray-400">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top posts mini */}
      <div className="rounded-xl border border-gray-800 bg-black p-4">
        <p className="mb-2 text-xs text-gray-500 font-medium">Published posts · 12 total</p>
        <div className="space-y-2">
          {["How to Rank in 2025", "LLM SEO Guide", "AI Content Strategy"].map((t, i) => (
            <div key={t} className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400 truncate max-w-[65%]">{t}</span>
              <span className="text-[10px] text-accent font-medium">{[2841, 1209, 934][i]} views</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  const bars = [20,28,22,35,30,42,38,50,44,55,60,52,68,65,72,70,80,75,85,82,90,88,95,92,100,96,88,94,98,100];
  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Stat row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Pageviews", value: "24,891", delta: "+31%" },
          { label: "Visitors", value: "8,103", delta: "+18%" },
          { label: "Avg duration", value: "2m 47s", delta: "+5%" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-black p-3">
            <p className="text-[10px] text-gray-500">{s.label}</p>
            <p className="mt-0.5 text-base font-bold text-white">{s.value}</p>
            <p className="text-[10px] font-medium text-accent">{s.delta}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-gray-800 bg-black p-4">
        <p className="mb-3 text-xs text-gray-500">Organic traffic · Last 30 days</p>
        <div className="flex items-end gap-0.5 h-20">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `rgba(57,255,20,${0.08 + (h / 100) * 0.4})` }} />
          ))}
        </div>
      </div>

      {/* Top sources */}
      <div className="rounded-xl border border-gray-800 bg-black p-4">
        <p className="mb-2 text-xs text-gray-500 font-medium">Traffic sources</p>
        {[
          { name: "Organic Search", pct: 68, color: "bg-accent/70" },
          { name: "Direct", pct: 18, color: "bg-blue-500/70" },
          { name: "AI Referrals", pct: 9, color: "bg-purple-500/70" },
          { name: "Social", pct: 5, color: "bg-gray-600" },
        ].map((s) => (
          <div key={s.name} className="mb-2">
            <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
              <span>{s.name}</span><span>{s.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-800">
              <div className={`h-1.5 rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LlmMockup() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Score + stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Visibility Score", value: "78", unit: "/100", color: "text-purple-400" },
          { label: "AI Mentions", value: "847", unit: " this month", color: "text-accent" },
          { label: "Sentiment", value: "84%", unit: " positive", color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-black p-3">
            <p className="text-[10px] text-gray-500">{s.label}</p>
            <p className={`mt-0.5 text-base font-bold ${s.color}`}>{s.value}<span className="text-[10px] text-gray-600 font-normal">{s.unit}</span></p>
          </div>
        ))}
      </div>

      {/* Recent mentions */}
      <div className="rounded-xl border border-gray-800 bg-black p-4">
        <p className="mb-2 text-xs text-gray-500 font-medium">Recent AI mentions</p>
        <div className="space-y-2.5">
          {[
            { platform: "ChatGPT", query: "best SEO tools 2025", sentiment: "positive" },
            { platform: "Perplexity", query: "headless CMS with analytics", sentiment: "positive" },
            { platform: "Claude", query: "LLM visibility tracking", sentiment: "neutral" },
          ].map((m) => (
            <div key={m.query} className="flex items-start gap-2">
              <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${m.sentiment === "positive" ? "bg-accent" : "bg-gray-500"}`} />
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-purple-400">{m.platform}</span>
                <p className="text-[11px] text-gray-400 truncate">"{m.query}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share of voice */}
      <div className="rounded-xl border border-gray-800 bg-black p-4">
        <p className="mb-2 text-xs text-gray-500 font-medium">Share of Voice</p>
        {[
          { name: "RankFlo (you)", pct: 38, color: "bg-purple-500/80" },
          { name: "Competitor A", pct: 29, color: "bg-gray-600" },
          { name: "Competitor B", pct: 19, color: "bg-gray-700" },
          { name: "Others", pct: 14, color: "bg-gray-800" },
        ].map((s) => (
          <div key={s.name} className="mb-2">
            <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
              <span>{s.name}</span><span>{s.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-900">
              <div className={`h-1.5 rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MOCKUPS = { seo: <SeoMockup />, analytics: <AnalyticsMockup />, llm: <LlmMockup /> };

/* ── Main export ───────────────────────────────────────────────────────────── */

export function ThreeModes() {
  const [active, setActive] = useState<"seo" | "analytics" | "llm">("seo");
  const mode = MODES.find((m) => m.id === active)!;

  return (
    <section className="bg-gray-950 py-24">
      <div className="mx-auto max-w-wide px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold text-accent">One platform. Three growth engines.</p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-white">
            Everything your content needs
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-500">
            Most tools do one thing. RankFlo does all three — and they work together.
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-2xl border border-gray-800 bg-gray-900 p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setActive(m.id)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                  active === m.id
                    ? `bg-gray-800 shadow-sm ${m.accentClass}`
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content: left copy + right mockup */}
        <div className="grid items-start gap-10 lg:grid-cols-2">
          {/* Copy */}
          <div className="flex flex-col justify-center lg:pr-8">
            <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${mode.pillClass} mb-5`}>
              {mode.label}
            </span>
            <h3 className="text-3xl font-bold text-white">{mode.title}</h3>
            <p className="mt-4 text-base leading-relaxed text-gray-500">{mode.desc}</p>
            <ul className="mt-7 space-y-3">
              {mode.bullets.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm text-gray-300">
                  <svg className={`h-4 w-4 shrink-0 ${mode.accentClass}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Dashboard mockup */}
          <div className={`overflow-hidden rounded-2xl border bg-gray-950 shadow-2xl transition-all duration-300 ${mode.activeBorder}`}>
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 border-b border-gray-800 px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
              <span className="ml-3 text-[10px] text-gray-600">app.rankflo.io / {active === "seo" ? "posts" : active === "analytics" ? "analytics" : "llms"}</span>
            </div>
            {MOCKUPS[active]}
          </div>
        </div>
      </div>
    </section>
  );
}
