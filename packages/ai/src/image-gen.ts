/**
 * KIE.ai image generation (Nano Banana — Gemini Flash Image Preview).
 *
 * Uses the KIE jobs API which is async:
 *   1. POST /createTask → returns taskId
 *   2. Poll GET /recordInfo?taskId=... until successFlag === 1
 */

const KIE_IMAGE_BASE = "https://api.kie.ai/api/v1/jobs";
const NANO_BANANA_MODEL = "google/nano-banana";

interface KieCreateResponse {
  code: number;
  msg: string;
  data: { taskId: string };
}

interface KieRecordResponse {
  code: number;
  data: {
    successFlag: number; // 0=pending, 1=done, 2=failed
    progress?: string;   // "0.00" to "1.00"
    resultUrls?: string[];
    errorMessage?: string;
  };
}

/**
 * Generate an image using KIE Nano Banana.
 * Returns the URL of the generated image.
 *
 * @param apiKey  - KIE API key (Bearer token)
 * @param prompt  - Text description for the image
 * @param aspectRatio - "1:1" | "16:9" | "4:3" | "9:16" (default "16:9")
 * @param timeoutMs - Max ms to wait for generation (default 90s)
 */
export async function generateImageWithKie(
  apiKey: string,
  prompt: string,
  aspectRatio: "1:1" | "16:9" | "4:3" | "9:16" = "16:9",
  timeoutMs = 90_000,
): Promise<string> {
  // 1. Create task
  const createRes = await fetch(`${KIE_IMAGE_BASE}/createTask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: NANO_BANANA_MODEL,
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        output_format: "jpg",
      },
    }),
  });

  if (!createRes.ok) {
    const body = await createRes.text().catch(() => "");
    throw new Error(`KIE task creation failed (${createRes.status}): ${body}`);
  }

  const createData = (await createRes.json()) as KieCreateResponse;
  if (createData.code !== 200 || !createData.data?.taskId) {
    throw new Error(`KIE task creation error: ${createData.msg}`);
  }

  const { taskId } = createData.data;

  // 2. Poll until done or timeout
  const pollIntervalMs = 3_000;
  const maxAttempts = Math.ceil(timeoutMs / pollIntervalMs);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    const pollRes = await fetch(
      `${KIE_IMAGE_BASE}/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      },
    ).catch(() => null);

    if (!pollRes?.ok) continue;

    const pollData = (await pollRes.json()) as KieRecordResponse;
    const { successFlag, resultUrls, errorMessage } = pollData.data ?? {};

    if (successFlag === 1) {
      const url = resultUrls?.[0];
      if (!url) throw new Error("KIE returned success but no image URL");
      return url;
    }

    if (successFlag === 2) {
      throw new Error(`KIE image generation failed: ${errorMessage ?? "unknown error"}`);
    }
    // successFlag === 0 → still generating, continue polling
  }

  throw new Error(`KIE image generation timed out after ${timeoutMs / 1000}s`);
}
