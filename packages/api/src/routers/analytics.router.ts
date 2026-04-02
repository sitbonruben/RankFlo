import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@rankflo/db";

import { router, orgProcedure } from "../trpc";

// ─── AI referrer domains ────────────────────────────────────
const AI_REFERRER_DOMAINS: { domain: string; label: string; platform: string }[] = [
  { domain: "perplexity.ai", label: "Perplexity", platform: "perplexity" },
  { domain: "claude.ai", label: "Claude", platform: "claude" },
  { domain: "chat.openai.com", label: "ChatGPT", platform: "chatgpt" },
  { domain: "chatgpt.com", label: "ChatGPT", platform: "chatgpt" },
  { domain: "gemini.google.com", label: "Google Gemini", platform: "gemini" },
  { domain: "copilot.microsoft.com", label: "Copilot", platform: "copilot" },
  { domain: "bing.com", label: "Bing AI", platform: "copilot" },
  { domain: "you.com", label: "You.com", platform: "other" },
  { domain: "phind.com", label: "Phind", platform: "other" },
  { domain: "grok.com", label: "Grok", platform: "grok" },
  { domain: "poe.com", label: "Poe", platform: "other" },
];

const dateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  projectId: z.string().optional(),
});

function baseWhere(
  organizationId: string,
  from: Date,
  to: Date,
  projectId?: string,
) {
  return {
    organizationId,
    eventType: "pageview",
    timestamp: { gte: from, lte: to },
    ...(projectId ? { projectId } : {}),
  } as const;
}

