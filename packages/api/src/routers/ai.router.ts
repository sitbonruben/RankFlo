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
  improveContent,
  chat,
} from "@rankflo/ai";
import type { AIConfig, BrandVoice } from "@rankflo/ai";

// ─── Helpers ────────────────────────────────────────────────

/**
 * Resolve the AI configuration from environment variables.
 * Throws a descriptive PRECONDITION_FAILED error if no API key is set.
 */
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

/**
 * Build a BrandVoice object from a project's stored brand settings.
 * Falls back to sensible defaults when the project has no brand configuration.
 */
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

export const aiRouter = router({
  // ─── GENERATE CONTENT ───────────────────────────────────
  generateContent: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
        topic: z.string().min(1),
        targetKeywords: z.array(z.string()).min(1),
        secondaryKeywords: z.array(z.string()).optional(),
        contentType: z
          .enum([
            "blog-post",
            "landing-page",
            "product-description",
            "tutorial",
            "comparison",
            "listicle",
            "how-to",
            "case-study",
            "news",
          ])
          .default("blog-post"),
        wordCount: z.number().min(100).max(10000).optional(),
        tone: z.string().optional(),
        outline: z.array(z.string()).optional(),
        callToAction: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = requireAIConfig();

      // Look up the project to get brand voice and style
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, organizationId: ctx.organizationId },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const brandVoice = buildBrandVoiceFromProject(project);

      try {
        const result = await generateContent(
          config,
          {
            topic: input.topic,
            targetKeywords: input.targetKeywords,
            secondaryKeywords: input.secondaryKeywords,
            contentType: input.contentType,
            wordCount: input.wordCount,
            tone: input.tone,
            outline: input.outline,
            callToAction: input.callToAction,
          },
          brandVoice,
        );

        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `AI generation failed: ${error.message}`
              : "AI generation failed unexpectedly.",
          cause: error,
        });
      }
    }),

  // ─── SUGGEST TOPICS ─────────────────────────────────────
  suggestTopics: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
        count: z.number().min(1).max(50).default(10),
        existingTopics: z.array(z.string()).optional(),
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

      // Gather existing post titles if the caller did not provide existingTopics
      let existingTopics = input.existingTopics;
      if (!existingTopics || existingTopics.length === 0) {
        const existingPosts = await ctx.db.post.findMany({
          where: { projectId: project.id, deletedAt: null },
          select: { title: true },
          take: 100,
        });
        existingTopics = existingPosts.map((p) => p.title);
      }

      const brandStyle = project.brandStyle as Record<string, unknown> | null;

      try {
        const topics = await suggestTopics(config, {
          projectName: project.name,
          industry:
            typeof brandStyle?.industry === "string"
              ? brandStyle.industry
              : undefined,
          audience:
            typeof brandStyle?.targetAudience === "string"
              ? brandStyle.targetAudience
              : undefined,
          existingTopics,
          count: input.count,
        });

        return { topics };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `Topic suggestion failed: ${error.message}`
              : "Topic suggestion failed unexpectedly.",
          cause: error,
        });
      }
    }),

  // ─── CREATE CONTENT STRATEGY ────────────────────────────
  createStrategy: orgProcedure
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

      try {
        const strategy = await createContentStrategy(config, {
          projectName: project.name,
          industry:
            typeof brandStyle?.industry === "string"
              ? brandStyle.industry
              : undefined,
          audience:
            typeof brandStyle?.targetAudience === "string"
              ? brandStyle.targetAudience
              : undefined,
          businessGoals: input.businessGoals,
          weeksAhead: input.weeksAhead,
        });

        return strategy;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `Strategy creation failed: ${error.message}`
              : "Strategy creation failed unexpectedly.",
          cause: error,
        });
      }
    }),

  // ─── ANALYZE SEO (pure algorithmic, no AI key needed) ──
  analyzeSEO: orgProcedure
    .input(
      z.object({
        content: z.string().min(1),
        title: z.string().min(1),
        description: z.string().default(""),
        targetKeywords: z.array(z.string()).min(1),
      }),
    )
    .query(async ({ input }) => {
      const analysis = analyzeSEO({
        content: input.content,
        title: input.title,
        description: input.description,
        targetKeywords: input.targetKeywords,
      });

      return analysis;
    }),

  // ─── ANALYZE BRAND VOICE ────────────────────────────────
  analyzeBrandVoice: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
        samples: z.array(z.string()).optional(),
        websiteUrl: z.string().url().optional(),
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

      // If no samples are provided, fetch recent posts from this project
      let samples = input.samples;
      if (!samples || samples.length === 0) {
        const recentPosts = await ctx.db.post.findMany({
          where: {
            projectId: project.id,
            deletedAt: null,
            contentPlain: { not: null },
          },
          select: { contentPlain: true },
          orderBy: { updatedAt: "desc" },
          take: 5,
        });

        samples = recentPosts
          .map((p) => p.contentPlain)
          .filter((c): c is string => c !== null && c.length > 100);
      }

      // Use the project URL as the website URL if not provided
      const websiteUrl = input.websiteUrl ?? project.url ?? undefined;

      if ((!samples || samples.length === 0) && !websiteUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Provide content samples or a website URL to analyze brand voice. No existing published content was found for this project.",
        });
      }

      try {
        const brandVoice = await analyzeBrandVoice(config, {
          samples,
          websiteUrl,
        });

        // Persist the analyzed brand voice onto the project
        await ctx.db.project.update({
          where: { id: project.id },
          data: {
            brandStyle: {
              ...((project.brandStyle as Record<string, unknown>) ?? {}),
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

        return brandVoice;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `Brand voice analysis failed: ${error.message}`
              : "Brand voice analysis failed unexpectedly.",
          cause: error,
        });
      }
    }),

  // ─── IMPROVE CONTENT ───────────────────────────────────
  improveContent: orgProcedure
    .input(
      z.object({
        content: z.string().min(1),
        instructions: z.string().min(1),
        projectId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = requireAIConfig();

      let brandVoice: BrandVoice | undefined;

      if (input.projectId) {
        const project = await ctx.db.project.findFirst({
          where: {
            id: input.projectId,
            organizationId: ctx.organizationId,
          },
        });

        if (project) {
          brandVoice = buildBrandVoiceFromProject(project);
        }
      }

      try {
        const result = await improveContent(config, {
          content: input.content,
          instructions: input.instructions,
          brandVoice,
        });

        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `Content improvement failed: ${error.message}`
              : "Content improvement failed unexpectedly.",
          cause: error,
        });
      }
    }),

  // ─── AI CHAT ────────────────────────────────────────────
  chat: orgProcedure
    .input(
      z.object({
        message: z.string().min(1),
        context: z.string().optional(),
        projectId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = requireAIConfig();

      let brandVoice: BrandVoice | undefined;

      if (input.projectId) {
        const project = await ctx.db.project.findFirst({
          where: {
            id: input.projectId,
            organizationId: ctx.organizationId,
          },
        });

        if (project) {
          brandVoice = buildBrandVoiceFromProject(project);
        }
      }

      try {
        const result = await chat(config, {
          message: input.message,
          context: input.context,
          brandVoice,
        });

        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `AI chat failed: ${error.message}`
              : "AI chat failed unexpectedly.",
          cause: error,
        });
      }
    }),
});
