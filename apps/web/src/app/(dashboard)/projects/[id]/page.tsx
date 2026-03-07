"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Tab = "content" | "deployments" | "branding" | "settings";

const PLATFORMS: Record<string, { label: string; color: string; darkColor: string }> = {
  NEXTJS: { label: "Next.js", color: "#000", darkColor: "#fff" },
  REACT: { label: "React", color: "#61DAFB", darkColor: "#61DAFB" },
  VUE: { label: "Vue.js", color: "#4FC08D", darkColor: "#4FC08D" },
  SHOPIFY: { label: "Shopify", color: "#96BF48", darkColor: "#96BF48" },
  WORDPRESS: { label: "WordPress", color: "#21759B", darkColor: "#21759B" },
  WIX: { label: "Wix", color: "#FAAD4D", darkColor: "#FAAD4D" },
  ASTRO: { label: "Astro", color: "#FF5D01", darkColor: "#FF5D01" },
  CUSTOM: { label: "Custom", color: "#6B7280", darkColor: "#9CA3AF" },
};

function SvgIcon({ path, className = "h-4 w-4" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

// Mock data
const MOCK_PROJECT = {
  id: "1",
  name: "RankFlo Marketing Site",
  url: "https://rankflo.io",
  platform: "NEXTJS",
  status: "ACTIVE" as const,
  description: "Main marketing website and blog for RankFlo. Drives organic traffic through SEO-optimized technical content.",
  postCount: 24,
  totalViews: 128400,
  lastDeployedAt: "2 hours ago",
  integrationType: "GITHUB",
  integrationConfig: { repoOwner: "rankflo", repoName: "marketing-site", branch: "main" },
  contentFormat: "MDX",
  contentDir: "content/blog",
  apiKey: "blg_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  brandColors: { primary: "#39FF14", secondary: "#1a1a2e", accent: "#39FF14", background: "#0a0a0a", text: "#ffffff" },
  brandFonts: { heading: { family: "Inter", weight: "700" }, body: { family: "Inter", weight: "400" } },
  createdAt: "Jan 15, 2026",
};

const MOCK_POSTS = [
  { id: "p1", title: "Getting Started with RankFlo SDK", slug: "getting-started-sdk", status: "PUBLISHED", publishedAt: "2 hours ago", views: 1234 },
  { id: "p2", title: "SEO Best Practices for 2026", slug: "seo-best-practices-2026", status: "PUBLISHED", publishedAt: "1 day ago", views: 3456 },
  { id: "p3", title: "How to Drive Organic Traffic with AI Content", slug: "organic-traffic-ai", status: "PUBLISHED", publishedAt: "3 days ago", views: 8901 },
  { id: "p4", title: "Building a Headless CMS Architecture", slug: "headless-cms-architecture", status: "DRAFT", publishedAt: null, views: 0 },
  { id: "p5", title: "Content Strategy for SaaS Companies", slug: "content-strategy-saas", status: "PUBLISHED", publishedAt: "1 week ago", views: 5678 },
  { id: "p6", title: "Technical Writing Tips", slug: "technical-writing-tips", status: "SCHEDULED", publishedAt: null, views: 0 },
];

const MOCK_DEPLOYMENTS = [
  { id: "d1", postTitle: "Getting Started with RankFlo SDK", status: "SUCCESS", deployedAt: "2 hours ago", commitSha: "a1b2c3d" },
  { id: "d2", postTitle: "SEO Best Practices for 2026", status: "SUCCESS", deployedAt: "1 day ago", commitSha: "d4e5f6g" },
  { id: "d3", postTitle: "Content Strategy for SaaS", status: "SUCCESS", deployedAt: "3 days ago", commitSha: "h7i8j9k" },
  { id: "d4", postTitle: "Building a Headless CMS", status: "FAILED", deployedAt: "5 days ago", commitSha: "l0m1n2o", error: "Build failed: MDX syntax error on line 45" },
];

function formatViews(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-500 dark:bg-accent",
    SETUP: "bg-amber-400",
    PAUSED: "bg-gray-400 dark:bg-gray-500",
    PUBLISHED: "bg-green-500 dark:bg-accent",
    DRAFT: "bg-gray-400 dark:bg-gray-500",
    SCHEDULED: "bg-blue-400",
    SUCCESS: "bg-green-500 dark:bg-accent",
    FAILED: "bg-red-400",
    PENDING: "bg-amber-400",
    DEPLOYING: "bg-blue-400",
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[status] || "bg-gray-400 dark:bg-gray-600"}`} />;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [tab, setTab] = useState<Tab>("content");
  const [showApiKey, setShowApiKey] = useState(false);

  const project = MOCK_PROJECT;
  const platformInfo = PLATFORMS[project.platform] || PLATFORMS.CUSTOM;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "content", label: "Content", count: MOCK_POSTS.length },
    { id: "deployments", label: "Deployments", count: MOCK_DEPLOYMENTS.length },
    { id: "branding", label: "Branding" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/projects"
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:hover:bg-gray-900 dark:hover:text-white"
        >
          <SvgIcon path="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-700 dark:bg-gray-800 dark:text-white">
              {project.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{project.name}</h1>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200 dark:bg-accent-1 dark:text-accent dark:border-accent/20">
                  <StatusDot status={project.status} />
                  {project.status}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-sm text-gray-500">
                <span className="font-medium text-gray-700 dark:text-gray-300">{platformInfo.label}</span>
                {project.url && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700">·</span>
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 dark:hover:text-accent transition-colors">
                      {project.url.replace("https://", "")}
                    </a>
                  </>
                )}
                <span className="text-gray-300 dark:text-gray-700">·</span>
                <span>Created {project.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/posts/new"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
          >
            <SvgIcon path="M12 4.5v15m7.5-7.5h-15" />
            New post
          </Link>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:hover:bg-gray-900 dark:hover:text-white">
            <SvgIcon path="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Posts", value: project.postCount.toString(), icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
          { label: "Total views", value: formatViews(project.totalViews), icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" },
          { label: "Last deployed", value: project.lastDeployedAt || "Never", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Integration", value: project.integrationType || "None", icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-2">
              <SvgIcon path={stat.icon} className="h-4 w-4 text-gray-400 dark:text-gray-600" />
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id ? "text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800">{t.count}</span>
            )}
            {tab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 dark:bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "content" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {["All", "Published", "Draft", "Scheduled"].map((f, i) => (
                <button
                  key={f}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    i === 0 ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white">
              <SvgIcon path="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              Deploy all
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-950">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell">Published</th>
                  <th className="hidden px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 xl:table-cell">Views</th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {MOCK_POSTS.map((post) => (
                  <tr key={post.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-5 py-4">
                      <Link href={`/posts/${post.slug}/edit`} className="text-sm font-medium text-gray-900 hover:text-green-600 transition-colors dark:text-white dark:hover:text-accent">
                        {post.title}
                      </Link>
                      <p className="text-xs text-gray-400 dark:text-gray-600">/{post.slug}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
                        post.status === "PUBLISHED" ? "bg-green-50 text-green-700 border border-green-200 dark:bg-accent-1 dark:text-accent dark:border-accent/20" :
                        post.status === "SCHEDULED" ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" :
                        "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        <StatusDot status={post.status} />
                        {post.status}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <span className="text-sm text-gray-400 dark:text-gray-600">{post.publishedAt || "—"}</span>
                    </td>
                    <td className="hidden px-5 py-4 text-right xl:table-cell">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{post.views > 0 ? formatViews(post.views) : "—"}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300" title="Edit">
                          <SvgIcon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300" title="Deploy">
                          <SvgIcon path="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "deployments" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-950">
            <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {MOCK_DEPLOYMENTS.map((dep) => (
                <div key={dep.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      dep.status === "SUCCESS" ? "bg-green-50 dark:bg-accent/10" : "bg-red-50 dark:bg-red-500/10"
                    }`}>
                      {dep.status === "SUCCESS" ? (
                        <SvgIcon path="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-green-600 dark:text-accent" />
                      ) : (
                        <SvgIcon path="M6 18L18 6M6 6l12 12" className="h-4 w-4 text-red-500 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{dep.postTitle}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-xs text-gray-400 font-mono dark:text-gray-500">{dep.commitSha}</code>
                        <span className="text-xs text-gray-400 dark:text-gray-600">{dep.deployedAt}</span>
                      </div>
                      {dep.error && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400">{dep.error}</p>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
                    dep.status === "SUCCESS" ? "bg-green-50 text-green-700 border border-green-200 dark:bg-accent-1 dark:text-accent dark:border-accent/20" : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                  }`}>
                    <StatusDot status={dep.status} />
                    {dep.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "branding" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Brand Colors</h3>
            <div className="flex flex-col gap-3">
              {Object.entries(project.brandColors).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{key}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded border border-gray-200 dark:border-gray-700" style={{ backgroundColor: value }} />
                    <code className="text-xs text-gray-400 font-mono dark:text-gray-500">{value}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Typography</h3>
            <div className="flex flex-col gap-3">
              {project.brandFonts && Object.entries(project.brandFonts).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{key}</span>
                  <span className="text-sm text-gray-900 dark:text-white">{(value as any).family} ({(value as any).weight})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-800">
              <span className="text-xs text-gray-500">Live preview — how blog posts will appear on your site</span>
            </div>
            <div className="p-8" style={{ backgroundColor: project.brandColors.background }}>
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="h-2 w-16 rounded" style={{ backgroundColor: project.brandColors.primary, opacity: 0.8 }} />
                <div className="h-6 w-3/4 rounded" style={{ backgroundColor: project.brandColors.text, opacity: 0.9 }} />
                <div className="space-y-2">
                  <div className="h-2.5 w-full rounded" style={{ backgroundColor: project.brandColors.text, opacity: 0.2 }} />
                  <div className="h-2.5 w-5/6 rounded" style={{ backgroundColor: project.brandColors.text, opacity: 0.2 }} />
                  <div className="h-2.5 w-4/6 rounded" style={{ backgroundColor: project.brandColors.text, opacity: 0.2 }} />
                </div>
                <div className="inline-flex h-8 items-center rounded-lg px-4 text-xs font-semibold" style={{ backgroundColor: project.brandColors.primary, color: project.brandColors.background }}>
                  Read more
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="flex flex-col gap-6">
          {/* Integration */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Integration</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                <span className="text-sm text-gray-900 dark:text-white">{project.integrationType}</span>
              </div>
              {project.integrationConfig.repoOwner && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Repository</span>
                  <span className="text-sm text-gray-900 font-mono dark:text-white">{project.integrationConfig.repoOwner}/{project.integrationConfig.repoName}</span>
                </div>
              )}
              {project.integrationConfig.branch && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Branch</span>
                  <span className="text-sm text-gray-900 font-mono dark:text-white">{project.integrationConfig.branch}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Content format</span>
                <span className="text-sm text-gray-900 dark:text-white">{project.contentFormat}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Content directory</span>
                <span className="text-sm text-gray-900 font-mono dark:text-white">{project.contentDir}</span>
              </div>
            </div>
          </div>

          {/* API Key */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Headless CMS API Key</h3>
            <p className="text-xs text-gray-500 mb-4">Use this key to fetch content from RankFlo in your application</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 font-mono dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                {showApiKey ? project.apiKey : "blg_" + "•".repeat(40)}
              </code>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                <SvgIcon path={showApiKey ? "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" : "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
              </button>
              <button className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white">
                Copy
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Quick start</p>
              <pre className="text-xs text-gray-500 font-mono overflow-x-auto">
{`fetch('https://api.rankflo.io/v1/posts', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})`}
              </pre>
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-950/10">
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Danger zone</h3>
            <p className="text-xs text-gray-500 mb-4">These actions are irreversible. Posts will be unlinked but not deleted.</p>
            <div className="flex gap-3">
              <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-500 transition-colors hover:border-amber-300 hover:text-amber-600 dark:border-gray-800 dark:text-gray-400 dark:hover:border-amber-800 dark:hover:text-amber-400">
                Pause project
              </button>
              <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30">
                Delete project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
