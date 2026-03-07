import type {
  ContentItem,
  DeployResult,
  ListContentOptions,
  ProjectInfo,
  WordPressConfig,
} from "../types";
import { BaseConnector, ConnectorError } from "./base";

interface WPSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  gmt_offset: number;
  timezone_string: string;
  namespaces: string[];
}

interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: "publish" | "draft" | "pending" | "private" | "future";
  title: { rendered: string; raw?: string };
  content: { rendered: string; raw?: string };
  excerpt: { rendered: string; raw?: string };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  link: string;
}

interface WPTag {
  id: number;
  name: string;
  slug: string;
}

interface WPMedia {
  id: number;
  source_url: string;
}

/**
 * WordPress connector — uses the WordPress REST API (WP JSON).
 * Authenticates via Application Passwords (Basic auth).
 */
export class WordPressConnector extends BaseConnector {
  readonly type = "wordpress";

  private config: WordPressConfig;
  private apiBase: string;
  private headers: Record<string, string>;

  constructor(config: WordPressConfig) {
    super();
    this.config = config;

    // Ensure no trailing slash
    const siteUrl = config.siteUrl.replace(/\/+$/, "");
    this.apiBase = `${siteUrl}/wp-json/wp/v2`;

    // Application Password uses Basic auth
    const credentials = Buffer.from(
      `${config.username}:${config.applicationPassword}`,
    ).toString("base64");

    this.headers = {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    };
  }

  private apiUrl(path: string): string {
    return `${this.apiBase}${path}`;
  }

  /**
   * Convert a WP post status to the universal status.
   */
  private mapStatus(
    wpStatus: string,
  ): "draft" | "published" | "scheduled" {
    switch (wpStatus) {
      case "publish":
        return "published";
      case "future":
        return "scheduled";
      default:
        return "draft";
    }
  }

  /**
   * Convert a universal status to WP post status.
   */
  private toWpStatus(
    status: "draft" | "published" | "scheduled",
  ): string {
    switch (status) {
      case "published":
        return "publish";
      case "scheduled":
        return "future";
      default:
        return "draft";
    }
  }

  /**
   * Convert a WP post to a universal ContentItem.
   */
  private postToContentItem(
    post: WPPost,
    tagNames?: string[],
    featuredImageUrl?: string,
  ): ContentItem {
    return {
      externalId: String(post.id),
      title: post.title.raw ?? post.title.rendered,
      slug: post.slug,
      content: post.content.raw ?? post.content.rendered,
      contentHtml: post.content.rendered,
      format: "html",
      status: this.mapStatus(post.status),
      tags: tagNames,
      featuredImage: featuredImageUrl,
      excerpt:
        post.excerpt.raw ?? (post.excerpt.rendered?.replace(/<[^>]+>/g, "").trim() || undefined),
      publishedAt: post.date ? new Date(post.date) : undefined,
      updatedAt: post.modified ? new Date(post.modified) : undefined,
      metadata: {
        wp_id: post.id,
        wp_status: post.status,
        wp_categories: post.categories,
        wp_link: post.link,
      },
    };
  }

  /**
   * Resolve tag IDs to tag names.
   */
  private async resolveTagNames(tagIds: number[]): Promise<string[]> {
    if (tagIds.length === 0) return [];

    try {
      const tags = await this.fetchJson<WPTag[]>(
        this.apiUrl(`/tags?include=${tagIds.join(",")}&per_page=100`),
        { headers: this.headers },
      );
      return tags.map((t) => t.name);
    } catch {
      return [];
    }
  }

  /**
   * Resolve featured media ID to its URL.
   */
  private async resolveFeaturedImage(
    mediaId: number,
  ): Promise<string | undefined> {
    if (!mediaId) return undefined;

    try {
      const media = await this.fetchJson<WPMedia>(
        this.apiUrl(`/media/${mediaId}`),
        { headers: this.headers },
      );
      return media.source_url;
    } catch {
      return undefined;
    }
  }

