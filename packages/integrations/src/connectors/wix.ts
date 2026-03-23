import type {
  ContentItem,
  DeployResult,
  ListContentOptions,
  ProjectInfo,
  WixConfig,
} from "../types";
import { BaseConnector, ConnectorError } from "./base";

/** Wix API base URL. */
const WIX_API = "https://www.wixapis.com";

interface WixSiteProperties {
  site: {
    siteDisplayName: string;
    siteDescription: string | null;
    url: string;
  };
}

interface WixBlogPost {
  id: string;
  title: string;
  slug: string;
  richContent?: { nodes: unknown[] };
  excerpt?: string;
  content?: string;
  contentText?: string;
  featured: boolean;
  pinned: boolean;
  status: "PUBLISHED" | "DRAFT" | "SCHEDULED";
  coverMedia?: {
    image?: { url: string };
  };
  tags?: { label: string }[];
  publishedDate?: string;
  lastPublishedDate?: string;
  updatedDate?: string;
  memberId?: string;
  url?: { base: string; path: string };
}

interface WixListResponse {
  posts: WixBlogPost[];
  metaData: {
    count: number;
    offset: number;
    total: number;
  };
}

interface WixPostResponse {
  post: WixBlogPost;
}

/**
 * Wix connector — uses the Wix Blog API.
 * Manages blog posts through the Wix REST API with API key authentication.
 */
export class WixConnector extends BaseConnector {
  readonly type = "wix";

  private config: WixConfig;
  private headers: Record<string, string>;

  constructor(config: WixConfig) {
    super();
    this.config = config;
    this.headers = {
      Authorization: config.apiKey,
      "wix-site-id": config.siteId,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private apiUrl(path: string): string {
    return `${WIX_API}${path}`;
  }

  /**
   * Map Wix post status to universal status.
   */
  private mapStatus(
    wixStatus: string,
  ): "draft" | "published" | "scheduled" {
    switch (wixStatus) {
      case "PUBLISHED":
        return "published";
      case "SCHEDULED":
        return "scheduled";
      default:
        return "draft";
    }
  }

  /**
   * Map universal status to Wix status.
   */
  private toWixStatus(status: "draft" | "published" | "scheduled"): string {
    switch (status) {
      case "published":
        return "PUBLISHED";
      case "scheduled":
        return "SCHEDULED";
      default:
        return "DRAFT";
    }
  }

  /**
   * Convert a Wix blog post to a universal ContentItem.
   */
  private postToContentItem(post: WixBlogPost): ContentItem {
    const content = post.contentText ?? post.content ?? "";
    const fullUrl =
      post.url ? `${post.url.base}${post.url.path}` : undefined;

    return {
      externalId: post.id,
      title: post.title,
      slug: post.slug,
      content,
      format: "html",
      status: this.mapStatus(post.status),
      tags: post.tags?.map((t) => t.label),
      featuredImage: post.coverMedia?.image?.url,
      excerpt: post.excerpt,
      publishedAt: post.publishedDate
        ? new Date(post.publishedDate)
        : post.lastPublishedDate
          ? new Date(post.lastPublishedDate)
          : undefined,
      updatedAt: post.updatedDate ? new Date(post.updatedDate) : undefined,
      metadata: {
        wix_id: post.id,
        featured: post.featured,
        pinned: post.pinned,
        url: fullUrl,
      },
    };
  }

  // ─── Lifecycle ─────────────────────────────────────────────────

  /** Verify API key by fetching site properties and listing posts. */
  async connect(): Promise<void> {
    try {
      // Test with a blog query (list 1 post) to verify authentication
      await this.fetchJson<WixListResponse>(
        this.apiUrl("/blog/v3/posts/query"),
        {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify({
            query: {
              paging: { limit: 1, offset: 0 },
            },
          }),
        },
      );
      this.connected = true;
    } catch (error) {
      throw new ConnectorError(
        `Failed to connect to Wix site "${this.config.siteId}". Verify your API key.`,
        { connectorType: this.type, operation: "connect", cause: error },
      );
    }
  }

  /** Test the Wix API connection. */
  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.fetchJson<WixListResponse>(
        this.apiUrl("/blog/v3/posts/query"),
        {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify({
            query: {
              paging: { limit: 1, offset: 0 },
            },
          }),
        },
      );
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ─── Project Info ──────────────────────────────────────────────

  /** Get Wix site information and post count. */
  async getProjectInfo(): Promise<ProjectInfo> {
    this.assertConnected();

    // Get post count
    const listResp = await this.fetchJson<WixListResponse>(
      this.apiUrl("/blog/v3/posts/query"),
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          query: {
            paging: { limit: 1, offset: 0 },
          },
        }),
      },
    );

    const total = listResp.metaData?.total ?? 0;

    // Try to get site properties
    let siteName = "Wix Site";
    let siteDescription: string | undefined;
    let siteUrl: string | undefined;

