import { TRPCError } from "@trpc/server";

import { PLAN_LIMITS } from "@rankflo/core/constants";
import { isOSS } from "@rankflo/feature-flags";
import type { Plan } from "@rankflo/core/constants";
import type { PrismaClient } from "@rankflo/db";

type LimitKey = "maxPosts" | "maxPages" | "maxTeamMembers" | "maxApiKeys" | "maxWebhooks";

/**
 * Counts current usage of a resource and throws FORBIDDEN if the org is at or
 * over its plan limit.  Pass `limit === -1` to mean "unlimited".
 *
 * Skipped entirely in OSS mode — self-hosted instances have no plan limits.
 */
export async function checkPlanLimit(
  db: PrismaClient,
  organizationId: string,
  plan: Plan,
  limitKey: LimitKey,
): Promise<void> {
  // OSS (self-hosted) installations are always unlimited
  if (isOSS()) return;

  const limit = PLAN_LIMITS[plan][limitKey] as number;
  if (limit === -1) return; // unlimited on this plan

  let current = 0;

  switch (limitKey) {
    case "maxPosts":
      current = await db.post.count({
        where: { organizationId, deletedAt: null },
      });
      break;

    case "maxPages":
      current = await db.page.count({
        where: { organizationId, deletedAt: null },
      });
      break;

    case "maxTeamMembers":
      current = await db.membership.count({
        where: { organizationId },
      });
      break;

    case "maxApiKeys":
      current = await db.apiKey.count({
        where: { organizationId, revokedAt: null },
      });
      break;

    case "maxWebhooks":
      current = await db.webhook.count({
        where: { organizationId },
      });
      break;

    default: {
      const _exhaustive: never = limitKey;
      throw new Error(`Unknown limitKey: ${_exhaustive}`);
    }
  }

  if (current >= limit) {
    const resourceLabel: Record<LimitKey, string> = {
      maxPosts: "posts",
      maxPages: "pages",
      maxTeamMembers: "team members",
      maxApiKeys: "API keys",
      maxWebhooks: "webhooks",
    };

    const nextPlan = plan === "FREE" ? "Pro" : "Enterprise";

    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Plan limit reached: your ${plan} plan allows ${limit} ${resourceLabel[limitKey]}. Upgrade to ${nextPlan} to create more.`,
    });
  }
}
