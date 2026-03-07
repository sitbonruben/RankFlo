import type {
  ContentItem,
  DeployResult,
  ListContentOptions,
  ProjectInfo,
  WebflowConfig,
} from "../types";
import { BaseConnector, ConnectorError } from "./base";

/** Webflow API v2 base URL. */
const WEBFLOW_API = "https://api.webflow.com";

interface WebflowSite {
  id: string;
  displayName: string;
  shortName: string;
  previewUrl: string;
  createdOn: string;
  lastPublished: string | null;
  customDomains?: { url: string }[];
}

interface WebflowCollection {
  id: string;
  displayName: string;
  singularName: string;
  slug: string;
  fields: WebflowField[];
}

interface WebflowField {
  id: string;
  displayName: string;
  slug: string;
  type: string;
  isRequired: boolean;
}

interface WebflowItem {
  id: string;
  cmsLocaleId: string | null;
  lastPublished: string | null;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: Record<string, unknown>;
}

interface WebflowItemsResponse {
  items: WebflowItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

/**
 * Webflow connector — uses the Webflow CMS API v2.
 * Manages CMS collection items for a given site and collection.
 */
export class WebflowConnector extends BaseConnector {
  readonly type = "webflow";

  private config: WebflowConfig;
  private headers: Record<string, string>;
  private collectionFields: WebflowField[] = [];

