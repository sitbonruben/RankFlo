import type {
  ContentItem,
  DeployResult,
  ListContentOptions,
  ProjectInfo,
  RestApiConfig,
} from "../types";
import { BaseConnector, ConnectorError } from "./base";

/**
 * Generic REST API connector — works with ANY REST API.
 * User configures endpoints for list/get/create/update/delete, plus auth details.
 * The connector handles authentication, pagination, and field mapping.
 */
export class RestConnector extends BaseConnector {
  readonly type = "rest";

  private config: RestApiConfig;

  constructor(config: RestApiConfig) {
    super();
    this.config = config;
  }

  /**
   * Build the full URL for an endpoint path.
   */
  private buildUrl(path: string, replacements?: Record<string, string>): string {
    const base = this.config.baseUrl.replace(/\/+$/, "");
    let resolvedPath = path.startsWith("/") ? path : `/${path}`;

    if (replacements) {
      for (const [key, value] of Object.entries(replacements)) {
        resolvedPath = resolvedPath.replace(`:${key}`, encodeURIComponent(value));
      }
    }

    return `${base}${resolvedPath}`;
  }

  /**
   * Build authentication headers based on the configured auth type.
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    switch (this.config.authType) {
      case "bearer":
        if (this.config.authToken) {
          headers.Authorization = `Bearer ${this.config.authToken}`;
        }
        break;
      case "api-key":
        if (this.config.apiKeyHeader && this.config.apiKeyValue) {
          headers[this.config.apiKeyHeader] = this.config.apiKeyValue;
        }
        break;
      case "basic":
        if (this.config.username && this.config.password) {
          const encoded = Buffer.from(
            `${this.config.username}:${this.config.password}`,
          ).toString("base64");
          headers.Authorization = `Basic ${encoded}`;
        }
        break;
      case "none":
        // No auth headers
        break;
    }

    return headers;
  }

  /**
   * Attempt to extract a list of items from a JSON response.
   * Handles common patterns: root array, { data: [...] }, { items: [...] },
   * { results: [...] }, { posts: [...] }, { articles: [...] }.
   */
  private extractList(body: unknown): unknown[] {
    if (Array.isArray(body)) return body;

    if (body && typeof body === "object") {
      const obj = body as Record<string, unknown>;
      for (const key of [
        "data",
        "items",
        "results",
        "posts",
        "articles",
        "entries",
        "records",
        "content",
        "documents",
      ]) {
        if (Array.isArray(obj[key])) return obj[key] as unknown[];
      }
    }

    return [];
  }

  /**
   * Map an arbitrary API response object to a ContentItem.
   * Tries common field names for each property.
   */
  private mapToContentItem(raw: unknown): ContentItem {
    const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
      string,
      unknown
    >;

    const id = String(
      obj.id ?? obj._id ?? obj.uuid ?? obj.externalId ?? obj.ID ?? "",
    );
    const title = String(
      obj.title ?? obj.name ?? obj.headline ?? obj.subject ?? "Untitled",
    );
    const slug = String(
      obj.slug ?? obj.handle ?? obj.url_slug ?? obj.permalink ?? this.slugify(title),
    );
    const content = String(
      obj.content ??
        obj.body ??
        obj.body_html ??
        obj.text ??
        obj.description ??
        obj.html ??
        "",
    );
    const contentHtml = obj.body_html ?? obj.content_html ?? obj.html;
    const excerpt =
      obj.excerpt ?? obj.summary ?? obj.short_description ?? obj.teaser;
    const author = obj.author ?? obj.author_name ?? obj.creator ?? obj.writer;
    const tags = obj.tags ?? obj.categories ?? obj.labels ?? obj.keywords;
    const image =
      obj.featured_image ??
      obj.image ??
      obj.cover_image ??
      obj.thumbnail ??
      obj.og_image;
    const status = obj.status ?? obj.state ?? obj.publish_status;
    const publishedAt = obj.published_at ?? obj.publishedAt ?? obj.date ?? obj.created_at;
    const updatedAt = obj.updated_at ?? obj.updatedAt ?? obj.modified_at ?? obj.modified;

    let resolvedStatus: "draft" | "published" | "scheduled" = "published";
    if (typeof status === "string") {
      const lower = status.toLowerCase();
      if (lower === "draft" || lower === "unpublished") resolvedStatus = "draft";
      else if (lower === "scheduled" || lower === "future") resolvedStatus = "scheduled";
    }

    return {
      externalId: id,
      title,
      slug,
      content,
      contentHtml: typeof contentHtml === "string" ? contentHtml : undefined,
      format: "html",
      status: resolvedStatus,
      author: typeof author === "string" ? author : undefined,
      tags: Array.isArray(tags)
        ? tags.map(String)
        : typeof tags === "string"
          ? tags.split(",").map((t) => t.trim())
          : undefined,
      featuredImage: typeof image === "string" ? image : undefined,
      excerpt: typeof excerpt === "string" ? excerpt : undefined,
      publishedAt:
        typeof publishedAt === "string" ? new Date(publishedAt) : undefined,
      updatedAt:
        typeof updatedAt === "string" ? new Date(updatedAt) : undefined,
      metadata: obj,
    };
  }

