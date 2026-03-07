import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, orgProcedure } from "../trpc";
import {
  createConnector,
  BrandExtractor,
} from "@rankflo/integrations";
import type {
  IntegrationConfig,
  ContentItem,
  ProjectInfo,
  BrandProfile,
  DeployResult,
} from "@rankflo/integrations";

// ─── Constants ──────────────────────────────────────────────

const INTEGRATION_TYPES = [
  "GITHUB",
  "GITLAB",
  "BITBUCKET",
  "SHOPIFY_API",
  "WORDPRESS_API",
  "WEBFLOW_API",
  "WIX_API",
  "REST_API",
  "GRAPHQL_API",
] as const;

/** Build an IntegrationConfig union from separate type + config values. */
function buildIntegrationConfig(
  type: string,
  config: Record<string, unknown>,
): IntegrationConfig {
  // Cast – the Zod validation on the input already ensures `type` is valid.
  return { type, config } as unknown as IntegrationConfig;
}

// ─── Router ─────────────────────────────────────────────────

export const integrationRouter = router({
  // ─── TEST CONNECTION ────────────────────────────────────
  testConnection: orgProcedure
    .input(
      z.object({
        type: z.enum(INTEGRATION_TYPES),
        config: z.record(z.unknown()),
      }),
    )
    .mutation(async ({ input }) => {
      const connector = createConnector(
        buildIntegrationConfig(input.type, input.config),
      );

      const result = await connector.testConnection();

      let projectInfo: ProjectInfo | undefined;

      // If connection succeeded, try to get project info
      if (result.ok) {
        try {
          await connector.connect();
          projectInfo = await connector.getProjectInfo();
        } catch {
          // Project info is optional — connection test still succeeded
        } finally {
          await connector.disconnect().catch(() => {});
        }
      }

      return {
        ok: result.ok,
        error: result.error,
        projectInfo: projectInfo ?? null,
      };
    }),

  // ─── EXTRACT BRAND ─────────────────────────────────────
  extractBrand: orgProcedure
    .input(
      z.object({
        url: z.string().url(),
      }),
    )
    .mutation(async ({ input }): Promise<BrandProfile> => {
      const extractor = new BrandExtractor();

      try {
        const profile = await extractor.extract(input.url);
        return profile;
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? `Brand extraction failed: ${error.message}`
              : `Could not extract brand information from ${input.url}`,
          cause: error,
        });
      }
    }),

  // ─── GET PROJECT INFO ──────────────────────────────────
  getProjectInfo: orgProcedure
    .input(
      z.object({
        type: z.enum(INTEGRATION_TYPES),
        config: z.record(z.unknown()),
      }),
    )
    .mutation(async ({ input }): Promise<ProjectInfo> => {
      const connector = createConnector(
        buildIntegrationConfig(input.type, input.config),
      );

      try {
        await connector.connect();
        const info = await connector.getProjectInfo();
        return info;
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? `Failed to get project info: ${error.message}`
              : "Failed to get project info from the external service.",
          cause: error,
        });
      } finally {
        await connector.disconnect().catch(() => {});
      }
    }),

  // ─── SYNC CONTENT ──────────────────────────────────────
  syncContent: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, organizationId: ctx.organizationId },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      if (!project.integrationType) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project has no integration configured.",
        });
      }

      const integrationConfig = project.integrationConfig as Record<
        string,
        unknown
      > | null;

      if (!integrationConfig) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project integration configuration is missing.",
        });
      }

      const connector = createConnector(
        buildIntegrationConfig(project.integrationType, integrationConfig),
      );

      try {
        await connector.connect();

        const externalItems = await connector.listContent();

        let created = 0;
        let updated = 0;
        let skipped = 0;

        for (const item of externalItems) {
          const existing = await ctx.db.post.findFirst({
            where: {
              organizationId: ctx.organizationId,
              projectId: project.id,
              slug: item.slug,
              deletedAt: null,
            },
          });

          if (existing) {
            const needsUpdate =
              existing.title !== item.title ||
              existing.contentPlain !== item.content;

            if (needsUpdate) {
              await ctx.db.post.update({
                where: { id: existing.id },
                data: {
                  title: item.title,
                  content: { markdown: item.content, externalId: item.externalId },
                  contentHtml: item.contentHtml ?? null,
                  contentPlain: item.content,
                  excerpt: item.excerpt ?? existing.excerpt,
                  featuredImage: item.featuredImage ?? existing.featuredImage,
                  status: item.status === "published" ? "PUBLISHED" : "DRAFT",
                  publishedAt: item.publishedAt ?? existing.publishedAt,
                },
              });
              updated++;
            } else {
              skipped++;
            }
          } else {
            await ctx.db.post.create({
              data: {
                organizationId: ctx.organizationId,
                projectId: project.id,
                authorId: ctx.session.user.id,
                title: item.title,
                slug: item.slug,
                content: { markdown: item.content, externalId: item.externalId },
                contentHtml: item.contentHtml ?? null,
                contentPlain: item.content,
                excerpt: item.excerpt ?? null,
                featuredImage: item.featuredImage ?? null,
                status: item.status === "published" ? "PUBLISHED" : "DRAFT",
                publishedAt: item.publishedAt ?? null,
              },
            });
            created++;
          }
        }

        const totalPosts = await ctx.db.post.count({
          where: { projectId: project.id, deletedAt: null },
        });

        await ctx.db.project.update({
          where: { id: project.id },
          data: { postCount: totalPosts },
        });

        return { total: externalItems.length, created, updated, skipped };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `Content sync failed: ${error.message}`
              : "Content sync failed unexpectedly.",
          cause: error,
        });
      } finally {
        await connector.disconnect().catch(() => {});
      }
    }),

  // ─── DEPLOY CONTENT ────────────────────────────────────
  deployContent: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
        postIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, organizationId: ctx.organizationId },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      if (!project.integrationType) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project has no integration configured.",
        });
      }

      const integrationConfig = project.integrationConfig as Record<
        string,
        unknown
      > | null;

      if (!integrationConfig) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project integration configuration is missing.",
        });
      }

      const posts = await ctx.db.post.findMany({
        where: {
          id: { in: input.postIds },
          organizationId: ctx.organizationId,
          deletedAt: null,
        },
        include: {
          tags: { include: { tag: true } },
          author: { select: { name: true } },
        },
      });

      if (posts.length !== input.postIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Some posts not found. Expected ${input.postIds.length}, found ${posts.length}.`,
        });
      }

      const deploymentRecords = await Promise.all(
        posts.map((post) =>
          ctx.db.deployment.create({
            data: {
              projectId: project.id,
              postId: post.id,
              status: "DEPLOYING",
            },
          }),
        ),
      );

      const format = project.contentFormat.toLowerCase() as
        | "markdown"
        | "mdx"
        | "html"
        | "json";

      const contentItems: ContentItem[] = posts.map((post) => {
        const contentData = post.content as Record<string, unknown>;
        const markdownContent =
          typeof contentData?.markdown === "string"
            ? contentData.markdown
            : post.contentPlain ?? "";

        return {
          externalId:
            typeof contentData?.externalId === "string"
              ? contentData.externalId
              : "",
          title: post.title,
          slug: post.slug,
          content: markdownContent,
          contentHtml: post.contentHtml ?? undefined,
          format,
          status: post.status === "PUBLISHED" ? ("published" as const) : ("draft" as const),
          author: post.author.name ?? undefined,
          tags: post.tags.map((pt) => pt.tag.name),
          featuredImage: post.featuredImage ?? undefined,
          excerpt: post.excerpt ?? undefined,
          publishedAt: post.publishedAt ?? undefined,
          updatedAt: post.updatedAt,
        };
      });

      const connector = createConnector(
        buildIntegrationConfig(project.integrationType, integrationConfig),
      );

      let deployResult: DeployResult;

      try {
        await connector.connect();
        deployResult = await connector.deploy(contentItems);
      } catch (error) {
        await ctx.db.deployment.updateMany({
          where: { id: { in: deploymentRecords.map((d) => d.id) } },
          data: {
            status: "FAILED",
            error: error instanceof Error ? error.message : "Deployment failed",
          },
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `Deployment failed: ${error.message}`
              : "Deployment failed unexpectedly.",
          cause: error,
        });
      } finally {
        await connector.disconnect().catch(() => {});
      }

      if (deployResult.success) {
        await ctx.db.deployment.updateMany({
          where: { id: { in: deploymentRecords.map((d) => d.id) } },
          data: {
            status: "SUCCESS",
            deployedAt: new Date(),
            commitSha: deployResult.commitSha ?? null,
            commitUrl: deployResult.commitUrl ?? null,
            deployUrl: deployResult.url ?? null,
          },
        });

        await ctx.db.project.update({
          where: { id: project.id },
          data: { lastDeployedAt: new Date() },
        });
      } else {
        await ctx.db.deployment.updateMany({
          where: { id: { in: deploymentRecords.map((d) => d.id) } },
          data: {
            status: "FAILED",
            error: deployResult.error ?? "Unknown deployment error",
          },
        });
      }

      return {
        success: deployResult.success,
        deployedCount: deployResult.deployedItems,
        commitSha: deployResult.commitSha ?? null,
        commitUrl: deployResult.commitUrl ?? null,
        url: deployResult.url ?? null,
        error: deployResult.error ?? null,
        details: deployResult.details ?? null,
      };
    }),
});
