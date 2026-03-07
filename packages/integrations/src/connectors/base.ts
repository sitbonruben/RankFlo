import type {
  Connector,
  ContentItem,
  DeployResult,
  ListContentOptions,
  ProjectInfo,
} from "../types";

/** Default request timeout in milliseconds (30 seconds). */
const DEFAULT_TIMEOUT_MS = 30_000;

/** Maximum number of retry attempts for failed requests. */
const MAX_RETRIES = 3;

/** Base delay between retries in milliseconds (exponential backoff). */
const RETRY_BASE_DELAY_MS = 1_000;

/** HTTP status codes that are safe to retry on. */
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

/**
 * Error thrown by connector operations with additional context.
 */
export class ConnectorError extends Error {
  public readonly statusCode?: number;
  public readonly connectorType: string;
  public readonly operation: string;

  constructor(
    message: string,
    opts: {
      connectorType: string;
      operation: string;
      statusCode?: number;
      cause?: unknown;
    },
  ) {
    super(message, { cause: opts.cause });
    this.name = "ConnectorError";
    this.connectorType = opts.connectorType;
    this.operation = opts.operation;
    this.statusCode = opts.statusCode;
  }
}

/**
 * Abstract base class for all connectors.
 * Provides common HTTP helpers with retry/timeout, error handling, and logging.
 */
export abstract class BaseConnector implements Connector {
  abstract readonly type: string;

  protected connected = false;
  protected timeoutMs: number;

  constructor(opts?: { timeoutMs?: number }) {
    this.timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  // ─── Lifecycle (to be implemented by subclasses) ───────────────

  abstract connect(): Promise<void>;
  abstract testConnection(): Promise<{ ok: boolean; error?: string }>;

  /** Default disconnect implementation. Override if cleanup is needed. */
  async disconnect(): Promise<void> {
    this.connected = false;
  }

  // ─── Abstract CRUD methods ─────────────────────────────────────

  abstract getProjectInfo(): Promise<ProjectInfo>;
  abstract listContent(options?: ListContentOptions): Promise<ContentItem[]>;
  abstract getContent(externalId: string): Promise<ContentItem | null>;
  abstract createContent(
    item: Omit<ContentItem, "externalId">,
  ): Promise<ContentItem>;
  abstract updateContent(
    externalId: string,
    updates: Partial<Omit<ContentItem, "externalId">>,
  ): Promise<ContentItem>;
  abstract deleteContent(externalId: string): Promise<boolean>;
  abstract deploy(items: ContentItem[]): Promise<DeployResult>;

  // ─── HTTP Helpers ──────────────────────────────────────────────

  /**
   * Make an HTTP request with automatic retry, timeout, and error handling.
   * @param url - The URL to fetch.
   * @param init - Standard fetch RequestInit options.
   * @param retries - Number of retry attempts remaining (default: MAX_RETRIES).
   * @returns The fetch Response object.
   * @throws ConnectorError on non-retryable failure or exhausted retries.
   */
  protected async fetchWithRetry(
    url: string,
    init: RequestInit = {},
    retries = MAX_RETRIES,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const mergedInit: RequestInit = {
      ...init,
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, mergedInit);

      if (response.ok) {
        return response;
      }

      // Retryable error
      if (RETRYABLE_STATUS_CODES.has(response.status) && retries > 0) {
        const retryAfter = response.headers.get("retry-after");
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : RETRY_BASE_DELAY_MS * Math.pow(2, MAX_RETRIES - retries);
        await this.sleep(delay);
        return this.fetchWithRetry(url, init, retries - 1);
      }

      // Non-retryable error — read body for error details
      const errorBody = await response.text().catch(() => "");
      throw new ConnectorError(
        `HTTP ${response.status}: ${response.statusText}${errorBody ? ` — ${errorBody.slice(0, 500)}` : ""}`,
        {
          connectorType: this.type,
          operation: `${init.method ?? "GET"} ${url}`,
          statusCode: response.status,
        },
      );
    } catch (error) {
      if (error instanceof ConnectorError) {
        throw error;
      }

      // Abort / timeout
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        throw new ConnectorError(
          `Request timed out after ${this.timeoutMs}ms: ${init.method ?? "GET"} ${url}`,
          {
            connectorType: this.type,
            operation: `${init.method ?? "GET"} ${url}`,
            cause: error,
          },
        );
      }

      // Network error — retry if attempts remain
      if (retries > 0) {
        const delay =
          RETRY_BASE_DELAY_MS * Math.pow(2, MAX_RETRIES - retries);
        await this.sleep(delay);
        return this.fetchWithRetry(url, init, retries - 1);
      }

      throw new ConnectorError(
        `Network error: ${error instanceof Error ? error.message : String(error)}`,
        {
          connectorType: this.type,
          operation: `${init.method ?? "GET"} ${url}`,
          cause: error,
        },
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Make a JSON API request with automatic serialization/deserialization.
   * @param url - The URL to fetch.
   * @param init - Fetch options. `body` should be a plain object (will be JSON-stringified).
   * @returns Parsed JSON response body.
   */
  protected async fetchJson<T = unknown>(
    url: string,
    init: RequestInit & { body?: unknown } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(init.headers as Record<string, string> | undefined),
    };

    let body: string | undefined;
    if (init.body !== undefined && init.body !== null) {
      headers["Content-Type"] = "application/json";
      body =
        typeof init.body === "string"
          ? init.body
          : JSON.stringify(init.body);
    }

    const response = await this.fetchWithRetry(url, {
      ...init,
      headers,
      body,
    });

    const text = await response.text();
    if (!text) return undefined as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ConnectorError(
        `Invalid JSON response from ${url}: ${text.slice(0, 200)}`,
        {
          connectorType: this.type,
          operation: `${init.method ?? "GET"} ${url}`,
        },
      );
    }
  }