    try {
      const siteProps = await this.fetchJson<WixSiteProperties>(
        this.apiUrl("/site-properties/v4/properties"),
        { headers: this.headers },
      );
      siteName = siteProps.site.siteDisplayName || siteName;
      siteDescription = siteProps.site.siteDescription ?? undefined;
      siteUrl = siteProps.site.url;
    } catch {
      // Site properties endpoint might not be available — non-critical
    }

    return {
      name: siteName,
      description: siteDescription,
      url: siteUrl,
      framework: "wix",
      hasExistingContent: total > 0,
      contentCount: total,
      detectedFormat: "html",
    };
  }

  // ─── Content CRUD ──────────────────────────────────────────────

  /** List Wix blog posts. */
  async listContent(options?: ListContentOptions): Promise<ContentItem[]> {
    this.assertConnected();

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    const query: Record<string, unknown> = {
      paging: { limit, offset },
      sort: [{ fieldName: "lastPublishedDate", order: "DESC" }],
    };

    if (options?.status) {
      query.filter = {
        status: this.toWixStatus(
          options.status as "draft" | "published" | "scheduled",
        ),
      };
    }

    const data = await this.fetchJson<WixListResponse>(
      this.apiUrl("/blog/v3/posts/query"),
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ query }),
      },
    );

    return (data.posts ?? []).map((p) => this.postToContentItem(p));
  }

  /** Get a single Wix blog post by ID. */
  async getContent(externalId: string): Promise<ContentItem | null> {
    this.assertConnected();

    try {
      const data = await this.fetchJson<WixPostResponse>(
        this.apiUrl(`/blog/v3/posts/${externalId}`),
        { headers: this.headers },
      );
      return this.postToContentItem(data.post);
    } catch (error) {
      if (error instanceof ConnectorError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /** Create a new Wix blog post as a draft, then optionally publish. */
  async createContent(
    item: Omit<ContentItem, "externalId">,
  ): Promise<ContentItem> {
    this.assertConnected();

    const payload: Record<string, unknown> = {
      post: {
        title: item.title,
        content: item.content,
        excerpt: item.excerpt ?? undefined,
        featured: false,
      },
    };

    // Create as draft first
    const created = await this.fetchJson<WixPostResponse>(
      this.apiUrl("/blog/v3/draft-posts"),
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(payload),
      },
    );

    // Publish if status is "published"
    if (item.status === "published" && created.post.id) {
      try {
        const published = await this.fetchJson<WixPostResponse>(
          this.apiUrl(`/blog/v3/draft-posts/${created.post.id}/publish`),
          {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({}),
          },
        );
        return this.postToContentItem(published.post);
      } catch {
        // Publish failed — return draft version
        return this.postToContentItem(created.post);
      }
    }

    return this.postToContentItem(created.post);
  }

  /** Update an existing Wix blog post. */
  async updateContent(
    externalId: string,
    updates: Partial<Omit<ContentItem, "externalId">>,
  ): Promise<ContentItem> {
    this.assertConnected();

    const postUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) postUpdates.title = updates.title;
    if (updates.content !== undefined) postUpdates.content = updates.content;
    if (updates.excerpt !== undefined) postUpdates.excerpt = updates.excerpt;

    const updated = await this.fetchJson<WixPostResponse>(
      this.apiUrl(`/blog/v3/draft-posts/${externalId}`),
      {
        method: "PATCH",
        headers: this.headers,
        body: JSON.stringify({ post: postUpdates }),
      },
    );

    // Publish if status changed to published
    if (updates.status === "published") {
      try {
        const published = await this.fetchJson<WixPostResponse>(
          this.apiUrl(`/blog/v3/draft-posts/${externalId}/publish`),
          {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({}),
          },
        );
        return this.postToContentItem(published.post);
      } catch {
        return this.postToContentItem(updated.post);
      }
    }

    return this.postToContentItem(updated.post);
  }

  /** Delete a Wix blog post. */
  async deleteContent(externalId: string): Promise<boolean> {
    this.assertConnected();

    try {
      await this.fetchWithRetry(
        this.apiUrl(`/blog/v3/posts/${externalId}`),
        { method: "DELETE", headers: this.headers },
      );
      return true;
    } catch (error) {
      if (error instanceof ConnectorError && error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  // ─── Deployment ────────────────────────────────────────────────

  /** Batch create or update and publish blog posts on Wix. */
  async deploy(items: ContentItem[]): Promise<DeployResult> {
    this.assertConnected();

    if (items.length === 0) {
      return { success: true, deployedItems: 0, details: "No items to deploy." };
    }

    let deployed = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        if (item.externalId && !item.externalId.includes("/")) {
          await this.updateContent(item.externalId, {
            ...item,
            status: "published",
          });
        } else {
          await this.createContent({ ...item, status: "published" });
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
      deployedItems: deployed,
      error: errors.length > 0 ? errors.join("; ") : undefined,
      details: `Deployed ${deployed}/${items.length} posts to Wix`,
    };
  }
}
