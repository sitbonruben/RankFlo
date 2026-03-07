import type {
  ContentItem,
  DeployResult,
  GraphQLConfig,
  ListContentOptions,
  ProjectInfo,
} from "../types";
import { BaseConnector, ConnectorError } from "./base";

/**
 * Default GraphQL queries and mutations used when the user does not provide custom ones.
 * These follow the most common CMS conventions (e.g. Hygraph, Contentful, Strapi GraphQL).
 */
const DEFAULT_QUERIES = {
  list: `
    query ListPosts($limit: Int, $offset: Int, $status: String) {
      posts(
        first: $limit
        skip: $offset
        where: { status: $status }
      ) {
        id
        title
        slug
        content
        status
        author
        tags
        featuredImage
        excerpt
        publishedAt
        updatedAt
      }
    }
  `,
  get: `
    query GetPost($id: ID!) {
      post(where: { id: $id }) {
        id
        title
        slug
        content
        status
        author
        tags
        featuredImage
        excerpt
        publishedAt
        updatedAt
      }
    }
  `,
  create: `
    mutation CreatePost($input: PostCreateInput!) {
      createPost(data: $input) {
        id
        title
        slug
        content
        status
        author
        tags
        featuredImage
        excerpt
        publishedAt
        updatedAt
      }
    }
  `,
  update: `
    mutation UpdatePost($id: ID!, $input: PostUpdateInput!) {
      updatePost(where: { id: $id }, data: $input) {
        id
        title
        slug
        content
        status
        author
        tags
        featuredImage
        excerpt
        publishedAt
        updatedAt
      }
    }
  `,
  delete: `
    mutation DeletePost($id: ID!) {
      deletePost(where: { id: $id }) {
        id
      }
    }
  `,
};

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown[]; path?: string[] }>;
}

/**
 * Generic GraphQL connector — works with any GraphQL CMS or API.
 * Users can provide custom queries/mutations or use sensible defaults.
 * Supports bearer and API key authentication.
 */
export class GraphQLConnector extends BaseConnector {
  readonly type = "graphql";

  private config: GraphQLConfig;
  private queries: typeof DEFAULT_QUERIES;

  constructor(config: GraphQLConfig, customQueries?: Partial<typeof DEFAULT_QUERIES>) {
    super();
    this.config = config;
    this.queries = { ...DEFAULT_QUERIES, ...customQueries };
  }

