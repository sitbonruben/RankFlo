export const PLANS = {
  FREE: "FREE",
  PRO: "PRO",
  ENTERPRISE: "ENTERPRISE",
} as const;

export type Plan = (typeof PLANS)[keyof typeof PLANS];

export interface PlanLimits {
  maxPosts: number;
  maxPages: number;
  maxTeamMembers: number;
  maxMediaStorageMb: number;
  maxApiKeys: number;
  maxWebhooks: number;
  customDomain: boolean;
  ssoEnabled: boolean;
  prioritySupport: boolean;
  analyticsRetentionDays: number;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    maxPosts: 50,
    maxPages: 10,
    maxTeamMembers: 3,
    maxMediaStorageMb: 500,
    maxApiKeys: 2,
    maxWebhooks: 3,
    customDomain: false,
    ssoEnabled: false,
    prioritySupport: false,
    analyticsRetentionDays: 30,
  },
  PRO: {
    maxPosts: -1, // unlimited
    maxPages: -1,
    maxTeamMembers: 20,
    maxMediaStorageMb: 10_000,
    maxApiKeys: 10,
    maxWebhooks: 20,
    customDomain: true,
    ssoEnabled: false,
    prioritySupport: true,
    analyticsRetentionDays: 365,
  },
  ENTERPRISE: {
    maxPosts: -1,
    maxPages: -1,
    maxTeamMembers: -1,
    maxMediaStorageMb: -1,
    maxApiKeys: -1,
    maxWebhooks: -1,
    customDomain: true,
    ssoEnabled: true,
    prioritySupport: true,
    analyticsRetentionDays: -1,
  },
};

export function isWithinLimit(current: number, limit: number): boolean {
  if (limit === -1) return true;
  return current < limit;
}
