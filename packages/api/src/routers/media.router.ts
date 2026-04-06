import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { PAGINATION } from "@rankflo/core/constants";

import { requirePermission } from "../middleware/rbac";
import { router, orgProcedure } from "../trpc";

export const mediaRouter = router({
  list: orgProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z
          .number()
          .int()
          .positive()
          .max(PAGINATION.maxPageSize)
          .default(PAGINATION.defaultPageSize),
        mimeType: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;

      const where: Record<string, unknown> = {
        organizationId: ctx.organizationId,
      };

      if (input.mimeType) {
        where.mimeType = { startsWith: input.mimeType };
      }

      if (input.search) {
        where.OR = [
          { fileName: { contains: input.search, mode: "insensitive" } },
          { altText: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.db.media.findMany({
          where: where as never,
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
          include: {
            uploader: {
              select: { id: true, name: true },
            },
          },
        }),
        ctx.db.media.count({ where: where as never }),
      ]);

      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
        hasNext: input.page * input.pageSize < total,
        hasPrev: input.page > 1,
      };
    }),

  create: orgProcedure
    .use(requirePermission("media:upload"))
    .input(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        url: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        altText: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        metadata: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.media.create({
        data: {
          ...input,
          organizationId: ctx.organizationId,
          uploadedBy: ctx.session.user.id,
        },
      });
    }),

  update: orgProcedure
    .use(requirePermission("media:upload"))
    .input(
      z.object({
        id: z.string().cuid(),
        altText: z.string().optional(),
        fileName: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.db.media.update({
        where: { id },
        data,
      });
    }),

  replace: orgProcedure
    .use(requirePermission("media:upload"))
    .input(
      z.object({
        id: z.string().cuid(),
        newUrl: z.string().url(),
        fileName: z.string().optional(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.media.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const oldUrl = existing.url;

      // Update the media record with the new file
      const updated = await ctx.db.media.update({
        where: { id: input.id },
        data: {
          url: input.newUrl,
          ...(input.fileName && { fileName: input.fileName }),
          ...(input.fileSize != null && { fileSize: input.fileSize }),
          ...(input.mimeType && { mimeType: input.mimeType }),
          ...(input.width != null && { width: input.width }),
          ...(input.height != null && { height: input.height }),
        },
      });

      // Update all posts in this org that use the old URL as featuredImage
      const postsUpdated = await ctx.db.post.updateMany({
        where: {
          organizationId: ctx.organizationId,
          featuredImage: oldUrl,
          deletedAt: null,
        },
        data: { featuredImage: input.newUrl },
      });

      return { media: updated, postsUpdated: postsUpdated.count };
    }),

  usageCount: orgProcedure
    .input(z.object({ url: z.string() }))
    .query(async ({ ctx, input }) => {
      const count = await ctx.db.post.count({
        where: {
          organizationId: ctx.organizationId,
          featuredImage: input.url,
          deletedAt: null,
        },
      });
      return { count };
    }),

  delete: orgProcedure
    .use(requirePermission("media:delete"))
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const media = await ctx.db.media.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
      });

      if (!media) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.media.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
