import { TRPCError } from "@trpc/server";
import { z } from "zod";
import crypto from "crypto";

import { router, orgProcedure } from "../trpc";
import { requirePermission } from "../middleware/rbac";
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
  getProjectSchema,
  deleteProjectSchema,
  deployToProjectSchema,
  listDeploymentsSchema,
} from "@rankflo/core/validators";

export const projectRouter = router({
  // ─── LIST PROJECTS ─────────────────────────────────────
  list: orgProcedure
    .input(listProjectsSchema)
    .query(async ({ ctx, input }) => {
      const { status, platform, search, page, pageSize, sort } = input;

      const where: any = {
        organizationId: ctx.organizationId,
      };

      if (status) where.status = status;
      if (platform) where.platform = platform;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { url: { contains: search, mode: "insensitive" } },
        ];
      }

      const orderBy: any = {
        newest: { createdAt: "desc" },
        oldest: { createdAt: "asc" },
        name: { name: "asc" },
        "most-posts": { postCount: "desc" },
        "most-views": { totalViews: "desc" },
      }[sort];

      const [items, total] = await Promise.all([
        ctx.db.project.findMany({
          where,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            _count: { select: { posts: true, deployments: true } },
          },
        }),
        ctx.db.project.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    }),

  // ─── GET PROJECT BY ID ──────────────────────────────────
  getById: orgProcedure
    .input(getProjectSchema)
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        include: {
          posts: {
            take: 10,
            orderBy: { updatedAt: "desc" },
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              publishedAt: true,
              updatedAt: true,
              featuredImage: true,
            },
          },
          deployments: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              post: { select: { id: true, title: true, slug: true } },
            },
          },
          _count: { select: { posts: true, deployments: true } },
        },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      return project;
    }),

  // ─── CREATE PROJECT ──────────────────────────────────────
  create: orgProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      // Generate a unique API key for this project's headless CMS access
      const apiKey = `rf_${crypto.randomBytes(24).toString("hex")}`;

      const project = await ctx.db.project.create({
        data: {
          organizationId: ctx.organizationId,
          name: input.name,
          description: input.description,
          url: input.url,
          platform: input.platform,
          status: "SETUP",
          integrationType: input.integrationType,
          integrationConfig: input.integrationConfig ?? undefined,
          contentDir: input.contentDir,
          contentFormat: input.contentFormat,
          brandColors: input.brandColors ?? undefined,
          brandFonts: input.brandFonts ?? undefined,
          brandLogo: input.brandLogo,
          brandStyle: input.brandStyle ?? undefined,
          apiKey,
        },
      });

      return project;
    }),

  // ─── UPDATE PROJECT ──────────────────────────────────────
  update: orgProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.project.findFirst({
        where: { id, organizationId: ctx.organizationId },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const project = await ctx.db.project.update({
        where: { id },
        data: {
          ...data,
          integrationConfig: data.integrationConfig === null ? null : data.integrationConfig ?? undefined,
          brandColors: data.brandColors === null ? null : data.brandColors ?? undefined,
          brandFonts: data.brandFonts === null ? null : data.brandFonts ?? undefined,
          brandStyle: data.brandStyle === null ? null : data.brandStyle ?? undefined,
        },
      });

      return project;
    }),

  // ─── UPDATE AUTOPILOT ────────────────────────────────────
  updateAutopilot: orgProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        autopilotEnabled: z.boolean(),
        autopilotFrequency: z.number().int().min(1).max(7).default(2),
        autopilotContentType: z.enum(["blog-post", "tutorial", "how-to", "listicle", "comparison", "landing-page"]).default("blog-post"),
        autopilotAutoPublish: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...autopilot } = input;

      const existing = await ctx.db.project.findFirst({
        where: { id, organizationId: ctx.organizationId },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      // If enabling and no next run time set, schedule it immediately
      const autopilotNextRunAt =
        autopilot.autopilotEnabled && !existing.autopilotNextRunAt
          ? new Date() // due immediately so cron picks it up on next tick
          : undefined;

      return ctx.db.project.update({
        where: { id },
        data: {
          ...autopilot,
          ...(autopilotNextRunAt ? { autopilotNextRunAt } : {}),
        },
      });
    }),

  // ─── DELETE PROJECT ──────────────────────────────────────
  delete: orgProcedure
    .input(deleteProjectSchema)
    .use(requirePermission("post:delete"))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.project.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      // Unlink posts from this project (don't delete them)
      await ctx.db.post.updateMany({
        where: { projectId: input.id },
        data: { projectId: null },
      });

      // Delete child records that don't cascade automatically
      await ctx.db.deployment.deleteMany({ where: { projectId: input.id } });
      await ctx.db.subscriber.deleteMany({ where: { projectId: input.id } });

      await ctx.db.project.delete({ where: { id: input.id } });

      return { success: true };
    }),

  // ─── REGENERATE API KEY ──────────────────────────────────
  regenerateApiKey: orgProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.project.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const apiKey = `rf_${crypto.randomBytes(24).toString("hex")}`;

      const project = await ctx.db.project.update({
        where: { id: input.id },
        data: { apiKey },
      });

      return { apiKey: project.apiKey };
    }),

  // ─── ACTIVATE PROJECT ───────────────────────────────────
  activate: orgProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      return ctx.db.project.update({
        where: { id: input.id },
        data: { status: "ACTIVE" },
      });
    }),

  // ─── LIST DEPLOYMENTS ───────────────────────────────────
  listDeployments: orgProcedure
    .input(listDeploymentsSchema)
    .query(async ({ ctx, input }) => {
      const { projectId, page, pageSize } = input;

      // Verify project belongs to org
      const project = await ctx.db.project.findFirst({
        where: { id: projectId, organizationId: ctx.organizationId },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const [items, total] = await Promise.all([
        ctx.db.deployment.findMany({
          where: { projectId },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            post: { select: { id: true, title: true, slug: true } },
          },
        }),
        ctx.db.deployment.count({ where: { projectId } }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    }),

  // ─── DEPLOY POSTS TO PROJECT ────────────────────────────
  deploy: orgProcedure
    .input(deployToProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId, postIds } = input;

      const project = await ctx.db.project.findFirst({
        where: { id: projectId, organizationId: ctx.organizationId },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      // Verify all posts exist and belong to this org
      const posts = await ctx.db.post.findMany({
        where: { id: { in: postIds }, organizationId: ctx.organizationId },
      });

      if (posts.length !== postIds.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Some posts not found" });
      }

      // Create deployment records
      const deployments = await ctx.db.deployment.createMany({
        data: postIds.map(postId => ({
          projectId,
          postId,
          status: "PENDING" as const,
        })),
      });

      // Update project stats
      await ctx.db.project.update({
        where: { id: projectId },
        data: { lastDeployedAt: new Date() },
      });

      // TODO: Trigger actual deployment based on integrationType
      // For now, mark as success (will implement actual deployment per integration)
      await ctx.db.deployment.updateMany({
        where: { projectId, status: "PENDING" },
        data: { status: "SUCCESS", deployedAt: new Date() },
      });

      return { count: postIds.length };
    }),

  // ─── PROJECT STATS ──────────────────────────────────────
  stats: orgProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const [postCount, publishedCount, draftCount, deploymentCount, recentDeployments] =
        await Promise.all([
          ctx.db.post.count({ where: { projectId: input.id } }),
          ctx.db.post.count({ where: { projectId: input.id, status: "PUBLISHED" } }),
          ctx.db.post.count({ where: { projectId: input.id, status: "DRAFT" } }),
          ctx.db.deployment.count({ where: { projectId: input.id } }),
          ctx.db.deployment.findMany({
            where: { projectId: input.id },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
              post: { select: { title: true, slug: true } },
            },
          }),
        ]);

      return {
        postCount,
        publishedCount,
        draftCount,
        deploymentCount,
        recentDeployments,
      };
    }),

  // ─── EXPORT AI CONTEXT BRIEF ─────────────────────────────
  exportAIContext: orgProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
        select: {
          name: true,
          url: true,
          platform: true,
          description: true,
          brandStyle: true,
        },
      });

      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });

      const posts = await ctx.db.post.findMany({
        where: { projectId: input.id, deletedAt: null },
        orderBy: { publishedAt: "desc" },
        select: {
          title: true,
          excerpt: true,
          status: true,
          slug: true,
          publishedAt: true,
          readingTime: true,
          tags: { select: { tag: { select: { name: true } } } },
          seoMeta: { select: { metaTitle: true, metaDescription: true, keywords: true } },
        },
      });

      const now = new Date().toISOString().split("T")[0];
      const published = posts.filter((p) => p.status === "PUBLISHED");
      const drafts = posts.filter((p) => p.status === "DRAFT");

      // Collect all covered keywords/topics for gap analysis
      const allKeywords = new Set<string>();
      const allTags = new Set<string>();
      posts.forEach((p) => {
        p.seoMeta?.keywords?.forEach((k) => allKeywords.add(k.toLowerCase()));
        p.tags?.forEach((t) => allTags.add(t.tag.name.toLowerCase()));
      });

      const brandStyle = project.brandStyle as Record<string, unknown> | null;
      const tone = Array.isArray(brandStyle?.tone) ? (brandStyle.tone as string[]).join(", ") : null;

      const lines: string[] = [
        `# ${project.name} — AI Content Brief`,
        ``,
        `> Generated: ${now}  `,
        `> Use this file to give any AI full context before generating new blog posts.`,
        ``,
        `---`,
        ``,
        `## Project Overview`,
        ``,
        `- **Name:** ${project.name}`,
        `- **URL:** ${project.url ?? "not set"}`,
        `- **Platform:** ${project.platform}`,
        ...(project.description ? [`- **Description:** ${project.description}`] : []),
        ...(tone ? [`- **Brand tone:** ${tone}`] : []),
        ``,
        `---`,
        ``,
        `## Published Posts (${published.length})`,
        ``,
        `These topics are already covered — do NOT duplicate them:`,
        ``,
      ];

      published.forEach((p, i) => {
        lines.push(`### ${i + 1}. ${p.title}`);
        if (p.excerpt) lines.push(`> ${p.excerpt}`);
        lines.push(`- **Slug:** \`/${p.slug}\``);
        if (p.publishedAt) lines.push(`- **Published:** ${p.publishedAt.toISOString().split("T")[0]}`);
        if (p.readingTime) lines.push(`- **Reading time:** ${p.readingTime} min`);
        if (p.tags.length > 0) lines.push(`- **Tags:** ${p.tags.map((t) => t.tag.name).join(", ")}`);
        if (p.seoMeta?.keywords?.length) lines.push(`- **Keywords:** ${p.seoMeta.keywords.join(", ")}`);
        if (p.seoMeta?.metaDescription) lines.push(`- **Meta description:** ${p.seoMeta.metaDescription}`);
        lines.push(``);
      });

      if (drafts.length > 0) {
        lines.push(`---`, ``, `## Draft Posts (${drafts.length})`, ``, `In progress — avoid duplicating these topics too:`, ``);
        drafts.forEach((p, i) => {
          lines.push(`### ${i + 1}. ${p.title}`);
          if (p.excerpt) lines.push(`> ${p.excerpt}`);
          if (p.tags.length > 0) lines.push(`- **Tags:** ${p.tags.map((t) => t.tag.name).join(", ")}`);
          lines.push(``);
        });
      }

      lines.push(
        `---`,
        ``,
        `## SEO & Topics Summary`,
        ``,
        `**Covered keywords:** ${allKeywords.size > 0 ? [...allKeywords].join(", ") : "none yet"}`,
        ``,
        `**Covered tags/categories:** ${allTags.size > 0 ? [...allTags].join(", ") : "none yet"}`,
        ``,
        `---`,
        ``,
        `## Instructions for AI`,
        ``,
        `When generating new content for **${project.name}**:`,
        ``,
        `1. Do NOT write about any topic already listed above.`,
        `2. Target keywords NOT in the covered list above to maximize SEO reach.`,
        `3. Match the brand tone: **${tone ?? "professional, informative"}**.`,
        `4. Each post should include: a clear H1 title, H2 subheadings, a meta description (150–160 chars), and 3–5 target keywords.`,
        `5. Suggest an outline before writing: intro, 3–5 main sections, and a conclusion with CTA.`,
        `6. Aim for 1200–2000 words for pillar posts, 600–900 for supporting posts.`,
        ``,
      );

      return { markdown: lines.join("\n"), filename: `${project.name.toLowerCase().replace(/\s+/g, "-")}-ai-brief.md` };
    }),
});
