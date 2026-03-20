import { z } from "zod";

import { CONTENT, PAGINATION } from "../constants/limits";

export const postStatusSchema = z.enum([
  "DRAFT",
  "REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
]);
export type PostStatus = z.infer<typeof postStatusSchema>;

export const createPostSchema = z.object({
  title: z.string().min(1).max(CONTENT.maxTitleLength),
  slug: z
    .string()
    .min(1)
    .max(CONTENT.maxSlugLength)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  content: z.any(),
  contentHtml: z.string().optional(),
  contentPlain: z.string().optional(),
  readingTime: z.number().int().nonnegative().optional(),
  excerpt: z.string().max(CONTENT.maxExcerptLength).optional(),
  featuredImage: z.string().url().optional(),
  status: postStatusSchema.default("DRAFT"),
  scheduledAt: z.coerce.date().optional(),
  locale: z.string().default("en"),
  tagIds: z.array(z.string()).max(CONTENT.maxTagsPerPost).optional(),
  projectId: z.string().optional(),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(CONTENT.maxTitleLength).optional(),
  slug: z
    .string()
    .min(1)
    .max(CONTENT.maxSlugLength)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  content: z.any().optional(),
  contentHtml: z.string().optional(),
  contentPlain: z.string().optional(),
  readingTime: z.number().int().nonnegative().optional(),
  excerpt: z.string().max(CONTENT.maxExcerptLength).optional(),
  featuredImage: z.string().url().nullable().optional(),
  status: postStatusSchema.optional(),
  scheduledAt: z.coerce.date().nullable().optional(),
  locale: z.string().optional(),
  tagIds: z.array(z.string()).max(CONTENT.maxTagsPerPost).optional(),
  changelog: z.string().max(500).optional(),
  // SEO meta (upserted to seo_meta table)
  metaTitle: z.string().max(60).nullable().optional(),
  metaDescription: z.string().max(160).nullable().optional(),
  ogImage: z.string().url().nullable().optional(),
  // Project association
  projectId: z.string().nullable().optional(),
});
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const listPostsSchema = z.object({
  status: postStatusSchema.optional(),
  authorId: z.string().optional(),
  tagSlug: z.string().optional(),
  locale: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z
    .number()
    .int()
    .positive()
    .max(PAGINATION.maxPageSize)
    .default(PAGINATION.defaultPageSize),
  sort: z.enum(["newest", "oldest", "title", "updated"]).default("newest"),
});
export type ListPostsInput = z.infer<typeof listPostsSchema>;

export const getPostSchema = z.object({
  id: z.string().min(1).optional(),
  slug: z.string().optional(),
});
export type GetPostInput = z.infer<typeof getPostSchema>;

export const deletePostSchema = z.object({
  id: z.string().min(1),
});
