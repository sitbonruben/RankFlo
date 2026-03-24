import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  createTeamSchema,
} from "@rankflo/core/validators";

import { requireRole } from "../middleware/rbac";
import { checkPlanLimit } from "../middleware/plan-limits";
import { router, protectedProcedure, orgProcedure } from "../trpc";
import { encrypt, decrypt, maskKey } from "../lib/encrypt";

export const organizationRouter = router({
  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.organization.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Organization slug already taken",
        });
      }

      const org = await ctx.db.organization.create({
        data: {
          name: input.name,
          slug: input.slug,
          memberships: {
            create: {
              userId: ctx.session.user.id,
              role: "ADMIN",
            },
          },
        },
      });

      return org;
    }),

  get: orgProcedure.query(async ({ ctx }) => {
    const org = await ctx.db.organization.findUnique({
      where: { id: ctx.organizationId },
      include: {
        _count: {
          select: {
            posts: true,
            pages: true,
            media: true,
            memberships: true,
          },
        },
      },
    });

    if (!org) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return org;
  }),

  update: orgProcedure
    .use(requireRole("ADMIN"))
    .input(updateOrganizationSchema.omit({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.organization.update({
        where: { id: ctx.organizationId },
        data: input,
      });

      return org;
    }),

  listMembers: orgProcedure.query(async ({ ctx }) => {
    const members = await ctx.db.membership.findMany({
      where: { organizationId: ctx.organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        team: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return members;
  }),

  inviteMember: orgProcedure
    .use(requireRole("ADMIN"))
    .input(inviteMemberSchema)
    .mutation(async ({ ctx, input }) => {
      // Enforce plan team member limit (skipped in OSS mode)
      const plan = ctx.session.membership!.organization.plan;
      await checkPlanLimit(ctx.db, ctx.organizationId, plan, "maxTeamMembers");

      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found. They must sign up first.",
        });
      }

      const existing = await ctx.db.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: ctx.organizationId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member",
        });
      }

      const membership = await ctx.db.membership.create({
        data: {
          userId: user.id,
          organizationId: ctx.organizationId,
          role: input.role,
          teamId: input.teamId,
        },
      });

      return membership;
    }),

  removeMember: orgProcedure
    .use(requireRole("ADMIN"))
    .input(z.object({ userId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove yourself",
        });
      }

      await ctx.db.membership.delete({
        where: {
          userId_organizationId: {
            userId: input.userId,
            organizationId: ctx.organizationId,
          },
        },
      });

      return { success: true };
    }),

  updateMemberRole: orgProcedure
    .use(requireRole("ADMIN"))
    .input(
      z.object({
        userId: z.string().cuid(),
        role: z.enum(["ADMIN", "EDITOR", "AUTHOR", "VIEWER"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.membership.update({
        where: {
          userId_organizationId: {
            userId: input.userId,
            organizationId: ctx.organizationId,
          },
        },
        data: { role: input.role },
      });

      return membership;
    }),

  // Teams
  listTeams: orgProcedure.query(async ({ ctx }) => {
    return ctx.db.team.findMany({
      where: { organizationId: ctx.organizationId },
      include: {
        _count: { select: { memberships: true } },
      },
      orderBy: { name: "asc" },
    });
  }),

  createTeam: orgProcedure
    .use(requireRole("ADMIN"))
    .input(createTeamSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.team.create({
        data: {
          ...input,
          organizationId: ctx.organizationId,
        },
      });
    }),

  // ─── AI Settings ────────────────────────────────────────
  getAISettings: orgProcedure
    .use(requireRole("ADMIN"))
    .query(async ({ ctx }) => {
      const org = await ctx.db.organization.findUnique({
        where: { id: ctx.organizationId },
        select: { settings: true },
      });
      const settings = (org?.settings as Record<string, unknown>) ?? {};
      const provider = (settings.aiProvider as string) ?? null;
      const hasKey = !!(settings.aiApiKey);
      const maskedKey = settings.aiApiKey
        ? maskKey(decrypt(settings.aiApiKey as string))
        : null;
      const hasImageKey = !!(settings.kieImageApiKey);
      const maskedImageKey = settings.kieImageApiKey
        ? maskKey(decrypt(settings.kieImageApiKey as string))
        : null;
      const baseUrl = (settings.aiBaseUrl as string) ?? null;
      const model = (settings.aiModel as string) ?? null;
      return { provider, hasKey, maskedKey, hasImageKey, maskedImageKey, baseUrl, model };
    }),

  updateAISettings: orgProcedure
    .use(requireRole("ADMIN"))
    .input(
      z.object({
        provider: z.enum(["anthropic", "openai", "google", "kie", "ollama"]),
        apiKey: z.string().optional(),
        baseUrl: z.string().url().optional(),
        model: z.string().optional(),
        kieImageApiKey: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.organization.findUnique({
        where: { id: ctx.organizationId },
        select: { settings: true },
      });
      const current = (org?.settings as Record<string, unknown>) ?? {};
      const update: Record<string, unknown> = {
        ...current,
        aiProvider: input.provider,
      };
      if (input.apiKey) {
        update.aiApiKey = encrypt(input.apiKey);
      }
      if (input.baseUrl !== undefined) {
        update.aiBaseUrl = input.baseUrl;
      }
      if (input.model !== undefined) {
        update.aiModel = input.model;
      }
      if (input.kieImageApiKey) {
        update.kieImageApiKey = encrypt(input.kieImageApiKey);
      }
      await ctx.db.organization.update({
        where: { id: ctx.organizationId },
        data: { settings: update },
      });
      return { success: true };
    }),

  fetchModels: orgProcedure
    .use(requireRole("ADMIN"))
    .input(z.object({
      provider: z.enum(["openai", "ollama"]),
      baseUrl: z.string().url().optional(),
      apiKey: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const base = input.baseUrl ?? (input.provider === "ollama" ? "http://localhost:11434" : "https://api.openai.com");

      if (input.provider === "ollama") {
        const res = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new TRPCError({ code: "BAD_REQUEST", message: `Cannot reach Ollama at ${base}` });
        const data = await res.json() as { models: { name: string }[] };
        return { models: data.models.map((m: { name: string }) => m.name) };
      } else {
        const res = await fetch(`${base}/v1/models`, {
          headers: { Authorization: `Bearer ${input.apiKey ?? ""}` },
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot fetch models" });
        const data = await res.json() as { data: { id: string }[] };
        return { models: data.data.map((m: { id: string }) => m.id) };
      }
    }),

  updateKieImageKey: orgProcedure
    .use(requireRole("ADMIN"))
    .input(z.object({ apiKey: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.organization.findUnique({
        where: { id: ctx.organizationId },
        select: { settings: true },
      });
      const current = (org?.settings as Record<string, unknown>) ?? {};
      await ctx.db.organization.update({
        where: { id: ctx.organizationId },
        data: { settings: { ...current, kieImageApiKey: encrypt(input.apiKey) } },
      });
      return { success: true };
    }),

  clearAISettings: orgProcedure
    .use(requireRole("ADMIN"))
    .mutation(async ({ ctx }) => {
      const org = await ctx.db.organization.findUnique({
        where: { id: ctx.organizationId },
        select: { settings: true },
      });
      const { aiProvider: _p, aiApiKey: _k, kieImageApiKey: _img, aiBaseUrl: _u, aiModel: _m, ...rest } =
        (org?.settings as Record<string, unknown>) ?? {};
      await ctx.db.organization.update({
        where: { id: ctx.organizationId },
        data: { settings: rest },
      });
      return { success: true };
    }),
});