  /**
   * Ensure tags exist and return their IDs.
   * Creates tags that don't already exist.
   */
  private async ensureTagIds(tagNames: string[]): Promise<number[]> {
    if (tagNames.length === 0) return [];

    const ids: number[] = [];

    for (const name of tagNames) {
      // Search for existing tag
      try {
        const existing = await this.fetchJson<WPTag[]>(
          this.apiUrl(`/tags?search=${encodeURIComponent(name)}&per_page=10`),
          { headers: this.headers },
        );

        const exact = existing.find(
          (t) => t.name.toLowerCase() === name.toLowerCase(),
        );

        if (exact) {
          ids.push(exact.id);
          continue;
        }
      } catch {
        // Search failed — try creating
      }

      // Create new tag
      try {
        const newTag = await this.fetchJson<WPTag>(
          this.apiUrl("/tags"),
          {
            method: "POST",
            headers: this.headers,
            body: { name },
          },
        );
        ids.push(newTag.id);
      } catch {
        // Couldn't create tag — skip it
      }
    }

    return ids;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────

  /** Verify WordPress REST API is available and credentials are valid. */
  async connect(): Promise<void> {
    try {
      const siteUrl = this.config.siteUrl.replace(/\/+$/, "");
      await this.fetchJson<WPSiteInfo>(`${siteUrl}/wp-json`, {
        headers: this.headers,
      });

      // Also verify we can access posts (authentication check)
      await this.fetchJson<WPPost[]>(
        this.apiUrl("/posts?per_page=1&context=edit"),
        { headers: this.headers },
      );

      this.connected = true;
    } catch (error) {
      throw new ConnectorError(
        `Failed to connect to WordPress at "${this.config.siteUrl}". Verify the URL and Application Password.`,
        { connectorType: this.type, operation: "connect", cause: error },
      );
    }
  }

  /** Test the WordPress API connection. */
  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      const siteUrl = this.config.siteUrl.replace(/\/+$/, "");
      await this.fetchJson<WPSiteInfo>(`${siteUrl}/wp-json`, {
        headers: this.headers,
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

  /** Get WordPress site information and post count. */
  async getProjectInfo(): Promise<ProjectInfo> {
    this.assertConnected();

    const siteUrl = this.config.siteUrl.replace(/\/+$/, "");
    const siteInfo = await this.fetchJson<WPSiteInfo>(
      `${siteUrl}/wp-json`,
      { headers: this.headers },
    );

    // Get total post count from headers
    const response = await this.fetchWithRetry(
      this.apiUrl("/posts?per_page=1"),
      { headers: this.headers },
    );
    const totalPosts = parseInt(
      response.headers.get("x-wp-total") ?? "0",
      10,
    );

    return {
      name: siteInfo.name,
      description: siteInfo.description || undefined,
      url: siteInfo.url,
      framework: "wordpress",
      language: "php",
      hasExistingContent: totalPosts > 0,
      contentCount: totalPosts,
      detectedFormat: "html",
    };
  }

  // ─── Content CRUD ──────────────────────────────────────────────

  /** List WordPress posts with optional filtering and pagination. */
  async listContent(options?: ListContentOptions): Promise<ContentItem[]> {
    this.assertConnected();

    const params = new URLSearchParams();
    params.set("per_page", String(options?.limit ?? 20));
    params.set("offset", String(options?.offset ?? 0));
    params.set("context", "edit");
    params.set("orderby", "date");
    params.set("order", "desc");

    if (options?.status) {
      params.set("status", this.toWpStatus(options.status as "draft" | "published" | "scheduled"));
    } else {
      params.set("status", "publish,draft,future,pending,private");
    }

    const posts = await this.fetchJson<WPPost[]>(
      this.apiUrl(`/posts?${params.toString()}`),
      { headers: this.headers },
    );

    // Resolve tags and featured images in parallel
    const items = await Promise.all(
      posts.map(async (post) => {
        const [tagNames, featuredImage] = await Promise.all([
          this.resolveTagNames(post.tags),
          this.resolveFeaturedImage(post.featured_media),
        ]);
        return this.postToContentItem(post, tagNames, featuredImage);
      }),
    );

    return items;
  }

  /** Get a single WordPress post by ID. */
  async getContent(externalId: string): Promise<ContentItem | null> {
    this.assertConnected();

    try {
      const post = await this.fetchJson<WPPost>(
        this.apiUrl(`/posts/${externalId}?context=edit`),
        { headers: this.headers },
      );

      const [tagNames, featuredImage] = await Promise.all([
        this.resolveTagNames(post.tags),
        this.resolveFeaturedImage(post.featured_media),
      ]);

      return this.postToContentItem(post, tagNames, featuredImage);
    } catch (error) {
      if (error instanceof ConnectorError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /** Create a new WordPress post. */
  async createContent(
    item: Omit<ContentItem, "externalId">,
  ): Promise<ContentItem> {
    this.assertConnected();

    const tagIds = item.tags ? await this.ensureTagIds(item.tags) : [];

    const payload: Record<string, unknown> = {
      title: item.title,
      slug: item.slug,
      content: item.content,
      status: this.toWpStatus(item.status),
      tags: tagIds,
    };

    if (item.excerpt) payload.excerpt = item.excerpt;
    if (item.publishedAt) payload.date = item.publishedAt.toISOString();

    const post = await this.fetchJson<WPPost>(
      this.apiUrl("/posts"),
      {
        method: "POST",
        headers: this.headers,
        body: payload,
      },
    );

    return this.postToContentItem(post, item.tags);
  }

  /** Update an existing WordPress post. */
  async updateContent(
    externalId: string,
    updates: Partial<Omit<ContentItem, "externalId">>,
  ): Promise<ContentItem> {
    this.assertConnected();

    const payload: Record<string, unknown> = {};

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.status !== undefined) payload.status = this.toWpStatus(updates.status);
    if (updates.excerpt !== undefined) payload.excerpt = updates.excerpt;
    if (updates.publishedAt !== undefined) {
      payload.date = updates.publishedAt.toISOString();
    }

    if (updates.tags) {
      payload.tags = await this.ensureTagIds(updates.tags);
    }

    const post = await this.fetchJson<WPPost>(
      this.apiUrl(`/posts/${externalId}`),
      {
        method: "POST",
        headers: this.headers,
        body: payload,
      },
    );

    const tagNames = await this.resolveTagNames(post.tags);
    return this.postToContentItem(post, tagNames);
  }

  /** Delete a WordPress post (move to trash). */
  async deleteContent(externalId: string): Promise<boolean> {
    this.assertConnected();

    try {
      await this.fetchWithRetry(
        this.apiUrl(`/posts/${externalId}`),
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

  /** Batch create or update posts on WordPress. */
  async deploy(items: ContentItem[]): Promise<DeployResult> {
    this.assertConnected();

    if (items.length === 0) {
      return { success: true, deployedItems: 0, details: "No items to deploy." };
    }

    let deployed = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        if (item.externalId && /^\d+$/.test(item.externalId)) {
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
      url: this.config.siteUrl,
      deployedItems: deployed,
      error: errors.length > 0 ? errors.join("; ") : undefined,
      details: `Deployed ${deployed}/${items.length} posts to WordPress`,
    };
  }
}
