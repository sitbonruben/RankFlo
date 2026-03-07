import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, orgProcedure } from "../trpc";
import { resolveAIConfig, AIProviderClient } from "@rankflo/ai";
import type { AIConfig } from "@rankflo/ai";

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

const socialPlatformEnum = z.enum([
  "TWITTER",
  "LINKEDIN",
  "FACEBOOK",
  "INSTAGRAM",
  "THREADS",
  "BLUESKY",
  "MASTODON",
]);

const socialPostStatusEnum = z.enum([
  "DRAFT",
  "SCHEDULED",
  "PUBLISHING",
  "PUBLISHED",
  "FAILED",
]);

// Platform-specific prompts for content repurposing
const PLATFORM_PROMPTS: Record<string, string> = {
  TWITTER:
    "Rewrite the following blog post as a Twitter/X post. Must be under 280 characters. Make it punchy and attention-grabbing. Include 2-3 relevant hashtags. Do not use markdown.",
  LINKEDIN:
    "Rewrite the following blog post as a LinkedIn post. Use a professional tone. Use line breaks for readability. Start with a hook. End with a call to action or question. Keep it under 3000 characters. Do not use markdown links.",
  FACEBOOK:
    "Rewrite the following blog post as a Facebook post. Keep it casual and engaging. Use emoji sparingly for visual appeal. Encourage interaction with a question or call to action. Keep it under 500 characters.",
  INSTAGRAM:
    "Rewrite the following blog post as an Instagram caption. Focus on the visual story. Use a conversational tone. Add 5-10 relevant hashtags at the end. Keep it under 2200 characters.",
  THREADS:
    "Rewrite the following blog post as a Threads post. Keep it concise and conversational. Under 500 characters. Make it shareable.",
  BLUESKY:
    "Rewrite the following blog post as a Bluesky post. Must be under 300 characters. Be concise and engaging. Include relevant context.",
  MASTODON:
    "Rewrite the following blog post as a Mastodon post. Must be under 500 characters. Be thoughtful and community-oriented. Include 2-3 relevant hashtags.",
};

// ─── Router ─────────────────────────────────────────────────

