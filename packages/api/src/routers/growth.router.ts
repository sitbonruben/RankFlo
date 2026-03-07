import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, orgProcedure } from "../trpc";
import {
  resolveAIConfig,
  generateContent,
  suggestTopics,
  createContentStrategy,
  analyzeSEO,
  analyzeBrandVoice,
  slugify,
} from "@rankflo/ai";
import type { AIConfig, BrandVoice } from "@rankflo/ai";

// ─── Helpers ────────────────────────────────────────────────

function requireAIConfig(): AIConfig {
  const config = resolveAIConfig();
  if (!config) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in your environment.",
    });
  }
  return config;
}

function buildBrandVoiceFromProject(project: {
  name: string;
  description?: string | null;
  brandStyle?: unknown;
  url?: string | null;
}): BrandVoice {
  const style = project.brandStyle as Record<string, unknown> | null | undefined;

  return {
    tone: Array.isArray(style?.tone)
      ? (style.tone as string[])
      : ["professional", "informative"],
    style: typeof style?.writingStyle === "string"
      ? style.writingStyle
      : "Clear and engaging",
    vocabulary: Array.isArray(style?.vocabulary)
      ? (style.vocabulary as string[])
      : [],
    avoidWords: Array.isArray(style?.avoidWords)
      ? (style.avoidWords as string[])
      : [],
    targetAudience: typeof style?.targetAudience === "string"
      ? style.targetAudience
      : "General audience",
    industry: typeof style?.industry === "string"
      ? style.industry
      : "General",
    examples: Array.isArray(style?.examples)
      ? (style.examples as string[])
      : undefined,
  };
}

// ─── Router ─────────────────────────────────────────────────

