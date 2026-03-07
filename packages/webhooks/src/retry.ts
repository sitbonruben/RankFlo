import { db } from "@rankflo/db";
import { WEBHOOK_RETRY } from "@rankflo/core/constants";

export function calculateRetryDelay(attempt: number): number {
  const delay = Math.min(
    WEBHOOK_RETRY.maxDelayMs,
    WEBHOOK_RETRY.baseDelayMs * Math.pow(WEBHOOK_RETRY.backoffMultiplier, attempt),
  );
  // Full jitter
  return Math.random() * delay;
}

export async function processRetryQueue(): Promise<number> {
  const pending = await db.webhookDelivery.findMany({
    where: {
      status: { in: ["RETRYING", "PENDING"] },
      nextRetryAt: { lte: new Date() },
      attempts: { lt: WEBHOOK_RETRY.maxAttempts },
    },
    include: { webhook: true },
    take: 50,
  });

  let processed = 0;

  for (const delivery of pending) {
    if (!delivery.webhook.isActive) continue;

    const payload = JSON.stringify({
      event: delivery.event,
      timestamp: new Date().toISOString(),
      data: delivery.payload,
    });

    try {
      const response = await fetch(delivery.webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "RankFlo-Webhooks/1.0",
        },
        body: payload,
        signal: AbortSignal.timeout(10_000),
      });

      const newAttempts = delivery.attempts + 1;

      if (response.ok) {
        await db.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: "SUCCESS",
            statusCode: response.status,
            attempts: newAttempts,
            completedAt: new Date(),
            nextRetryAt: null,
          },
        });
      } else if (newAttempts >= WEBHOOK_RETRY.maxAttempts) {
        await db.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: "DEAD",
            statusCode: response.status,
            attempts: newAttempts,
            nextRetryAt: null,
          },
        });
      } else {
        const retryDelay = calculateRetryDelay(newAttempts);
        await db.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: "RETRYING",
            statusCode: response.status,
            attempts: newAttempts,
            nextRetryAt: new Date(Date.now() + retryDelay),
          },
        });
      }
    } catch {
      const newAttempts = delivery.attempts + 1;
      if (newAttempts >= WEBHOOK_RETRY.maxAttempts) {
        await db.webhookDelivery.update({
          where: { id: delivery.id },
          data: { status: "DEAD", attempts: newAttempts, nextRetryAt: null },
        });
      } else {
        const retryDelay = calculateRetryDelay(newAttempts);
        await db.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: "RETRYING",
            attempts: newAttempts,
            nextRetryAt: new Date(Date.now() + retryDelay),
          },
        });
      }
    }

    processed++;
  }

  return processed;
}
