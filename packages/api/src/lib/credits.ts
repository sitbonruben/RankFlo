import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@rankflo/db";

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