  // ─── Utility Helpers ───────────────────────────────────────────

  /** Assert that the connector is connected before performing operations. */
  protected assertConnected(): void {
    if (!this.connected) {
      throw new ConnectorError(
        "Connector is not connected. Call connect() first.",
        { connectorType: this.type, operation: "assertConnected" },
      );
    }
  }

  /** Sleep for the given number of milliseconds. */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate a URL-friendly slug from a title string.
   * @param title - The title to slugify.
   * @returns A lowercase, hyphen-separated slug.
   */
  protected slugify(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Parse YAML-style frontmatter from markdown/mdx content.
   * Returns the parsed key-value pairs and the remaining content body.
   */
  protected parseFrontmatter(raw: string): {
    data: Record<string, unknown>;
    content: string;
  } {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) {
      return { data: {}, content: raw };
    }

    const [, frontmatterBlock, body] = match;
    const data: Record<string, unknown> = {};

    if (frontmatterBlock) {
      for (const line of frontmatterBlock.split(/\r?\n/)) {
        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) continue;

        const key = line.slice(0, colonIdx).trim();
        let value: unknown = line.slice(colonIdx + 1).trim();

        // Strip surrounding quotes
        if (
          typeof value === "string" &&
          ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'")))
        ) {
          value = (value as string).slice(1, -1);
        }

        // Parse arrays like [tag1, tag2]
        if (
          typeof value === "string" &&
          value.startsWith("[") &&
          value.endsWith("]")
        ) {
          value = value
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
        }

        // Parse booleans
        if (value === "true") value = true;
        if (value === "false") value = false;

        if (key) {
          data[key] = value;
        }
      }
    }

    return { data, content: body ?? "" };
  }

  /**
   * Serialize a ContentItem into markdown with YAML frontmatter.
   */
  protected serializeToMarkdown(item: Omit<ContentItem, "externalId"> | ContentItem): string {
    const lines: string[] = ["---"];

    lines.push(`title: "${item.title.replace(/"/g, '\\"')}"`);
    lines.push(`slug: "${item.slug}"`);
    lines.push(`status: "${item.status}"`);

    if (item.author) lines.push(`author: "${item.author}"`);
    if (item.excerpt) lines.push(`excerpt: "${item.excerpt.replace(/"/g, '\\"')}"`);
    if (item.featuredImage) lines.push(`featuredImage: "${item.featuredImage}"`);
    if (item.tags && item.tags.length > 0) {
      lines.push(`tags: [${item.tags.map((t) => `"${t}"`).join(", ")}]`);
    }
    if (item.publishedAt) {
      lines.push(`publishedAt: "${item.publishedAt.toISOString()}"`);
    }
    if (item.updatedAt) {
      lines.push(`updatedAt: "${item.updatedAt.toISOString()}"`);
    }

    lines.push("---");
    lines.push("");
    lines.push(item.content);

    return lines.join("\n");
  }
}
