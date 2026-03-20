import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createHmac } from "crypto";

import {
  createPostSchema,
  updatePostSchema,
  listPostsSchema,
} from "@rankflo/core/validators";

import { requirePermission, requireRole } from "../middleware/rbac";
import { router, orgProcedure } from "../trpc";
import type { PrismaClient } from "@rankflo/db";

// ─── Webhook delivery ────────────────────────────────────────────────────────
// Fire-and-forget: finds active webhooks for the org matching the event,
// delivers them with HMAC-SHA256 signature, logs the delivery.
async function fireWebhooks(
  db: PrismaClient,
  organizationId: string,
  event: string,
  payload: Record<string, unknown>,
) {
  try {
    const webhooks = await db.webhook.findMany({
      where: {
        organizationId,
        isActive: true,
        events: { has: event },
      },
    });

    if (webhooks.length === 0) return;

    const body = JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload });

    await Promise.allSettled(
      webhooks.map(async (webhook) => {
        const sig = createHmac("sha256", webhook.secret).update(body).digest("hex");
        let statusCode: number | null = null;
        let responseBody: string | null = null;
        let status: "SUCCESS" | "FAILED" = "FAILED";

        try {
          const res = await fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-RankFlo-Event": event,
              "X-RankFlo-Signature": `sha256=${sig}`,
            },
            body,
            signal: AbortSignal.timeout(10_000),
          });
          statusCode = res.status;
          responseBody = await res.text().catch(() => null);
          status = res.ok ? "SUCCESS" : "FAILED";
        } catch {
          // network error — leave status FAILED
        }

        await db.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            event,
            payload: payload as object,
            statusCode,
            responseBody,
            status,
            attempts: 1,
            completedAt: new Date(),
          },
        });
      }),
    );
  } catch {
    // Never let webhook errors surface to the caller
  }
}

