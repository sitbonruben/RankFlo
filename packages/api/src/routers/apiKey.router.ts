import { randomBytes, createHash } from "crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, orgProcedure } from "../trpc";

function generateApiKey(): { key: string; keyHash: string; keyPrefix: string } {
  const raw = randomBytes(32).toString("hex"); // 64 hex chars
  const key = `sk_live_${raw}`;
  const keyHash = createHash("sha256").update(key).digest("hex");
  const keyPrefix = `sk_live_${raw.slice(0, 8)}...`;
  return { key, keyHash, keyPrefix };
}

export const apiKeyRouter = router({
  /**
   * Create a new API key. Returns the full key ONCE — it is never stored in plaintext.
   */
  create: orgProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const { key, keyHash, keyPrefix } = generateApiKey();

      const apiKey = await ctx.db.apiKey.create({
        data: {
          organizationId: ctx.organizationId,
          userId: ctx.session.userId,
          name: input.name,
          keyHash,
          keyPrefix,
          scopes: ["*"],
        },
      });

      return {
        key, // Full key — shown ONCE
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        createdAt: apiKey.createdAt,
      };
    }),

  /**
   * List all active (non-revoked) API keys for the current org.
   */
  list: orgProcedure.query(async ({ ctx }) => {
    return ctx.db.apiKey.findMany({
      where: { organizationId: ctx.organizationId, revokedAt: null },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  /**
   * Revoke an API key (soft delete).
   */
  revoke: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const key = await ctx.db.apiKey.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
      });

      if (!key) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.apiKey.update({
        where: { id: input.id },
        data: { revokedAt: new Date() },
      });

      return { success: true };
    }),
});
