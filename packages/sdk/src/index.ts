export interface RankFloClientConfig {
  baseUrl: string;
  apiKey: string;
}

export class RankFloClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: RankFloClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api/v1${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new RankFloError(
        (error as Record<string, string>).message ?? response.statusText,
        response.status,
      );
    }

    return response.json() as Promise<T>;
  }

  posts = {
    list: (params?: { page?: number; pageSize?: number; status?: string }) =>
      this.request<{ items: unknown[]; total: number }>(
        `/posts?${new URLSearchParams(params as Record<string, string>)}`,
      ),
    get: (slug: string) =>
      this.request<unknown>(`/posts/${slug}`),
    create: (data: { title: string; slug: string; content: unknown }) =>
      this.request<unknown>("/posts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Record<string, unknown>) =>
      this.request<unknown>(`/posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request<{ success: boolean }>(`/posts/${id}`, {
        method: "DELETE",
      }),
  };

  media = {
    list: (params?: { page?: number; pageSize?: number }) =>
      this.request<{ items: unknown[]; total: number }>(
        `/media?${new URLSearchParams(params as Record<string, string>)}`,
      ),
    upload: (data: { fileName: string; url: string; mimeType: string }) =>
      this.request<unknown>("/media", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  search = {
    query: (q: string, params?: { page?: number; tags?: string[] }) =>
      this.request<{ items: unknown[]; total: number }>(
        `/search?q=${encodeURIComponent(q)}&${new URLSearchParams(params as Record<string, string>)}`,
      ),
  };
}

export class RankFloError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "RankFloError";
  }
}
