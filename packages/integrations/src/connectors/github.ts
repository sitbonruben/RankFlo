import type {
  ContentItem,
  DeployResult,
  GitConfig,
  ListContentOptions,
  ProjectInfo,
} from "../types";
import { BaseConnector, ConnectorError } from "./base";

/** GitHub REST API base URL. */
const GITHUB_API = "https://api.github.com";

/** Common content directory paths to probe when auto-detecting. */
const CONTENT_DIR_CANDIDATES = [
  "content/blog",
  "content/posts",
  "content",
  "src/content",
  "src/content/blog",
  "src/pages/blog",
  "src/posts",
  "posts",
  "_posts",
  "data/blog",
  "blog",
  "articles",
  "docs",
];

/** Map of package dependency names to framework identifiers. */
const FRAMEWORK_SIGNATURES: Record<string, string> = {
  next: "nextjs",
  gatsby: "gatsby",
  astro: "astro",
  "@sveltejs/kit": "sveltekit",
  svelte: "svelte",
  "@remix-run/react": "remix",
  nuxt: "nuxt",
  "@nuxt/core": "nuxt",
  vuepress: "vuepress",
  vitepress: "vitepress",
  hexo: "hexo",
  "react-scripts": "create-react-app",
  react: "react",
  vue: "vue",
  angular: "angular",
};

/** File extensions considered as content files. */
const CONTENT_EXTENSIONS = new Set([".md", ".mdx", ".html", ".json"]);

interface GitHubUser {
  login: string;
  name: string | null;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  language: string | null;
}

interface GitHubContentEntry {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: "file" | "dir" | "symlink" | "submodule";
  download_url: string | null;
}

interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  content: string;
  encoding: string;
}

interface GitHubBlob {
  sha: string;
  url: string;
}

interface GitHubTreeEntry {
  path: string;
  mode: string;
  type: string;
  sha: string;
}

interface GitHubTree {
  sha: string;
  tree: GitHubTreeEntry[];
}

interface GitHubCommit {
  sha: string;
  html_url: string;
}

interface GitHubRef {
  ref: string;
  object: { sha: string; type: string };
}

/**
 * GitHub connector — full implementation using the GitHub REST API.
 * Supports reading/writing content files, detecting project frameworks,
 * and atomic multi-file deployments via the Git Trees API.
 */
export class GitHubConnector extends BaseConnector {
  readonly type = "github";

  private config: GitConfig;
  private headers: Record<string, string>;
  private user: GitHubUser | null = null;

