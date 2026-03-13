import { TRPCError } from "@trpc/server";
import { z } from "zod";
import crypto from "crypto";

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
  editDocument,
  slugify,
} from "@rankflo/ai";
import type { AIConfig, BrandVoice, GeneratedContent } from "@rankflo/ai";
import { checkAndDeductCredits } from "../lib/credits";
import { CREDIT_COSTS } from "@rankflo/core/constants";

// ─── Helpers ────────────────────────────────────────────────

/**
 * Resolve AI config: org-level settings take priority over env vars.
 */
async function requireAIConfig(ctx: { db: { organization: { findUnique: (args: unknown) => Promise<{ settings: unknown } | null> } }; organizationId: string }): Promise<AIConfig> {
  // 1. Check org-level AI settings first
  const org = await ctx.db.organization.findUnique({
    where: { id: ctx.organizationId },
    select: { settings: true },
  });
  const settings = (org?.settings as Record<string, unknown>) ?? {};
  if (settings.aiApiKey && settings.aiProvider) {
    return {
      provider: settings.aiProvider as "openai" | "anthropic" | "google",
      apiKey: settings.aiApiKey as string,
    };
  }

  // 2. Fall back to environment variables
  const config = resolveAIConfig();
  if (!config) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "No AI provider configured. Add an API key in Settings → AI, or set OPENAI_API_KEY / ANTHROPIC_API_KEY in your environment.",
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
  // ─── GET PROVIDER INFO ──────────────────────────────────
  getProvider: orgProcedure
    .query(async ({ ctx }) => {
      const org = await ctx.db.organization.findUnique({
        where: { id: ctx.organizationId },
        select: { settings: true },
      });
      const settings = (org?.settings as Record<string, unknown>) ?? {};

      if (settings.aiApiKey && settings.aiProvider) {
        const p = settings.aiProvider as string;
        return {
          configured: true,
          provider: p,
          label: p === "anthropic" ? "Claude" : p === "openai" ? "GPT-4" : p === "google" ? "Gemini" : p,
        };
      }

      // Fall back to env
      const envConfig = resolveAIConfig();
      if (!envConfig) return { configured: false, provider: null, label: null };
      const p = envConfig.provider;
      return {
        configured: true,
        provider: p,
        label: p === "anthropic" ? "Claude" : p === "openai" ? "GPT-4" : p === "google" ? "Gemini" : p,
      };
    }),

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
      const config = await requireAIConfig(ctx);

      // Deduct AI credits before calling the provider
      await checkAndDeductCredits(ctx.db, ctx.organizationId, CREDIT_COSTS.generateContent, "generateContent");

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
      const config = await requireAIConfig(ctx);

      await checkAndDeductCredits(ctx.db, ctx.organizationId, CREDIT_COSTS.suggestTopics, "suggestTopics");

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
      const config = await requireAIConfig(ctx);

      await checkAndDeductCredits(ctx.db, ctx.organizationId, CREDIT_COSTS.createStrategy, "createStrategy");

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
      const config = await requireAIConfig(ctx);

      await checkAndDeductCredits(ctx.db, ctx.organizationId, CREDIT_COSTS.analyzeBrandVoice, "analyzeBrandVoice");

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
      const config = await requireAIConfig(ctx);

      await checkAndDeductCredits(ctx.db, ctx.organizationId, CREDIT_COSTS.improveContent, "improveContent");

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
      const config = await requireAIConfig(ctx);

      await checkAndDeductCredits(ctx.db, ctx.organizationId, CREDIT_COSTS.chat, "chat");

      let brandVoice: BrandVoice | undefined;
      let projectDescription: string | undefined;
      let existingPostTitles: string[] | undefined;

      if (input.projectId) {
        const project = await ctx.db.project.findFirst({
          where: {
            id: input.projectId,
            organizationId: ctx.organizationId,
          },
        });

        if (project) {
          brandVoice = buildBrandVoiceFromProject(project);
          projectDescription = project.description ?? undefined;

          const existingPosts = await ctx.db.post.findMany({
            where: { projectId: project.id, deletedAt: null },
            select: { title: true },
            orderBy: { updatedAt: "desc" },
            take: 30,
          });
          existingPostTitles = existingPosts.map((p) => p.title);
        }
      }

      try {
        const result = await chat(config, {
          message: input.message,
          context: input.context,
          brandVoice,
          projectDescription,
          existingPostTitles,
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

  // ─── CREATE POST (research + generate + save) ────────
  createPost: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
        topic: z.string().optional(),
        contentType: z
          .enum(["blog-post", "tutorial", "how-to", "listicle", "comparison", "landing-page"])
          .default("blog-post"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = await requireAIConfig(ctx);

      // Charge full generate cost — covers research + generation
      await checkAndDeductCredits(ctx.db, ctx.organizationId, CREDIT_COSTS.generateContent, "createPost");

      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, organizationId: ctx.organizationId },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      // Load existing post titles to avoid duplicates
      const existingPosts = await ctx.db.post.findMany({
        where: { projectId: project.id, deletedAt: null },
        select: { title: true },
        orderBy: { updatedAt: "desc" },
        take: 50,
      });
      const existingTitles = existingPosts.map((p) => p.title);

      const brandStyle = project.brandStyle as Record<string, unknown> | null;
      const contentScope =
        typeof brandStyle?.contentScope === "string"
          ? brandStyle.contentScope
          : project.description ?? undefined;

      // Determine topic
      let topicTitle: string;
      let topicKeywords: string[] = [];

      if (input.topic) {
        topicTitle = input.topic;
      } else {
        // Auto-research a unique topic the project hasn't covered yet
        const suggestions = await suggestTopics(config, {
          projectName: project.name,
          industry: typeof brandStyle?.industry === "string" ? brandStyle.industry : undefined,
          audience:
            typeof brandStyle?.targetAudience === "string"
              ? brandStyle.targetAudience
              : undefined,
          existingTopics: existingTitles,
          contentScope,
          count: 3,
        });

        const picked = suggestions[0];
        if (!picked) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not generate a topic suggestion",
          });
        }
        topicTitle = picked.topic;
        topicKeywords = picked.keywords;
      }

      const brandVoice = buildBrandVoiceFromProject(project);

      // Generate full content
      let generated: GeneratedContent;
      try {
        generated = await generateContent(
          config,
          {
            topic: topicTitle,
            targetKeywords: topicKeywords.length > 0 ? topicKeywords : [topicTitle],
            contentType: input.contentType,
          },
          brandVoice,
        );
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `Content generation failed: ${error.message}`
              : "Content generation failed unexpectedly.",
          cause: error,
        });
      }

      // Save as DRAFT post
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
          contentHtml: generated.contentHtml,
          contentPlain: generated.content,
          readingTime: generated.estimatedReadTime,
          status: "DRAFT",
          organizationId: ctx.organizationId,
          authorId: ctx.session.user.id,
          projectId: project.id,
          version: 1,
          locale: "en",
        },
      });

      // Create SEO metadata
      await ctx.db.seoMeta.create({
        data: {
          postId: post.id,
          metaTitle: generated.metaTitle,
          metaDescription: generated.metaDescription,
          keywords: generated.tags,
          structuredData: (generated.structuredData as object) ?? undefined,
        },
      });

      // Update project post count
      await ctx.db.project.update({
        where: { id: project.id },
        data: { postCount: { increment: 1 } },
      });

      return {
        postId: post.id,
        slug: post.slug,
        title: post.title,
      };
    }),

  // ─── EDIT DOCUMENT (live block editing) ─────────────────
  editDocument: orgProcedure
    .input(
      z.object({
        instruction: z.string().min(1).max(600),
        currentBlocks: z.array(z.any()),
        postTitle: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = await requireAIConfig(ctx);
      await checkAndDeductCredits(ctx.db, ctx.organizationId, CREDIT_COSTS.improveContent, "editDocument");

      try {
        const result = await editDocument(config, {
          instruction: input.instruction,
          currentBlocks: input.currentBlocks,
          postTitle: input.postTitle,
        });
        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Document edit failed.",
          cause: error,
        });
      }
    }),

  // ─── GENERATE SCHEDULE (autopilot) ──────────────────────
  generateSchedule: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
        count: z.number().min(1).max(14).default(7),
        autoSchedule: z.boolean().default(false),
        keywords: z.string().optional(),
        startDate: z.coerce.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = await requireAIConfig(ctx);
      await checkAndDeductCredits(ctx.db, ctx.organizationId, CREDIT_COSTS.suggestTopics * input.count, "generateSchedule");

      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, organizationId: ctx.organizationId },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });

      const existing = await ctx.db.post.findMany({
        where: { projectId: input.projectId, deletedAt: null },
        select: { title: true },
        take: 50,
      });
      const existingTitles = existing.map((p) => p.title);

      const brandStyle = project.brandStyle as Record<string, unknown> | null;
      const contentScope = input.keywords
        ? `Focus on: ${input.keywords}`
        : typeof brandStyle?.contentScope === "string"
          ? brandStyle.contentScope
          : project.description ?? undefined;

      const suggestions = await suggestTopics(config, {
        projectName: project.name,
        industry: typeof brandStyle?.industry === "string" ? brandStyle.industry : undefined,
        audience: typeof brandStyle?.targetAudience === "string" ? brandStyle.targetAudience : undefined,
        existingTopics: existingTitles,
        contentScope,
        count: input.count,
      });

      const startDate = input.startDate ?? new Date();
      const created: { id: string; title: string; slug: string; scheduledAt: Date | null }[] = [];

      for (let i = 0; i < suggestions.length; i++) {
        const topic = suggestions[i];
        if (!topic) continue;

        const dayOffset = Math.floor(i / 2);
        const slotHour = i % 2 === 0 ? 9 : 15;
        const scheduledAt = new Date(startDate);
        scheduledAt.setDate(scheduledAt.getDate() + dayOffset + 1);
        scheduledAt.setUTCHours(slotHour, 0, 0, 0);

        const postSlug = slugify(topic.topic) + "-" + crypto.randomBytes(3).toString("hex");

        const post = await ctx.db.post.create({
          data: {
            title: topic.topic,
            slug: postSlug,
            excerpt: topic.description ?? "",
            content: {
              blocks: [
                {
                  id: crypto.randomBytes(4).toString("hex"),
                  type: "callout",
                  props: {
                    type: "info",
                    title: "AI-generated post",
                    text: "Open this post in the editor and click \"Generate with AI\" to fill in the full content.",
                  },
                },
              ],
              version: 1,
              metadata: {},
            },
            contentPlain: topic.description ?? "",
            status: input.autoSchedule ? "SCHEDULED" : "DRAFT",
            scheduledAt: input.autoSchedule ? scheduledAt : null,
            organizationId: ctx.organizationId,
            authorId: ctx.session.user.id,
            projectId: project.id,
            version: 1,
            locale: "en",
          },
        });

        await ctx.db.calendarEntry.create({
          data: {
            organizationId: ctx.organizationId,
            title: topic.topic,
            entryType: "BLOG_POST",
            status: "PLANNED",
            postId: post.id,
            scheduledDate: scheduledAt,
            tags: topic.keywords ?? [],
          },
        });

        created.push({ id: post.id, title: post.title, slug: post.slug, scheduledAt: input.autoSchedule ? scheduledAt : null });
      }

      await ctx.db.project.update({
        where: { id: project.id },
        data: { postCount: { increment: created.length } },
      });

      return { created };
    }),
});
