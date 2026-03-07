import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, orgProcedure } from "../trpc";

// ─── Helpers ────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "as", "be", "was", "are",
  "were", "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "shall", "should", "may", "might", "must", "can",
  "could", "not", "no", "nor", "so", "if", "then", "than", "too",
  "very", "just", "about", "above", "after", "again", "all", "also",
  "am", "any", "because", "before", "between", "both", "each", "few",
  "get", "got", "he", "her", "here", "him", "his", "how", "i", "into",
  "its", "let", "me", "more", "most", "my", "new", "now", "off", "old",
  "only", "other", "our", "out", "own", "over", "re", "same", "she",
  "some", "still", "such", "that", "their", "them", "these", "they",
  "this", "those", "through", "under", "up", "us", "use", "using",
  "want", "way", "we", "well", "what", "when", "where", "which",
  "while", "who", "whom", "why", "you", "your",
]);

function extractKeywords(content: string): string[] {
  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  // Count frequency
  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }

  // Return top 20 by frequency
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

function scorePost(
  keywords: string[],
  title: string,
  excerpt: string | null,
  tags: string[],
): number {
  const titleLower = title.toLowerCase();
  const excerptLower = (excerpt ?? "").toLowerCase();
  const tagsLower = tags.map((t) => t.toLowerCase());

  let score = 0;
  for (const keyword of keywords) {
    // Title matches are worth more
    if (titleLower.includes(keyword)) score += 3;
    if (excerptLower.includes(keyword)) score += 1;
    if (tagsLower.some((tag) => tag.includes(keyword))) score += 2;
  }

  return score;
}

function extractInternalLinks(html: string): string[] {
  const linkRegex = /href=["']([^"']+)["']/g;
  const links: string[] = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    // Internal links: relative paths or same-domain
    if (
      href.startsWith("/") ||
      href.startsWith("./") ||
      href.startsWith("../") ||
      (!href.startsWith("http://") && !href.startsWith("https://") && !href.startsWith("mailto:"))
    ) {
      links.push(href);
    }
  }

  return links;
}

// ─── Router ─────────────────────────────────────────────────

export const internalLinksRouter = router({
  /**
   * SUGGEST — Get internal linking suggestions based on current post content.
   */
  suggest: orgProcedure
    .input(
      z.object({
        content: z.string().min(1),
        currentPostId: z.string().optional(),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      // 1. Get all published posts for this org
      const publishedPosts = await ctx.db.post.findMany({
        where: {
          organizationId: ctx.organizationId,
          status: "PUBLISHED",
          deletedAt: null,
          ...(input.currentPostId ? { id: { not: input.currentPostId } } : {}),
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          contentPlain: true,
          tags: {
            select: {
              tag: {
                select: { name: true },
              },
            },
          },
        },
      });

      // 2. Extract keywords from the current content
      const keywords = extractKeywords(input.content);

      if (keywords.length === 0) {
        return { suggestions: [], keywords: [] };
      }

      // 3. Score each published post
      const scored = publishedPosts.map((post) => {
        const tagNames = post.tags.map((pt) => pt.tag.name);
        const relevanceScore = scorePost(keywords, post.title, post.excerpt, tagNames);

        return {
          postId: post.id,
          title: post.title,
          slug: post.slug,
          relevanceScore,
          suggestedAnchorText: post.title,
          url: `/${post.slug}`,
        };
      });

      // 4. Filter out zero-score and sort by relevance
      const suggestions = scored
        .filter((s) => s.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, input.limit);

      return { suggestions, keywords };
    }),

  /**
   * ANALYZE — Analyze internal links in an existing post.
   */
  analyze: orgProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      // 1. Get the post
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.postId,
          organizationId: ctx.organizationId,
          deletedAt: null,
        },
        select: {
          id: true,
          contentHtml: true,
          contentPlain: true,
          tags: {
            select: {
              tag: {
                select: { name: true },
              },
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      // 2. Extract existing internal links from HTML
      const existingLinks = extractInternalLinks(post.contentHtml ?? "");

      // 3. Get all other published posts for this org
      const otherPosts = await ctx.db.post.findMany({
        where: {
          organizationId: ctx.organizationId,
          status: "PUBLISHED",
          deletedAt: null,
          id: { not: post.id },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          tags: {
            select: {
              tag: {
                select: { name: true },
              },
            },
          },
        },
      });

      // 4. Find missing opportunities using keyword scoring
      const keywords = extractKeywords(post.contentPlain ?? "");

      const alreadyLinkedSlugs = new Set(
        existingLinks
          .map((link) => link.replace(/^\//, "").replace(/\/$/, ""))
          .filter(Boolean),
      );

      const missingOpportunities = otherPosts
        .filter((p) => !alreadyLinkedSlugs.has(p.slug))
        .map((p) => {
          const tagNames = p.tags.map((pt) => pt.tag.name);
          const relevanceScore = scorePost(keywords, p.title, p.excerpt, tagNames);
          return {
            title: p.title,
            slug: p.slug,
            relevanceScore,
          };
        })
        .filter((p) => p.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10);

      return {
        existingLinks,
        missingOpportunities,
        totalInternalLinks: existingLinks.length,
      };
    }),
});