  /**
   * Build authentication and custom headers.
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(this.config.headers ?? {}),
    };

    switch (this.config.authType) {
      case "bearer":
        if (this.config.authToken) {
          headers.Authorization = `Bearer ${this.config.authToken}`;
        }
        break;
      case "api-key":
        if (this.config.authToken) {
          // Common header names for API keys in GraphQL services
          headers.Authorization = `Bearer ${this.config.authToken}`;
        }
        break;
      case "none":
        break;
    }

    return headers;
  }

  /**
   * Execute a GraphQL query or mutation.
   */
  private async execute<T = unknown>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const response = await this.fetchJson<GraphQLResponse<T>>(
      this.config.endpoint,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: { query, variables },
      },
    );

    if (response.errors && response.errors.length > 0) {
      const messages = response.errors.map((e) => e.message).join("; ");
      throw new ConnectorError(`GraphQL errors: ${messages}`, {
        connectorType: this.type,
        operation: "execute",
      });
    }

    if (!response.data) {
      throw new ConnectorError("GraphQL response contained no data.", {
        connectorType: this.type,
        operation: "execute",
      });
    }

    return response.data;
  }

  /**
   * Extract a list of items from the GraphQL response data.
   * Searches for the first array value in the data object.
   */
  private extractList(data: unknown): unknown[] {
    if (Array.isArray(data)) return data;

    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      for (const value of Object.values(obj)) {
        if (Array.isArray(value)) return value;
        // Handle connection-style responses: { edges: [{ node: ... }] }
        if (
          value &&
          typeof value === "object" &&
          "edges" in (value as Record<string, unknown>)
        ) {
          const edges = (value as Record<string, unknown>).edges;
          if (Array.isArray(edges)) {
            return edges.map((e: unknown) =>
              e && typeof e === "object" && "node" in (e as Record<string, unknown>)
                ? (e as Record<string, unknown>).node
                : e,
            );
          }
        }
      }
    }

    return [];
  }

  /**
   * Extract a single item from the GraphQL response data.
   * Searches for the first non-null object value.
   */
  private extractSingle(data: unknown): unknown | null {
    if (!data || typeof data !== "object") return null;

    const obj = data as Record<string, unknown>;
    for (const value of Object.values(obj)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
      }
    }

    return null;
  }

  /**
   * Map an arbitrary GraphQL response object to a ContentItem.
   */
  private mapToContentItem(raw: unknown): ContentItem {
    const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
      string,
      unknown
    >;

    const id = String(obj.id ?? obj._id ?? obj.uuid ?? "");
    const title = String(
      obj.title ?? obj.name ?? obj.headline ?? "Untitled",
    );
    const slug = String(
      obj.slug ?? obj.handle ?? this.slugify(title),
    );
    const content = String(
      obj.content ??
        obj.body ??
        obj.bodyHtml ??
        obj.text ??
        obj.richText ??
        "",
    );
    const contentHtml = obj.contentHtml ?? obj.bodyHtml ?? obj.html;
    const excerpt = obj.excerpt ?? obj.summary ?? obj.description;
    const author = obj.author ?? obj.authorName;
    const tags = obj.tags ?? obj.categories ?? obj.labels;
    const image = obj.featuredImage ?? obj.image ?? obj.coverImage ?? obj.thumbnail;
    const status = obj.status ?? obj.state;
    const publishedAt = obj.publishedAt ?? obj.publishDate ?? obj.date;
    const updatedAt = obj.updatedAt ?? obj.modifiedAt ?? obj.modified;

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
      featuredImage: typeof image === "string"
        ? image
        : image && typeof image === "object" && "url" in (image as Record<string, unknown>)
          ? String((image as Record<string, unknown>).url)
          : undefined,
      excerpt: typeof excerpt === "string" ? excerpt : undefined,
      publishedAt:
        typeof publishedAt === "string" ? new Date(publishedAt) : undefined,
      updatedAt:
        typeof updatedAt === "string" ? new Date(updatedAt) : undefined,
      metadata: obj,
    };
  }

  // ─── Lifecycle ─────────────────────────────────────────────────

  /** Verify the GraphQL endpoint is reachable with an introspection query. */
  async connect(): Promise<void> {
    try {
      await this.execute<unknown>(
        `{ __typename }`,
      );
      this.connected = true;
    } catch (error) {
      throw new ConnectorError(
        `Failed to connect to GraphQL endpoint "${this.config.endpoint}". Verify URL and credentials.`,
        { connectorType: this.type, operation: "connect", cause: error },
      );
    }
  }

  /** Test the GraphQL connection. */
  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.execute<unknown>(`{ __typename }`);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ─── Project Info ──────────────────────────────────────────────

  /** Get basic project info by querying the schema and listing content. */
  async getProjectInfo(): Promise<ProjectInfo> {
    this.assertConnected();

    let contentCount = 0;
    try {
      const data = await this.execute<unknown>(this.queries.list, {
        limit: 1,
        offset: 0,
      });
      const items = this.extractList(data);
      contentCount = items.length;
    } catch {
      // Query may not be compatible — that's okay
    }

    const host = new URL(this.config.endpoint).hostname;

    return {
      name: host,
      url: this.config.endpoint,
      hasExistingContent: contentCount > 0,
      contentCount,
      detectedFormat: "html",
    };
  }

  // ─── Content CRUD ──────────────────────────────────────────────

  /** List content via the list query. */
  async listContent(options?: ListContentOptions): Promise<ContentItem[]> {
    this.assertConnected();

    const variables: Record<string, unknown> = {
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    };
    if (options?.status) variables.status = options.status;

    const data = await this.execute<unknown>(this.queries.list, variables);
    const raw = this.extractList(data);
    return raw.map((item) => this.mapToContentItem(item));
  }

  /** Get a single content item by ID. */
  async getContent(externalId: string): Promise<ContentItem | null> {
    this.assertConnected();

    try {
      const data = await this.execute<unknown>(this.queries.get, {
        id: externalId,
      });
      const item = this.extractSingle(data);
      return item ? this.mapToContentItem(item) : null;
    } catch (error) {
      if (
        error instanceof ConnectorError &&
        error.message.includes("not found")
      ) {
        return null;
      }
      throw error;
    }
  }

  /** Create a new content item via the create mutation. */
  async createContent(
    item: Omit<ContentItem, "externalId">,
  ): Promise<ContentItem> {
    this.assertConnected();

    const input: Record<string, unknown> = {
      title: item.title,
      slug: item.slug,
      content: item.content,
      status: item.status,
      excerpt: item.excerpt,
      author: item.author,
      tags: item.tags,
      featuredImage: item.featuredImage,
    };

    const data = await this.execute<unknown>(this.queries.create, { input });
    const created = this.extractSingle(data);
    return this.mapToContentItem(created ?? {});
  }

  /** Update an existing content item via the update mutation. */
  async updateContent(
    externalId: string,
    updates: Partial<Omit<ContentItem, "externalId">>,
  ): Promise<ContentItem> {
    this.assertConnected();

    const input: Record<string, unknown> = {};
    if (updates.title !== undefined) input.title = updates.title;
    if (updates.slug !== undefined) input.slug = updates.slug;
    if (updates.content !== undefined) input.content = updates.content;
    if (updates.status !== undefined) input.status = updates.status;
    if (updates.excerpt !== undefined) input.excerpt = updates.excerpt;
    if (updates.author !== undefined) input.author = updates.author;
    if (updates.tags !== undefined) input.tags = updates.tags;
    if (updates.featuredImage !== undefined) {
      input.featuredImage = updates.featuredImage;
    }

    const data = await this.execute<unknown>(this.queries.update, {
      id: externalId,
      input,
    });
    const updated = this.extractSingle(data);
    return this.mapToContentItem(updated ?? {});
  }

  /** Delete a content item via the delete mutation. */
  async deleteContent(externalId: string): Promise<boolean> {
    this.assertConnected();

    try {
      await this.execute<unknown>(this.queries.delete, {
        id: externalId,
      });
      return true;
    } catch {
      return false;
    }
  }

  // ─── Deployment ────────────────────────────────────────────────

  /** Batch create or update items via GraphQL mutations. */
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
      url: this.config.endpoint,
      deployedItems: deployed,
      error: errors.length > 0 ? errors.join("; ") : undefined,
      details: `Deployed ${deployed}/${items.length} items via GraphQL`,
    };
  }
}
