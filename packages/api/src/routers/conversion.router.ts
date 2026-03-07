import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, orgProcedure, publicProcedure } from "../trpc";

const dateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export const conversionRouter = router({
  goals: router({
    list: orgProcedure.query(async ({ ctx }) => {
      const goals = await ctx.db.conversionGoal.findMany({
        where: { organizationId: ctx.organizationId },
        include: {
          _count: { select: { conversions: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return goals.map((goal) => ({
        ...goal,
        conversionCount: goal._count.conversions,
        _count: undefined,
      }));
    }),

    create: orgProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          eventType: z.string().min(1),
          targetValue: z.number().int().positive().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const goal = await ctx.db.conversionGoal.create({
          data: {
            organizationId: ctx.organizationId,
            ...input,
          },
        });

        return goal;
      }),

    update: orgProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          eventType: z.string().min(1).optional(),
          targetValue: z.number().int().positive().nullable().optional(),
          isActive: z.boolean().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;

        const existing = await ctx.db.conversionGoal.findFirst({
          where: { id, organizationId: ctx.organizationId },
        });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversion goal not found",
          });
        }

        const goal = await ctx.db.conversionGoal.update({
          where: { id },
          data,
        });

        return goal;
      }),

    delete: orgProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await ctx.db.conversionGoal.findFirst({
          where: { id: input.id, organizationId: ctx.organizationId },
        });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversion goal not found",
          });
        }

        await ctx.db.conversionGoal.delete({
          where: { id: input.id },
        });

        return { success: true };
      }),
  }),

  track: publicProcedure
    .input(
      z.object({
        organizationId: z.string(),
        goalName: z.string(),
        visitorId: z.string().optional(),
        sessionId: z.string().optional(),
        postId: z.string().optional(),
        path: z.string().optional(),
        referrer: z.string().optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        value: z.number().optional(),
        metadata: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId, goalName, ...eventData } = input;

      const goal = await ctx.db.conversionGoal.findUnique({
        where: {
          organizationId_name: { organizationId, name: goalName },
        },
      });

      if (!goal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Conversion goal "${goalName}" not found`,
        });
      }

      if (!goal.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Conversion goal "${goalName}" is not active`,
        });
      }

      const event = await ctx.db.conversionEvent.create({
        data: {
          organizationId,
          goalId: goal.id,
          ...eventData,
        },
      });

      return { success: true, eventId: event.id };
    }),

  report: orgProcedure
    .input(
      dateRangeSchema.extend({
        goalId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { from, to, goalId } = input;

      const where = {
        organizationId: ctx.organizationId,
        timestamp: { gte: from, lte: to },
        ...(goalId && { goalId }),
      };

      const [events, bySource, byPost] = await Promise.all([
        ctx.db.conversionEvent.findMany({
          where,
          select: { timestamp: true, value: true },
          orderBy: { timestamp: "asc" },
        }),
        ctx.db.conversionEvent.groupBy({
          by: ["utmSource"],
          where: {
            ...where,
            utmSource: { not: null },
          },
          _count: { id: true },
          _sum: { value: true },
          orderBy: { _count: { id: "desc" } },
        }),
        ctx.db.conversionEvent.groupBy({
          by: ["postId"],
          where: {
            ...where,
            postId: { not: null },
          },
          _count: { id: true },
          _sum: { value: true },
          orderBy: { _count: { id: "desc" } },
        }),
      ]);

      // Group conversions by day
      const dailyMap = new Map<string, { count: number; value: number }>();
      for (const event of events) {
        const dayKey = event.timestamp.toISOString().slice(0, 10);
        const entry = dailyMap.get(dayKey) ?? { count: 0, value: 0 };
        entry.count += 1;
        entry.value += event.value ?? 0;
        dailyMap.set(dayKey, entry);
      }

      const daily = Array.from(dailyMap.entries()).map(
        ([date, { count, value }]) => ({
          date,
          count,
          value,
        }),
      );

      const totalConversions = events.length;
      const totalValue = events.reduce((sum, e) => sum + (e.value ?? 0), 0);

      const sourceBreakdown = bySource.map((s) => ({
        source: s.utmSource,
        count: s._count.id,
        value: s._sum.value ?? 0,
      }));

      const postBreakdown = byPost.map((p) => ({
        postId: p.postId,
        count: p._count.id,
        value: p._sum.value ?? 0,
      }));

      return {
        daily,
        totalConversions,
        totalValue,
        sourceBreakdown,
        postBreakdown,
      };
    }),

  funnel: orgProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      const { from, to } = input;
      const orgWhere = { organizationId: ctx.organizationId };

      const [visitors, pageViews, subscribers, conversions] =
        await Promise.all([
          // Unique visitors from analytics events
          ctx.db.analyticsEvent
            .groupBy({
              by: ["visitorId"],
              where: {
                ...orgWhere,
                timestamp: { gte: from, lte: to },
              },
            })
            .then((result) => result.length),

          // Total page views
          ctx.db.analyticsEvent.count({
            where: {
              ...orgWhere,
              eventType: "pageview",
              timestamp: { gte: from, lte: to },
            },
          }),

          // New subscribers in the period
          ctx.db.subscriber.count({
            where: {
              ...orgWhere,
              subscribedAt: { gte: from, lte: to },
            },
          }),

          // Conversions in the period
          ctx.db.conversionEvent.count({
            where: {
              ...orgWhere,
              timestamp: { gte: from, lte: to },
            },
          }),
        ]);

      return {
        visitors,
        pageViews,
        subscribers,
        conversions,
        rates: {
          viewsPerVisitor:
            visitors > 0
              ? Math.round((pageViews / visitors) * 100) / 100
              : 0,
          subscribeRate:
            visitors > 0
              ? Math.round((subscribers / visitors) * 10000) / 100
              : 0,
          conversionRate:
            visitors > 0
              ? Math.round((conversions / visitors) * 10000) / 100
              : 0,
        },
      };
    }),
});
