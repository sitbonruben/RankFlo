"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

const PLATFORM_STYLES: Record<string, string> = {
  chatgpt: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  claude: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  gemini: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  perplexity: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  copilot: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400",
  grok: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};
const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini",
  perplexity: "Perplexity", copilot: "Copilot", grok: "Grok", other: "Other",
};

function timeAgo(date: Date | string | null) {
  if (!date) return null;
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

/* ── Optimization checklist panel ─────────────────────────────────────────── */
function OptChecklist({ postId }: { postId: string }) {
  const { data: result, isLoading } = trpc.llm.postOptimizationChecks.useQuery({ postId });

  if (isLoading) {
    return (
      <div className="space-y-2 px-5 pb-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-5 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />)}
      </div>
    );
  }

  if (!result) return null;

  const checks = result.checks;
  const passed = checks.filter((c: { passed: boolean }) => c.passed).length;
  const pct = Math.round((passed / checks.length) * 100);

  return (
    <div className="border-t border-gray-50 dark:border-gray-900">
      <div className="flex items-center justify-between px-5 py-2.5">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">LLM Optimization Score</p>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className={`h-full rounded-full transition-all ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`text-xs font-semibold ${pct >= 70 ? "text-green-600 dark:text-green-400" : pct >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-500 dark:text-red-400"}`}>
            {passed}/{checks.length}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-5 pb-4">
        {checks.map((c: { id: string; label: string; passed: boolean }) => (
          <div key={c.id} className="flex items-center gap-2">
            {c.passed ? (
              <svg className="h-3.5 w-3.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5 shrink-0 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={`text-xs ${c.passed ? "text-gray-600 dark:text-gray-400" : "text-gray-400 dark:text-gray-600"}`}>{c.label}</span>
          </div>
        ))}
      </div>
      {checks.some((c: { passed: boolean }) => !c.passed) && (
        <div className="px-5 pb-4">
          <Link
            href={`/posts/${postId}/edit` as string}
            className="text-xs font-medium text-green-600 hover:underline dark:text-accent"
          >
            Fix in editor →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ── Expandable cited post row ─────────────────────────────────────────────── */
function CitedPostRow({ post }: {
  post: {
    id: string; title: string; slug: string;
    citationCount: number; platforms: string[];
    lastCitedAt: Date | string | null;
  };
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-gray-50 last:border-0 dark:border-gray-900">
      <div
        className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{post.title}</p>
          </div>
          <p className="truncate text-xs text-gray-400 dark:text-gray-600">/{post.slug}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {post.platforms.map((p) => (
              <span key={p} className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${PLATFORM_STYLES[p] ?? PLATFORM_STYLES.other}`}>
                {PLATFORM_LABELS[p] ?? p}
              </span>
            ))}
          </div>
        </div>
        <span className="text-lg font-bold tabular-nums text-green-600 dark:text-green-400 text-right">
          {post.citationCount}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-600 text-right w-24">
          {timeAgo(post.lastCitedAt) ?? "—"}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
      {expanded && <OptChecklist postId={post.id} title={post.title} />}
    </div>
  );
}

export default function CitationsPage() {
  const { data: posts, isLoading } = trpc.llm.citedPosts.useQuery();

  const cited = posts?.filter((p) => p.citationCount > 0) ?? [];
  const uncited = posts?.filter((p) => p.citationCount === 0) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/llms" className="hover:text-gray-700 dark:hover:text-gray-300">LLM Search</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">Citations</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Citations</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Which of your posts have been cited by AI — with per-post optimization checklists.
          </p>
        </div>
        <Link
          href="/llms/mentions"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Log mention
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Posts cited by AI", value: cited.length, accent: cited.length > 0 },
          { label: "Total citations", value: cited.reduce((s, p) => s + p.citationCount, 0), accent: false },
          { label: "Posts not yet cited", value: uncited.length, accent: false },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-5 ${s.accent ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20" : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"}`}
          >
            <p className={`text-sm font-medium ${s.accent ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>{s.label}</p>
            {isLoading ? (
              <div className="mt-2 h-8 w-14 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            ) : (
              <p className={`mt-1 text-3xl font-bold tracking-tight ${s.accent ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                {s.value}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Cited posts with expandable checklists */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : cited.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <svg className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">No citations matched yet</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
            Log AI mentions that include a cited URL — we&apos;ll match them to your published posts.
          </p>
          <Link href="/llms/mentions" className="mt-3 inline-flex text-sm font-medium text-green-600 hover:underline dark:text-accent">
            Go to AI Mentions →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Cited posts</h3>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">Click a post to see its LLM optimization checklist</p>
          </div>
          <div>
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-600">
              <span>Post</span>
              <span className="text-right">Citations</span>
              <span className="text-right w-24">Last cited</span>
              <span className="w-4" />
            </div>
            {cited.map((post) => (
              <CitedPostRow key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Uncited posts with optimization scores */}
      {!isLoading && uncited.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Posts not yet cited</h3>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">Optimize these to improve your chance of being cited by AI</p>
          </div>
          <div>
            {uncited.slice(0, 10).map((post) => (
              <CitedPostRow key={post.id} post={post} />
            ))}
            {uncited.length > 10 && (
              <p className="px-5 py-3 text-xs text-gray-400 dark:text-gray-600">
                + {uncited.length - 10} more posts
              </p>
            )}
          </div>
        </div>
      )}

      {/* How to get cited */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">How to get cited by AI</h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-900">
          {[
            { title: "Write authoritative, comprehensive content", tip: "AI systems prefer citing sources that go deep on a topic. Aim for 1,500+ words with clear H2/H3 headings and supporting data." },
            { title: "Add structured data (JSON-LD)", tip: "Schema markup helps AI parse your content. Use Article, HowTo, or FAQ schema on your posts." },
            { title: "Optimize meta descriptions and excerpts", tip: "A clear, descriptive meta helps AI understand what your post is about and whether it&apos;s worth citing." },
            { title: "Build topical authority with clusters", tip: "Publish multiple posts on related subtopics. Being the go-to source on a niche increases citation probability." },
          ].map((item, i) => (
            <div key={i} className="px-5 py-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
