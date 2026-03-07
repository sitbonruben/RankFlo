export const RATE_LIMITS = {
  publicApi: { max: 1000, windowMs: 60 * 60 * 1000 },
  mutations: { max: 100, windowMs: 60 * 1000 },
  queries: { max: 500, windowMs: 60 * 1000 },
  auth: { max: 10, windowMs: 60 * 1000 },
  mediaUpload: { max: 50, windowMs: 60 * 60 * 1000 },
  webhookDelivery: { maxConcurrent: 10 },
} as const;

export const WEBHOOK_RETRY = {
  maxAttempts: 8,
  baseDelayMs: 10_000,
  maxDelayMs: 24 * 60 * 60 * 1000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
} as const;

export const SESSION = {
  maxAgeDays: 30,
  refreshAfterDays: 15,
  cookieName: "rankflo_session",
  redisCacheTtlSeconds: 900,
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

export const CONTENT = {
  maxTitleLength: 200,
  maxExcerptLength: 500,
  maxSlugLength: 100,
  maxTagsPerPost: 10,
  minPasswordLength: 8,
  maxPasswordLength: 128,
} as const;
