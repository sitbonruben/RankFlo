import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, orgProcedure, publicProcedure } from "../trpc";

export const subscriberRouter = router({
  list: orgProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        status: z.enum(["ACTIVE", "UNSUBSCRIBED", "BOUNCED"]).optional(),
        source: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, status, source, search } = input;
      const skip = (page - 1) * limit;

      const where = {
        organizationId: ctx.organizationId,
        ...(status && { status }),
        ...(source && { source }),
        ...(search && {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const [subscribers, total] = await Promise.all([
        ctx.db.subscriber.findMany({
          where,
          orderBy: { subscribedAt: "desc" },
          skip,
          take: limit,
        }),
        ctx.db.subscriber.count({ where }),
      ]);

      return {
        subscribers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        organizationId: z.string(),
        projectId: z.string().optional(),
        source: z.string().optional(),
        sourcePostId: z.string().optional(),
        referrer: z.string().optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, organizationId, tags, ...rest } = input;

      // Check if subscriber already exists for this organization
      const existing = await ctx.db.subscriber.findUnique({
        where: {
          organizationId_email: { organizationId, email },
        },
      });

      if (existing) {
        // If previously unsubscribed, reactivate
        if (existing.status === "UNSUBSCRIBED") {
          const updated = await ctx.db.subscriber.update({
            where: { id: existing.id },
            data: {
              status: "ACTIVE",
              unsubscribedAt: null,
              subscribedAt: new Date(),
              ...(tags && { tags: { set: tags } }),
              ...rest,
            },
          });

          return { success: true, subscriberId: updated.id };
        }

        // Already active — return existing
        return { success: true, subscriberId: existing.id };
      }

      const subscriber = await ctx.db.subscriber.create({
        data: {
          email,
          organizationId,
          ...(tags && { tags }),
          ...rest,
        },
      });

      return { success: true, subscriberId: subscriber.id };
    }),

  unsubscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        organizationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, organizationId } = input;

      const subscriber = await ctx.db.subscriber.findUnique({
        where: {
          organizationId_email: { organizationId, email },
        },
      });

      if (!subscriber) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscriber not found",
        });
      }

      await ctx.db.subscriber.update({
        where: { id: subscriber.id },
        data: {
          status: "UNSUBSCRIBED",
          unsubscribedAt: new Date(),
        },
      });

      return { success: true };
    }),

  stats: orgProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const orgWhere = { organizationId: ctx.organizationId };

    const [total, active, thisWeek, thisMonth, topSourcesRaw, growthRaw] =
      await Promise.all([
        ctx.db.subscriber.count({ where: orgWhere }),
        ctx.db.subscriber.count({
          where: { ...orgWhere, status: "ACTIVE" },
        }),
        ctx.db.subscriber.count({
          where: {
            ...orgWhere,
            subscribedAt: { gte: startOfWeek },
          },
        }),
        ctx.db.subscriber.count({
          where: {
            ...orgWhere,
            subscribedAt: { gte: startOfMonth },
          },
        }),
        ctx.db.subscriber.groupBy({
          by: ["source"],
          where: {
            ...orgWhere,
            source: { not: null },
          },
          _count: { source: true },
          orderBy: { _count: { source: "desc" } },
          take: 10,
        }),
        ctx.db.subscriber.findMany({
          where: {
            ...orgWhere,
            subscribedAt: { gte: thirtyDaysAgo },
          },
          select: { subscribedAt: true },
          orderBy: { subscribedAt: "asc" },
        }),
      ]);

    const topSources = topSourcesRaw.map((s) => ({
      source: s.source,
      count: s._count.source,
    }));

    // Group subscribers by day for the last 30 days
    const growthMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const day = new Date(thirtyDaysAgo);
      day.setDate(thirtyDaysAgo.getDate() + i);
      growthMap.set(day.toISOString().slice(0, 10), 0);
    }
    for (const sub of growthRaw) {
      const dayKey = sub.subscribedAt.toISOString().slice(0, 10);
      growthMap.set(dayKey, (growthMap.get(dayKey) ?? 0) + 1);
    }
    const growthByDay = Array.from(growthMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return { total, active, thisWeek, thisMonth, topSources, growthByDay };
  }),

  export: orgProcedure
    .input(
      z.object({
        status: z.enum(["ACTIVE", "UNSUBSCRIBED", "BOUNCED"]).optional(),
        source: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const subscribers = await ctx.db.subscriber.findMany({
        where: {
          organizationId: ctx.organizationId,
          ...(input.status && { status: input.status }),
          ...(input.source && { source: input.source }),
        },
        orderBy: { subscribedAt: "desc" },
      });

      return subscribers;
    }),

  bulkTag: orgProcedure
    .input(
      z.object({
        subscriberIds: z.array(z.string()).min(1),
        tags: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { subscriberIds, tags } = input;

      // Verify all subscribers belong to the organization
      const subscribers = await ctx.db.subscriber.findMany({
        where: {
          id: { in: subscriberIds },
          organizationId: ctx.organizationId,
        },
        select: { id: true, tags: true },
      });

      if (subscribers.length !== subscriberIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more subscribers not found in this organization",
        });
      }

      // Update each subscriber, merging new tags with existing ones
      await Promise.all(
        subscribers.map((sub) => {
          const mergedTags = Array.from(new Set([...sub.tags, ...tags]));
          return ctx.db.subscriber.update({
            where: { id: sub.id },
            data: { tags: { set: mergedTags } },
          });
        }),
      );

      return { success: true, updated: subscribers.length };
    }),
});