  constructor(config: WebflowConfig) {
    super();
    this.config = config;
    this.headers = {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private apiUrl(path: string): string {
    return `${WEBFLOW_API}${path}`;
  }

  /**
   * Map common field slugs to a ContentItem.
   * Webflow collections have user-defined fields, so we look for common names.
   */
  private itemToContentItem(item: WebflowItem): ContentItem {
    const fd = item.fieldData;

    // Common field mappings
    const title = String(fd.name ?? fd.title ?? fd["post-title"] ?? "Untitled");
    const slug = String(fd.slug ?? this.slugify(title));
    const content = String(fd["post-body"] ?? fd.body ?? fd.content ?? fd["rich-text"] ?? "");
    const excerpt = fd.excerpt ?? fd.summary ?? fd.description;
    const featuredImage = fd["main-image"] ?? fd["featured-image"] ?? fd.thumbnail ?? fd.image;
    const author = fd.author ?? fd["author-name"];
    const tags = fd.tags ?? fd.categories;

    return {
      externalId: item.id,
      title,
      slug,
      content,
      contentHtml: content,
      format: "html",
      status: item.isDraft ? "draft" : item.isArchived ? "draft" : "published",
      author: author ? String(author) : undefined,
      tags: Array.isArray(tags)
        ? tags.map(String)
        : typeof tags === "string"
          ? tags.split(",").map((t) => t.trim())
          : undefined,
      featuredImage: typeof featuredImage === "object" && featuredImage !== null
        ? String((featuredImage as Record<string, unknown>).url ?? "")
        : featuredImage
          ? String(featuredImage)
          : undefined,
      excerpt: excerpt ? String(excerpt) : undefined,
      publishedAt: item.lastPublished ? new Date(item.lastPublished) : undefined,
      updatedAt: new Date(item.lastUpdated),
      metadata: {
        webflow_id: item.id,
        isArchived: item.isArchived,
        isDraft: item.isDraft,
      },
    };
  }

  /**
   * Build fieldData payload for creating/updating items.
   */
  private contentToFieldData(
    item: Partial<Omit<ContentItem, "externalId">> & { title?: string; slug?: string },
  ): Record<string, unknown> {
    const fd: Record<string, unknown> = {};

    if (item.title !== undefined) fd.name = item.title;
    if (item.slug !== undefined) fd.slug = item.slug;
    if (item.content !== undefined) {
      // Try to use the right field name based on known collection fields
      const bodyField = this.collectionFields.find(
        (f) =>
          f.slug === "post-body" ||
          f.slug === "body" ||
          f.slug === "content" ||
          f.slug === "rich-text",
      );
      fd[bodyField?.slug ?? "post-body"] = item.content;
    }
    if (item.excerpt !== undefined) fd.excerpt = item.excerpt;
    if (item.author !== undefined) fd.author = item.author;

    return fd;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────

  /** Verify API access by fetching the site and collection info. */
  async connect(): Promise<void> {
    try {
      await this.fetchJson<WebflowSite>(
        this.apiUrl(`/v2/sites/${this.config.siteId}`),
        { headers: this.headers },
      );

      // Also fetch collection schema so we know the fields
      const collection = await this.fetchJson<WebflowCollection>(
        this.apiUrl(`/v2/collections/${this.config.collectionId}`),
        { headers: this.headers },
      );
      this.collectionFields = collection.fields;

      this.connected = true;
    } catch (error) {
      throw new ConnectorError(
        `Failed to connect to Webflow. Verify your site ID, collection ID, and API token.`,
        { connectorType: this.type, operation: "connect", cause: error },
      );
    }
  }

  /** Test the Webflow API connection. */
  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.fetchJson<WebflowSite>(
        this.apiUrl(`/v2/sites/${this.config.siteId}`),
        { headers: this.headers },
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

  /** Get site information and collection item count. */
  async getProjectInfo(): Promise<ProjectInfo> {
    this.assertConnected();

    const site = await this.fetchJson<WebflowSite>(
      this.apiUrl(`/v2/sites/${this.config.siteId}`),
      { headers: this.headers },
    );

    const itemsResp = await this.fetchJson<WebflowItemsResponse>(
      this.apiUrl(
        `/v2/collections/${this.config.collectionId}/items?limit=1`,
      ),
      { headers: this.headers },
    );

    const domain = site.customDomains?.[0]?.url ?? site.previewUrl;

    return {
      name: site.displayName,
      url: domain,
      framework: "webflow",
      hasExistingContent: itemsResp.pagination.total > 0,
      contentCount: itemsResp.pagination.total,
      detectedFormat: "html",
    };
  }

  // ─── Content CRUD ──────────────────────────────────────────────

  /** List CMS collection items. */
  async listContent(options?: ListContentOptions): Promise<ContentItem[]> {
    this.assertConnected();

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    const data = await this.fetchJson<WebflowItemsResponse>(
      this.apiUrl(
        `/v2/collections/${this.config.collectionId}/items?limit=${limit}&offset=${offset}`,
      ),
      { headers: this.headers },
    );

    let items = data.items.map((i) => this.itemToContentItem(i));

    if (options?.status) {
      items = items.filter((i) => i.status === options.status);
    }

    return items;
  }

  /** Get a single CMS item by ID. */
  async getContent(externalId: string): Promise<ContentItem | null> {
    this.assertConnected();

    try {
      const item = await this.fetchJson<WebflowItem>(
        this.apiUrl(
          `/v2/collections/${this.config.collectionId}/items/${externalId}`,
        ),
        { headers: this.headers },
      );
      return this.itemToContentItem(item);
    } catch (error) {
      if (error instanceof ConnectorError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /** Create a new CMS item. */
  async createContent(
    item: Omit<ContentItem, "externalId">,
  ): Promise<ContentItem> {
    this.assertConnected();

    const fieldData = this.contentToFieldData(item);

    const created = await this.fetchJson<WebflowItem>(
      this.apiUrl(
        `/v2/collections/${this.config.collectionId}/items`,
      ),
      {
        method: "POST",
        headers: this.headers,
        body: {
          isArchived: false,
          isDraft: item.status === "draft",
          fieldData,
        },
      },
    );

    return this.itemToContentItem(created);
  }

  /** Update an existing CMS item. */
  async updateContent(
    externalId: string,
    updates: Partial<Omit<ContentItem, "externalId">>,
  ): Promise<ContentItem> {
    this.assertConnected();

    const fieldData = this.contentToFieldData(updates);

    const payload: Record<string, unknown> = { fieldData };
    if (updates.status !== undefined) {
      payload.isDraft = updates.status === "draft";
      payload.isArchived = false;
    }

    const updated = await this.fetchJson<WebflowItem>(
      this.apiUrl(
        `/v2/collections/${this.config.collectionId}/items/${externalId}`,
      ),
      {
        method: "PATCH",
        headers: this.headers,
        body: payload,
      },
    );

    return this.itemToContentItem(updated);
  }

  /** Delete a CMS item. */
  async deleteContent(externalId: string): Promise<boolean> {
    this.assertConnected();

    try {
      await this.fetchWithRetry(
        this.apiUrl(
          `/v2/collections/${this.config.collectionId}/items/${externalId}`,
        ),
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

  /** Create/update items and publish the Webflow site. */
  async deploy(items: ContentItem[]): Promise<DeployResult> {
    this.assertConnected();

    if (items.length === 0) {
      return { success: true, deployedItems: 0, details: "No items to deploy." };
    }

    let deployed = 0;
    const errors: string[] = [];
    const createdIds: string[] = [];

    for (const item of items) {
      try {
        if (item.externalId && !item.externalId.includes("/")) {
          const updated = await this.updateContent(item.externalId, item);
          createdIds.push(updated.externalId);
        } else {
          const created = await this.createContent(item);
          createdIds.push(created.externalId);
        }
        deployed++;
      } catch (error) {
        errors.push(
          `Failed to deploy "${item.title}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Publish the items
    if (createdIds.length > 0) {
      try {
        await this.fetchJson(
          this.apiUrl(
            `/v2/collections/${this.config.collectionId}/items/publish`,
          ),
          {
            method: "POST",
            headers: this.headers,
            body: { itemIds: createdIds },
          },
        );
      } catch (error) {
        errors.push(
          `Failed to publish items: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return {
      success: errors.length === 0,
      deployedItems: deployed,
      error: errors.length > 0 ? errors.join("; ") : undefined,
      details: `Deployed ${deployed}/${items.length} items to Webflow`,
    };
  }
}
