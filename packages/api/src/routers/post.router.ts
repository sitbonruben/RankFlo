import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createPostSchema,
  updatePostSchema,
  listPostsSchema,
} from "@rankflo/core/validators";

import { requirePermission, requireRole } from "../middleware/rbac";
import { router, orgProcedure } from "../trpc";

export const postRouter = router({
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
      const { id, tagIds, changelog, ...data } = input;

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
      const post = await ctx.db.post.update({
        where: { id: input.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
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
});