export const growthRouter = router({
  /**
   * SCAN — One-click site analysis.
   * Takes a URL, extracts brand voice, creates/updates project.
   * Returns brand identity + initial topic suggestions.
   */
  scan: orgProcedure
    .input(
      z.object({
        url: z.string().url(),
        projectName: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = requireAIConfig();
      const url = input.url;
      const projectName =
        input.projectName || new URL(url).hostname.replace("www.", "");

      // 1. Analyze brand voice from URL
      let brandVoice: BrandVoice;
      try {
        brandVoice = await analyzeBrandVoice(config, { websiteUrl: url });
      } catch {
        // Fallback to defaults if brand analysis fails
        brandVoice = {
          tone: ["professional", "informative"],
          style: "Clear and engaging",
          vocabulary: [],
          avoidWords: [],
          targetAudience: "General audience",
          industry: "General",
        };
      }

      // 2. Create or update project
      let project = await ctx.db.project.findFirst({
        where: { url, organizationId: ctx.organizationId },
      });

      if (project) {
        project = await ctx.db.project.update({
          where: { id: project.id },
          data: {
            brandStyle: {
              tone: brandVoice.tone,
              writingStyle: brandVoice.style,
              vocabulary: brandVoice.vocabulary,
              avoidWords: brandVoice.avoidWords,
              targetAudience: brandVoice.targetAudience,
              industry: brandVoice.industry,
              examples: brandVoice.examples,
            },
          },
        });
      } else {
        project = await ctx.db.project.create({
          data: {
            name: projectName,
            url,
            organizationId: ctx.organizationId,
            platform: "web",
            status: "ACTIVE",
            apiKey: crypto.randomUUID(),
            brandStyle: {
              tone: brandVoice.tone,
              writingStyle: brandVoice.style,
              vocabulary: brandVoice.vocabulary,
              avoidWords: brandVoice.avoidWords,
              targetAudience: brandVoice.targetAudience,
              industry: brandVoice.industry,
              examples: brandVoice.examples,
            },
          },
        });
      }

      // 3. Suggest initial topics
      let topics;
      try {
        topics = await suggestTopics(config, {
          projectName: project.name,
          industry: brandVoice.industry,
          audience: brandVoice.targetAudience,
          count: 8,
        });
      } catch {
        topics = [];
      }

      return {
        projectId: project.id,
        projectName: project.name,
        brandVoice,
        topics,
      };
    }),

  /**
   * RESEARCH — Get topic suggestions for a project.
   */
  research: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
        count: z.number().min(1).max(30).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const config = requireAIConfig();

      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, organizationId: ctx.organizationId },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      // Get existing post titles to avoid duplicates
      const existingPosts = await ctx.db.post.findMany({
        where: { projectId: project.id, deletedAt: null },
        select: { title: true },
        take: 100,
      });

      const brandStyle = project.brandStyle as Record<string, unknown> | null;

      const topics = await suggestTopics(config, {
        projectName: project.name,
        industry:
          typeof brandStyle?.industry === "string" ? brandStyle.industry : undefined,
        audience:
          typeof brandStyle?.targetAudience === "string"
            ? brandStyle.targetAudience
            : undefined,
        existingTopics: existingPosts.map((p) => p.title),
        count: input.count,
      });

      return { topics };
    }),

  /**
   * AUDIT — Run SEO audit across all posts in a project.
   */
  audit: orgProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, organizationId: ctx.organizationId },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const posts = await ctx.db.post.findMany({
        where: { projectId: project.id, deletedAt: null },
        select: {
          id: true,
          title: true,
          slug: true,
          contentPlain: true,
          excerpt: true,
          status: true,
          seoMeta: true,
        },
        take: 50,
      });

      const audits = posts.map((post) => {
        const analysis = analyzeSEO({
          content: post.contentPlain ?? "",
          title: post.title,
          description: post.seoMeta?.metaDescription ?? post.excerpt ?? "",
          targetKeywords: (post.seoMeta?.keywords as string[]) ?? [],
        });

        return {
          postId: post.id,
          title: post.title,
          slug: post.slug,
          status: post.status,
          score: analysis.score,
          issues: [
            ...(analysis.title.score < 70 ? analysis.title.suggestions : []),
            ...(analysis.description.score < 70
              ? analysis.description.suggestions
              : []),
            ...(analysis.keywords.score < 70 ? analysis.keywords.suggestions : []),
            ...(analysis.readability.score < 70
              ? analysis.readability.suggestions
              : []),
            ...(analysis.contentLength.score < 70
              ? analysis.contentLength.suggestions
              : []),
          ],
        };
      });

      const avgScore =
        audits.length > 0
          ? Math.round(audits.reduce((sum, a) => sum + a.score, 0) / audits.length)
          : 0;

      return {
        overallScore: avgScore,
        totalPosts: audits.length,
        issues: audits.filter((a) => a.issues.length > 0),
        topPerformers: audits
          .filter((a) => a.score >= 80)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5),
        needsWork: audits
          .filter((a) => a.score < 60)
          .sort((a, b) => a.score - b.score)
          .slice(0, 5),
      };
    }),

  /**
   * STRATEGY — Generate a content strategy for a project.
   */
  strategy: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
        businessGoals: z.array(z.string()).min(1),
        weeksAhead: z.number().min(1).max(52).default(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = requireAIConfig();

      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, organizationId: ctx.organizationId },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const brandStyle = project.brandStyle as Record<string, unknown> | null;

      const strategy = await createContentStrategy(config, {
        projectName: project.name,
        industry:
          typeof brandStyle?.industry === "string" ? brandStyle.industry : undefined,
        audience:
          typeof brandStyle?.targetAudience === "string"
            ? brandStyle.targetAudience
            : undefined,
        businessGoals: input.businessGoals,
        weeksAhead: input.weeksAhead,
      });

      return strategy;
    }),

  /**
   * QUICK GENERATE — One-click content generation from a topic.
   * Creates an AI-generated draft post.
   */
  quickGenerate: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
        topic: z.string().min(1),
        keywords: z.array(z.string()).min(1),
        contentType: z
          .enum([
            "blog-post",
            "landing-page",
            "tutorial",
            "comparison",
            "listicle",
            "how-to",
          ])
          .default("blog-post"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = requireAIConfig();

      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, organizationId: ctx.organizationId },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const brandVoice = buildBrandVoiceFromProject(project);

      // Generate the content
      const generated = await generateContent(
        config,
        {
          topic: input.topic,
          targetKeywords: input.keywords,
          contentType: input.contentType,
        },
        brandVoice,
      );

      // Create a draft post
      const post = await ctx.db.post.create({
        data: {
          title: generated.title,
          slug: generated.slug || slugify(generated.title),
          excerpt: generated.excerpt,
          content: {
            type: "doc",
            blocks: [
              {
                id: crypto.randomUUID(),
                type: "markdown",
                props: { content: generated.content },
              },
            ],
          },
          contentPlain: generated.content,
          status: "DRAFT",
          organizationId: ctx.organizationId,
          authorId: ctx.session.user.id,
          projectId: project.id,
          version: 1,
          locale: "en",
        },
      });

      // Create SEO meta for the post
      await ctx.db.seoMeta.create({
        data: {
          postId: post.id,
          metaTitle: generated.metaTitle,
          metaDescription: generated.metaDescription,
          keywords: generated.tags,
          structuredData: generated.structuredData,
        },
      });

      return {
        postId: post.id,
        title: generated.title,
        slug: generated.slug,
        excerpt: generated.excerpt,
        wordCount: generated.wordCount,
        seoScore: generated.seoScore,
        readTime: generated.estimatedReadTime,
      };
    }),

  /**
   * OVERVIEW — Get aggregated stats for a project.
   */
  overview: orgProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, organizationId: ctx.organizationId },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const [postCount, publishedCount, draftCount] = await Promise.all([
        ctx.db.post.count({
          where: { projectId: project.id, deletedAt: null },
        }),
        ctx.db.post.count({
          where: { projectId: project.id, deletedAt: null, status: "PUBLISHED" },
        }),
        ctx.db.post.count({
          where: { projectId: project.id, deletedAt: null, status: "DRAFT" },
        }),
      ]);

      const brandStyle = project.brandStyle as Record<string, unknown> | null;

      return {
        project: {
          id: project.id,
          name: project.name,
          url: project.url,
        },
        stats: {
          totalPosts: postCount,
          published: publishedCount,
          drafts: draftCount,
        },
        brand: brandStyle
          ? {
              industry: brandStyle.industry as string | undefined,
              targetAudience: brandStyle.targetAudience as string | undefined,
              tone: brandStyle.tone as string[] | undefined,
              writingStyle: brandStyle.writingStyle as string | undefined,
            }
          : null,
      };
    }),
});
