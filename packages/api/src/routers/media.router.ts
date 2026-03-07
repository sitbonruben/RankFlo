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
