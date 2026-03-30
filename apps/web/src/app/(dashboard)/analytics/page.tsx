"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

const RANGES = [
  { label: "7d",  days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1yr", days: 365 },
] as const;

const TABS = ["Overview", "Posts", "Sources", "Locations"] as const;
type Tab = typeof TABS[number];

function dateRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from, to };
}

function fmtNum(n: number) { return n.toLocaleString(); }

/* ── Time series area chart ────────────────────────────────────────────────── */
function TimeSeriesChart({
  data,
  isLoading,
}: {
  data: { date: string; pageviews: number; visitors: number }[];
  isLoading: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 800, H = 160, PAD = { t: 8, r: 16, b: 28, l: 40 };

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;
  }
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-400 dark:text-gray-600">No traffic data yet</p>
      </div>
    );
  }

  const maxPV = Math.max(...data.map((d) => d.pageviews), 1);
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const px = (i: number) => PAD.l + (i / (data.length - 1 || 1)) * chartW;
  const py = (v: number) => PAD.t + chartH - (v / maxPV) * chartH;

  // Polyline points
  const pvPts = data.map((d, i) => `${px(i)},${py(d.pageviews)}`).join(" ");
  const visPts = data.map((d, i) => `${px(i)},${py(d.visitors)}`).join(" ");

  // Area fill (close path to bottom)
  const pvArea = `M ${data.map((d, i) => `${px(i)},${py(d.pageviews)}`).join(" L ")} L ${px(data.length - 1)},${PAD.t + chartH} L ${PAD.l},${PAD.t + chartH} Z`;

  // Y-axis labels
  const yTicks = [0, 0.5, 1].map((f) => ({
    y: PAD.t + chartH - f * chartH,
    label: Math.round(f * maxPV).toLocaleString(),
  }));

  // X-axis labels (show ~5)
  const step = Math.max(1, Math.floor(data.length / 5));
  const xLabels = data
    .map((d, i) => ({ i, label: d.date.slice(5) }))
    .filter((_, i) => i % step === 0 || i === data.length - 1);

  const hoveredData = hovered !== null ? data[hovered] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y grid */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.l} y1={t.y} x2={W - PAD.r} y2={t.y} stroke="currentColor" strokeWidth={0.5} className="text-gray-100 dark:text-gray-800" />
            <text x={PAD.l - 4} y={t.y + 4} textAnchor="end" fontSize={10} className="fill-gray-400 dark:fill-gray-600">{t.label}</text>
          </g>
        ))}

        {/* Area fill */}
        <path d={pvArea} fill="url(#pvGrad)" />

        {/* Lines */}
        <polyline points={pvPts} fill="none" stroke="#22c55e" strokeWidth={2} strokeLinejoin="round" />
        <polyline points={visPts} fill="none" stroke="#60a5fa" strokeWidth={1.5} strokeLinejoin="round" strokeDasharray="4 2" />

        {/* X labels */}
        {xLabels.map(({ i, label }) => (
          <text key={i} x={px(i)} y={H - 4} textAnchor="middle" fontSize={10} className="fill-gray-400 dark:fill-gray-600">{label}</text>
        ))}

        {/* Hover target rects */}
        {data.map((d, i) => {
          const x = px(i);
          const slotW = data.length > 1 ? chartW / (data.length - 1) : chartW;
          return (
            <rect
              key={i}
              x={x - slotW / 2}
              y={PAD.t}
              width={slotW}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
            />
          );
        })}

        {/* Hovered indicator */}
        {hovered !== null && (
          <>
            <line x1={px(hovered)} y1={PAD.t} x2={px(hovered)} y2={PAD.t + chartH} stroke="currentColor" strokeWidth={1} className="text-gray-300 dark:text-gray-700" />
            <circle cx={px(hovered)} cy={py(data[hovered].pageviews)} r={3.5} fill="#22c55e" />
            <circle cx={px(hovered)} cy={py(data[hovered].visitors)} r={3} fill="#60a5fa" />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hoveredData && (
        <div className="pointer-events-none absolute left-10 top-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium text-gray-900 dark:text-white">{hoveredData.date}</p>
          <p className="text-xs text-green-600 dark:text-green-400">{fmtNum(hoveredData.pageviews)} views</p>
          <p className="text-xs text-blue-500">{fmtNum(hoveredData.visitors)} visitors</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Pageviews</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded-full bg-blue-400" style={{ backgroundImage: "repeating-linear-gradient(to right, #60a5fa 0 4px, transparent 4px 6px)" }} />
          <span className="text-xs text-gray-500 dark:text-gray-400">Visitors</span>
        </div>
      </div>
    </div>
  );
}

/* ── Stat card ─────────────────────────────────────────────────────────────── */
function StatCard({
  label, value, sub, isLoading, accent,
}: {
  label: string; value: string | number | undefined; sub?: string | null; isLoading: boolean; accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20" : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"}`}>
      <p className={`text-sm font-medium ${accent ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>{label}</p>
      {isLoading ? (
        <div className="mt-2 h-8 w-24 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
      ) : (
        <>
          <p className={`mt-1 text-3xl font-bold tracking-tight ${accent ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
            {typeof value === "number" ? fmtNum(value) : (value ?? "—")}
          </p>
          {sub && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">{sub}</p>}
        </>
      )}
    </div>
  );
}

/* ── Generic bar table ─────────────────────────────────────────────────────── */
function BarTable({
  title, rows, colA, colB, isLoading, renderLabel,
}: {
  title: string;
  rows: { label: string | null; count: number }[];
  colA: string; colB: string;
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
  rows, isLoading,
}: {
  rows: { postId: string; title: string; slug: string; path: string; views: number; status: string }[];
  isLoading: boolean;
}) {
  const max = rows.length > 0 ? Math.max(...rows.map((r) => r.views)) : 1;
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Post Performance</h3>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">Blog posts matched to tracked page views</p>
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
              <div className="absolute inset-y-0 left-0 bg-green-50 dark:bg-green-950/20" style={{ width: `${(row.views / max) * 100}%`, opacity: 0.6 }} />
              <div className="relative grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <Link href={`/posts/${row.slug}/edit`} className="min-w-0 group">
                  <p className="truncate text-sm font-medium text-gray-900 group-hover:text-green-600 dark:text-white dark:group-hover:text-accent">{row.title}</p>
                  <p className="truncate text-xs text-gray-400 dark:text-gray-600">{row.path}</p>
                </Link>
                <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white text-right">{row.views.toLocaleString()}</span>
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

/* ── AI Referrers widget ───────────────────────────────────────────────────── */
function AiReferrersCard({ data, isLoading }: { data: { label: string; platform: string; visits: number }[] | undefined; isLoading: boolean }) {
  const total = data?.reduce((s, r) => s + r.visits, 0) ?? 0;
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Referrers</h3>
          {!isLoading && total > 0 && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:bg-green-950/30 dark:text-green-400">
              {total} visits from AI
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">Traffic arriving from AI platforms</p>
      </div>
      {isLoading ? (
        <div className="space-y-3 p-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-5 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : !data?.length ? (
        <div className="px-5 py-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">No AI referrer traffic yet</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-700">When visitors arrive from ChatGPT, Perplexity, or Claude, they&apos;ll appear here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-900">
          {data.map((r) => (
            <div key={r.platform} className="flex items-center justify-between px-5 py-2.5">
              <span className="text-sm text-gray-700 dark:text-gray-300">{r.label}</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-full rounded-full bg-purple-500" style={{ width: `${(r.visits / total) * 100}%` }} />
                </div>
                <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white w-8 text-right">{r.visits}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Engagement metrics row ────────────────────────────────────────────────── */
function EngagementRow({ data, isLoading }: { data: { avgDuration: number; avgPagesPerSession: number; totalSessions: number; totalPageviews: number } | undefined; isLoading: boolean }) {
  function fmtDuration(sec: number) {
    if (!sec) return "—";
    if (sec < 60) return `${sec}s`;
    return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  }
  const items = [
    { label: "Avg. Session Duration", value: isLoading ? null : fmtDuration(data?.avgDuration ?? 0) },
    { label: "Pages / Session", value: isLoading ? null : (data?.avgPagesPerSession?.toFixed(1) ?? "—") },
    { label: "Total Sessions", value: isLoading ? null : (data?.totalSessions?.toLocaleString() ?? "—") },
  ];
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
          {isLoading ? (
            <div className="mt-1.5 h-6 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          ) : (
            <p className="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{item.value}</p>
          )}
        </div>
      ))}
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
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between px-5 py-3.5 text-left">
        <div className="flex items-center gap-2.5">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Tracking snippet {projectName ? `— ${projectName}` : ""}
          </span>
          {projectKey ? (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:bg-green-900/20 dark:text-green-400">Key ready</span>
          ) : (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">Select a project</span>
          )}
        </div>
        <svg className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 dark:border-gray-800">
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Paste this snippet in your blog&apos;s <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">&lt;head&gt;</code>.
          </p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-green-400 dark:bg-black">{snippet}</pre>
            <button onClick={copy} className="absolute right-2 top-2 rounded-md bg-gray-800 px-2.5 py-1 text-[10px] font-medium text-gray-300 transition-colors hover:bg-gray-700">
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
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
  const timeSeriesQ = trpc.analytics.timeSeries.useQuery(queryBase, { enabled: activeTab === "Overview" });
  const engagementQ = trpc.analytics.engagement.useQuery(queryBase, { enabled: activeTab === "Overview" });
  const aiReferrersQ = trpc.analytics.aiReferrers.useQuery(queryBase, { enabled: activeTab === "Overview" || activeTab === "Sources" });
  const topPagesQ   = trpc.analytics.topPages.useQuery({ ...queryBase, limit: 10 }, { enabled: activeTab === "Overview" });
  const topPostsQ   = trpc.analytics.topPosts.useQuery({ ...queryBase, limit: 20 }, { enabled: activeTab === "Posts" });
  const referrersQ  = trpc.analytics.topReferrers.useQuery({ ...queryBase, limit: 15 }, { enabled: activeTab === "Sources" });
  const devicesQ    = trpc.analytics.devices.useQuery(queryBase, { enabled: activeTab === "Sources" || activeTab === "Overview" });
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
            Traffic, engagement, and performance across your content.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
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
      <SetupPanel projectKey={selectedProject?.apiKey ?? undefined} projectName={selectedProject?.name} />

      {/* Overview stats */}
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
            <div className="flex flex-col gap-6">
              {/* Time series */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Traffic over time</h3>
                  <Link href="/analytics/content" className="text-xs text-gray-500 hover:text-green-600 dark:hover:text-accent">
                    Content breakdown →
                  </Link>
                </div>
                <TimeSeriesChart data={timeSeriesQ.data ?? []} isLoading={timeSeriesQ.isLoading} />
              </div>

              {/* Engagement */}
              <EngagementRow data={engagementQ.data} isLoading={engagementQ.isLoading} />

              {/* AI referrers + top pages */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <AiReferrersCard data={aiReferrersQ.data} isLoading={aiReferrersQ.isLoading} />
                <BarTable
                  title="Top Pages"
                  rows={(topPagesQ.data ?? []).map((r) => ({ label: r.path, count: r.views }))}
                  colA="Page" colB="Views"
                  isLoading={topPagesQ.isLoading}
                />
              </div>

              {/* Devices */}
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
            <PostsTable rows={topPostsQ.data ?? []} isLoading={topPostsQ.isLoading} />
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
              <AiReferrersCard data={aiReferrersQ.data} isLoading={aiReferrersQ.isLoading} />
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
