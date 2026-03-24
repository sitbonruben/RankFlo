import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { z } from "zod";

import { createWebhookSchema } from "@rankflo/core/validators";

import { requireRole } from "../middleware/rbac";
import { checkPlanLimit } from "../middleware/plan-limits";
import { router, orgProcedure } from "../trpc";

export const webhookRouter = router({
  list: orgProcedure.query(async ({ ctx }) => {
    return ctx.db.webhook.findMany({
      where: { organizationId: ctx.organizationId },
      include: {
        _count: { select: { deliveries: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: orgProcedure
    .use(requireRole("ADMIN"))
    .input(createWebhookSchema)
    .mutation(async ({ ctx, input }) => {
      // Enforce plan webhook limit (skipped in OSS mode)
      const plan = ctx.session.membership!.organization.plan;
      await checkPlanLimit(ctx.db, ctx.organizationId, plan, "maxWebhooks");

      const secret = randomBytes(32).toString("hex");

      return ctx.db.webhook.create({
        data: {
          ...input,
          secret,
          organizationId: ctx.organizationId,
        },
      });
    }),

  update: orgProcedure
    .use(requireRole("ADMIN"))
    .input(
      z.object({
        id: z.string().cuid(),
        url: z.string().url().optional(),
        events: z.array(z.string()).min(1).optional(),
        isActive: z.boolean().optional(),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.db.webhook.update({
        where: { id },
        data,
      });
    }),

  delete: orgProcedure
    .use(requireRole("ADMIN"))
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.webhook.delete({ where: { id: input.id } });
      return { success: true };
    }),

  deliveries: orgProcedure
    .input(
      z.object({
        webhookId: z.string().cuid(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;

      const [items, total] = await Promise.all([
        ctx.db.webhookDelivery.findMany({
          where: { webhookId: input.webhookId },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.pageSize,
        }),
        ctx.db.webhookDelivery.count({
          where: { webhookId: input.webhookId },
        }),
      ]);

      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),
});
