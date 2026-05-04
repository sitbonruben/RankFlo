import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, orgProcedure } from "../trpc";

// ─── Schemas ────────────────────────────────────────────────

const calendarEntryTypeEnum = z.enum([
  "BLOG_POST",
  "SOCIAL_POST",
  "EMAIL_CAMPAIGN",
  "LANDING_PAGE",
  "VIDEO",
  "PODCAST",
  "WEBINAR",
  "OTHER",
]);

const calendarEntryStatusEnum = z.enum([
  "IDEA",
  "PLANNED",
  "IN_PROGRESS",
  "IN_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "CANCELLED",
]);

// ─── Router ─────────────────────────────────────────────────

export const calendarRouter = router({
  /**
   * LIST — Get calendar entries with optional filters.
   * Returns entries with assignee info and linked post info.
   */
  list: orgProcedure
    .input(
      z
        .object({
          from: z.coerce.date().optional(),
          to: z.coerce.date().optional(),
          status: calendarEntryStatusEnum.optional(),
          assigneeId: z.string().optional(),
          entryType: calendarEntryTypeEnum.optional(),
        })
        .optional()
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        organizationId: ctx.organizationId,
      };

      if (input.status) where.status = input.status;
      if (input.assigneeId) where.assigneeId = input.assigneeId;
      if (input.entryType) where.entryType = input.entryType;

      if (input.from || input.to) {
        const scheduledDate: Record<string, Date> = {};
        if (input.from) scheduledDate.gte = input.from;
        if (input.to) scheduledDate.lte = input.to;
        where.scheduledDate = scheduledDate;
      }

      const entries = await ctx.db.calendarEntry.findMany({
        where: where as never,
        orderBy: { scheduledDate: "asc" },
        include: {
          assignee: {
            select: { id: true, name: true, avatarUrl: true },
          },
          post: {
            select: { id: true, title: true, slug: true, status: true, publishedAt: true, scheduledAt: true },
          },
        },
      });

      return { items: entries };
    }),

  /**
   * CREATE — Create a new calendar entry.
   */
  create: orgProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        entryType: calendarEntryTypeEnum.optional(),
        status: calendarEntryStatusEnum.optional(),
        assigneeId: z.string().optional(),
        scheduledDate: z.coerce.date().optional(),
        dueDate: z.coerce.date().optional(),
        color: z.string().optional(),
        tags: z.array(z.string()).optional(),
        postId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify assignee belongs to the org if provided
      if (input.assigneeId) {
        const membership = await ctx.db.membership.findUnique({
          where: {
            userId_organizationId: {
              userId: input.assigneeId,
              organizationId: ctx.organizationId,
            },
          },
        });

        if (!membership) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Assignee is not a member of this organization",
          });
        }
      }

      // Verify post belongs to the org if provided
      if (input.postId) {
        const post = await ctx.db.post.findFirst({
          where: {
            id: input.postId,
            organizationId: ctx.organizationId,
            deletedAt: null,
          },
        });

        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blog post not found",
          });
        }
      }

      const entry = await ctx.db.calendarEntry.create({
        data: {
          organizationId: ctx.organizationId,
          title: input.title,
          description: input.description,
          entryType: input.entryType ?? "BLOG_POST",
          status: input.status ?? "IDEA",
          assigneeId: input.assigneeId,
          scheduledDate: input.scheduledDate,
          dueDate: input.dueDate,
          color: input.color,
          tags: input.tags ?? [],
          postId: input.postId,
        },
        include: {
          assignee: {
            select: { id: true, name: true, avatarUrl: true },
          },
          post: {
            select: { id: true, title: true, slug: true, status: true, publishedAt: true, scheduledAt: true },
          },
        },
      });

      return entry;
    }),

  /**
   * UPDATE — Update an existing calendar entry.
   */
  update: orgProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        entryType: calendarEntryTypeEnum.optional(),
        status: calendarEntryStatusEnum.optional(),
        assigneeId: z.string().nullable().optional(),
        scheduledDate: z.coerce.date().nullable().optional(),
        dueDate: z.coerce.date().nullable().optional(),
        color: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
        postId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.calendarEntry.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Calendar entry not found",
        });
      }

      // Verify assignee belongs to the org if being changed
      if (input.assigneeId) {
        const membership = await ctx.db.membership.findUnique({
          where: {
            userId_organizationId: {
              userId: input.assigneeId,
              organizationId: ctx.organizationId,
            },
          },
        });

        if (!membership) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Assignee is not a member of this organization",
          });
        }
      }

      // Verify post belongs to the org if being changed
      if (input.postId) {
        const post = await ctx.db.post.findFirst({
          where: {
            id: input.postId,
            organizationId: ctx.organizationId,
            deletedAt: null,
          },
        });

        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blog post not found",
          });
        }
      }

      const { id, ...data } = input;

      const updated = await ctx.db.calendarEntry.update({
        where: { id },
        data,
        include: {
          assignee: {
            select: { id: true, name: true, avatarUrl: true },
          },
          post: {
            select: { id: true, title: true, slug: true, status: true, publishedAt: true, scheduledAt: true },
          },
        },
      });

      return updated;
    }),

  /**
   * DELETE — Remove a calendar entry.
   */
  delete: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.calendarEntry.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Calendar entry not found",
        });
      }

      await ctx.db.calendarEntry.delete({ where: { id: input.id } });

      return { success: true };
    }),

  /**
   * MOVE — Quick reschedule by moving to a new date (for drag-drop).
   */
  move: orgProcedure
    .input(
      z.object({
        id: z.string(),
        scheduledDate: z.coerce.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.calendarEntry.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Calendar entry not found",
        });
      }

      const updated = await ctx.db.calendarEntry.update({
        where: { id: input.id },
        data: { scheduledDate: input.scheduledDate },
        include: {
          assignee: {
            select: { id: true, name: true, avatarUrl: true },
          },
          post: {
            select: { id: true, title: true, slug: true, status: true, publishedAt: true, scheduledAt: true },
          },
        },
      });

      return updated;
    }),

  /**
   * STATS — Get counts by status and by entry type for a date range.
   */
  stats: orgProcedure
    .input(
      z
        .object({
          from: z.coerce.date().optional(),
          to: z.coerce.date().optional(),
        })
        .optional()
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        organizationId: ctx.organizationId,
      };

      if (input.from || input.to) {
        const scheduledDate: Record<string, Date> = {};
        if (input.from) scheduledDate.gte = input.from;
        if (input.to) scheduledDate.lte = input.to;
        where.scheduledDate = scheduledDate;
      }

      const [byStatus, byType, total] = await Promise.all([
        ctx.db.calendarEntry.groupBy({
          by: ["status"],
          where: where as never,
          _count: { status: true },
        }),
        ctx.db.calendarEntry.groupBy({
          by: ["entryType"],
          where: where as never,
          _count: { entryType: true },
        }),
        ctx.db.calendarEntry.count({ where: where as never }),
      ]);

      return {
        total,
        byStatus: byStatus.map((g) => ({
          status: g.status,
          count: g._count.status,
        })),
        byType: byType.map((g) => ({
          entryType: g.entryType,
          count: g._count.entryType,
        })),
      };
    }),
});
