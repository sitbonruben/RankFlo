"use client";

import { useState } from "react";

interface PageAudit {
  postId: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  score: number;
  url: string;
  metaTitle: string;
  metaDescription: string;
  keywords: { word: string; count: number; density: number }[];
  headings: { tag: string; text: string; hasKeyword: boolean }[];
  wordCount: number;
  readingTime: string;
  issues: { severity: "critical" | "warning" | "info"; message: string; fix: string }[];
  strengths: string[];
  preview: {
    title: string;
    description: string;
    url: string;
  };
}

interface AuditData {
  overallScore: number;
  totalPosts: number;
  issues: {
    postId: string;
    title: string;
    slug: string;
    status: string;
    score: number;
    issues: string[];
  }[];
  topPerformers: {
    postId: string;
    title: string;
    score: number;
  }[];
  needsWork: {
    postId: string;
    title: string;
    score: number;
    issues: string[];
  }[];
}

// ─── Mock per-page audit data ──────────────────────────────
const MOCK_PAGE_AUDITS: PageAudit[] = [
  {
    postId: "1",
    title: "Welcome to RankFlo",
    slug: "welcome-to-rankflo",
    status: "published",
    score: 94,
    url: "https://rankflo.io/blog/welcome-to-rankflo",
    metaTitle: "Welcome to RankFlo — Modern Blog Management Platform",
    metaDescription: "Discover RankFlo, the all-in-one platform for creating, managing, and growing your blog with AI-powered tools and built-in SEO optimization.",
    keywords: [
      { word: "rankflo", count: 12, density: 2.1 },
      { word: "blog management", count: 6, density: 1.1 },
      { word: "platform", count: 5, density: 0.9 },
      { word: "content creation", count: 4, density: 0.7 },
      { word: "SEO", count: 3, density: 0.5 },
    ],
    headings: [
      { tag: "H1", text: "Welcome to RankFlo", hasKeyword: true },
      { tag: "H2", text: "Why Choose RankFlo?", hasKeyword: true },
      { tag: "H2", text: "Key Features", hasKeyword: false },
      { tag: "H3", text: "AI-Powered Writing", hasKeyword: false },
      { tag: "H3", text: "Built-in Analytics", hasKeyword: false },
      { tag: "H2", text: "Getting Started", hasKeyword: false },
    ],
    wordCount: 1847,
    readingTime: "8 min",
    issues: [
      { severity: "info", message: "Consider adding more internal links", fix: "Add 2-3 links to related posts like 'Getting Started with the API' and 'Self-Hosting Guide'" },
    ],
    strengths: [
      "Strong keyword density (2.1%) for primary keyword",
      "Excellent meta description length (156 characters)",
      "H1 contains target keyword",
      "Good content length (1,847 words)",
      "All images have alt text",
    ],
    preview: {
      title: "Welcome to RankFlo — Modern Blog Management Platform",
      description: "Discover RankFlo, the all-in-one platform for creating, managing, and growing your blog with AI-powered tools and built-in SEO optimization.",
      url: "rankflo.io › blog › welcome-to-rankflo",
    },
  },
  {
    postId: "2",
    title: "Getting Started with the API",
    slug: "getting-started-api",
    status: "published",
    score: 87,
    url: "https://rankflo.io/blog/getting-started-api",
    metaTitle: "Getting Started with the RankFlo API | Developer Guide",
    metaDescription: "Learn how to integrate with the RankFlo API. Complete guide with authentication, endpoints, and code examples for Node.js and Python.",
    keywords: [
      { word: "API", count: 24, density: 3.8 },
      { word: "rankflo", count: 8, density: 1.3 },
      { word: "authentication", count: 6, density: 1.0 },
      { word: "endpoints", count: 5, density: 0.8 },
      { word: "developer", count: 3, density: 0.5 },
    ],
    headings: [
      { tag: "H1", text: "Getting Started with the API", hasKeyword: true },
      { tag: "H2", text: "Authentication", hasKeyword: false },
      { tag: "H2", text: "Core Endpoints", hasKeyword: true },
      { tag: "H3", text: "Posts API", hasKeyword: true },
      { tag: "H3", text: "Media API", hasKeyword: true },
      { tag: "H2", text: "Error Handling", hasKeyword: false },
      { tag: "H2", text: "Rate Limits", hasKeyword: false },
    ],
    wordCount: 2340,
    readingTime: "11 min",
    issues: [
      { severity: "warning", message: "Primary keyword density too high (3.8%)", fix: "Reduce 'API' usage by ~8 instances. Aim for 1-2.5% density to avoid over-optimization." },
      { severity: "warning", message: "No featured image set", fix: "Add a featured image with alt text containing your target keyword." },
      { severity: "info", message: "Missing schema markup", fix: "Add TechArticle or HowTo schema markup to help search engines understand the content type." },
    ],
    strengths: [
      "Comprehensive content (2,340 words)",
      "Well-structured headings hierarchy",
      "Target keyword in H1 and H2s",
      "Good meta description (148 characters)",
    ],
    preview: {
      title: "Getting Started with the RankFlo API | Developer Guide",
      description: "Learn how to integrate with the RankFlo API. Complete guide with authentication, endpoints, and code examples for Node.js and Python.",
      url: "rankflo.io › blog › getting-started-api",
    },
  },
  {
    postId: "3",
    title: "Self-Hosting Guide",
    slug: "self-hosting-guide",
    status: "draft",
    score: 52,
    url: "https://rankflo.io/blog/self-hosting-guide",
    metaTitle: "Self-Hosting Guide",
    metaDescription: "",
    keywords: [
      { word: "self-hosting", count: 3, density: 0.8 },
      { word: "docker", count: 2, density: 0.5 },
      { word: "deploy", count: 2, density: 0.5 },
    ],
    headings: [
      { tag: "H1", text: "Self-Hosting Guide", hasKeyword: true },
      { tag: "H2", text: "Requirements", hasKeyword: false },
      { tag: "H2", text: "Installation", hasKeyword: false },
    ],
    wordCount: 456,
    readingTime: "2 min",
    issues: [
      { severity: "critical", message: "Missing meta description", fix: "Write a compelling meta description (150-160 chars) summarizing the self-hosting process and benefits." },
      { severity: "critical", message: "Meta title too short and generic", fix: "Expand to 'How to Self-Host RankFlo — Complete Docker & VPS Guide' (50-60 chars ideal)." },
      { severity: "critical", message: "Content is too thin (456 words)", fix: "Expand to at least 1,500 words. Add sections for Docker setup, VPS providers, SSL configuration, and troubleshooting." },
      { severity: "warning", message: "No images found", fix: "Add screenshots of the deployment process, architecture diagrams, or terminal output examples." },
      { severity: "warning", message: "Missing internal links", fix: "Link to the API guide and main welcome post for context." },
      { severity: "warning", message: "Low keyword density for 'self-hosting' (0.8%)", fix: "Naturally increase usage of 'self-hosting' and related terms like 'self-hosted', 'on-premise'." },
      { severity: "info", message: "No external links", fix: "Add links to Docker documentation, recommended VPS providers, and relevant tutorials." },
    ],
    strengths: [
      "Target keyword in H1",
      "Clean URL structure",
    ],
    preview: {
      title: "Self-Hosting Guide",
      description: "No description provided — search engines will auto-generate a snippet from page content.",
      url: "rankflo.io › blog › self-hosting-guide",
    },
  },
  {
    postId: "4",
    title: "10 Tips for Better Blog SEO in 2026",
    slug: "blog-seo-tips-2026",
    status: "published",
    score: 91,
    url: "https://rankflo.io/blog/blog-seo-tips-2026",
    metaTitle: "10 Tips for Better Blog SEO in 2026 | RankFlo",
    metaDescription: "Boost your blog's search rankings with these 10 actionable SEO tips for 2026. From keyword research to technical optimization, improve your organic traffic today.",
    keywords: [
      { word: "SEO", count: 18, density: 2.0 },
      { word: "blog", count: 14, density: 1.6 },
      { word: "keywords", count: 8, density: 0.9 },
      { word: "ranking", count: 6, density: 0.7 },
      { word: "traffic", count: 5, density: 0.6 },
    ],
    headings: [
      { tag: "H1", text: "10 Tips for Better Blog SEO in 2026", hasKeyword: true },
      { tag: "H2", text: "1. Focus on Search Intent", hasKeyword: false },
      { tag: "H2", text: "2. Master Keyword Research", hasKeyword: true },
      { tag: "H2", text: "3. Optimize Your Meta Tags", hasKeyword: true },
      { tag: "H2", text: "4. Improve Page Speed", hasKeyword: false },
      { tag: "H2", text: "5. Build Quality Backlinks", hasKeyword: false },
    ],
    wordCount: 2890,
    readingTime: "13 min",
    issues: [
      { severity: "info", message: "Add a table of contents for long-form content", fix: "Add an anchor-linked TOC at the top — helps users and can appear as sitelinks in search results." },
    ],
    strengths: [
      "Excellent meta description (158 characters)",
      "Strong keyword coverage across headings",
      "Comprehensive long-form content (2,890 words)",
      "Good keyword density distribution",
      "Number in title (increases CTR by ~36%)",
      "Current year in title (signals fresh content)",
    ],
    preview: {
      title: "10 Tips for Better Blog SEO in 2026 | RankFlo",
      description: "Boost your blog's search rankings with these 10 actionable SEO tips for 2026. From keyword research to technical optimization, improve your organic traffic today.",
      url: "rankflo.io › blog › blog-seo-tips-2026",
    },
  },
  {
    postId: "5",
    title: "Content Marketing Strategy for Startups",
    slug: "content-marketing-startups",
    status: "published",
    score: 73,
    url: "https://rankflo.io/blog/content-marketing-startups",
    metaTitle: "Content Marketing Strategy for Startups — How to Get Started",
    metaDescription: "A practical guide to building a content marketing strategy for your startup. Learn how to create content that drives traffic and converts.",
    keywords: [
      { word: "content marketing", count: 10, density: 1.4 },
      { word: "startup", count: 8, density: 1.1 },
      { word: "strategy", count: 7, density: 1.0 },
      { word: "traffic", count: 4, density: 0.6 },
    ],
    headings: [
      { tag: "H1", text: "Content Marketing Strategy for Startups", hasKeyword: true },
      { tag: "H2", text: "Why Content Marketing Matters", hasKeyword: true },
      { tag: "H2", text: "Step 1: Define Your Audience", hasKeyword: false },
      { tag: "H2", text: "Step 2: Create a Content Calendar", hasKeyword: false },
      { tag: "H2", text: "Measuring Results", hasKeyword: false },
    ],
    wordCount: 1520,
    readingTime: "7 min",
    issues: [
      { severity: "warning", message: "Meta title too long (63 characters)", fix: "Shorten to under 60 characters: 'Content Marketing Strategy for Startups | RankFlo'" },
      { severity: "warning", message: "Missing alt text on 2 images", fix: "Add descriptive alt text containing relevant keywords to the infographic and header images." },
      { severity: "info", message: "Could benefit from FAQ schema", fix: "Add FAQ structured data for common questions about startup content marketing." },
      { severity: "info", message: "Only 4 keywords tracked", fix: "Expand keyword targeting to include 'content strategy', 'startup growth', 'organic marketing'." },
    ],
    strengths: [
      "Clear heading structure",
      "Target keyword in H1 and H2",
      "Good meta description length (137 characters)",
    ],
    preview: {
      title: "Content Marketing Strategy for Startups — How to Get Started",
      description: "A practical guide to building a content marketing strategy for your startup. Learn how to create content that drives traffic and converts.",
      url: "rankflo.io › blog › content-marketing-startups",
    },
  },
];

