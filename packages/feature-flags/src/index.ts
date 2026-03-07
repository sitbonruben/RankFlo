import type { Plan } from "@rankflo/core/constants";

export type RankFloMode = "oss" | "saas";

export function getMode(): RankFloMode {
  return (process.env.RANKFLO_MODE as RankFloMode) ?? "oss";
}

export function isSaaS(): boolean {
  return getMode() === "saas";
}

export function isOSS(): boolean {
  return getMode() === "oss";
}

const SAAS_FEATURES = {
  billing: true,
  customDomains: true,
  sso: true,
  prioritySupport: true,
  managedAnalytics: true,
  advancedExport: true,
} as const;

export type SaaSFeature = keyof typeof SAAS_FEATURES;

const PLAN_FEATURES: Record<string, Plan[]> = {
  billing: ["PRO", "ENTERPRISE"],
  customDomains: ["PRO", "ENTERPRISE"],
  sso: ["ENTERPRISE"],
  prioritySupport: ["PRO", "ENTERPRISE"],
  managedAnalytics: ["PRO", "ENTERPRISE"],
  advancedExport: ["PRO", "ENTERPRISE"],
};

export function isFeatureEnabled(
  feature: SaaSFeature,
  plan?: Plan,
): boolean {
  if (!isSaaS()) return false;
  if (!plan) return false;
  const allowedPlans = PLAN_FEATURES[feature];
  if (!allowedPlans) return false;
  return allowedPlans.includes(plan);
}

export function requireFeature(feature: SaaSFeature, plan?: Plan): void {
  if (!isFeatureEnabled(feature, plan)) {
    throw new Error(
      `Feature "${feature}" is not available on your current plan`,
    );
  }
}
