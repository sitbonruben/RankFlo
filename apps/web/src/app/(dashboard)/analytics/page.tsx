"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

const RANGES = [
  { label: "7d",   days: 7 },
  { label: "30d",  days: 30 },
  { label: "90d",  days: 90 },
  { label: "1yr",  days: 365 },
] as const;

const TABS = ["Overview", "Posts", "Sources", "Locations"] as const;
type Tab = typeof TABS[number];

function dateRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from, to };
}

function fmtSeconds(sec: number) {
  if (!sec) return "—";
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

/* ── Stat card ─────────────────────────────────────────────────────────────── */
function StatCard({ label, value, isLoading }: { label: string; value: number | undefined; isLoading: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      {isLoading ? (
        <div className="mt-2 h-8 w-24 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
      ) : (
        <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {(value ?? 0).toLocaleString()}
        </p>
      )}
    </div>
  );
}

/* ── Generic bar table ─────────────────────────────────────────────────────── */
function BarTable({
  title,
  rows,
  colA,
  colB,
  isLoading,
  renderLabel,
}: {
  title: string;
  rows: { label: string | null; count: number }[];
  colA: string;
  colB: string;
  isLoading: boolean;
  renderLabel?: (label: string | null) => React.ReactNode;
}) {
  const max = rows.length > 0 ? Math.max(...rows.map((r) => r.count)) : 1;
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {isLoading ? (
        <div className="space-y-3 p-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-gray-100 dark:bg-gray-800" style={{ width: `${70 - i * 10}%` }} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-400 dark:text-gray-600">No data yet</p>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-900">
          <div className="flex items-center justify-between px-5 py-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-600">
            <span>{colA}</span><span>{colB}</span>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="relative px-5 py-2.5">
              <div
                className="absolute inset-y-0 left-0 bg-green-50 dark:bg-green-950/20"
                style={{ width: `${(row.count / max) * 100}%`, opacity: 0.7 }}
              />
              <div className="relative flex items-center justify-between">
                <span className="max-w-[70%] truncate text-sm text-gray-700 dark:text-gray-300">
                  {renderLabel ? renderLabel(row.label) : (row.label ?? "(direct)")}
                </span>
                <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                  {row.count.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Posts analytics table ─────────────────────────────────────────────────── */
function PostsTable({
  rows,
  isLoading,
}: {
  rows: { postId: string; title: string; slug: string; path: string; views: number; status: string }[];
  isLoading: boolean;
}) {
  const max = rows.length > 0 ? Math.max(...rows.map((r) => r.views)) : 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Post Performance</h3>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">
          Blog posts matched to tracked page views by URL slug
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-gray-100 dark:bg-gray-800" style={{ width: `${80 - i * 8}%` }} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-600">No post traffic matched yet</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-700">
            Make sure the tracker is on your blog and posts have been visited
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-900">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-600">
            <span>Post</span>
            <span className="text-right">Views</span>
            <span className="text-right w-14">Status</span>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="relative px-5 py-3">
              {/* progress bar background */}
              <div
                className="absolute inset-y-0 left-0 bg-green-50 dark:bg-green-950/20"
                style={{ width: `${(row.views / max) * 100}%`, opacity: 0.6 }}
              />
              <div className="relative grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <Link
                  href={`/posts/${row.slug}/edit`}
                  className="min-w-0 group"
                >
                  <p className="truncate text-sm font-medium text-gray-900 group-hover:text-green-600 dark:text-white dark:group-hover:text-accent">
                    {row.title}
                  </p>
                  <p className="truncate text-xs text-gray-400 dark:text-gray-600">{row.path}</p>
                </Link>
                <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white text-right">
                  {row.views.toLocaleString()}
                </span>
                <span className={`inline-flex justify-center rounded-md px-2 py-0.5 text-xs font-medium w-14 ${
                  row.status === "PUBLISHED"
                    ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500"
                }`}>
                  {row.status === "PUBLISHED" ? "Live" : row.status.charAt(0) + row.status.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Setup snippet ─────────────────────────────────────────────────────────── */
function SetupPanel({ projectKey, projectName }: { projectKey?: string; projectName?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const snippet = projectKey
    ? `<script src="https://app.rankflo.io/tracker.js"\n  data-project-key="${projectKey}"\n  async></script>`
    : `<!-- Select a project above to get your key -->\n<script src="https://app.rankflo.io/tracker.js"\n  data-project-key="blg_YOUR_KEY"\n  async></script>`;

  const copy = () => {
    void navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Tracking snippet {projectName ? `— ${projectName}` : ""}
          </span>
          {projectKey ? (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:bg-green-900/20 dark:text-green-400">
              Key ready
            </span>
          ) : (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              Select a project
            </span>
          )}
        </div>
        <svg className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 dark:border-gray-800">
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Paste this snippet in your blog&apos;s{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">&lt;head&gt;</code>.{" "}
            Uses the same key as the Content API — no extra credentials needed.
          </p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-green-400 dark:bg-black">
              {snippet}
            </pre>
            <button
              onClick={copy}
              className="absolute right-2 top-2 rounded-md bg-gray-800 px-2.5 py-1 text-[10px] font-medium text-gray-300 transition-colors hover:bg-gray-700"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-600">
            The tracker fires on every page view and handles SPA navigation automatically.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [rangeIdx, setRangeIdx] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const range = useMemo(() => dateRange(RANGES[rangeIdx].days), [rangeIdx]);

  const projectsQuery = trpc.project.list.useQuery({});
  const projects = projectsQuery.data?.items ?? [];
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const queryBase = { ...range, ...(selectedProjectId ? { projectId: selectedProjectId } : {}) };

  const overviewQ   = trpc.analytics.overview.useQuery(queryBase);
  const topPagesQ   = trpc.analytics.topPages.useQuery({ ...queryBase, limit: 10 }, { enabled: activeTab === "Overview" });
  const topPostsQ   = trpc.analytics.topPosts.useQuery({ ...queryBase, limit: 20 }, { enabled: activeTab === "Posts" });
  const referrersQ  = trpc.analytics.topReferrers.useQuery({ ...queryBase, limit: 15 }, { enabled: activeTab === "Sources" });
  const devicesQ    = trpc.analytics.devices.useQuery(queryBase, { enabled: activeTab === "Sources" });
  const countriesQ  = trpc.analytics.countries.useQuery({ ...queryBase, limit: 15 }, { enabled: activeTab === "Locations" });

  const hasData = (overviewQ.data?.pageViews ?? 0) > 0;
  const isLoading = overviewQ.isLoading;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Traffic and performance across your blog content.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          {/* Project selector */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {/* Date range tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
            {RANGES.map((r, i) => (
              <button
                key={i}
                onClick={() => setRangeIdx(i)}
                className={[
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  rangeIdx === i
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
                ].join(" ")}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tracking snippet */}
      <SetupPanel
        projectKey={selectedProject?.apiKey ?? undefined}
        projectName={selectedProject?.name}
      />

      {/* Overview stats — always visible */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Page Views"      value={overviewQ.data?.pageViews}      isLoading={isLoading} />
        <StatCard label="Unique Visitors" value={overviewQ.data?.uniqueVisitors} isLoading={isLoading} />
        <StatCard label="Sessions"        value={overviewQ.data?.sessions}       isLoading={isLoading} />
      </div>

      {/* No data hint */}
      {!isLoading && !hasData && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No traffic data yet</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Expand the tracking snippet above and add it to your blog&apos;s{" "}
            <code className="rounded bg-gray-200 px-1 text-xs dark:bg-gray-800">&lt;head&gt;</code> to start collecting data.
          </p>
        </div>
      )}

      {/* Tabs */}
      {(isLoading || hasData) && (
        <>
          <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab
                    ? "border-green-500 text-gray-900 dark:border-accent dark:text-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
                ].join(" ")}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BarTable
                title="Top Pages"
                rows={(topPagesQ.data ?? []).map((r) => ({ label: r.path, count: r.views }))}
                colA="Page" colB="Views"
                isLoading={topPagesQ.isLoading}
              />
              <BarTable
                title="Devices"
                rows={(devicesQ.data ?? []).map((r) => ({ label: r.device, count: r.count }))}
                colA="Device" colB="Views"
                isLoading={devicesQ.isLoading}
              />
            </div>
          )}

          {/* Posts tab */}
          {activeTab === "Posts" && (
            <PostsTable
              rows={topPostsQ.data ?? []}
              isLoading={topPostsQ.isLoading}
            />
          )}

          {/* Sources tab */}
          {activeTab === "Sources" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BarTable
                title="Top Referrers"
                rows={(referrersQ.data ?? []).map((r) => ({ label: r.referrer, count: r.views }))}
                colA="Source" colB="Views"
                isLoading={referrersQ.isLoading}
                renderLabel={(label) =>
                  label ? (
                    <a href={label} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 dark:hover:text-accent">
                      {label.replace(/^https?:\/\//, "").split("/")[0]}
                    </a>
                  ) : "(direct / none)"
                }
              />
              <BarTable
                title="Devices"
                rows={(devicesQ.data ?? []).map((r) => ({ label: r.device, count: r.count }))}
                colA="Device" colB="Views"
                isLoading={devicesQ.isLoading}
              />
            </div>
          )}

          {/* Locations tab */}
          {activeTab === "Locations" && (
            <BarTable
              title="Countries"
              rows={(countriesQ.data ?? []).map((r) => ({ label: r.country, count: r.visitors }))}
              colA="Country" colB="Visitors"
              isLoading={countriesQ.isLoading}
            />
          )}
        </>
      )}
    </div>
  );
}
