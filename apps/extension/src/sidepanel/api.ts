/// <reference types="chrome"/>

export const BASE_URL = "https://app.rankflo.io";

export async function callApi(
  procedure: string,
  input?: unknown,
  token?: string | null,
  apiKey?: string | null,
): Promise<unknown> {
  const method = procedure.includes(".list") || procedure.includes(".get") || procedure.includes(".me") ? "GET" : "POST";

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  } else if (token) {
    headers["Cookie"] = `rankflo_session=${token}`;
  }

  const url =
    method === "GET"
      ? `${BASE_URL}/api/trpc/${procedure}?input=${encodeURIComponent(JSON.stringify(input ?? {}))}`
      : `${BASE_URL}/api/trpc/${procedure}`;

  const res = await fetch(url, {
    method,
    headers,
    credentials: apiKey ? "omit" : "include",
    body: method === "POST" ? JSON.stringify({ 0: input }) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const json = await res.json();

  // tRPC batch response: [{ result: { data: ... } }] or { result: { data: ... } }
  if (Array.isArray(json)) {
    const first = json[0];
    if (first?.result?.data !== undefined) return first.result.data;
    if (first?.error) throw new Error(first.error.message ?? "Unknown error");
  }
  if (json?.result?.data !== undefined) return json.result.data;
  if (json?.error) throw new Error(json.error.message ?? "Unknown error");
  return json;
}

export async function getStoredAuth(): Promise<{ token?: string; apiKey?: string }> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["token", "apiKey"], (result) => {
      resolve({ token: result["token"], apiKey: result["apiKey"] });
    });
  });
}

export async function saveAuth(auth: { token?: string; apiKey?: string }) {
  return new Promise<void>((resolve) => {
    chrome.storage.local.set(auth, resolve);
  });
}

export async function clearAuth() {
  return new Promise<void>((resolve) => {
    chrome.storage.local.remove(["token", "apiKey"], resolve);
  });
}
