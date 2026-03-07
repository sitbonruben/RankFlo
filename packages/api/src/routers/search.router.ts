import { z } from "zod";

import { router, orgProcedure } from "../trpc";

export const searchRouter = router({
  query: orgProcedure
    .input(
      z.object({
        query: z.string().min(1),
        page: z.number().default(1),
        pageSize: z.number().default(20),
        tags: z.array(z.string()).optional(),
        locale: z.string().optional(),
        sort: z.enum(["relevance", "date", "title"]).default("relevance"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;

      // Full-text search via Prisma (PostgreSQL)
      const where: Record<string, unknown> = {
        organizationId: ctx.organizationId,
        status: "PUBLISHED",
        deletedAt: null,
      };

      if (input.locale) where.locale = input.locale;
      if (input.tags?.length) {
        where.tags = { some: { tag: { slug: { in: input.tags } } } };
      }

      where.OR = [
        { title: { contains: input.query, mode: "insensitive" } },
        { excerpt: { contains: input.query, mode: "insensitive" } },
        { contentPlain: { contains: input.query, mode: "insensitive" } },
      ];

      const orderBy: Record<string, string> = {};
      if (input.sort === "date") orderBy.publishedAt = "desc";
      else if (input.sort === "title") orderBy.title = "asc";
      else orderBy.publishedAt = "desc"; // relevance fallback

      const [items, total] = await Promise.all([
        ctx.db.post.findMany({
          where: where as never,
          orderBy: orderBy as never,
          skip,
          take: input.pageSize,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            publishedAt: true,
            readingTime: true,
            featuredImage: true,
            author: {
              select: { id: true, name: true, avatarUrl: true },
            },
            tags: {
              include: { tag: { select: { name: true, slug: true, color: true } } },
            },
          },
        }),
        ctx.db.post.count({ where: where as never }),
      ]);

      // Track search query
      await ctx.db.searchQuery.create({
        data: {
          organizationId: ctx.organizationId,
          query: input.query,
          resultsCount: total,
          visitorId: ctx.session.user.id,
        },
      });

      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),

  suggest: orgProcedure
    .input(z.object({ prefix: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        where: {
          organizationId: ctx.organizationId,
          status: "PUBLISHED",
          deletedAt: null,
          title: { contains: input.prefix, mode: "insensitive" },
        },
        select: { title: true, slug: true },
        take: 5,
        orderBy: { publishedAt: "desc" },
      });

      return posts.map((p) => ({ title: p.title, slug: p.slug }));
    }),

  // Track click on search result
  trackClick: orgProcedure
    .input(
      z.object({
        queryId: z.string().cuid(),
        postId: z.string().cuid(),
        position: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.searchQuery.update({
        where: { id: input.queryId },
        data: {
          clickedPostId: input.postId,
          clickPosition: input.position,
        },
      });

      return { success: true };
    }),
});
