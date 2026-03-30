"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

const ICONS: Record<string, string> = {
  seo: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  content: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  growth: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
  default: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
};

const PRIORITIES = ["high", "medium", "low"] as const;
const PRIORITY_COLORS = {
  high: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

interface Insight {
  title: string;
  description: string;
  action: string;
  actionHref: string;
  priority: "high" | "medium" | "low";
  category: string;
}

function generateInsights(
  stats: { total: number; published: number; draft: number; scheduled: number } | undefined,
  analytics: { pageViews: number; uniqueVisitors: number; sessions: number } | undefined,
  topPosts: { title: string; views: number }[] | undefined,
): Insight[] {
  const insights: Insight[] = [];

  if (!stats && !analytics) return [];

  // Content insights
  if ((stats?.total ?? 0) === 0) {
    insights.push({
      title: "Create your first post",
      description: "You have no posts yet. Start publishing content to build your audience.",
      action: "Write first post",
      actionHref: "/posts/new",
      priority: "high",
      category: "content",
    });
  } else if ((stats?.published ?? 0) === 0) {
    insights.push({
      title: "Publish your drafts",
      description: `You have ${stats?.draft ?? 0} draft posts. Publishing regularly helps with SEO indexing.`,
      action: "View drafts",
      actionHref: "/posts",
      priority: "high",
      category: "content",
    });
  } else if ((stats?.draft ?? 0) > (stats?.published ?? 0)) {
    insights.push({
      title: "High draft-to-published ratio",
      description: `You have ${stats?.draft} drafts vs ${stats?.published} published posts. Consider publishing more consistently.`,
      action: "Review drafts",
      actionHref: "/posts",
      priority: "medium",
      category: "content",
    });
  }

  if ((stats?.scheduled ?? 0) === 0 && (stats?.published ?? 0) > 0) {
    insights.push({
      title: "Schedule content in advance",
      description: "Scheduling posts ahead of time ensures consistent publishing without gaps.",
      action: "Open calendar",
      actionHref: "/calendar",
      priority: "medium",
      category: "content",
    });
  }

  // Analytics insights
  if ((analytics?.pageViews ?? 0) === 0) {
    insights.push({
      title: "Install the tracking snippet",
      description: "No traffic data found. Add the tracker to your blog to see pageviews, visitors, and sources.",
      action: "Go to Analytics",
      actionHref: "/analytics",
      priority: "high",
      category: "seo",
    });
  } else {
    const bounceProxy = analytics ? (analytics.pageViews / Math.max(analytics.sessions, 1)) : 0;
    if (bounceProxy < 1.5 && analytics!.sessions > 10) {
      insights.push({
        title: "Low pages per session",
        description: "Visitors are leaving after viewing only one page. Add internal links and related post CTAs to boost engagement.",
        action: "Edit posts",
        actionHref: "/posts",
        priority: "medium",
        category: "content",
      });
    }
  }

  // Top content insights
  if (topPosts && topPosts.length > 0) {
    insights.push({
      title: `Update your top post: "${topPosts[0].title.slice(0, 40)}…"`,
      description: `Your most-viewed post has ${topPosts[0].views.toLocaleString()} views. Keep it fresh with updated info and a clear CTA.`,
      action: "View posts",
      actionHref: "/posts",
      priority: "medium",
      category: "growth",
    });
  }

  // Always-on recommendations
  insights.push(
    {
      title: "Check Core Web Vitals",
      description: "Page speed directly affects Google rankings. Test your blog pages and fix LCP / CLS issues.",
      action: "Run speed test",
      actionHref: "/analytics/vitals",
      priority: "medium",
      category: "seo",
    },
    {
      title: "Add search to your blog",
      description: "Site search helps visitors find content and gives you keyword data to guide future posts.",
      action: "View keywords",
      actionHref: "/analytics/keywords",
      priority: "low",
      category: "growth",
    },
    {
      title: "Track your LLM visibility",
      description: "AI chatbots are becoming a major traffic source. Monitor whether ChatGPT, Claude, and Gemini mention your brand.",
      action: "Go to LLM Search",
      actionHref: "/llms",
      priority: "low",
      category: "growth",
    },
  );

  return insights;
}

export default function AiInsightsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: stats } = trpc.post.stats.useQuery({});
  const { data: analytics } = trpc.analytics.overview.useQuery({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const { data: topPostsData } = trpc.analytics.topPosts.useQuery({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
    limit: 5,
  });

  const insights = generateInsights(stats, analytics, topPostsData);
  const categories = ["all", ...Array.from(new Set(insights.map((i) => i.category)))];
  const filtered = activeCategory === "all" ? insights : insights.filter((i) => i.category === activeCategory);

  const highCount = insights.filter((i) => i.priority === "high").length;
  const mediumCount = insights.filter((i) => i.priority === "medium").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/analytics" className="hover:text-gray-700 dark:hover:text-gray-300">Analytics</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">AI Insights</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">AI Insights</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Personalized recommendations based on your content and traffic data.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">High priority</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-red-700 dark:text-red-400">{highCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-950/20">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Medium priority</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-amber-700 dark:text-amber-400">{mediumCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total insights</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{insights.length}</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              activeCategory === cat
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Insights list */}
      <div className="flex flex-col gap-3">
        {PRIORITIES.map((priority) => {
          const items = filtered.filter((i) => i.priority === priority);
          if (items.length === 0) return null;
          return items.map((insight, idx) => (
            <div
              key={`${priority}-${idx}`}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[insight.category] ?? ICONS.default} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{insight.title}</p>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize ${PRIORITY_COLORS[insight.priority]}`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{insight.description}</p>
                  <Link
                    href={insight.actionHref}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 dark:text-accent dark:hover:text-accent-9"
                  >
                    {insight.action}
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ));
        })}
      </div>
    </div>
  );
}
