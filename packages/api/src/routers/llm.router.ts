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

  // ── AI Visibility Score (0–100) ──────────────────────────

  visibilityScore: orgProcedure.query(async ({ ctx }) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [mentionCount, sentimentRows, citedPosts, totalPosts, topicsRows, promptRows] =
      await Promise.all([
        ctx.db.llmMention.count({
          where: { organizationId: ctx.organizationId, mentionedAt: { gte: thirtyDaysAgo } },
        }),
        ctx.db.llmMention.groupBy({
          by: ["sentiment"],
          where: { organizationId: ctx.organizationId, mentionedAt: { gte: thirtyDaysAgo } },
          _count: { sentiment: true },
        }),
        ctx.db.llmMention.findMany({
          where: { organizationId: ctx.organizationId, url: { not: null } },
          select: { url: true },
          distinct: ["url"],
        }),
        ctx.db.post.count({
          where: { organizationId: ctx.organizationId, status: "PUBLISHED", deletedAt: null },
        }),
        ctx.db.postTag.findMany({
          where: { post: { organizationId: ctx.organizationId, status: "PUBLISHED", deletedAt: null } },
          select: { tagId: true },
          distinct: ["tagId"],
        }),
        ctx.db.llmPrompt.findMany({
          where: { organizationId: ctx.organizationId },
          select: { lastTestedAt: true },
        }),
      ]);

    // Score components (each 0–100, weighted to total 100)
    // 1. Mention volume: 0–30 pts (log scale — 10 mentions = 30 pts)
    const mentionScore = Math.min(30, Math.round((Math.log10(Math.max(mentionCount, 1)) / Math.log10(10)) * 30));

    // 2. Sentiment: 0–25 pts
    const positive = sentimentRows.find((s) => s.sentiment === "positive")?._count.sentiment ?? 0;
    const negative = sentimentRows.find((s) => s.sentiment === "negative")?._count.sentiment ?? 0;
    const sentimentScore = mentionCount > 0
      ? Math.round(((positive - negative * 0.5) / mentionCount) * 25)
      : 0;
    const clampedSentiment = Math.max(0, Math.min(25, sentimentScore));

    // 3. Citations: 0–25 pts (unique posts cited)
    const uniquePostsWithUrls = new Set(
      citedPosts.map((m) => {
        try { return new URL(m.url!).pathname.split("/").filter(Boolean).pop() ?? ""; } catch { return ""; }
      }).filter(Boolean)
    ).size;
    const citationScore = Math.min(25, Math.round((uniquePostsWithUrls / Math.max(totalPosts, 1)) * 100));

    // 4. Topic coverage: 0–10 pts
    const topicCount = topicsRows.length;
    const mentionedTopicCount = topicsRows.filter((t) => {
      // simplistic: tag is "mentioned" if we have any mentions
      return mentionCount > 0;
    }).length;
    const topicScore = topicCount > 0 ? Math.min(10, Math.round((mentionCount > 0 ? 1 : 0) * 10)) : 0;

    // 5. Prompt testing: 0–10 pts
    const testedPrompts = promptRows.filter((p) => p.lastTestedAt).length;
    const totalPrompts = promptRows.length;
    const promptScore = totalPrompts > 0 ? Math.min(10, Math.round((testedPrompts / totalPrompts) * 10)) : 0;

    const total = Math.min(100, mentionScore + clampedSentiment + citationScore + topicScore + promptScore);

    return {
      total,
      components: {
        mentions: { score: mentionScore, max: 30, label: "Mention volume" },
        sentiment: { score: clampedSentiment, max: 25, label: "Sentiment" },
        citations: { score: citationScore, max: 25, label: "Content citations" },
        topics: { score: topicScore, max: 10, label: "Topic coverage" },
        prompts: { score: promptScore, max: 10, label: "Prompt testing" },
      },
      mentionCount,
      citedPostCount: uniquePostsWithUrls,
      testedPrompts,
      totalPrompts,
    };
  }),

  // ── Weekly mention trend (last 8 weeks) ──────────────────

  weeklyTrend: orgProcedure.query(async ({ ctx }) => {
    const weeks: { week: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7 - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const count = await ctx.db.llmMention.count({
        where: {
          organizationId: ctx.organizationId,
          mentionedAt: { gte: weekStart, lte: weekEnd },
        },
      });

      const label = weekStart.toLocaleDateString("en", { month: "short", day: "numeric" });
      weeks.push({ week: weekStart.toISOString().slice(0, 10), label, count });
    }
    return weeks;
  }),

  // ── Share of Voice ────────────────────────────────────────

  shareOfVoice: orgProcedure.query(async ({ ctx }) => {
    const org = await ctx.db.organization.findUnique({
      where: { id: ctx.organizationId },
      select: { name: true },
    });
    const orgName = org?.name ?? "";

    const brands = await ctx.db.llmMention.groupBy({
      by: ["brandName"],
      where: { organizationId: ctx.organizationId },
      _count: { brandName: true },
    });

    const total = brands.reduce((s, b) => s + b._count.brandName, 0);
    if (total === 0) return [];

    return brands
      .map((b) => ({
        brandName: b.brandName || orgName,
        count: b._count.brandName,
        percentage: Math.round((b._count.brandName / total) * 100),
        isOwn: b.brandName === "" || b.brandName === orgName,
      }))
      .sort((a, b) => (b.isOwn ? 1 : 0) - (a.isOwn ? 1 : 0) || b.count - a.count);
  }),

  // ── Post LLM optimization checks ─────────────────────────

  postOptimizationChecks: orgProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.postId, organizationId: ctx.organizationId },
        include: {
          seoMeta: true,
          tags: { include: { tag: true } },
        },
      });
      if (!post) return null;

      const contentText = post.contentPlain ?? "";
      const wordCount = contentText.split(/\s+/).filter(Boolean).length;
      const hasH2 = contentText.includes("\n## ") || (post.contentHtml?.includes("<h2") ?? false);
      const hasFaqSchema = post.seoMeta?.structuredData != null && JSON.stringify(post.seoMeta.structuredData).includes("FAQPage");
      const hasArticleSchema = post.seoMeta?.structuredData != null;
      const hasExcerpt = !!post.excerpt;
      const hasMetaDesc = !!post.seoMeta?.metaDescription;
      const tagCount = post.tags.length;
      const hasFeaturedImage = !!post.featuredImage;

      const checks = [
        {
          id: "word_count",
          label: "1,500+ words",
          description: "Comprehensive content gets cited more by AI systems",
          passed: wordCount >= 1500,
          impact: "high" as const,
          value: `${wordCount.toLocaleString()} words`,
        },
        {
          id: "headings",
          label: "Clear H2 headings",
          description: "Structured sections help AI parse and cite specific points",
          passed: hasH2,
          impact: "high" as const,
        },
        {
          id: "meta_desc",
          label: "Meta description set",
          description: "AI often uses meta descriptions as summaries",
          passed: hasMetaDesc,
          impact: "medium" as const,
        },
        {
          id: "excerpt",
          label: "Excerpt written",
          description: "A clear excerpt helps AI understand the post's focus",
          passed: hasExcerpt,
          impact: "medium" as const,
        },
        {
          id: "schema",
          label: "Structured data (JSON-LD)",
          description: "Schema markup helps AI parse your content correctly",
          passed: hasArticleSchema,
          impact: "high" as const,
        },
        {
          id: "faq_schema",
          label: "FAQ schema",
          description: "FAQPage schema makes your Q&A content directly citable by AI",
          passed: hasFaqSchema,
          impact: "medium" as const,
        },
        {
          id: "tags",
          label: "2+ tags assigned",
          description: "Topics/tags help AI associate your post with relevant queries",
          passed: tagCount >= 2,
          impact: "low" as const,
          value: `${tagCount} tag${tagCount !== 1 ? "s" : ""}`,
        },
        {
          id: "featured_image",
          label: "Featured image",
          description: "Visual content increases citation likelihood in multimodal AI",
          passed: hasFeaturedImage,
          impact: "low" as const,
        },
      ];

      const passed = checks.filter((c) => c.passed).length;
      const score = Math.round((passed / checks.length) * 100);

      return { postId: input.postId, title: post.title, score, checks, wordCount };
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
