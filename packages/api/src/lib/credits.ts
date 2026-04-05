import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@rankflo/db";
import { estimateCost } from "@rankflo/core/constants";

/**
 * Check that the organization has enough AI credits and deduct them atomically.
 *
 * - Enterprise orgs are always allowed (unlimited credits).
 * - Free / Pro orgs must have aiCreditsBalance >= cost.
 * - A CreditLedger entry is written for every deduction.
 *
 * Returns the new balance after deduction.
 */
export async function checkAndDeductCredits(
  db: PrismaClient,
  organizationId: string,
  cost: number,
  feature: string,
): Promise<number> {
  if (cost === 0) return 0;

  // Load org inside a transaction so the check + update is atomic
  return await db.$transaction(async (tx) => {
    const org = await tx.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true, aiCreditsBalance: true },
    });

    if (!org) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
    }

    // Enterprise = unlimited; skip credit check
    if (org.plan === "ENTERPRISE") return -1;

    if (org.aiCreditsBalance < cost) {
      throw new TRPCError({
        code: "PAYMENT_REQUIRED",
        message: `Not enough AI credits. This action costs ${cost} credit${cost !== 1 ? "s" : ""} but your balance is ${org.aiCreditsBalance}. Purchase a credit pack to continue.`,
      });
    }

    const newBalance = org.aiCreditsBalance - cost;

    await tx.organization.update({
      where: { id: organizationId },
      data: { aiCreditsBalance: { decrement: cost } },
    });

    await tx.creditLedger.create({
      data: {
        organizationId,
        type: "USAGE",
        amount: -cost,
        balance: newBalance,
        description: `Used ${cost} credit${cost !== 1 ? "s" : ""} for ${feature}`,
        metadata: { feature },
      },
    });

    return newBalance;
  });
}

/**
 * Log token usage after an AI API call.
 * Updates the most recent USAGE ledger entry with token metadata.
 * Fire-and-forget — errors are silently ignored.
 */
export async function logTokenUsage(
  db: PrismaClient,
  organizationId: string,
  data: {
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    feature: string;
  },
): Promise<void> {
  try {
    const cost = estimateCost(data.provider, data.model, data.inputTokens, data.outputTokens);

    // Find the most recent USAGE entry for this org
    const latest = await db.creditLedger.findFirst({
      where: { organizationId, type: "USAGE" },
      orderBy: { createdAt: "desc" },
    });

    if (latest) {
      const existing = (latest.metadata as Record<string, unknown>) ?? {};
      await db.creditLedger.update({
        where: { id: latest.id },
        data: {
          metadata: {
            ...existing,
            provider: data.provider,
            model: data.model,
            inputTokens: data.inputTokens,
            outputTokens: data.outputTokens,
            estimatedCostUsd: Math.round(cost * 1_000_000) / 1_000_000, // 6 decimal places
          },
        },
      });
    }
  } catch {
    // Silently ignore — token logging should never break the main flow
  }
}
