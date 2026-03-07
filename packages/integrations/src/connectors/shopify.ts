import type {
  ContentItem,
  DeployResult,
  ListContentOptions,
  ProjectInfo,
  ShopifyConfig,
} from "../types";
import { BaseConnector, ConnectorError } from "./base";

interface ShopifyShop {
  shop: {
    id: number;
    name: string;
    email: string;
    domain: string;
    myshopify_domain: string;
    description: string | null;
  };
}

interface ShopifyBlog {
  id: number;
  handle: string;
  title: string;
}

interface ShopifyArticle {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  author: string;
  tags: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  summary_html: string | null;
  image?: { src: string } | null;
}

interface ShopifyPage {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  author: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Shopify connector — uses the Shopify Admin REST API.
 * Manages blog articles and pages through the Shopify Admin API.
 */
export class ShopifyConnector extends BaseConnector {
  readonly type = "shopify";

  private config: ShopifyConfig;
  private baseUrl: string;
  private headers: Record<string, string>;
  private primaryBlogId: number | null = null;

  constructor(config: ShopifyConfig) {
    super();
    this.config = config;
    this.baseUrl = `https://${config.shop}/admin/api/${config.apiVersion}`;
    this.headers = {
      "X-Shopify-Access-Token": config.accessToken,
      "Content-Type": "application/json",
    };
  }

  private apiUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  /**
   * Ensure we have a blog ID to work with.
   * Creates a default "News" blog if none exists.
   */
  private async ensureBlogId(): Promise<number> {
    if (this.primaryBlogId) return this.primaryBlogId;

    const data = await this.fetchJson<{ blogs: ShopifyBlog[] }>(
      this.apiUrl("/blogs.json"),
      { headers: this.headers },
    );

    if (data.blogs.length > 0) {
      this.primaryBlogId = data.blogs[0]!.id;
      return this.primaryBlogId;
    }

    // Create a default blog
    const result = await this.fetchJson<{ blog: ShopifyBlog }>(
      this.apiUrl("/blogs.json"),
      {
        method: "POST",
        headers: this.headers,
        body: { blog: { title: "Blog" } },
      },
    );

    this.primaryBlogId = result.blog.id;
    return this.primaryBlogId;
  }

  /**
   * Convert a Shopify article to a universal ContentItem.
   */
  private articleToContentItem(article: ShopifyArticle): ContentItem {
    return {
      externalId: String(article.id),
      title: article.title,
      slug: article.handle,
      content: article.body_html,
      contentHtml: article.body_html,
      format: "html",
      status: article.published_at ? "published" : "draft",
      author: article.author || undefined,
      tags: article.tags
        ? article.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
      featuredImage: article.image?.src ?? undefined,
      excerpt: article.summary_html ?? undefined,
      publishedAt: article.published_at
        ? new Date(article.published_at)
        : undefined,
      updatedAt: new Date(article.updated_at),
      metadata: { shopify_id: article.id },
    };
  }

  // ─── Lifecycle ─────────────────────────────────────────────────

  /** Verify Shopify API access by fetching shop information. */
  async connect(): Promise<void> {
    try {
      await this.fetchJson<ShopifyShop>(
        this.apiUrl("/shop.json"),
        { headers: this.headers },
      );
      this.connected = true;
    } catch (error) {
      throw new ConnectorError(
        `Failed to connect to Shopify store "${this.config.shop}". Check your access token and API version.`,
        { connectorType: this.type, operation: "connect", cause: error },
      );
    }
  }

  /** Test that the API credentials are valid. */
  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.fetchJson<ShopifyShop>(
        this.apiUrl("/shop.json"),
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

  /** Get shop information: name, domain, and blog article count. */
  async getProjectInfo(): Promise<ProjectInfo> {
    this.assertConnected();

    const shopData = await this.fetchJson<ShopifyShop>(
      this.apiUrl("/shop.json"),
      { headers: this.headers },
    );

    const blogId = await this.ensureBlogId();
    const countData = await this.fetchJson<{ count: number }>(
      this.apiUrl(`/blogs/${blogId}/articles/count.json`),
      { headers: this.headers },
    );

    return {
      name: shopData.shop.name,
      description: shopData.shop.description ?? undefined,
      url: `https://${shopData.shop.domain}`,
      framework: "shopify",
      language: "liquid",
      hasExistingContent: countData.count > 0,
      contentCount: countData.count,
      detectedFormat: "html",
    };
  }

  // ─── Content CRUD ──────────────────────────────────────────────

  /** List blog articles from the primary blog. */
  async listContent(options?: ListContentOptions): Promise<ContentItem[]> {
    this.assertConnected();

    const blogId = await this.ensureBlogId();
    const params = new URLSearchParams();

    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.status === "published") params.set("published_status", "published");
    if (options?.status === "draft") params.set("published_status", "unpublished");

    const qs = params.toString();
    const url = this.apiUrl(
      `/blogs/${blogId}/articles.json${qs ? `?${qs}` : ""}`,
    );

    const data = await this.fetchJson<{ articles: ShopifyArticle[] }>(
      url,
      { headers: this.headers },
    );

    let articles = data.articles.map((a) => this.articleToContentItem(a));

    if (options?.offset) {
      articles = articles.slice(options.offset);
    }

    return articles;
  }