export const socialRouter = router({
  accounts: router({
    /**
     * LIST — Get all social accounts for the organization.
     */
    list: orgProcedure.query(async ({ ctx }) => {
      const accounts = await ctx.db.socialAccount.findMany({
        where: { organizationId: ctx.organizationId },
        orderBy: { createdAt: "desc" },
      });

      return { items: accounts };
    }),

    /**
     * CREATE — Add a new social media account.
     */
    create: orgProcedure
      .input(
        z.object({
          platform: socialPlatformEnum,
          accountName: z.string().min(1),
          accountId: z.string().optional(),
          accessToken: z.string().optional(),
          refreshToken: z.string().optional(),
          tokenExpiresAt: z.coerce.date().optional(),
          avatarUrl: z.string().url().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await ctx.db.socialAccount.findUnique({
          where: {
            organizationId_platform_accountName: {
              organizationId: ctx.organizationId,
              platform: input.platform,
              accountName: input.accountName,
            },
          },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `A ${input.platform} account with name "${input.accountName}" already exists`,
          });
        }

        const account = await ctx.db.socialAccount.create({
          data: {
            organizationId: ctx.organizationId,
            platform: input.platform,
            accountName: input.accountName,
            accountId: input.accountId,
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            tokenExpiresAt: input.tokenExpiresAt,
            avatarUrl: input.avatarUrl,
          },
        });

        return account;
      }),

    /**
     * DELETE — Remove a social media account.
     */
    delete: orgProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const account = await ctx.db.socialAccount.findFirst({
          where: { id: input.id, organizationId: ctx.organizationId },
        });

        if (!account) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Social account not found",
          });
        }

        await ctx.db.socialAccount.delete({ where: { id: input.id } });

        return { success: true };
      }),
  }),

  posts: router({
    /**
     * LIST — Get paginated social posts with account info.
     */
    list: orgProcedure
      .input(
        z
          .object({
            status: socialPostStatusEnum.optional(),
            accountId: z.string().optional(),
            page: z.number().min(1).default(1),
            limit: z.number().min(1).max(100).default(20),
          })
          .optional()
          .default({}),
      )
      .query(async ({ ctx, input }) => {
        const { page, limit, status, accountId } = input;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {
          organizationId: ctx.organizationId,
        };

        if (status) where.status = status;
        if (accountId) where.socialAccountId = accountId;

        const [items, total] = await Promise.all([
          ctx.db.socialPost.findMany({
            where: where as never,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
              socialAccount: {
                select: {
                  id: true,
                  platform: true,
                  accountName: true,
                  avatarUrl: true,
                },
              },
              post: {
                select: { id: true, title: true, slug: true },
              },
            },
          }),
          ctx.db.socialPost.count({ where: where as never }),
        ]);

        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
        };
      }),

    /**
     * CREATE — Create a new social post (DRAFT or SCHEDULED).
     */
    create: orgProcedure
      .input(
        z.object({
          socialAccountId: z.string(),
          postId: z.string().optional(),
          content: z.string().min(1),
          mediaUrls: z.array(z.string().url()).optional(),
          scheduledAt: z.coerce.date().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Verify the social account belongs to the org
        const account = await ctx.db.socialAccount.findFirst({
          where: {
            id: input.socialAccountId,
            organizationId: ctx.organizationId,
          },
        });

        if (!account) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Social account not found",
          });
        }

        // If a blog post is linked, verify it belongs to the org
        if (input.postId) {
          const post = await ctx.db.post.findFirst({
            where: {
              id: input.postId,
              organizationId: ctx.organizationId,
              deletedAt: null,
            },
          });

          if (!post) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Blog post not found",
            });
          }
        }

        const status = input.scheduledAt ? "SCHEDULED" : "DRAFT";

        const socialPost = await ctx.db.socialPost.create({
          data: {
            organizationId: ctx.organizationId,
            socialAccountId: input.socialAccountId,
            postId: input.postId,
            content: input.content,
            mediaUrls: input.mediaUrls ?? [],
            status,
            scheduledAt: input.scheduledAt,
          },
          include: {
            socialAccount: {
              select: {
                id: true,
                platform: true,
                accountName: true,
                avatarUrl: true,
              },
            },
          },
        });

        return socialPost;
      }),

    /**
     * UPDATE — Update an existing social post.
     */
    update: orgProcedure
      .input(
        z.object({
          id: z.string(),
          content: z.string().min(1).optional(),
          mediaUrls: z.array(z.string().url()).optional(),
          scheduledAt: z.coerce.date().optional(),
          status: socialPostStatusEnum.optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await ctx.db.socialPost.findFirst({
          where: { id: input.id, organizationId: ctx.organizationId },
        });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Social post not found",
          });
        }

        const { id, ...data } = input;

        const updated = await ctx.db.socialPost.update({
          where: { id },
          data,
          include: {
            socialAccount: {
              select: {
                id: true,
                platform: true,
                accountName: true,
                avatarUrl: true,
              },
            },
          },
        });

        return updated;
      }),

    /**
     * DELETE — Delete a social post.
     */
    delete: orgProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await ctx.db.socialPost.findFirst({
          where: { id: input.id, organizationId: ctx.organizationId },
        });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Social post not found",
          });
        }

        await ctx.db.socialPost.delete({ where: { id: input.id } });

        return { success: true };
      }),
  }),

  /**
   * REPURPOSE — Generate social media content from a blog post using AI.
   * For each requested platform, generates platform-appropriate content.
   */
  repurpose: orgProcedure
    .input(
      z.object({
        postId: z.string(),
        platforms: z.array(z.string()).min(1),
        tone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = requireAIConfig();

      // Fetch the blog post
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.postId,
          organizationId: ctx.organizationId,
          deletedAt: null,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog post not found",
        });
      }

      const blogContent = [
        `Title: ${post.title}`,
        post.excerpt ? `Summary: ${post.excerpt}` : "",
        `Content:\n${post.contentPlain ?? ""}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      const provider = new AIProviderClient(config);

      // Generate content for each platform in parallel
      const results = await Promise.all(
        input.platforms.map(async (platform) => {
          const platformKey = platform.toUpperCase();
          const platformPrompt =
            PLATFORM_PROMPTS[platformKey] ??
            `Rewrite the following blog post for the ${platform} platform. Adapt the tone and length appropriately. Do not use markdown.`;

          const toneInstruction = input.tone
            ? `\nTone: ${input.tone}`
            : "";

          const response = await provider.complete({
            system:
              "You are a social media content specialist. You repurpose blog content into platform-specific social media posts. Return ONLY the post content, no explanations or labels.",
            messages: [
              {
                role: "user",
                content: `${platformPrompt}${toneInstruction}\n\n---\n\n${blogContent}`,
              },
            ],
            maxTokens: 1024,
            temperature: 0.7,
          });

          return {
            platform: platformKey,
            content: response.content.trim(),
          };
        }),
      );

      return { items: results };
    }),
});
