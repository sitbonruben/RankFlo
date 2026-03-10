#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "./client.js";

const API_KEY = process.env["RANKFLO_API_KEY"];
const BASE_URL = process.env["RANKFLO_URL"] ?? "https://app.rankflo.io";

if (!API_KEY) {
  console.error("[rankflo-mcp] Error: RANKFLO_API_KEY environment variable is required.");
  console.error("  Generate a key at: https://app.rankflo.io/settings/api-keys");
  process.exit(1);
}

const client = createClient(API_KEY, BASE_URL);

// ─── Tool definitions ────────────────────────────────────────────────────────

const TOOLS: Tool[] = [
  {
    name: "list_projects",
    description: "List all your RankFlo projects (blog sites). Returns IDs, names, URLs, and status.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "list_posts",
    description: "List blog posts in a project. Filter by status (DRAFT, PUBLISHED, SCHEDULED).",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "Project ID from list_projects" },
        status: {
          type: "string",
          enum: ["DRAFT", "PUBLISHED", "SCHEDULED"],
          description: "Filter by post status (optional)",
        },
        limit: { type: "number", description: "Max posts to return (default 20)" },
      },
      required: ["projectId"],
    },
  },
  {
    name: "create_post",
    description: "Create a new blog post (draft by default). Use generate_post to AI-write the content first.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "Project ID from list_projects" },
        title: { type: "string", description: "Post title" },
        content: { type: "string", description: "Post body in Markdown" },
        status: {
          type: "string",
          enum: ["DRAFT", "PUBLISHED"],
          description: "Publish immediately or save as draft (default: DRAFT)",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tag names to attach",
        },
      },
      required: ["projectId", "title", "content"],
    },
  },
  {
    name: "update_post",
    description: "Update an existing blog post's title, content, or tags.",
    inputSchema: {
      type: "object",
      properties: {
        postId: { type: "string", description: "Post ID from list_posts" },
        title: { type: "string" },
        content: { type: "string", description: "Full Markdown content" },
        tags: { type: "array", items: { type: "string" } },
      },
      required: ["postId"],
    },
  },
  {
    name: "publish_post",
    description: "Publish a draft post, making it live on the blog.",
    inputSchema: {
      type: "object",
      properties: {
        postId: { type: "string", description: "Post ID from list_posts" },
      },
      required: ["postId"],
    },
  },
  {
    name: "generate_post",
    description:
      "Use RankFlo's AI to generate a complete blog post on a topic. Returns the generated title and Markdown content. You can then use create_post to save it.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "Project ID — used to match brand voice" },
        topic: { type: "string", description: "What the post should be about" },
        tone: {
          type: "string",
          enum: ["informative", "professional", "casual", "persuasive", "seo"],
          description: "Writing tone (default: informative)",
        },
        wordCount: { type: "number", description: "Target word count (default: 800)" },
      },
      required: ["projectId", "topic"],
    },
  },
  {
    name: "get_analytics",
    description: "Get traffic analytics for a project: total views, top posts, recent trends.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        period: {
          type: "string",
          enum: ["7d", "30d", "90d"],
          description: "Time period (default: 30d)",
        },
      },
      required: ["projectId"],
    },
  },
  {
    name: "search_topics",
    description: "Get AI-suggested blog topic ideas for a project based on SEO and competitors.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        seed: { type: "string", description: "Optional seed keyword or niche" },
      },
      required: ["projectId"],
    },
  },
];

// ─── Server ─────────────────────────────────────────────────────────────────

const server = new Server(
  { name: "rankflo", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case "list_projects": {
        result = await client.call("project.list", { page: 1, pageSize: 50 });
        break;
      }

      case "list_posts": {
        const { projectId, status, limit = 20 } = args as {
          projectId: string;
          status?: string;
          limit?: number;
        };
        result = await client.call("post.list", {
          projectId,
          ...(status && { status }),
          page: 1,
          pageSize: limit,
        });
        break;
      }

      case "create_post": {
        const { projectId, title, content, status = "DRAFT", tags } = args as {
          projectId: string;
          title: string;
          content: string;
          status?: string;
          tags?: string[];
        };
        result = await client.call("post.create", {
          projectId,
          title,
          content,
          status,
          tags,
        });
        break;
      }

      case "update_post": {
        const { postId, title, content, tags } = args as {
          postId: string;
          title?: string;
          content?: string;
          tags?: string[];
        };
        result = await client.call("post.update", { id: postId, title, content, tags });
        break;
      }

      case "publish_post": {
        const { postId } = args as { postId: string };
        result = await client.call("post.publish", { id: postId });
        break;
      }

      case "generate_post": {
        const { projectId, topic, tone = "informative", wordCount = 800 } = args as {
          projectId: string;
          topic: string;
          tone?: string;
          wordCount?: number;
        };
        result = await client.call("ai.generatePost", { projectId, topic, tone, wordCount });
        break;
      }

      case "get_analytics": {
        const { projectId, period = "30d" } = args as { projectId: string; period?: string };
        result = await client.call("analytics.getSummary", { projectId, period });
        break;
      }

      case "search_topics": {
        const { projectId, seed } = args as { projectId: string; seed?: string };
        result = await client.call("growth.suggestTopics", { projectId, seed });
        break;
      }

      default:
        return {
          content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`[rankflo-mcp] Connected to ${BASE_URL}`);