export const analyticsRouter = router({
  overview: orgProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      const { from, to, projectId } = input;
      const where = baseWhere(ctx.organizationId, from, to, projectId);

      const [pageViews, visitors, sessions] = await Promise.all([
        ctx.db.analyticsEvent.count({ where }),
        ctx.db.analyticsEvent.groupBy({ by: ["visitorId"], where }),
        ctx.db.analyticsEvent.groupBy({ by: ["sessionId"], where }),
      ]);

      return {
        pageViews,
        uniqueVisitors: visitors.length,
        sessions: sessions.length,
      };
    }),

  topPages: orgProcedure
    .input(dateRangeSchema.extend({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const where = {
        ...baseWhere(ctx.organizationId, input.from, input.to, input.projectId),
        path: { not: null },
      };
      const pages = await ctx.db.analyticsEvent.groupBy({
        by: ["path"],
        where,
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: input.limit,
      });
      return pages.map((p) => ({ path: p.path, views: p._count.path }));
    }),

  topReferrers: orgProcedure
    .input(dateRangeSchema.extend({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const where = {
        ...baseWhere(ctx.organizationId, input.from, input.to, input.projectId),
        referrer: { not: null },
      };
      const referrers = await ctx.db.analyticsEvent.groupBy({
        by: ["referrer"],
        where,
        _count: { referrer: true },
        orderBy: { _count: { referrer: "desc" } },
        take: input.limit,
      });
      return referrers.map((r) => ({ referrer: r.referrer, views: r._count.referrer }));
    }),

  devices: orgProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      const where = {
        ...baseWhere(ctx.organizationId, input.from, input.to, input.projectId),
        device: { not: null },
      };
      const devices = await ctx.db.analyticsEvent.groupBy({
        by: ["device"],
        where,
        _count: { device: true },
        orderBy: { _count: { device: "desc" } },
      });
      return devices.map((d) => ({ device: d.device, count: d._count.device }));
    }),

  countries: orgProcedure
    .input(dateRangeSchema.extend({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const where = {
        ...baseWhere(ctx.organizationId, input.from, input.to, input.projectId),
        country: { not: null },
      };
      const countries = await ctx.db.analyticsEvent.groupBy({
        by: ["country"],
        where,
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: input.limit,
      });
      return countries.map((c) => ({ country: c.country, visitors: c._count.country }));
    }),

  // Per-post analytics — matches top paths to published post slugs
  topPosts: orgProcedure
    .input(dateRangeSchema.extend({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const where = {
        ...baseWhere(ctx.organizationId, input.from, input.to, input.projectId),
        path: { not: null },
      };

      // Get top paths with view count, unique visitors, and avg duration
      const topPaths = await ctx.db.analyticsEvent.groupBy({
        by: ["path"],
        where,
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: input.limit * 4, // fetch extra since most paths won't match a post
      });

      // Extract slugs — take the last non-empty segment of each path
      const slugMap = new Map<string, { views: number; path: string }>();
      for (const row of topPaths) {
        const parts = (row.path ?? "").split("/").filter(Boolean);
        const slug = parts[parts.length - 1];
        if (slug && !slugMap.has(slug)) {
          slugMap.set(slug, { views: row._count.path, path: row.path ?? "" });
        }
      }

      // Find posts matching these slugs
      const posts = await ctx.db.post.findMany({
        where: {
          organizationId: ctx.organizationId,
          slug: { in: Array.from(slugMap.keys()) },
          deletedAt: null,
        },
        select: { id: true, title: true, slug: true, status: true },
      });

      // Merge and sort by views
      return posts
        .map((post) => {
          const stats = slugMap.get(post.slug);
          return {
            postId: post.id,
            title: post.title ?? post.slug,
            slug: post.slug,
            path: stats?.path ?? `/${post.slug}`,
            views: stats?.views ?? 0,
            status: post.status,
          };
        })
        .sort((a, b) => b.views - a.views)
        .slice(0, input.limit);
    }),

  // Unique visitor counts for a set of slugs (used by posts list page)
  postViews: orgProcedure
    .input(
      dateRangeSchema.extend({
        slugs: z.array(z.string()).max(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.slugs.length === 0) return {};
      const where = {
        organizationId: ctx.organizationId,
        eventType: "pageview",
        timestamp: { gte: input.from, lte: input.to },
        ...(input.projectId ? { projectId: input.projectId } : {}),
        path: { in: input.slugs.flatMap((s) => [`/${s}`, `/blog/${s}`, `/posts/${s}`]) },
      };
      const rows = await ctx.db.analyticsEvent.groupBy({
        by: ["path"],
        where,
        _count: { path: true },
      });
      // Collapse back to slug → count
      const result: Record<string, number> = {};
      for (const row of rows) {
        const slug = (row.path ?? "").split("/").filter(Boolean).pop() ?? "";
        if (slug) result[slug] = (result[slug] ?? 0) + row._count.path;
      }
      return result;
    }),

  // Top site search queries
  topSearchQueries: orgProcedure
    .input(z.object({ days: z.number().default(30), limit: z.number().default(25) }))
    .query(async ({ ctx, input }) => {
      const from = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      const rows = await ctx.db.searchQuery.groupBy({
        by: ["query"],
        where: { organizationId: ctx.organizationId, timestamp: { gte: from } },
        _count: { query: true },
        _avg: { resultsCount: true, clickPosition: true },
        orderBy: { _count: { query: "desc" } },
        take: input.limit,
      });
      return rows.map((r) => ({
        query: r.query,
        searches: r._count.query,
        avgResults: Math.round(r._avg.resultsCount ?? 0),
        avgClickPosition: r._avg.clickPosition ? Number(r._avg.clickPosition.toFixed(1)) : null,
      }));
    }),

  // Google PageSpeed Insights (called server-side, no API key needed for basic usage)
  pageSpeed: orgProcedure
    .input(
      z.object({
        url: z.string().url(),
        strategy: z.enum(["mobile", "desktop"]).default("mobile"),
      }),
    )
    .mutation(async ({ input }) => {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(input.url)}&strategy=${input.strategy}&category=performance`;
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "PageSpeed API request failed" });
      }
      const data = (await res.json()) as Record<string, unknown>;
      const lr = data.lighthouseResult as Record<string, unknown> | undefined;
      const audits = (lr?.audits ?? {}) as Record<string, Record<string, unknown>>;
      const score = Math.round(((lr?.categories as Record<string, Record<string, number>> | undefined)?.performance?.score ?? 0) * 100);

      function metric(key: string) {
        const a = audits[key];
        if (!a) return null;
        return { value: a.displayValue as string, score: a.score as number };
      }

      const opps = Object.entries(audits)
        .filter(([, a]) => (a.details as Record<string, unknown> | undefined)?.type === "opportunity" && typeof a.score === "number" && (a.score as number) < 0.9)
        .map(([, a]) => ({
          title: a.title as string,
          description: a.description as string,
          savingsMs: ((a.details as Record<string, unknown> | undefined)?.overallSavingsMs as number | undefined) ?? 0,
          score: a.score as number,
        }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 6);

      return {
        score,
        strategy: input.strategy,
        lcp: metric("largest-contentful-paint"),
        tbt: metric("total-blocking-time"),
        cls: metric("cumulative-layout-shift"),
        fcp: metric("first-contentful-paint"),
        ttfb: metric("server-response-time"),
        si: metric("speed-index"),
        opportunities: opps,
      };
    }),

  // Daily pageview + visitor time series for charts
  timeSeries: orgProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      const { from, to, projectId } = input;
      type Row = { date: string; pageviews: number; visitors: number };
      const rows: Row[] = projectId
        ? await ctx.db.$queryRawUnsafe<Row[]>(
            `SELECT date_trunc('day', timestamp)::date::text AS date,
                    COUNT(*)::int AS pageviews,
                    COUNT(DISTINCT "visitorId")::int AS visitors
             FROM analytics_events
             WHERE "organizationId" = $1 AND "eventType" = 'pageview'
               AND timestamp >= $2 AND timestamp <= $3 AND "projectId" = $4
             GROUP BY 1 ORDER BY 1 ASC`,
            ctx.organizationId, from, to, projectId,
          )
        : await ctx.db.$queryRawUnsafe<Row[]>(
            `SELECT date_trunc('day', timestamp)::date::text AS date,
                    COUNT(*)::int AS pageviews,
                    COUNT(DISTINCT "visitorId")::int AS visitors
             FROM analytics_events
             WHERE "organizationId" = $1 AND "eventType" = 'pageview'
               AND timestamp >= $2 AND timestamp <= $3
             GROUP BY 1 ORDER BY 1 ASC`,
            ctx.organizationId, from, to,
          );

      // Fill in missing days with 0
      const map = new Map(rows.map((r) => [r.date, r]));
      const filled: Row[] = [];
      const cur = new Date(from);
      cur.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      while (cur <= end) {
        const key = cur.toISOString().slice(0, 10);
        filled.push(map.get(key) ?? { date: key, pageviews: 0, visitors: 0 });
        cur.setDate(cur.getDate() + 1);
      }
      return filled;
    }),

  // Session engagement metrics
  engagement: orgProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      const { from, to, projectId } = input;
      type EngRow = { avg_duration: number | null; total_sessions: number; total_pageviews: number };
      const rows: EngRow[] = projectId
        ? await ctx.db.$queryRawUnsafe<EngRow[]>(
            `SELECT ROUND(AVG(duration) FILTER (WHERE duration > 0 AND duration < 3600))::int AS avg_duration,
                    COUNT(DISTINCT "sessionId")::int AS total_sessions,
                    COUNT(*)::int AS total_pageviews
             FROM analytics_events
             WHERE "organizationId" = $1 AND "eventType" = 'pageview'
               AND timestamp >= $2 AND timestamp <= $3 AND "projectId" = $4`,
            ctx.organizationId, from, to, projectId,
          )
        : await ctx.db.$queryRawUnsafe<EngRow[]>(
            `SELECT ROUND(AVG(duration) FILTER (WHERE duration > 0 AND duration < 3600))::int AS avg_duration,
                    COUNT(DISTINCT "sessionId")::int AS total_sessions,
                    COUNT(*)::int AS total_pageviews
             FROM analytics_events
             WHERE "organizationId" = $1 AND "eventType" = 'pageview'
               AND timestamp >= $2 AND timestamp <= $3`,
            ctx.organizationId, from, to,
          );
      const r = rows[0];
      const avgPagesPerSession =
        r.total_sessions > 0
          ? Number((r.total_pageviews / r.total_sessions).toFixed(1))
          : 0;
      return {
        avgDuration: r.avg_duration ?? 0,
        avgPagesPerSession,
        totalSessions: r.total_sessions,
        totalPageviews: r.total_pageviews,
      };
    }),

  // Traffic arriving from AI platforms (perplexity.ai, claude.ai, etc.)
  aiReferrers: orgProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      const { from, to, projectId } = input;
      const where = {
        ...baseWhere(ctx.organizationId, from, to, projectId),
        referrer: { not: null as null },
      };
      const referrers = await ctx.db.analyticsEvent.groupBy({
        by: ["referrer"],
        where,
        _count: { referrer: true },
        orderBy: { _count: { referrer: "desc" } },
        take: 200,
      });

      // Match against known AI domains
      const matched = new Map<string, { label: string; platform: string; visits: number }>();
      for (const r of referrers) {
        if (!r.referrer) continue;
        for (const ai of AI_REFERRER_DOMAINS) {
          if (r.referrer.includes(ai.domain)) {
            const existing = matched.get(ai.platform);
            if (existing) {
              existing.visits += r._count.referrer;
            } else {
              matched.set(ai.platform, { label: ai.label, platform: ai.platform, visits: r._count.referrer });
            }
            break;
          }
        }
      }
      return Array.from(matched.values()).sort((a, b) => b.visits - a.visits);
    }),

  // Content performance: top posts with period-over-period delta
  contentPerformance: orgProcedure
    .input(dateRangeSchema.extend({ limit: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const { from, to, projectId, limit } = input;
      const days = Math.round((to.getTime() - from.getTime()) / 86400000);
      const prevFrom = new Date(from.getTime() - days * 86400000);
      const prevTo = new Date(from.getTime() - 1);

      const [current, previous, posts] = await Promise.all([
        ctx.db.analyticsEvent.groupBy({
          by: ["path"],
          where: { ...baseWhere(ctx.organizationId, from, to, projectId), path: { not: null } },
          _count: { path: true },
          orderBy: { _count: { path: "desc" } },
          take: limit * 5,
        }),
        ctx.db.analyticsEvent.groupBy({
          by: ["path"],
          where: { ...baseWhere(ctx.organizationId, prevFrom, prevTo, projectId), path: { not: null } },
          _count: { path: true },
        }),
        ctx.db.post.findMany({
          where: { organizationId: ctx.organizationId, status: "PUBLISHED", deletedAt: null },
          select: { id: true, title: true, slug: true, publishedAt: true },
        }),
      ]);

      const prevMap = new Map(previous.map((p) => [p.path, p._count.path]));

      const slugMap = new Map<string, { views: number; prevViews: number; path: string }>();
      for (const row of current) {
        const parts = (row.path ?? "").split("/").filter(Boolean);
        const slug = parts[parts.length - 1];
        if (slug && !slugMap.has(slug)) {
          slugMap.set(slug, {
            views: row._count.path,
            prevViews: prevMap.get(row.path) ?? 0,
            path: row.path ?? "",
          });
        }
      }

      return posts
        .map((post) => {
          const stats = slugMap.get(post.slug) ?? { views: 0, prevViews: 0, path: `/${post.slug}` };
          const delta =
            stats.prevViews > 0
              ? Math.round(((stats.views - stats.prevViews) / stats.prevViews) * 100)
              : stats.views > 0
              ? 100
              : 0;
          return { ...post, ...stats, delta };
        })
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
    }),

  // Track event (authenticated, internal use)
  track: orgProcedure
    .input(
      z.object({
        eventType: z.string(),
        path: z.string().optional(),
        referrer: z.string().optional(),
        sessionId: z.string(),
        visitorId: z.string(),
        projectId: z.string().optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        utmTerm: z.string().optional(),
        utmContent: z.string().optional(),
        device: z.string().optional(),
        browser: z.string().optional(),
        os: z.string().optional(),
        duration: z.number().optional(),
        properties: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.analyticsEvent.create({
        data: {
          organizationId: ctx.organizationId,
          ...input,
        },
      });
      return { success: true };
    }),
});