// ─── Score Ring component ──────────────────────────────────
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color =
    score >= 80
      ? "text-green-500 dark:text-accent"
      : score >= 60
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-gray-200 dark:text-gray-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${color} transition-all duration-1000`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${color}`}>{score}</span>
        <span className="text-[10px] text-gray-400">/ 100</span>
      </div>
    </div>
  );
}

// ─── Score Badge ────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 80
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-accent"
      : score >= 60
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  return (
    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {score}
    </span>
  );
}

// ─── Severity Icon ──────────────────────────────────────────
function SeverityIcon({ severity }: { severity: "critical" | "warning" | "info" }) {
  if (severity === "critical") {
    return (
      <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    );
  }
  if (severity === "warning") {
    return (
      <svg className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    );
  }
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

// ─── Google Preview card ────────────────────────────────────
function GooglePreview({ preview, hasIssues }: { preview: PageAudit["preview"]; hasIssues: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">Google Search Preview</p>
      <div className="space-y-0.5">
        <p className="text-sm text-blue-700 dark:text-blue-400 hover:underline cursor-pointer truncate">{preview.title}</p>
        <p className="text-xs text-green-700 dark:text-green-500">{preview.url}</p>
        <p className={`text-xs leading-relaxed ${hasIssues ? "text-gray-400 italic" : "text-gray-500 dark:text-gray-400"}`}>
          {preview.description}
        </p>
      </div>
    </div>
  );
}

// ─── Page detail drawer ─────────────────────────────────────
function PageDetail({ page, onClose }: { page: PageAudit; onClose: () => void }) {
  const criticalCount = page.issues.filter((i) => i.severity === "critical").length;
  const warningCount = page.issues.filter((i) => i.severity === "warning").length;
  const infoCount = page.issues.filter((i) => i.severity === "info").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <button
            onClick={onClose}
            className="mb-3 inline-flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to all pages
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{page.title}</h3>
          <p className="mt-0.5 text-xs text-gray-400">/{page.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            page.status === "published"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-accent"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}>
            {page.status === "published" ? "Published" : "Draft"}
          </span>
          <ScoreRing score={page.score} size={64} />
        </div>
      </div>

      {/* Google Preview */}
      <GooglePreview
        preview={page.preview}
        hasIssues={!page.metaDescription}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Word count", value: page.wordCount.toLocaleString() },
          { label: "Reading time", value: page.readingTime },
          { label: "Keywords", value: String(page.keywords.length) },
          { label: "Headings", value: String(page.headings.length) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-3 text-center dark:border-gray-800 dark:bg-gray-950">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-[10px] text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Issues & Fixes */}
      {page.issues.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Issues & Recommendations</h4>
            <div className="flex gap-1.5">
              {criticalCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {criticalCount} critical
                </span>
              )}
              {warningCount > 0 && (
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  {warningCount} warning{warningCount > 1 ? "s" : ""}
                </span>
              )}
              {infoCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {infoCount} suggestion{infoCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {page.issues.map((issue, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-start gap-2">
                  <SeverityIcon severity={issue.severity} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{issue.message}</p>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed">{issue.fix}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {page.strengths.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            <span className="mr-1.5 inline-block text-green-500">✓</span>
            What&apos;s working well
          </h4>
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-900/10">
            <ul className="space-y-1.5">
              {page.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-green-800 dark:text-green-300">
                  <svg className="mt-0.5 h-3 w-3 shrink-0 text-green-500 dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Keyword Analysis */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Keyword Analysis</h4>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">Keyword</th>
                <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-gray-500">Count</th>
                <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-gray-500">Density</th>
                <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {page.keywords.map((kw) => {
                const status =
                  kw.density >= 1.0 && kw.density <= 2.5
                    ? "optimal"
                    : kw.density > 2.5
                      ? "high"
                      : "low";
                return (
                  <tr key={kw.word} className="bg-white dark:bg-gray-950">
                    <td className="px-3 py-2 text-xs font-medium text-gray-900 dark:text-white">{kw.word}</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500">{kw.count}</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500">{kw.density}%</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        status === "optimal"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-accent"
                          : status === "high"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-1.5 text-[10px] text-gray-400">Ideal keyword density: 1.0% – 2.5% for primary keywords</p>
      </div>

      {/* Heading Structure */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Heading Structure</h4>
        <div className="space-y-1 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
          {page.headings.map((h, i) => (
            <div key={i} className="flex items-center gap-2" style={{ paddingLeft: h.tag === "H1" ? 0 : h.tag === "H2" ? 12 : 24 }}>
              <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-gray-500 dark:bg-gray-800">{h.tag}</span>
              <span className="truncate text-xs text-gray-700 dark:text-gray-300">{h.text}</span>
              {h.hasKeyword && (
                <span className="shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700 dark:bg-green-900/30 dark:text-accent">keyword ✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function SeoHealth({
  data,
  isLoading,
}: {
  data: AuditData | undefined;
  isLoading: boolean;
}) {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "critical" | "good">("all");

  // Use mock data for the per-page view (would come from API in production)
  const pageAudits = MOCK_PAGE_AUDITS;
  const selectedAudit = pageAudits.find((p) => p.postId === selectedPage);

  const filteredPages =
    filter === "all"
      ? pageAudits
      : filter === "critical"
        ? pageAudits.filter((p) => p.score < 70)
        : pageAudits.filter((p) => p.score >= 80);

  // Summary counts
  const criticalPages = pageAudits.filter((p) => p.score < 60).length;
  const warningPages = pageAudits.filter((p) => p.score >= 60 && p.score < 80).length;
  const goodPages = pageAudits.filter((p) => p.score >= 80).length;
  const totalIssues = pageAudits.reduce((sum, p) => sum + p.issues.length, 0);
  const avgScore = Math.round(pageAudits.reduce((sum, p) => sum + p.score, 0) / pageAudits.length);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="h-8 w-8 animate-spin text-green-500 dark:text-accent" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="mt-4 text-sm text-gray-500">Running SEO audit across all pages...</p>
      </div>
    );
  }

  // If a page is selected, show the detail view
  if (selectedAudit) {
    return <PageDetail page={selectedAudit} onClose={() => setSelectedPage(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Overall score header */}
      <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-950">
        <ScoreRing score={data?.overallScore ?? avgScore} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Site SEO Health</h3>
          <p className="mt-1 text-sm text-gray-500">
            {pageAudits.length} pages audited · {totalIssues} issues found
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {avgScore >= 80
              ? "Your content is well-optimized. Keep it up!"
              : avgScore >= 60
                ? "Good foundation. Fix the critical issues below to improve your rankings."
                : "Needs attention. Address the critical issues to improve visibility."}
          </p>
        </div>
        <div className="flex gap-3 sm:flex-col sm:gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 dark:bg-accent" />
            <span className="text-xs text-gray-500">{goodPages} good</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-500">{warningPages} need work</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500">{criticalPages} critical</span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Avg. Score</p>
          <p className={`mt-1 text-2xl font-semibold ${
            avgScore >= 80 ? "text-green-600 dark:text-accent" : avgScore >= 60 ? "text-yellow-600" : "text-red-600"
          }`}>{avgScore}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Total Issues</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{totalIssues}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Pages Indexed</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{pageAudits.filter((p) => p.status === "published").length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs text-gray-500">Avg. Word Count</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {Math.round(pageAudits.reduce((sum, p) => sum + p.wordCount, 0) / pageAudits.length).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {([
          { id: "all" as const, label: "All pages" },
          { id: "critical" as const, label: "Needs work" },
          { id: "good" as const, label: "Well optimized" },
        ]).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.id
                ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Page list */}
      <div className="space-y-2">
        {filteredPages.map((page) => {
          const criticals = page.issues.filter((i) => i.severity === "critical").length;
          const warnings = page.issues.filter((i) => i.severity === "warning").length;

          return (
            <button
              key={page.postId}
              onClick={() => setSelectedPage(page.postId)}
              className="group w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-green-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:hover:border-accent/50"
            >
              <div className="flex items-start gap-4">
                {/* Score ring small */}
                <div className="shrink-0">
                  <ScoreRing score={page.score} size={48} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-gray-900 group-hover:text-green-600 dark:text-white dark:group-hover:text-accent">
                      {page.title}
                    </p>
                    <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                      page.status === "published"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-accent"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {page.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-400">/{page.slug}</p>

                  {/* Meta preview */}
                  <div className="mt-2 rounded-md bg-gray-50 px-2.5 py-1.5 dark:bg-gray-900/50">
                    <p className="truncate text-xs text-blue-600 dark:text-blue-400">{page.metaTitle || "Missing meta title"}</p>
                    <p className="mt-0.5 truncate text-[10px] text-gray-400">
                      {page.metaDescription || "No meta description set"}
                    </p>
                  </div>

                  {/* Issue badges + keywords */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {criticals > 0 && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {criticals} critical
                      </span>
                    )}
                    {warnings > 0 && (
                      <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {warnings} warning{warnings > 1 ? "s" : ""}
                      </span>
                    )}
                    {page.issues.length === 0 && (
                      <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-accent">
                        No issues
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">·</span>
                    <span className="text-[10px] text-gray-400">{page.wordCount.toLocaleString()} words</span>
                    <span className="text-[10px] text-gray-400">·</span>
                    <span className="text-[10px] text-gray-400">{page.keywords.length} keywords</span>
                  </div>
                </div>

                {/* Arrow */}
                <svg className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-green-500 dark:text-gray-600 dark:group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {filteredPages.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white py-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-gray-500">No pages match this filter.</p>
        </div>
      )}

      {/* Common issues summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Most Common Issues</h4>
        <p className="mt-1 text-xs text-gray-500">Fixing these will have the biggest impact on your site&apos;s SEO.</p>
        <div className="mt-4 space-y-2">
          {[
            { issue: "Missing or incomplete meta descriptions", count: 1, severity: "critical" as const },
            { issue: "Thin content (under 1,000 words)", count: 1, severity: "critical" as const },
            { issue: "Missing featured images", count: 1, severity: "warning" as const },
            { issue: "Missing schema markup", count: 2, severity: "warning" as const },
            { issue: "Insufficient internal linking", count: 3, severity: "info" as const },
          ].map((item) => (
            <div key={item.issue} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/50">
              <SeverityIcon severity={item.severity} />
              <span className="flex-1 text-xs text-gray-700 dark:text-gray-300">{item.issue}</span>
              <span className="text-xs text-gray-400">{item.count} page{item.count > 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
