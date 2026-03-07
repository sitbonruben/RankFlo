"use client";

import * as React from "react";

// ─── Types ──────────────────────────────────────────────
interface LinkSuggestion {
  id: string;
  title: string;
  slug: string;
  relevance: number; // 0-100
}

interface ExistingLink {
  id: string;
  postTitle: string;
  anchorText: string;
  slug: string;
}

// ─── Mock Data ──────────────────────────────────────────
const MOCK_SUGGESTIONS: LinkSuggestion[] = [
  { id: "s1", title: "Getting Started with Next.js 15", slug: "/blog/getting-started-nextjs-15", relevance: 94 },
  { id: "s2", title: "Understanding React Server Components", slug: "/blog/react-server-components", relevance: 87 },
  { id: "s3", title: "TypeScript Best Practices for 2025", slug: "/blog/typescript-best-practices-2025", relevance: 78 },
  { id: "s4", title: "Building a Design System from Scratch", slug: "/blog/building-design-system", relevance: 65 },
  { id: "s5", title: "Performance Optimization Techniques", slug: "/blog/performance-optimization", relevance: 58 },
  { id: "s6", title: "Introduction to tRPC with Next.js", slug: "/blog/trpc-nextjs-intro", relevance: 45 },
];

const MOCK_EXISTING_LINKS: ExistingLink[] = [
  { id: "e1", postTitle: "Setting Up Your Dev Environment", anchorText: "dev environment guide", slug: "/blog/dev-environment-setup" },
  { id: "e2", postTitle: "CSS Grid Layout Deep Dive", anchorText: "CSS Grid", slug: "/blog/css-grid-deep-dive" },
  { id: "e3", postTitle: "Deploying to Vercel", anchorText: "deployment instructions", slug: "/blog/deploying-vercel" },
];

// ─── Relevance Bar ──────────────────────────────────────
function RelevanceBar({ score }: { score: number }) {
  const color = score >= 70 ? "#22c55e" : score >= 50 ? "#eab308" : "#6b7280";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-gray-500">{score}%</span>
    </div>
  );
}

// ─── Suggestion Item ────────────────────────────────────
function SuggestionItem({ suggestion }: { suggestion: LinkSuggestion }) {
  const [copied, setCopied] = React.useState(false);

  const handleInsert = React.useCallback(() => {
    const markdownLink = `[${suggestion.title}](${suggestion.slug})`;
    navigator.clipboard.writeText(markdownLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [suggestion.title, suggestion.slug]);

  return (
    <div className="group rounded-lg border border-gray-800 bg-gray-950 p-2.5">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-gray-300">
            {suggestion.title}
          </p>
          <p className="truncate text-[10px] text-gray-600">
            {suggestion.slug}
          </p>
        </div>
        <button
          type="button"
          onClick={handleInsert}
          className="shrink-0 rounded-md border border-gray-700 bg-gray-900 px-2 py-1 text-[10px] font-medium text-gray-400 transition-colors hover:border-[#39FF14]/30 hover:bg-[#39FF14]/10 hover:text-[#39FF14]"
        >
          {copied ? "Copied!" : "Insert Link"}
        </button>
      </div>
      <RelevanceBar score={suggestion.relevance} />
    </div>
  );
}

// ─── Existing Link Item ─────────────────────────────────
function ExistingLinkItem({ link }: { link: ExistingLink }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-950 px-2.5 py-2">
      {/* Link icon */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 14 14"
        fill="none"
        className="shrink-0 text-[#39FF14]"
      >
        <path
          d="M6 8L8 6M5 9L3.5 10.5C2.67 11.33 2.67 12.67 3.5 13.5V13.5C4.33 14.33 5.67 14.33 6.5 13.5L8 12M8 5L9.5 3.5C10.33 2.67 11.67 2.67 12.5 3.5V3.5C13.33 4.33 13.33 5.67 12.5 6.5L11 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-gray-300">
          {link.postTitle}
        </p>
        <p className="truncate text-[10px] text-gray-500">
          anchor: &quot;{link.anchorText}&quot;
        </p>
      </div>
    </div>
  );
}

// ─── Internal Links Panel ───────────────────────────────
export function InternalLinksPanel() {
  const suggestions = MOCK_SUGGESTIONS;
  const existingLinks = MOCK_EXISTING_LINKS;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#39FF14]/10">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="text-[#39FF14]"
          >
            <path
              d="M6 8L8 6M5 9L3.5 10.5C2.67 11.33 2.67 12.67 3.5 13.5V13.5C4.33 14.33 5.67 14.33 6.5 13.5L8 12M8 5L9.5 3.5C10.33 2.67 11.67 2.67 12.5 3.5V3.5C13.33 4.33 13.33 5.67 12.5 6.5L11 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h4 className="text-xs font-medium text-gray-300">Internal Links</h4>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 px-3 py-2">
        <span className="text-[11px] text-gray-500">
          <span className="font-medium text-gray-300">{existingLinks.length}</span> internal links found
        </span>
        <span className="text-[11px] text-gray-500">
          <span className="font-medium text-gray-300">{suggestions.length}</span> suggestions
        </span>
      </div>

      {/* Suggestions List */}
      <div className="space-y-1.5">
        <h5 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Suggested Links
        </h5>
        <div className="space-y-1.5">
          {suggestions.map((suggestion) => (
            <SuggestionItem key={suggestion.id} suggestion={suggestion} />
          ))}
        </div>
      </div>

      {/* Existing Links */}
      <div className="space-y-1.5 border-t border-gray-800 pt-4">
        <h5 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Existing Internal Links
        </h5>
        <div className="space-y-1.5">
          {existingLinks.map((link) => (
            <ExistingLinkItem key={link.id} link={link} />
          ))}
        </div>
      </div>
    </div>
  );
}