  // ─── Lifecycle ─────────────────────────────────────────────────

  /** Verify the connection by attempting to list content. */
  async connect(): Promise<void> {
    try {
      const url = this.buildUrl(this.config.endpoints.list);
      await this.fetchWithRetry(url, {
        headers: this.getAuthHeaders(),
      });
      this.connected = true;
    } catch (error) {
      throw new ConnectorError(
        `Failed to connect to REST API at "${this.config.baseUrl}". Verify credentials and endpoint configuration.`,
        { connectorType: this.type, operation: "connect", cause: error },
      );
    }
  }

  /** Test the REST API connection. */
  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      const url = this.buildUrl(this.config.endpoints.list);
      await this.fetchWithRetry(url, {
        headers: this.getAuthHeaders(),
      });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ─── Project Info ──────────────────────────────────────────────

  /** Get basic project info by listing content from the API. */
  async getProjectInfo(): Promise<ProjectInfo> {
    this.assertConnected();

    const url = this.buildUrl(this.config.endpoints.list);
    const body = await this.fetchJson<unknown>(url, {
      headers: this.getAuthHeaders(),
    });

    const items = this.extractList(body);

    return {
      name: new URL(this.config.baseUrl).hostname,
      url: this.config.baseUrl,
      hasExistingContent: items.length > 0,
      contentCount: items.length,
      detectedFormat: "html",
    };
  }

  // ─── Content CRUD ──────────────────────────────────────────────

  /** List content from the configured list endpoint. */
  async listContent(options?: ListContentOptions): Promise<ContentItem[]> {
    this.assertConnected();

    const url = new URL(this.buildUrl(this.config.endpoints.list));

    if (options?.limit) url.searchParams.set("limit", String(options.limit));
    if (options?.offset) url.searchParams.set("offset", String(options.offset));
    if (options?.status) url.searchParams.set("status", options.status);

    const body = await this.fetchJson<unknown>(url.toString(), {
      headers: this.getAuthHeaders(),
    });

    const raw = this.extractList(body);
    return raw.map((item) => this.mapToContentItem(item));
  }

  /** Get a single content item by ID. */
  async getContent(externalId: string): Promise<ContentItem | null> {
    this.assertConnected();

    try {
      const url = this.buildUrl(this.config.endpoints.get, {
        id: externalId,
      });

      const body = await this.fetchJson<unknown>(url, {
        headers: this.getAuthHeaders(),
      });

      return this.mapToContentItem(body);
    } catch (error) {
      if (error instanceof ConnectorError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /** Create a new content item via the create endpoint. */
  async createContent(
    item: Omit<ContentItem, "externalId">,
  ): Promise<ContentItem> {
    this.assertConnected();

    const url = this.buildUrl(this.config.endpoints.create);

    const payload: Record<string, unknown> = {
      title: item.title,
      slug: item.slug,
      content: item.content,
      status: item.status,
      excerpt: item.excerpt,
      author: item.author,
      tags: item.tags,
      featured_image: item.featuredImage,
    };

    const body = await this.fetchJson<unknown>(url, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    return this.mapToContentItem(body);
  }

  /** Update an existing content item via the update endpoint. */
  async updateContent(
    externalId: string,
    updates: Partial<Omit<ContentItem, "externalId">>,
  ): Promise<ContentItem> {
    this.assertConnected();

    const url = this.buildUrl(this.config.endpoints.update, {
      id: externalId,
    });

    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.excerpt !== undefined) payload.excerpt = updates.excerpt;
    if (updates.author !== undefined) payload.author = updates.author;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.featuredImage !== undefined) {
      payload.featured_image = updates.featuredImage;
    }

    const body = await this.fetchJson<unknown>(url, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    return this.mapToContentItem(body);
  }

  /** Delete a content item via the delete endpoint. */
  async deleteContent(externalId: string): Promise<boolean> {
    this.assertConnected();

    try {
      const url = this.buildUrl(this.config.endpoints.delete, {
        id: externalId,
      });

      await this.fetchWithRetry(url, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
      return true;
    } catch (error) {
      if (error instanceof ConnectorError && error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  // ─── Deployment ────────────────────────────────────────────────

  /** Batch create or update items via the REST API. */
  async deploy(items: ContentItem[]): Promise<DeployResult> {
    this.assertConnected();

    if (items.length === 0) {
      return { success: true, deployedItems: 0, details: "No items to deploy." };
    }

    let deployed = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        if (item.externalId) {
          await this.updateContent(item.externalId, item);
        } else {
          await this.createContent(item);
        }
        deployed++;
      } catch (error) {
        errors.push(
          `Failed to deploy "${item.title}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return {
      success: errors.length === 0,
      url: this.config.baseUrl,
      deployedItems: deployed,
      error: errors.length > 0 ? errors.join("; ") : undefined,
      details: `Deployed ${deployed}/${items.length} items via REST API`,
    };
  }
}
