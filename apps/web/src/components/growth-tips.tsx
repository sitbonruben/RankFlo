"use client";

import { useState } from "react";
import Link from "next/link";

interface Tip {
  id: string;
  priority: "high" | "medium" | "low";
  icon: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

interface GrowthTipsProps {
  hasProjects: boolean;
  hasAutopilot: boolean;
  postCount: number;
  projectId?: string;
  apiKey?: string | null;
  appUrl?: string;
}

function SvgIcon({ path, className = "h-4 w-4" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const PRIORITY_COLORS = {
  high: "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5",
  medium: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/5",
  low: "border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/5",
};

const PRIORITY_ICON_COLORS = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-blue-500",
};

const PRIORITY_LABELS = {
  high: "Action needed",
  medium: "Recommended",
  low: "Tip",
};

export function GrowthTips({ hasProjects, hasAutopilot, postCount, projectId, apiKey, appUrl = "https://app.rankflo.io" }: GrowthTipsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const tips: Tip[] = [];

  if (!hasProjects) {
    tips.push({
      id: "connect-project",
      priority: "high",
      icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244",
      title: "Connect your first project",
      description: "Link your website to start generating SEO content automatically.",
      action: { label: "Connect project", href: "/onboarding" },
    });
  }

  if (hasProjects && !hasAutopilot) {
    tips.push({
      id: "enable-autopilot",
      priority: "high",
      icon: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z",
      title: "Enable Autopilot for hands-free content",
      description: "RankFlo AI generates and publishes SEO posts on a schedule. Set it and forget it.",
      action: projectId ? { label: "Enable Autopilot", href: `/projects/${projectId}` } : undefined,
    });
  }

  if (postCount < 5 && hasProjects) {
    tips.push({
      id: "more-content",
      priority: "medium",
      icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
      title: "Publish at least 10 posts for real traction",
      description: `You have ${postCount} post${postCount === 1 ? "" : "s"}. Sites with 10+ posts get 3× more organic traffic. Autopilot gets you there in weeks.`,
      action: { label: "Create a post", href: "/posts/new" },
    });
  }

  if (hasProjects && apiKey) {
    tips.push({
      id: "llms-txt",
      priority: "low",
      icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
      title: "Make your content findable by AI (ChatGPT, Perplexity, Claude)",
      description: "Add an llms.txt route to your site. AI assistants crawl this to discover and cite your content — a new traffic source.",
      action: { label: "View llms.txt", href: `${appUrl}/api/v1/llms.txt?project_key=${apiKey}` },
    });
  }

  tips.push({
    id: "structured-data",
    priority: "low",
    icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
    title: "Add JSON-LD structured data for rich results",
    description: "RankFlo includes structured data in every post's API response. Render it in your <head> for Google rich snippets (star ratings, breadcrumbs, FAQs).",
  });

  tips.push({
    id: "internal-links",
    priority: "low",
    icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244",
    title: "Internal linking multiplies your SEO value",
    description: "Autopilot automatically links new posts to related older posts on your site — building topical authority clusters over time.",
  });

  const visible = tips.filter(t => !dismissed.has(t.id));

  if (visible.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-800/50">
        <div className="flex items-center gap-2">
          <SvgIcon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" className="h-4 w-4 text-green-500 dark:text-accent" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Growth Tips</span>
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800">{visible.length}</span>
        </div>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
        {visible.map(tip => (
          <div key={tip.id} className="flex items-start gap-3 px-5 py-4">
            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${PRIORITY_COLORS[tip.priority]}`}>
              <SvgIcon path={tip.icon} className={`h-3.5 w-3.5 ${PRIORITY_ICON_COLORS[tip.priority]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-xs font-medium ${PRIORITY_ICON_COLORS[tip.priority]}`}>
                    {PRIORITY_LABELS[tip.priority]}
                  </span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{tip.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{tip.description}</p>
                </div>
                <button
                  onClick={() => setDismissed(prev => new Set([...prev, tip.id]))}
                  className="shrink-0 text-gray-300 hover:text-gray-500 dark:text-gray-700 dark:hover:text-gray-500"
                  title="Dismiss"
                >
                  <SvgIcon path="M6 18L18 6M6 6l12 12" className="h-3.5 w-3.5" />
                </button>
              </div>
              {tip.action && (
                <div className="mt-2">
                  {tip.action.href.startsWith("http") ? (
                    <a
                      href={tip.action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 dark:text-accent dark:hover:text-accent-9"
                    >
                      {tip.action.label}
                      <SvgIcon path="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link
                      href={tip.action.href}
                      className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 dark:text-accent dark:hover:text-accent-9"
                    >
                      {tip.action.label}
                      <SvgIcon path="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
