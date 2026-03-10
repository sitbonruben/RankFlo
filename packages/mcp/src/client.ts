const DEFAULT_URL = "https://app.rankflo.io";

export function createClient(apiKey: string, baseUrl: string = DEFAULT_URL) {
  async function call(procedure: string, input: unknown = {}): Promise<unknown> {
    // tRPC over HTTP — determine method from procedure name
    const isQuery = /\.(list|get|me|stats|getCredits|getSubscription)/.test(procedure);
    const method = isQuery ? "GET" : "POST";

    const url =
      method === "GET"
        ? `${baseUrl}/api/v1/${procedure}?input=${encodeURIComponent(JSON.stringify(input))}`
        : `${baseUrl}/api/v1/${procedure}`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: method === "POST" ? JSON.stringify(input) : undefined,
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(`RankFlo API error ${res.status}: ${text.slice(0, 200)}`);
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
    }

    // tRPC response shape: { result: { data: ... } }
    if (typeof json === "object" && json !== null) {
      const obj = json as Record<string, unknown>;
      if ("result" in obj) {
        const result = obj["result"] as Record<string, unknown>;
        if ("data" in result) return result["data"];
      }
      if ("error" in obj) {
        const err = obj["error"] as Record<string, unknown>;
        throw new Error(String(err["message"] ?? "Unknown tRPC error"));
      }
    }

    return json;
  }

  return { call };
}

export type RankFloClient = ReturnType<typeof createClient>;