export const postRouter = router({
  stats: orgProcedure
    .input(z.object({ projectId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where = {
        organizationId: ctx.organizationId,
        deletedAt: null,
        ...(input?.projectId ? { projectId: input.projectId } : {}),
      };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [total, published, draft, scheduled, publishedToday] = await Promise.all([
        ctx.db.post.count({ where }),
        ctx.db.post.count({ where: { ...where, status: "PUBLISHED" } }),
        ctx.db.post.count({ where: { ...where, status: "DRAFT" } }),
        ctx.db.post.count({ where: { ...where, status: "SCHEDULED" } }),
        ctx.db.post.count({ where: { ...where, status: "PUBLISHED", publishedAt: { gte: today } } }),
      ]);
      return { total, published, draft, scheduled, publishedToday };
    }),

  list: orgProcedure
    .input(listPostsSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, status, authorId, search, sort, locale, tagSlug } = input;
      const skip = (page - 1) * pageSize;

      const where: Record<string, unknown> = {
        organizationId: ctx.organizationId,
        deletedAt: null,
      };

      if (status) where.status = status;
      if (authorId) where.authorId = authorId;
      if (locale) where.locale = locale;

      if (tagSlug) {
        where.tags = { some: { tag: { slug: tagSlug } } };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
        ];
      }

      const orderBy: Record<string, string> = {};
      switch (sort) {
        case "oldest":
          orderBy.createdAt = "asc";
          break;
        case "title":
          orderBy.title = "asc";
          break;
        case "updated":
          orderBy.updatedAt = "desc";
          break;
        default:
          orderBy.createdAt = "desc";
      }

      const [items, total] = await Promise.all([
        ctx.db.post.findMany({
          where: where as never,
          orderBy: orderBy as never,
          skip,
          take: pageSize,
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true },
            },
            tags: {
              include: { tag: true },
            },
            project: {
              select: { id: true, name: true },
            },
            _count: { select: { comments: true } },
          },
        }),
        ctx.db.post.count({ where: where as never }),
      ]);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1,
      };
    }),

  getById: orgProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
          deletedAt: null,
        },
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true, email: true },
          },
          tags: { include: { tag: true } },
          seoMeta: true,
          revisions: {
            orderBy: { version: "desc" },
            take: 10,
          },
          _count: { select: { comments: true } },
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      return post;
    }),

  getBySlug: orgProcedure
    .input(z.object({ slug: z.string(), locale: z.string().default("en") }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findFirst({
        where: {
          slug: input.slug,
          locale: input.locale,
          organizationId: ctx.organizationId,
          deletedAt: null,
        },
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
          tags: { include: { tag: true } },
          seoMeta: true,
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      return post;
    }),

  create: orgProcedure
    .use(requirePermission("post:create"))
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      const { tagIds, ...data } = input;

      const post = await ctx.db.post.create({
        data: {
          ...data,
          organizationId: ctx.organizationId,
          authorId: ctx.session.user.id,
          tags: tagIds
            ? {
                create: tagIds.map((tagId) => ({
                  tagId,
                })),
              }
            : undefined,
        },
        include: {
          tags: { include: { tag: true } },
        },
      });

      return post;
    }),

  update: orgProcedure
    .use(requirePermission("post:update"))
    .input(updatePostSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, tagIds, changelog, metaTitle, metaDescription, ogImage, ...data } = input;

      const existing = await ctx.db.post.findFirst({
        where: { id, organizationId: ctx.organizationId, deletedAt: null },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      // Check ownership for AUTHOR role
      if (
        ctx.role === "AUTHOR" &&
        existing.authorId !== ctx.session.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Create revision before updating
      await ctx.db.postRevision.create({
        data: {
          postId: id,
          version: existing.version,
          title: existing.title,
          content: existing.content as object,
          editedBy: ctx.session.user.id,
          changelog,
        },
      });

      // Handle publishing
      const updateData: Record<string, unknown> = {
        ...data,
        version: { increment: 1 },
      };

      if (data.status === "PUBLISHED" && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }

      const post = await ctx.db.post.update({
        where: { id },
        data: {
          ...updateData,
          tags: tagIds
            ? {
                deleteMany: {},
                create: tagIds.map((tagId) => ({ tagId })),
              }
            : undefined,
        } as never,
        include: {
          tags: { include: { tag: true } },
        },
      });

      // Upsert seoMeta if any SEO fields were provided
      const hasSeoChanges = metaTitle !== undefined || metaDescription !== undefined || ogImage !== undefined;
      if (hasSeoChanges) {
        await ctx.db.seoMeta.upsert({
          where: { postId: id },
          create: { postId: id, metaTitle, metaDescription, ogImage },
          update: {
            ...(metaTitle !== undefined && { metaTitle }),
            ...(metaDescription !== undefined && { metaDescription }),
            ...(ogImage !== undefined && { ogImage }),
          },
        });
      }

      // Fire webhooks when status changes to PUBLISHED
      const isNowPublished = data.status === "PUBLISHED";
      const wasAlreadyPublished = existing.status === "PUBLISHED";
      const event = isNowPublished
        ? wasAlreadyPublished
          ? "post.updated"
          : "post.published"
        : null;

      if (event) {
        void fireWebhooks(ctx.db, ctx.organizationId, event, {
          id: post.id,
          slug: post.slug,
          title: post.title,
          status: post.status,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
        });
      }

      return post;
    }),

  delete: orgProcedure
    .use(requirePermission("post:delete"))
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.post.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
          deletedAt: null,
        },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (
        ctx.role === "AUTHOR" &&
        existing.authorId !== ctx.session.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Soft delete
      await ctx.db.post.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),

  publish: orgProcedure
    .use(requirePermission("post:publish"))
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.post.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId, deletedAt: null },
        select: { status: true },
      });

      const post = await ctx.db.post.update({
        where: { id: input.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      void fireWebhooks(ctx.db, ctx.organizationId, "post.published", {
        id: post.id,
        slug: post.slug,
        title: post.title,
        status: post.status,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
      });

      return post;
    }),

  // ─── Approval Workflow ──────────────────────────────────

  submitForReview: orgProcedure
    .input(
      z.object({
        postId: z.string().cuid(),
        reviewerNote: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.postId,
          organizationId: ctx.organizationId,
          deletedAt: null,
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (post.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft posts can be submitted for review",
        });
      }

      // Check ownership for AUTHOR role
      if (ctx.role === "AUTHOR" && post.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const updated = await ctx.db.post.update({
        where: { id: input.postId },
        data: { status: "REVIEW" },
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
          tags: { include: { tag: true } },
        },
      });

      // Log the submission with optional reviewer note
      await ctx.db.auditLog.create({
        data: {
          organizationId: ctx.organizationId,
          userId: ctx.session.user.id,
          action: "post.submitted_for_review",
          entityType: "Post",
          entityId: input.postId,
          metadata: input.reviewerNote
            ? { reviewerNote: input.reviewerNote }
            : undefined,
        },
      });

      return updated;
    }),

  approve: orgProcedure
    .use(requireRole("EDITOR"))
    .input(
      z.object({
        postId: z.string().cuid(),
        publishNow: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.postId,
          organizationId: ctx.organizationId,
          deletedAt: null,
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (post.status !== "REVIEW") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only posts in review can be approved",
        });
      }

      const updated = await ctx.db.post.update({
        where: { id: input.postId },
        data: {
          status: input.publishNow ? "PUBLISHED" : "DRAFT",
          publishedAt: input.publishNow ? new Date() : undefined,
        },
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
          tags: { include: { tag: true } },
        },
      });

      await ctx.db.auditLog.create({
        data: {
          organizationId: ctx.organizationId,
          userId: ctx.session.user.id,
          action: input.publishNow
            ? "post.approved_and_published"
            : "post.approved",
          entityType: "Post",
          entityId: input.postId,
        },
      });

      return updated;
    }),

  reject: orgProcedure
    .use(requireRole("EDITOR"))
    .input(
      z.object({
        postId: z.string().cuid(),
        reason: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.postId,
          organizationId: ctx.organizationId,
          deletedAt: null,
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (post.status !== "REVIEW") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only posts in review can be rejected",
        });
      }

      const updated = await ctx.db.post.update({
        where: { id: input.postId },
        data: { status: "DRAFT" },
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
          tags: { include: { tag: true } },
        },
      });

      // Store rejection reason in audit log metadata
      await ctx.db.auditLog.create({
        data: {
          organizationId: ctx.organizationId,
          userId: ctx.session.user.id,
          action: "post.rejected",
          entityType: "Post",
          entityId: input.postId,
          metadata: { reason: input.reason },
        },
      });

      return updated;
    }),

  reviewQueue: orgProcedure
    .query(async ({ ctx }) => {
      const posts = await ctx.db.post.findMany({
        where: {
          organizationId: ctx.organizationId,
          status: "REVIEW",
          deletedAt: null,
        },
        orderBy: { updatedAt: "asc" },
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true, email: true },
          },
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
      });

      // Fetch the submission audit log entries for these posts to get
      // the submitted date and reviewer notes
      const postIds = posts.map((p) => p.id);

      const submissionLogs = await ctx.db.auditLog.findMany({
        where: {
          organizationId: ctx.organizationId,
          action: "post.submitted_for_review",
          entityType: "Post",
          entityId: { in: postIds },
        },
        orderBy: { timestamp: "desc" },
        distinct: ["entityId"],
      });

      const submissionMap = new Map(
        submissionLogs.map((log) => [log.entityId, log]),
      );

      return posts.map((post) => {
        const submission = submissionMap.get(post.id);
        const metadata = submission?.metadata as
          | { reviewerNote?: string }
          | null
          | undefined;

        return {
          ...post,
          submittedAt: submission?.timestamp ?? post.updatedAt,
          reviewerNote: metadata?.reviewerNote ?? null,
        };
      });
    }),

  recentActivity: orgProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const [recentlyPublished, upcomingScheduled] = await Promise.all([
      ctx.db.post.findMany({
        where: {
          organizationId: ctx.organizationId,
          status: "PUBLISHED",
          publishedAt: { gte: sevenDaysAgo },
          deletedAt: null,
        },
        select: { id: true, title: true, publishedAt: true, slug: true },
        orderBy: { publishedAt: "desc" },
        take: 15,
      }),
      ctx.db.post.findMany({
        where: {
          organizationId: ctx.organizationId,
          status: "SCHEDULED",
          scheduledAt: { gte: now, lte: threeDaysFromNow },
          deletedAt: null,
        },
        select: { id: true, title: true, scheduledAt: true, slug: true },
        orderBy: { scheduledAt: "asc" },
        take: 10,
      }),
    ]);

    return {
      notifications: [
        ...recentlyPublished.map((p) => ({
          id: `published-${p.id}`,
          type: "published" as const,
          title: p.title || "Untitled",
          message: "Post published",
          date: p.publishedAt!,
          href: `/posts/${p.slug}/edit`,
        })),
        ...upcomingScheduled.map((p) => ({
          id: `scheduled-${p.id}`,
          type: "scheduled" as const,
          title: p.title || "Untitled",
          message: "Publishing soon",
          date: p.scheduledAt!,
          href: `/posts/${p.slug}/edit`,
        })),
      ].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    };
  }),
});
