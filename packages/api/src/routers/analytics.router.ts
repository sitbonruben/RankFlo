import { z } from "zod";

import { router, orgProcedure } from "../trpc";

const dateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export const analyticsRouter = router({
  overview: orgProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      const { from, to } = input;

      const [pageViews, visitors, sessions] = await Promise.all([
        ctx.db.analyticsEvent.count({
          where: {
            organizationId: ctx.organizationId,
            eventType: "pageview",
            timestamp: { gte: from, lte: to },
          },
        }),
        ctx.db.analyticsEvent.groupBy({
          by: ["visitorId"],
          where: {
            organizationId: ctx.organizationId,
            eventType: "pageview",
            timestamp: { gte: from, lte: to },
          },
        }),
        ctx.db.analyticsEvent.groupBy({
          by: ["sessionId"],
          where: {
            organizationId: ctx.organizationId,
            eventType: "pageview",
            timestamp: { gte: from, lte: to },
          },
        }),
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
      const pages = await ctx.db.analyticsEvent.groupBy({
        by: ["path"],
        where: {
          organizationId: ctx.organizationId,
          eventType: "pageview",
          timestamp: { gte: input.from, lte: input.to },
          path: { not: null },
        },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: input.limit,
      });

      return pages.map((p) => ({
        path: p.path,
        views: p._count.path,
      }));
    }),

  topReferrers: orgProcedure
    .input(dateRangeSchema.extend({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const referrers = await ctx.db.analyticsEvent.groupBy({
        by: ["referrer"],
        where: {
          organizationId: ctx.organizationId,
          eventType: "pageview",
          timestamp: { gte: input.from, lte: input.to },
          referrer: { not: null },
        },
        _count: { referrer: true },
        orderBy: { _count: { referrer: "desc" } },
        take: input.limit,
      });

      return referrers.map((r) => ({
        referrer: r.referrer,
        views: r._count.referrer,
      }));
    }),

  devices: orgProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      const devices = await ctx.db.analyticsEvent.groupBy({
        by: ["device"],
        where: {
          organizationId: ctx.organizationId,
          eventType: "pageview",
          timestamp: { gte: input.from, lte: input.to },
          device: { not: null },
        },
        _count: { device: true },
        orderBy: { _count: { device: "desc" } },
      });

      return devices.map((d) => ({
        device: d.device,
        count: d._count.device,
      }));
    }),

  countries: orgProcedure
    .input(dateRangeSchema.extend({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const countries = await ctx.db.analyticsEvent.groupBy({
        by: ["country"],
        where: {
          organizationId: ctx.organizationId,
          eventType: "pageview",
          timestamp: { gte: input.from, lte: input.to },
          country: { not: null },
        },
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: input.limit,
      });

      return countries.map((c) => ({
        country: c.country,
        visitors: c._count.country,
      }));
    }),

  // Track event (public endpoint for the tracking script)
  track: orgProcedure
    .input(
      z.object({
        eventType: z.string(),
        path: z.string().optional(),
        referrer: z.string().optional(),
        sessionId: z.string(),
        visitorId: z.string(),
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
