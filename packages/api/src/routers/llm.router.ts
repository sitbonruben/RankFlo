import { z } from "zod";
import { router, orgProcedure } from "../trpc";

export const llmRouter = router({
  // ── Mention CRUD ──────────────────────────────────────────

  mentionStats: orgProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const from = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      const where = { organizationId: ctx.organizationId, mentionedAt: { gte: from } };

      const [total, byPlatform, bySentiment, prevTotal] = await Promise.all([
        ctx.db.llmMention.count({ where }),
        ctx.db.llmMention.groupBy({
          by: ["platform"],
          where,
          _count: { platform: true },
          orderBy: { _count: { platform: "desc" } },
        }),
        ctx.db.llmMention.groupBy({
          by: ["sentiment"],
          where,
          _count: { sentiment: true },
        }),
        ctx.db.llmMention.count({
          where: {
            organizationId: ctx.organizationId,
            mentionedAt: {
              gte: new Date(Date.now() - input.days * 2 * 24 * 60 * 60 * 1000),
              lt: from,
            },
          },
        }),
      ]);

      const positive = bySentiment.find((s) => s.sentiment === "positive")?._count.sentiment ?? 0;
      const negative = bySentiment.find((s) => s.sentiment === "negative")?._count.sentiment ?? 0;
      const sentimentScore = total > 0 ? Math.round(((positive - negative) / total) * 100) : 0;

      return {
        total,
        prevTotal,
        trend: prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : 0,
        byPlatform: byPlatform.map((p) => ({ platform: p.platform, count: p._count.platform })),
        bySentiment: bySentiment.map((s) => ({ sentiment: s.sentiment, count: s._count.sentiment })),
        sentimentScore,
        positive,
        negative,
        neutral: total - positive - negative,
      };
    }),

  mentionList: orgProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(20),
        platform: z.string().optional(),
        sentiment: z.string().optional(),
        brandName: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, platform, sentiment, brandName } = input;
      const where = {
        organizationId: ctx.organizationId,
        ...(platform ? { platform } : {}),
        ...(sentiment ? { sentiment } : {}),
        ...(brandName !== undefined ? { brandName } : {}),
      };
      const [items, total] = await Promise.all([
        ctx.db.llmMention.findMany({
          where,
          orderBy: { mentionedAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        ctx.db.llmMention.count({ where }),
      ]);
      return { items, total };
    }),

  mentionCreate: orgProcedure
    .input(
      z.object({
        platform: z.string().min(1),
        query: z.string().min(1),
        snippet: z.string().optional(),
        url: z.string().optional(),
        brandName: z.string().default(""),
        sentiment: z.enum(["positive", "neutral", "negative"]).default("neutral"),
        rank: z.number().optional(),
        notes: z.string().optional(),
        mentionedAt: z.coerce.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.llmMention.create({
        data: {
          organizationId: ctx.organizationId,
          ...input,
          mentionedAt: input.mentionedAt ?? new Date(),
        },
      });
    }),

  mentionUpdate: orgProcedure
    .input(
      z.object({
        id: z.string(),
        platform: z.string().optional(),
        query: z.string().optional(),
        snippet: z.string().optional(),
        url: z.string().optional(),
        brandName: z.string().optional(),
        sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
        rank: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.llmMention.update({
        where: { id, organizationId: ctx.organizationId },
        data,
      });
    }),

  mentionDelete: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.llmMention.delete({
        where: { id: input.id, organizationId: ctx.organizationId },
      });
      return { success: true };
    }),

  // ── Citations (posts referenced in mentions) ──────────────

  citedPosts: orgProcedure.query(async ({ ctx }) => {
    const [mentions, posts] = await Promise.all([
      ctx.db.llmMention.findMany({
        where: { organizationId: ctx.organizationId },
        select: { url: true, platform: true, sentiment: true, mentionedAt: true },
      }),
      ctx.db.post.findMany({
        where: { organizationId: ctx.organizationId, status: "PUBLISHED", deletedAt: null },
        select: { id: true, title: true, slug: true, publishedAt: true, excerpt: true },
        orderBy: { publishedAt: "desc" },
        take: 100,
      }),
    ]);

    return posts
      .map((post) => {
        const cited = mentions.filter((m) => m.url?.includes(post.slug));
        return {
          ...post,
          citationCount: cited.length,
          platforms: [...new Set(cited.map((m) => m.platform))],
          lastCitedAt: cited.length > 0 ? cited.sort((a, b) => b.mentionedAt.getTime() - a.mentionedAt.getTime())[0].mentionedAt : null,
          positiveCount: cited.filter((m) => m.sentiment === "positive").length,
          negativeCount: cited.filter((m) => m.sentiment === "negative").length,
        };
      })
      .sort((a, b) => b.citationCount - a.citationCount);
  }),

  // ── Competitors (distinct non-empty brandNames) ───────────

  competitors: orgProcedure.query(async ({ ctx }) => {
    const org = await ctx.db.organization.findUnique({
      where: { id: ctx.organizationId },
      select: { name: true },
    });
    const orgName = org?.name ?? "";

    const brands = await ctx.db.llmMention.groupBy({
      by: ["brandName"],
      where: { organizationId: ctx.organizationId },
      _count: { brandName: true },
      orderBy: { _count: { brandName: "desc" } },
    });

    // Enrich each brand with sentiment breakdown
    const results = await Promise.all(
      brands.map(async (b) => {
        const sentiments = await ctx.db.llmMention.groupBy({
          by: ["sentiment"],
          where: { organizationId: ctx.organizationId, brandName: b.brandName },
          _count: { sentiment: true },
        });
        const positive = sentiments.find((s) => s.sentiment === "positive")?._count.sentiment ?? 0;
        const negative = sentiments.find((s) => s.sentiment === "negative")?._count.sentiment ?? 0;
        const total = b._count.brandName;
        return {
          brandName: b.brandName || orgName,
          total,
          positive,
          negative,
          neutral: total - positive - negative,
          isOwn: b.brandName === "" || b.brandName === orgName,
          score: total > 0 ? Math.round(((positive - negative) / total) * 100) : 0,
        };
      }),
    );

    return results.sort((a, b) => (b.isOwn ? 1 : 0) - (a.isOwn ? 1 : 0) || b.total - a.total);
  }),

  // ── Prompts CRUD ──────────────────────────────────────────

  promptList: orgProcedure
    .input(z.object({ category: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.llmPrompt.findMany({
        where: {
          organizationId: ctx.organizationId,
          ...(input.category ? { category: input.category } : {}),
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  promptCreate: orgProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        category: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.llmPrompt.create({
        data: { organizationId: ctx.organizationId, ...input },
      });
    }),

  promptMarkTested: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.llmPrompt.update({
        where: { id: input.id, organizationId: ctx.organizationId },
        data: { lastTestedAt: new Date() },
      });
    }),

  promptDelete: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.llmPrompt.delete({
        where: { id: input.id, organizationId: ctx.organizationId },
      });
      return { success: true };
    }),

  // ── Topics (derived from post tags) ──────────────────────

  topics: orgProcedure.query(async ({ ctx }) => {
    const postTags = await ctx.db.postTag.findMany({
      where: {
        post: { organizationId: ctx.organizationId, status: "PUBLISHED", deletedAt: null },
      },
      include: { tag: true },
    });

    const map = new Map<string, { name: string; slug: string; count: number; color: string | null }>();
    for (const pt of postTags) {
      const existing = map.get(pt.tagId);
      if (existing) {
        existing.count++;
      } else {
        map.set(pt.tagId, { name: pt.tag.name, slug: pt.tag.slug, count: 1, color: pt.tag.color });
      }
    }

    const topics = Array.from(map.values()).sort((a, b) => b.count - a.count);

    // Check if any topic appears in LLM mention queries
    const mentions = await ctx.db.llmMention.findMany({
      where: { organizationId: ctx.organizationId },
      select: { query: true, sentiment: true },
    });

    return topics.map((t) => {
      const related = mentions.filter((m) =>
        m.query.toLowerCase().includes(t.name.toLowerCase()),
      );
      return {
        ...t,
        llmMentions: related.length,
        llmSentiment:
          related.length > 0
            ? related.filter((m) => m.sentiment === "positive").length > related.length / 2
              ? "positive"
              : related.filter((m) => m.sentiment === "negative").length > related.length / 2
              ? "negative"
              : "neutral"
            : null,
      };
    });
  }),
});
