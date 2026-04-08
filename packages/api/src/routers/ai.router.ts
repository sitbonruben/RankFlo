import { TRPCError } from "@trpc/server";
import { z } from "zod";
import crypto from "crypto";

import { router, orgProcedure } from "../trpc";
import { decrypt } from "../lib/encrypt";
import { logTokenUsage } from "../lib/credits";

// ─── Simple rate limiter for AI endpoints ──────────────────
const aiRateLimits = new Map<string, { count: number; resetAt: number }>();
function checkAIRateLimit(orgId: string, feature: string, maxPerMin: number) {
  const key = `${orgId}:${feature}`;
  const now = Date.now();
  const entry = aiRateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    aiRateLimits.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }
  if (entry.count >= maxPerMin) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Rate limit exceeded: max ${maxPerMin} requests per minute for ${feature}.` });
  }
  entry.count++;
}
// Clean up stale entries every 5 minutes
setInterval(() => { const now = Date.now(); for (const [k, v] of aiRateLimits) { if (now > v.resetAt) aiRateLimits.delete(k); } }, 300_000).unref();
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
  buildEditorBlocks,
  slugify,
  generateImageWithKie,
} from "@rankflo/ai";
import type { AIConfig, BrandVoice, GeneratedContent } from "@rankflo/ai";
import { checkAndDeductCredits } from "../lib/credits";
import { CREDIT_COSTS } from "@rankflo/core/constants";

// ─── Helpers ────────────────────────────────────────────────

/**
 * Log token usage from an AI result that has _usage metadata attached.
 * Fire-and-forget — never throws.
 */
async function maybeLogUsage(db: unknown, organizationId: string, result: unknown, feature: string) {
  try {
    const r = result as Record<string, unknown> | null;
    if (!r) return;
    const usage = r._usage as { provider: string; model: string; inputTokens: number; outputTokens: number } | undefined;
    if (usage && usage.inputTokens > 0) {
      await logTokenUsage(db as never, organizationId, { ...usage, feature });
    }
  } catch {
    // Never break the main flow
  }
}

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
  if (settings.aiProvider === "ollama") {
    return {
      provider: "ollama",
      apiKey: "",
      baseUrl: (settings.aiBaseUrl as string | undefined) ?? "http://localhost:11434",
      model: (settings.aiModel as string | undefined) ?? "llama3.2",
    };
  }
  if (settings.aiApiKey && settings.aiProvider) {
    return {
      provider: settings.aiProvider as "openai" | "anthropic" | "google" | "kie",
      apiKey: decrypt(settings.aiApiKey as string),
      model: settings.aiModel as string | undefined,
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
          label: p === "anthropic" ? "Claude" : p === "openai" ? "GPT-4" : p === "google" ? "Gemini" : p === "kie" ? "KIE.ai" : p,
        };
      }

      // Fall back to env
      const envConfig = resolveAIConfig();
      if (!envConfig) return { configured: false, provider: null, label: null };
      const p = envConfig.provider;
      return {
        configured: true,
        provider: p,
        label: p === "anthropic" ? "Claude" : p === "openai" ? "GPT-4" : p === "google" ? "Gemini" : p === "kie" ? "KIE.ai" : p,
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
      checkAIRateLimit(ctx.organizationId, "generateContent", 5);
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

        await maybeLogUsage(ctx.db, ctx.organizationId, result, "generateContent");

        // Auto-fetch a free stock image from Pexels based on the AI-suggested prompt
        if (result.featuredImagePrompt) {
          try {
            const pexelsKey = process.env.PEXELS_API_KEY ?? "lByrJErb46CXBMBflk7oTdJcqJCfccLKl4klnmU3k7LcGRpvOMYqcbS8";
            const searchTerms = result.featuredImagePrompt.slice(0, 100);
            const imgRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerms)}&per_page=5&orientation=landscape`, { headers: { Authorization: pexelsKey } });
            if (imgRes.ok) {
              const imgData = (await imgRes.json()) as { photos: { src: { large2x: string } }[] };
              const firstImg = imgData.photos?.[0]?.src?.large2x;
              if (firstImg) {
                (result as Record<string, unknown>).featuredImage = firstImg;
              }
            }
          } catch { /* non-critical */ }
        }

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

        await maybeLogUsage(ctx.db, ctx.organizationId, topics, "suggestTopics");
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
      checkAIRateLimit(ctx.organizationId, "improveContent", 10);
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

        await maybeLogUsage(ctx.db, ctx.organizationId, result, "improveContent");
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
      checkAIRateLimit(ctx.organizationId, "chat", 20);
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

      // Auto-fetch a free stock image for the featured image
      let featuredImage: string | undefined;
      if (generated.featuredImagePrompt) {
        try {
          const pexelsKey = process.env.PEXELS_API_KEY ?? "lByrJErb46CXBMBflk7oTdJcqJCfccLKl4klnmU3k7LcGRpvOMYqcbS8";
          const searchTerms = generated.featuredImagePrompt.slice(0, 100);
          const imgRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerms)}&per_page=5&orientation=landscape`, { headers: { Authorization: pexelsKey } });
          if (imgRes.ok) {
            const imgData = (await imgRes.json()) as { photos: { src: { large2x: string } }[] };
            const firstImg = imgData.photos?.[0]?.src?.large2x;
            if (firstImg) featuredImage = firstImg;
          }
        } catch { /* non-critical */ }
      }

      // Parse HTML into proper editor blocks
      const blocks: { id: string; type: string; props: Record<string, unknown> }[] = [];
      blocks.push({ id: crypto.randomUUID(), type: "table-of-contents", props: { style: "minimal", maxDepth: 3 } });
      const htmlParts = generated.contentHtml.match(/<(h[1-4]|p|ul|ol|blockquote)(\s[^>]*)?>[\s\S]*?<\/\1>/gi) ?? [];
      for (const part of htmlParts) {
        const tag = part.match(/^<(\w+)/)?.[1]?.toLowerCase() ?? "";
        const text = part.replace(/<[^>]*>/g, "").trim();
        if (!text) continue;
        if (tag.startsWith("h")) {
          blocks.push({ id: crypto.randomUUID(), type: "heading", props: { text, level: Math.min(parseInt(tag[1]!), 4), alignment: "left" } });
        } else if (tag === "ul" || tag === "ol") {
          const items = [...part.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => m[1]!.replace(/<[^>]*>/g, "").trim()).filter(Boolean);
          if (items.length) blocks.push({ id: crypto.randomUUID(), type: "list", props: { items, style: tag === "ul" ? "bullet" : "number" } });
        } else {
          blocks.push({ id: crypto.randomUUID(), type: "text", props: { html: `<p>${text}</p>`, alignment: "left" } });
        }
      }
      if (blocks.length <= 1) {
        blocks.push({ id: crypto.randomUUID(), type: "text", props: { html: generated.contentHtml, alignment: "left" } });
      }
      blocks.push({ id: crypto.randomUUID(), type: "newsletter-cta", props: { title: "Stay in the loop", description: "Get the latest insights delivered to your inbox.", buttonText: "Subscribe", style: "card", placeholder: "your@email.com" } });

      // Save as DRAFT post
      const post = await ctx.db.post.create({
        data: {
          title: generated.title,
          slug: generated.slug || slugify(generated.title),
          excerpt: generated.excerpt,
          featuredImage,
          content: { version: 1, metadata: {}, blocks },
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

  // ─── BUILD BLOCKS (write directly to editor) ─────────────
  buildBlocks: orgProcedure
    .input(
      z.object({
        topic: z.string().min(1).max(500),
        contentType: z
          .enum(["blog-post", "how-to", "listicle", "tutorial", "comparison", "case-study", "opinion", "roundup"])
          .default("blog-post"),
        keywords: z.array(z.string()).optional(),
        audience: z.string().optional(),
        tone: z.string().optional(),
        projectId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = await requireAIConfig(ctx);
      await checkAndDeductCredits(ctx.db, ctx.organizationId, CREDIT_COSTS.improveContent, "buildBlocks");

      let brandVoice: BrandVoice | undefined;
      let projectDescription: string | undefined;

      if (input.projectId) {
        const project = await ctx.db.project.findFirst({
          where: { id: input.projectId, organizationId: ctx.organizationId },
        });
        if (project) {
          brandVoice = buildBrandVoiceFromProject(project);
          projectDescription = project.description ?? undefined;
        }
      }

      try {
        const result = await buildEditorBlocks(config, {
          topic: input.topic,
          contentType: input.contentType,
          keywords: input.keywords,
          audience: input.audience,
          tone: input.tone,
          projectDescription,
          brandVoice,
        });
        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to generate content blocks.",
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

  // ─── SEARCH FREE IMAGES (Pexels) ────────────────────────
  searchImages: orgProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        page: z.number().int().positive().default(1),
      }),
    )
    .query(async ({ input }) => {
      const apiKey = process.env.PEXELS_API_KEY ?? "lByrJErb46CXBMBflk7oTdJcqJCfccLKl4klnmU3k7LcGRpvOMYqcbS8";
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(input.query)}&per_page=20&page=${input.page}&orientation=landscape`;
      const res = await fetch(url, {
        headers: { Authorization: apiKey },
      });
      if (!res.ok) return { images: [], total: 0 };
      const data = (await res.json()) as {
        total_results: number;
        photos: {
          id: number;
          src: { original: string; large2x: string; large: string; medium: string; small: string; tiny: string };
          photographer: string;
          photographer_url: string;
          alt?: string;
        }[];
      };
      return {
        images: data.photos.map((p) => ({
          id: String(p.id),
          url: p.src.large2x || p.src.large,
          thumbUrl: p.src.medium || p.src.small,
          alt: p.alt ?? "",
          photographer: p.photographer,
          photographerUrl: p.photographer_url,
        })),
        total: data.total_results,
      };
    }),

  // ─── GENERATE IMAGE (KIE Nano Banana) ───────────────────
  generateImage: orgProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(2000),
        aspectRatio: z.enum(["1:1", "16:9", "4:3", "9:16"]).default("16:9"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkAIRateLimit(ctx.organizationId, "generateImage", 3);
      // Resolve KIE image API key — org setting takes priority, then env
      const org = await ctx.db.organization.findUnique({
        where: { id: ctx.organizationId },
        select: { settings: true },
      });
      const settings = (org?.settings as Record<string, unknown>) ?? {};
      const apiKey =
        settings.kieImageApiKey ? decrypt(settings.kieImageApiKey as string) :
        process.env.KIE_API_KEY;

      if (!apiKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "No KIE API key configured. Add your KIE API key in Settings → AI.",
        });
      }

      await checkAndDeductCredits(ctx.db, ctx.organizationId, CREDIT_COSTS.improveContent, "generateImage");

      try {
        const url = await generateImageWithKie(apiKey, input.prompt, input.aspectRatio);
        return { url };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `Image generation failed: ${error.message}`
              : "Image generation failed unexpectedly.",
          cause: error,
        });
      }
    }),
});