  constructor(config: GitConfig) {
    super();
    this.config = config;
    this.headers = {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github.v3+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────

  private repoUrl(path = ""): string {
    return `${GITHUB_API}/repos/${this.config.owner}/${this.config.repo}${path}`;
  }

  private async ghGet<T>(path: string): Promise<T> {
    return this.fetchJson<T>(`${GITHUB_API}${path}`, {
      headers: this.headers,
    });
  }

  private async ghRepoGet<T>(path: string): Promise<T> {
    return this.fetchJson<T>(this.repoUrl(path), {
      headers: this.headers,
    });
  }

  private async ghRepoRequest<T>(
    path: string,
    method: string,
    body?: unknown,
  ): Promise<T> {
    return this.fetchJson<T>(this.repoUrl(path), {
      method,
      headers: this.headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Attempt to fetch a file from the repo. Returns null if not found (404).
   */
  private async tryGetFile(
    path: string,
  ): Promise<GitHubFileContent | null> {
    try {
      return await this.ghRepoGet<GitHubFileContent>(
        `/contents/${path}?ref=${this.config.branch}`,
      );
    } catch (error) {
      if (
        error instanceof ConnectorError &&
        error.statusCode === 404
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Decode base64-encoded file content from the GitHub API.
   */
  private decodeContent(encoded: string): string {
    // GitHub returns base64 with newlines
    const cleaned = encoded.replace(/\n/g, "");
    return Buffer.from(cleaned, "base64").toString("utf-8");
  }

  /**
   * Determine file extension from a path.
   */
  private getExtension(filePath: string): string {
    const dot = filePath.lastIndexOf(".");
    return dot >= 0 ? filePath.slice(dot) : "";
  }

  /**
   * Determine content format from file extension.
   */
  private formatFromExtension(
    ext: string,
  ): "markdown" | "mdx" | "html" | "json" {
    switch (ext) {
      case ".mdx":
        return "mdx";
      case ".html":
      case ".htm":
        return "html";
      case ".json":
        return "json";
      default:
        return "markdown";
    }
  }

  /**
   * Convert a raw file (path + decoded content) into a ContentItem.
   */
  private fileToContentItem(
    path: string,
    sha: string,
    rawContent: string,
  ): ContentItem {
    const ext = this.getExtension(path);
    const format = this.formatFromExtension(ext);
    const fileName = path.split("/").pop() ?? path;
    const nameWithoutExt = fileName.replace(/\.[^.]+$/, "");

    if (format === "markdown" || format === "mdx") {
      const { data, content } = this.parseFrontmatter(rawContent);
      return {
        externalId: path,
        title: String(data.title ?? nameWithoutExt),
        slug: String(data.slug ?? this.slugify(String(data.title ?? nameWithoutExt))),
        content,
        format,
        status: data.draft === true
          ? "draft"
          : data.status === "draft"
            ? "draft"
            : data.status === "scheduled"
              ? "scheduled"
              : "published",
        author: data.author ? String(data.author) : undefined,
        tags: Array.isArray(data.tags)
          ? data.tags.map(String)
          : typeof data.tags === "string"
            ? data.tags.split(",").map((t: string) => t.trim())
            : undefined,
        featuredImage: data.featuredImage
          ? String(data.featuredImage)
          : data.image
            ? String(data.image)
            : data.cover
              ? String(data.cover)
              : undefined,
        excerpt: data.excerpt
          ? String(data.excerpt)
          : data.description
            ? String(data.description)
            : undefined,
        publishedAt: data.date
          ? new Date(String(data.date))
          : data.publishedAt
            ? new Date(String(data.publishedAt))
            : undefined,
        updatedAt: data.updatedAt
          ? new Date(String(data.updatedAt))
          : data.lastmod
            ? new Date(String(data.lastmod))
            : undefined,
        metadata: { sha, ...data },
      };
    }

    // HTML or JSON — no frontmatter parsing
    return {
      externalId: path,
      title: nameWithoutExt,
      slug: this.slugify(nameWithoutExt),
      content: rawContent,
      format,
      status: "published",
      metadata: { sha },
    };
  }

  /**
   * Build the file path for a content item within the content directory.
   */
  private buildContentPath(
    slug: string,
    format: "markdown" | "mdx" | "html" | "json",
  ): string {
    const ext =
      format === "mdx"
        ? ".mdx"
        : format === "html"
          ? ".html"
          : format === "json"
            ? ".json"
            : ".md";
    const dir = this.config.contentDir.replace(/\/$/, "");
    return `${dir}/${slug}${ext}`;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────

  /** Validate the token by fetching the authenticated user. */
  async connect(): Promise<void> {
    try {
      this.user = await this.ghGet<GitHubUser>("/user");
      this.connected = true;
    } catch (error) {
      throw new ConnectorError(
        `Failed to authenticate with GitHub. Verify your token is valid.`,
        { connectorType: this.type, operation: "connect", cause: error },
      );
    }
  }

  /** Verify that the token can access the configured repository. */
  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.ghRepoGet<GitHubRepo>("");
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ─── Project Info ──────────────────────────────────────────────

  /**
   * Detect framework, language, content directory, and count existing content.
   * Reads package.json (or other config files) to determine the framework,
   * then probes common content directories.
   */
  async getProjectInfo(): Promise<ProjectInfo> {
    this.assertConnected();

    const repo = await this.ghRepoGet<GitHubRepo>("");

    let framework: string | undefined;
    let language: string | undefined = repo.language?.toLowerCase() ?? undefined;
    let contentDir: string | undefined = this.config.contentDir;
    let hasExistingContent = false;
    let contentCount = 0;
    let detectedFormat: "markdown" | "mdx" | "html" | "json" | undefined;

    // Try to read package.json to detect framework
    const pkgFile = await this.tryGetFile("package.json");
    if (pkgFile) {
      try {
        const pkg = JSON.parse(this.decodeContent(pkgFile.content));
        const allDeps: Record<string, string> = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        };

        for (const [depName, fw] of Object.entries(FRAMEWORK_SIGNATURES)) {
          if (depName in allDeps) {
            framework = fw;
            break;
          }
        }

        if (allDeps.typescript) {
          language = "typescript";
        } else if (!language) {
          language = "javascript";
        }
      } catch {
        // package.json couldn't be parsed — not critical
      }
    }

    // Check for Hugo (config.toml / config.yaml / hugo.toml)
    if (!framework) {
      const hugoConfig = await this.tryGetFile("hugo.toml");
      const hugoConfigYaml = hugoConfig ? null : await this.tryGetFile("config.toml");
      if (hugoConfig || hugoConfigYaml) {
        framework = "hugo";
        language = "go";
      }
    }

    // Check for Jekyll (_config.yml)
    if (!framework) {
      const jekyllConfig = await this.tryGetFile("_config.yml");
      if (jekyllConfig) {
        framework = "jekyll";
        language = "ruby";
      }
    }

    // Detect content directory if not explicitly set or verify the configured one
    if (contentDir) {
      try {
        const entries = await this.ghRepoGet<GitHubContentEntry[]>(
          `/contents/${contentDir}?ref=${this.config.branch}`,
        );
        const contentFiles = entries.filter(
          (e) => e.type === "file" && CONTENT_EXTENSIONS.has(this.getExtension(e.name)),
        );
        contentCount = contentFiles.length;
        hasExistingContent = contentCount > 0;
        if (contentFiles.length > 0) {
          detectedFormat = this.formatFromExtension(
            this.getExtension(contentFiles[0]!.name),
          );
        }
      } catch {
        // Directory doesn't exist yet — that's fine
      }
    }

    // Auto-detect content directory if none was configured or configured dir is empty
    if (!hasExistingContent) {
      for (const candidate of CONTENT_DIR_CANDIDATES) {
        if (candidate === contentDir) continue;
        try {
          const entries = await this.ghRepoGet<GitHubContentEntry[]>(
            `/contents/${candidate}?ref=${this.config.branch}`,
          );
          const contentFiles = entries.filter(
            (e) =>
              e.type === "file" &&
              CONTENT_EXTENSIONS.has(this.getExtension(e.name)),
          );
          if (contentFiles.length > 0) {
            contentDir = candidate;
            contentCount = contentFiles.length;
            hasExistingContent = true;
            detectedFormat = this.formatFromExtension(
              this.getExtension(contentFiles[0]!.name),
            );
            break;
          }
        } catch {
          // Not found — try next
        }
      }
    }

    return {
      name: repo.name,
      description: repo.description ?? undefined,
      url: repo.html_url,
      framework,
      language,
      contentDir,
      hasExistingContent,
      contentCount,
      detectedFormat,
    };
  }

  // ─── Content CRUD ──────────────────────────────────────────────

  /**
   * List content files in the configured content directory.
   * Fetches directory listing, then fetches each file's content in parallel.
   */
  async listContent(options?: ListContentOptions): Promise<ContentItem[]> {
    this.assertConnected();

    const dir = this.config.contentDir.replace(/\/$/, "");
    let entries: GitHubContentEntry[];

    try {
      entries = await this.ghRepoGet<GitHubContentEntry[]>(
        `/contents/${dir}?ref=${this.config.branch}`,
      );
    } catch (error) {
      if (
        error instanceof ConnectorError &&
        error.statusCode === 404
      ) {
        return [];
      }
      throw error;
    }

    // Filter to content files only
    const contentFiles = entries.filter(
      (e) =>
        e.type === "file" &&
        CONTENT_EXTENSIONS.has(this.getExtension(e.name)),
    );

    // Apply pagination
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? contentFiles.length;
    const paged = contentFiles.slice(offset, offset + limit);

    // Fetch content for each file in parallel (batched to avoid rate limits)
    const batchSize = 10;
    const items: ContentItem[] = [];

    for (let i = 0; i < paged.length; i += batchSize) {
      const batch = paged.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (entry) => {
          const file = await this.ghRepoGet<GitHubFileContent>(
            `/contents/${entry.path}?ref=${this.config.branch}`,
          );
          const decoded = this.decodeContent(file.content);
          return this.fileToContentItem(entry.path, entry.sha, decoded);
        }),
      );
      items.push(...results);
    }

    // Filter by status if requested
    if (options?.status) {
      return items.filter((item) => item.status === options.status);
    }

    return items;
  }

  /**
   * Get a single content file by its path (externalId).
   */
  async getContent(externalId: string): Promise<ContentItem | null> {
    this.assertConnected();

    const file = await this.tryGetFile(externalId);
    if (!file) return null;

    const decoded = this.decodeContent(file.content);
    return this.fileToContentItem(externalId, file.sha, decoded);
  }

  /**
   * Create a new content file in the repository.
   * Uses PUT /repos/{owner}/{repo}/contents/{path} to create the file.
   */
  async createContent(
    item: Omit<ContentItem, "externalId">,
  ): Promise<ContentItem> {
    this.assertConnected();

    const filePath = this.buildContentPath(item.slug, item.format);
    const fileContent = this.serializeToMarkdown(item);
    const encoded = Buffer.from(fileContent, "utf-8").toString("base64");

    const result = await this.ghRepoRequest<{
      content: { path: string; sha: string };
    }>(`/contents/${filePath}`, "PUT", {
      message: `Create ${item.title}`,
      content: encoded,
      branch: this.config.branch,
    });

    return {
      ...item,
      externalId: filePath,
      metadata: { sha: result.content.sha },
    };
  }

  /**
   * Update an existing content file.
   * Fetches the current SHA first, then uses PUT with the new content.
   */
  async updateContent(
    externalId: string,
    updates: Partial<Omit<ContentItem, "externalId">>,
  ): Promise<ContentItem> {
    this.assertConnected();

    // Get current file to obtain SHA and merge with updates
    const current = await this.getContent(externalId);
    if (!current) {
      throw new ConnectorError(
        `Content not found: ${externalId}`,
        { connectorType: this.type, operation: "updateContent" },
      );
    }

    const sha = (current.metadata as Record<string, unknown>)?.sha as string;
    if (!sha) {
      throw new ConnectorError(
        `Missing SHA for file: ${externalId}. Cannot update without it.`,
        { connectorType: this.type, operation: "updateContent" },
      );
    }

    const merged: ContentItem = { ...current, ...updates, externalId };
    const fileContent = this.serializeToMarkdown(merged);
    const encoded = Buffer.from(fileContent, "utf-8").toString("base64");

    const result = await this.ghRepoRequest<{
      content: { path: string; sha: string };
    }>(`/contents/${externalId}`, "PUT", {
      message: `Update ${merged.title}`,
      content: encoded,
      sha,
      branch: this.config.branch,
    });

    return {
      ...merged,
      metadata: { ...merged.metadata, sha: result.content.sha },
    };
  }

  /**
   * Delete a content file from the repository.
   */
  async deleteContent(externalId: string): Promise<boolean> {
    this.assertConnected();

    // Get current SHA
    const file = await this.tryGetFile(externalId);
    if (!file) return false;

    await this.ghRepoRequest(`/contents/${externalId}`, "DELETE", {
      message: `Delete ${externalId}`,
      sha: file.sha,
      branch: this.config.branch,
    });

    return true;
  }

  // ─── Deployment (Atomic multi-file commit via Git Trees API) ──

  /**
   * Deploy multiple content items as a single atomic commit.
   *
   * Uses the Git Trees API for atomic multi-file commits:
   * 1. Create blobs for each file
   * 2. Create a tree referencing all blobs
   * 3. Create a commit pointing to the tree
   * 4. Update the branch ref to point to the new commit
   */
  async deploy(items: ContentItem[]): Promise<DeployResult> {
    this.assertConnected();

    if (items.length === 0) {
      return {
        success: true,
        deployedItems: 0,
        details: "No items to deploy.",
      };
    }

    try {
      // Step 1: Get the current commit SHA for the branch
      const ref = await this.ghRepoGet<GitHubRef>(
        `/git/ref/heads/${this.config.branch}`,
      );
      const baseCommitSha = ref.object.sha;

      // Step 2: Get the base tree SHA
      const baseCommit = await this.ghRepoGet<{ tree: { sha: string } }>(
        `/git/commits/${baseCommitSha}`,
      );
      const baseTreeSha = baseCommit.tree.sha;

      // Step 3: Create blobs for each content item (in parallel batches)
      const blobEntries: { path: string; sha: string }[] = [];
      const batchSize = 5;

      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (item) => {
            const filePath = item.externalId || this.buildContentPath(item.slug, item.format);
            const fileContent = this.serializeToMarkdown(item);

            const blob = await this.ghRepoRequest<GitHubBlob>(
              "/git/blobs",
              "POST",
              {
                content: fileContent,
                encoding: "utf-8",
              },
            );

            return { path: filePath, sha: blob.sha };
          }),
        );
        blobEntries.push(...results);
      }

      // Step 4: Create a new tree with the blob entries
      const treePayload = blobEntries.map((entry) => ({
        path: entry.path,
        mode: "100644" as const,
        type: "blob" as const,
        sha: entry.sha,
      }));

      const newTree = await this.ghRepoRequest<GitHubTree>(
        "/git/trees",
        "POST",
        {
          base_tree: baseTreeSha,
          tree: treePayload,
        },
      );

      // Step 5: Create a new commit
      const itemTitles = items.map((i) => i.title).join(", ");
      const commitMessage =
        items.length === 1
          ? `Deploy: ${items[0]!.title}`
          : `Deploy ${items.length} posts: ${itemTitles.slice(0, 200)}`;

      const newCommit = await this.ghRepoRequest<GitHubCommit>(
        "/git/commits",
        "POST",
        {
          message: commitMessage,
          tree: newTree.sha,
          parents: [baseCommitSha],
        },
      );

      // Step 6: Update the branch ref to point to the new commit
      await this.ghRepoRequest(
        `/git/refs/heads/${this.config.branch}`,
        "PATCH",
        { sha: newCommit.sha },
      );

      return {
        success: true,
        commitSha: newCommit.sha,
        commitUrl: newCommit.html_url,
        url: `https://github.com/${this.config.owner}/${this.config.repo}/commit/${newCommit.sha}`,
        deployedItems: items.length,
        details: `Committed ${items.length} file(s) to ${this.config.branch}`,
      };
    } catch (error) {
      return {
        success: false,
        deployedItems: 0,
        error:
          error instanceof Error ? error.message : String(error),
        details: `Failed to deploy ${items.length} items to ${this.config.owner}/${this.config.repo}`,
      };
    }
  }
}
