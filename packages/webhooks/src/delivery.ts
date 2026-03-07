import { db } from "@rankflo/db";
import { WEBHOOK_RETRY } from "@rankflo/core/constants";
import { signPayload } from "./signature";
import type { WebhookEvent } from "./events";

interface DeliveryResult {
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  error?: string;
}

export async function deliverWebhook(
  webhookId: string,
  event: WebhookEvent,
  data: unknown,
): Promise<void> {
  const webhook = await db.webhook.findUnique({ where: { id: webhookId } });
  if (!webhook || !webhook.isActive) return;

  const payload = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    data,
  });

  const delivery = await db.webhookDelivery.create({
    data: {
      webhookId,
      event,
      payload: data as object,
      status: "PENDING",
    },
  });

  const result = await attemptDelivery(webhook.url, payload, webhook.secret);

  await db.webhookDelivery.update({
    where: { id: delivery.id },
    data: {
      status: result.success ? "SUCCESS" : "RETRYING",
      statusCode: result.statusCode,
      responseBody: result.responseBody?.substring(0, 1000),
      attempts: 1,
      completedAt: result.success ? new Date() : undefined,
      nextRetryAt: result.success
        ? undefined
        : new Date(Date.now() + WEBHOOK_RETRY.baseDelayMs),
    },
  });
}

async function attemptDelivery(
  url: string,
  payload: string,
  secret: string,
): Promise<DeliveryResult> {
  const signature = signPayload(payload, secret);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RankFlo-Signature": signature,
        "X-RankFlo-Timestamp": timestamp,
        "User-Agent": "RankFlo-Webhooks/1.0",
      },
      body: payload,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseBody = await response.text().catch(() => "");

    return {
      success: response.ok,
      statusCode: response.status,
      responseBody,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function dispatchEvent(
  organizationId: string,
  event: WebhookEvent,
  data: unknown,
): Promise<void> {
  const webhooks = await db.webhook.findMany({
    where: {
      organizationId,
      isActive: true,
      events: { has: event },
    },
  });

  await Promise.allSettled(
    webhooks.map((webhook) => deliverWebhook(webhook.id, event, data)),
  );
}
