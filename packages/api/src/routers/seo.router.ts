import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { requirePermission } from "../middleware/rbac";
import { router, orgProcedure, publicProcedure } from "../trpc";

const schemaTypeEnum = z.enum([
  "Article",
  "FAQ",
  "HowTo",
  "Product",
  "Recipe",
  "Review",
  "Event",
  "VideoObject",
]);

type SchemaType = z.infer<typeof schemaTypeEnum>;

export const seoRouter = router({
  getForPost: orgProcedure
    .input(z.object({ postId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.seoMeta.findUnique({
        where: { postId: input.postId },
      });
    }),

  getForPage: orgProcedure
    .input(z.object({ pageId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.seoMeta.findUnique({
        where: { pageId: input.pageId },
      });
    }),

  upsertForPost: orgProcedure
    .use(requirePermission("seo:update"))
    .input(
      z.object({
        postId: z.string().cuid(),
        metaTitle: z.string().max(70).optional(),
        metaDescription: z.string().max(160).optional(),
        canonicalUrl: z.string().url().optional(),
        ogImage: z.string().url().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        twitterCard: z.string().optional(),
        structuredData: z.record(z.unknown()).optional(),
        noIndex: z.boolean().optional(),
        noFollow: z.boolean().optional(),
        keywords: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { postId, ...data } = input;

      return ctx.db.seoMeta.upsert({
        where: { postId },
        update: data,
        create: { postId, ...data },
      });
    }),

  upsertForPage: orgProcedure
    .use(requirePermission("seo:update"))
    .input(
      z.object({
        pageId: z.string().cuid(),
        metaTitle: z.string().max(70).optional(),
        metaDescription: z.string().max(160).optional(),
        canonicalUrl: z.string().url().optional(),
        ogImage: z.string().url().optional(),
        noIndex: z.boolean().optional(),
        noFollow: z.boolean().optional(),
        keywords: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { pageId, ...data } = input;

      return ctx.db.seoMeta.upsert({
        where: { pageId },
        update: data,
        create: { pageId, ...data },
      });
    }),

  audit: orgProcedure
    .input(z.object({ postId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findFirst({
        where: { id: input.postId, organizationId: ctx.organizationId },
        include: { seoMeta: true },
      });

      if (!post) return null;

      const checks = [];
      const seo = post.seoMeta;

      // Meta title check
      const metaTitle = seo?.metaTitle ?? post.title;
      checks.push({
        name: "metaTitle",
        label: "Meta title",
        score: metaTitle && metaTitle.length >= 30 && metaTitle.length <= 60 ? 100 : metaTitle ? 50 : 0,
        message:
          !metaTitle
            ? "Missing meta title"
            : metaTitle.length < 30
              ? "Meta title is too short (under 30 chars)"
              : metaTitle.length > 60
                ? "Meta title is too long (over 60 chars)"
                : "Good meta title length",
        weight: 15,
      });

      // Meta description check
      const metaDesc = seo?.metaDescription ?? post.excerpt;
      checks.push({
        name: "metaDescription",
        label: "Meta description",
        score: metaDesc && metaDesc.length >= 120 && metaDesc.length <= 160 ? 100 : metaDesc ? 50 : 0,
        message:
          !metaDesc
            ? "Missing meta description"
            : metaDesc.length < 120
              ? "Meta description is too short"
              : metaDesc.length > 160
                ? "Meta description is too long"
                : "Good meta description length",
        weight: 15,
      });

      // Content length check
      const plainText = post.contentPlain ?? "";
      const wordCount = plainText.trim().split(/\s+/).length;
      checks.push({
        name: "contentLength",
        label: "Content length",
        score: wordCount >= 300 ? 100 : wordCount >= 100 ? 50 : 0,
        message:
          wordCount >= 300
            ? `Good content length (${wordCount} words)`
            : `Content too short (${wordCount} words, aim for 300+)`,
        weight: 10,
      });

      // OG Image
      checks.push({
        name: "ogImage",
        label: "Open Graph image",
        score: seo?.ogImage || post.featuredImage ? 100 : 0,
        message: seo?.ogImage || post.featuredImage ? "OG image set" : "Missing OG image",
        weight: 10,
      });

      // Excerpt
      checks.push({
        name: "excerpt",
        label: "Excerpt",
        score: post.excerpt ? 100 : 0,
        message: post.excerpt ? "Excerpt provided" : "Missing excerpt",
        weight: 10,
      });

      // Slug quality
      checks.push({
        name: "slug",
        label: "URL structure",
        score: post.slug.length <= 50 && !post.slug.includes("--") ? 100 : 50,
        message: "Clean URL slug",
        weight: 10,
      });

      // Featured image
      checks.push({
        name: "featuredImage",
        label: "Featured image",
        score: post.featuredImage ? 100 : 0,
        message: post.featuredImage ? "Featured image set" : "Missing featured image",
        weight: 10,
      });

      // Structured data
      checks.push({
        name: "structuredData",
        label: "Structured data",
        score: seo?.structuredData ? 100 : 0,
        message: seo?.structuredData ? "JSON-LD structured data present" : "Missing structured data",
        weight: 5,
      });

      // No index check
      checks.push({
        name: "indexable",
        label: "Indexable",
        score: !seo?.noIndex ? 100 : 0,
        message: seo?.noIndex ? "Page is set to noindex" : "Page is indexable",
        weight: 15,
      });

      const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
      const overallScore = Math.round(
        checks.reduce((sum, c) => sum + (c.score * c.weight) / totalWeight, 0),
      );

      return { overallScore, checks };
    }),

  getSchemaTypes: publicProcedure.query(() => {
    const schemaTypes: { type: SchemaType; description: string }[] = [
      { type: "Article", description: "Blog posts, news articles, and editorial content" },
      { type: "FAQ", description: "Frequently asked questions with answers" },
      { type: "HowTo", description: "Step-by-step instructional content" },
      { type: "Product", description: "Product information with name, description, and image" },
      { type: "Recipe", description: "Cooking or preparation recipes with ingredients and steps" },
      { type: "Review", description: "Reviews of products, services, or other items" },
      { type: "Event", description: "Events with dates, locations, and descriptions" },
      { type: "VideoObject", description: "Video content with metadata and thumbnails" },
    ];

    return schemaTypes;
  }),

  generateSchema: orgProcedure
    .use(requirePermission("seo:update"))
    .input(
      z.object({
        postId: z.string().cuid(),
        schemaType: schemaTypeEnum,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.postId,
          organizationId: ctx.organizationId,
          deletedAt: null,
        },
        include: {
          author: { select: { name: true } },
          seoMeta: true,
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      const plainText = post.contentPlain ?? "";
      const htmlContent = post.contentHtml ?? "";

      const structuredData = buildJsonLd(input.schemaType, {
        title: post.title,
        description: post.excerpt ?? "",
        authorName: post.author.name ?? "Unknown",
        datePublished: (post.publishedAt ?? post.createdAt).toISOString(),
        dateModified: post.updatedAt.toISOString(),
        image: post.featuredImage ?? "",
        plainText,
        htmlContent,
      });

      // Save to SeoMeta
      await ctx.db.seoMeta.upsert({
        where: { postId: input.postId },
        update: { structuredData: structuredData as object },
        create: { postId: input.postId, structuredData: structuredData as object },
      });

      return structuredData;
    }),
});

// ─── Schema Generation Helpers ───────────────────────────

interface PostData {
  title: string;
  description: string;
  authorName: string;
  datePublished: string;
  dateModified: string;
  image: string;
  plainText: string;
  htmlContent: string;
}

function buildJsonLd(
  schemaType: SchemaType,
  data: PostData,
): Record<string, unknown> {
  switch (schemaType) {
    case "Article":
      return buildArticleSchema(data);
    case "FAQ":
      return buildFaqSchema(data);
    case "HowTo":
      return buildHowToSchema(data);
    case "Product":
      return buildProductSchema(data);
    case "Recipe":
      return buildRecipeSchema(data);
    case "Review":
      return buildReviewSchema(data);
    case "Event":
      return buildEventSchema(data);
    case "VideoObject":
      return buildVideoObjectSchema(data);
  }
}

function buildArticleSchema(data: PostData): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.description,
    author: {
      "@type": "Person",
      name: data.authorName,
    },
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    image: data.image || undefined,
    publisher: {
      "@type": "Organization",
      name: data.authorName,
    },
  };
}

function buildFaqSchema(data: PostData): Record<string, unknown> {
  // Extract Q&A pairs: lines ending with "?" are treated as questions,
  // the following text until the next question is the answer.
  const lines = data.plainText.split("\n").filter((l) => l.trim());
  const mainEntity: { "@type": string; name: string; acceptedAnswer: { "@type": string; text: string } }[] = [];

  let currentQuestion: string | null = null;
  let currentAnswer: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.endsWith("?")) {
      if (currentQuestion && currentAnswer.length > 0) {
        mainEntity.push({
          "@type": "Question",
          name: currentQuestion,
          acceptedAnswer: {
            "@type": "Answer",
            text: currentAnswer.join(" ").trim(),
          },
        });
      }
      currentQuestion = trimmed;
      currentAnswer = [];
    } else if (currentQuestion) {
      currentAnswer.push(trimmed);
    }
  }

  // Push the last Q&A pair
  if (currentQuestion && currentAnswer.length > 0) {
    mainEntity.push({
      "@type": "Question",
      name: currentQuestion,
      acceptedAnswer: {
        "@type": "Answer",
        text: currentAnswer.join(" ").trim(),
      },
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity:
      mainEntity.length > 0
        ? mainEntity
        : [
            {
              "@type": "Question",
              name: "Sample question?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sample answer — replace with your content.",
              },
            },
          ],
  };
}

function buildHowToSchema(data: PostData): Record<string, unknown> {
  // Extract steps from numbered lists (e.g., "1. Do this" or "1) Do this")
  // or from headings in the plain text
  const lines = data.plainText.split("\n").filter((l) => l.trim());
  const steps: { "@type": string; text: string; position: number }[] = [];

  const numberedLineRegex = /^\d+[.)]\s+(.+)/;

  let position = 1;
  for (const line of lines) {
    const match = numberedLineRegex.exec(line.trim());
    if (match?.[1]) {
      steps.push({
        "@type": "HowToStep",
        text: match[1].trim(),
        position: position++,
      });
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: data.title,
    description: data.description,
    image: data.image || undefined,
    step:
      steps.length > 0
        ? steps
        : [
            {
              "@type": "HowToStep",
              text: "Step 1 — replace with your instructions.",
              position: 1,
            },
          ],
  };
}

function buildProductSchema(data: PostData): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.title,
    description: data.description,
    image: data.image || undefined,
    offers: {
      "@type": "Offer",
      price: "",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

function buildRecipeSchema(data: PostData): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: data.title,
    description: data.description,
    author: {
      "@type": "Person",
      name: data.authorName,
    },
    datePublished: data.datePublished,
    image: data.image || undefined,
    recipeIngredient: [],
    recipeInstructions: [],
  };
}

function buildReviewSchema(data: PostData): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    name: data.title,
    description: data.description,
    author: {
      "@type": "Person",
      name: data.authorName,
    },
    datePublished: data.datePublished,
    itemReviewed: {
      "@type": "Thing",
      name: "",
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: "",
      bestRating: "5",
    },
  };
}

function buildEventSchema(data: PostData): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: data.title,
    description: data.description,
    image: data.image || undefined,
    startDate: "",
    endDate: "",
    location: {
      "@type": "Place",
      name: "",
      address: "",
    },
    organizer: {
      "@type": "Organization",
      name: data.authorName,
    },
  };
}

function buildVideoObjectSchema(data: PostData): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: data.title,
    description: data.description,
    thumbnailUrl: data.image || "",
    uploadDate: data.datePublished,
    contentUrl: "",
    embedUrl: "",
  };
}