  /** Get a single blog article by its Shopify ID. */
  async getContent(externalId: string): Promise<ContentItem | null> {
    this.assertConnected();

    const blogId = await this.ensureBlogId();

    try {
      const data = await this.fetchJson<{ article: ShopifyArticle }>(
        this.apiUrl(`/blogs/${blogId}/articles/${externalId}.json`),
        { headers: this.headers },
      );
      return this.articleToContentItem(data.article);
    } catch (error) {
      if (error instanceof ConnectorError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /** Create a new blog article on Shopify. */
  async createContent(
    item: Omit<ContentItem, "externalId">,
  ): Promise<ContentItem> {
    this.assertConnected();

    const blogId = await this.ensureBlogId();

    const articlePayload: Record<string, unknown> = {
      title: item.title,
      handle: item.slug,
      body_html: item.format === "html" ? item.content : item.content,
      author: item.author || undefined,
      tags: item.tags?.join(", ") || "",
      published: item.status === "published",
    };

    if (item.excerpt) {
      articlePayload.summary_html = item.excerpt;
    }

    if (item.featuredImage) {
      articlePayload.image = { src: item.featuredImage };
    }

    const data = await this.fetchJson<{ article: ShopifyArticle }>(
      this.apiUrl(`/blogs/${blogId}/articles.json`),
      {
        method: "POST",
        headers: this.headers,
        body: { article: articlePayload },
      },
    );

    return this.articleToContentItem(data.article);
  }

  /** Update an existing Shopify blog article. */
  async updateContent(
    externalId: string,
    updates: Partial<Omit<ContentItem, "externalId">>,
  ): Promise<ContentItem> {
    this.assertConnected();

    const blogId = await this.ensureBlogId();

    const articlePayload: Record<string, unknown> = {
      id: Number(externalId),
    };

    if (updates.title !== undefined) articlePayload.title = updates.title;
    if (updates.slug !== undefined) articlePayload.handle = updates.slug;
    if (updates.content !== undefined) articlePayload.body_html = updates.content;
    if (updates.author !== undefined) articlePayload.author = updates.author;
    if (updates.tags !== undefined) articlePayload.tags = updates.tags.join(", ");
    if (updates.status !== undefined) {
      articlePayload.published = updates.status === "published";
    }
    if (updates.excerpt !== undefined) {
      articlePayload.summary_html = updates.excerpt;
    }
    if (updates.featuredImage !== undefined) {
      articlePayload.image = { src: updates.featuredImage };
    }

    const data = await this.fetchJson<{ article: ShopifyArticle }>(
      this.apiUrl(`/blogs/${blogId}/articles/${externalId}.json`),
      {
        method: "PUT",
        headers: this.headers,
        body: { article: articlePayload },
      },
    );

    return this.articleToContentItem(data.article);
  }

  /** Delete a Shopify blog article. */
  async deleteContent(externalId: string): Promise<boolean> {
    this.assertConnected();

    const blogId = await this.ensureBlogId();

    try {
      await this.fetchWithRetry(
        this.apiUrl(`/blogs/${blogId}/articles/${externalId}.json`),
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

  /** Batch create or update articles on Shopify. */
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
          // Existing article — update
          await this.updateContent(item.externalId, item);
        } else {
          // New article — create
          await this.createContent(item);
        }
        deployed++;
      } catch (error) {
        errors.push(
          `Failed to deploy "${item.title}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    const shop = this.config.shop.replace(".myshopify.com", "");

    return {
      success: errors.length === 0,
      url: `https://${this.config.shop}/admin/articles`,
      deployedItems: deployed,
      error: errors.length > 0 ? errors.join("; ") : undefined,
      details: `Deployed ${deployed}/${items.length} articles to ${shop}`,
    };
  }
}
