import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "User Guide — RankFlo Docs",
  description: "Learn the dashboard, editor, AI tools, analytics, team management, and more.",
};

export default function UserGuidePage() {
  return (
    <div>
      <h1>User Guide</h1>
      <p>This guide covers everything you need to use RankFlo — from creating your first project to publishing with AI assistance.</p>

      <hr />
      <h2 id="dashboard-overview">Dashboard overview</h2>
      <p>After signing in you land on the <strong>Overview</strong> page. The left sidebar gives you access to all sections.</p>
      <table>
        <thead><tr><th>Section</th><th>What it does</th></tr></thead>
        <tbody>
          <tr><td><strong>Overview</strong></td><td>Quick stats: posts published, total views, AI credits remaining</td></tr>
          <tr><td><strong>Posts</strong></td><td>All your blog posts across every status</td></tr>
          <tr><td><strong>Calendar</strong></td><td>Visual editorial calendar for scheduling</td></tr>
          <tr><td><strong>Media</strong></td><td>Image and file library</td></tr>
          <tr><td><strong>Analytics</strong></td><td>Pageview charts, top posts, traffic sources</td></tr>
          <tr><td><strong>Search</strong></td><td>Search analytics — query volume, CTR, zero-results</td></tr>
          <tr><td><strong>Settings</strong></td><td>API keys, AI providers, team members, webhooks</td></tr>
        </tbody>
      </table>

      <hr />
      <h2 id="projects">Projects</h2>
      <p>Every blog lives inside a <strong>Project</strong>. One organization can have multiple projects (e.g. company blog, changelog, docs).</p>
      <ol>
        <li>Go to <strong>Projects → New Project</strong></li>
        <li>Enter a name and your website URL</li>
        <li>Copy your <strong>Project API Key</strong> (<code>blg_xxx</code>)</li>
      </ol>
      <p>Your project key is read-only. It only returns <strong>published</strong> posts.</p>

      <hr />
      <h2 id="writing-posts">Writing posts</h2>
      <p>RankFlo uses a <strong>block editor</strong> powered by Tiptap. Type <code>/</code> anywhere to open the block menu.</p>
      <table>
        <thead><tr><th>Block</th><th>Shortcut</th></tr></thead>
        <tbody>
          <tr><td>Heading (H1–H3)</td><td><code>/h1</code> <code>/h2</code> <code>/h3</code></td></tr>
          <tr><td>Image</td><td><code>/image</code></td></tr>
          <tr><td>Callout</td><td><code>/callout</code></td></tr>
          <tr><td>Code block</td><td><code>/code</code></td></tr>
          <tr><td>Table</td><td><code>/table</code></td></tr>
          <tr><td>Quote</td><td><code>/quote</code></td></tr>
          <tr><td>Embed</td><td><code>/embed</code></td></tr>
        </tbody>
      </table>
      <p>Posts move through statuses: <strong>Draft → In Review → Scheduled → Published → Archived</strong></p>

      <hr />
      <h2 id="ai-writing">AI Writing</h2>
      <p>Click the AI icon in the editor to access AI tools:</p>
      <table>
        <thead><tr><th>Tool</th><th>What it does</th></tr></thead>
        <tbody>
          <tr><td><strong>Generate post</strong></td><td>Write a full post from a topic or brief</td></tr>
          <tr><td><strong>Continue writing</strong></td><td>Extend the current content</td></tr>
          <tr><td><strong>Rewrite</strong></td><td>Rewrite selected text in a different tone</td></tr>
          <tr><td><strong>SEO optimize</strong></td><td>Improve keyword density and meta tags</td></tr>
          <tr><td><strong>AI Chat</strong></td><td>Free-form conversation about the content</td></tr>
        </tbody>
      </table>
      <p>Go to <strong>Settings → AI</strong> to connect your AI provider (OpenAI, Anthropic, Google, Ollama). BYO key — RankFlo charges nothing for AI usage.</p>

      <hr />
      <h2 id="seo-audit">SEO Audit</h2>
      <p>The SEO panel runs a 9-point audit on every post (score out of 100):</p>
      <ul>
        <li>Meta title — present, correct length (30–60 chars)</li>
        <li>Meta description — present, correct length (120–160 chars)</li>
        <li>H1 heading — present, one per post</li>
        <li>Keyword in title and first paragraph</li>
        <li>Image alt text on all images</li>
        <li>Internal links (at least one)</li>
        <li>Structured data — valid JSON-LD schema</li>
      </ul>

      <hr />
      <h2 id="analytics">Analytics</h2>
      <p>Add the tracker to your site:</p>
      <pre><code>{`<script
  async
  src="https://app.rankflo.io/tracker.js"
  data-project-key="blg_xxx"
></script>`}</code></pre>
      <p>Cookieless, privacy-first — no GDPR consent banner needed. Dashboard shows pageviews, top posts, traffic sources, UTM breakdown, devices, and AI referrers.</p>

      <hr />
      <h2 id="team">Team &amp; Roles</h2>
      <p>Invite members at <strong>Settings → Team</strong>.</p>
      <table>
        <thead><tr><th>Role</th><th>Permissions</th></tr></thead>
        <tbody>
          <tr><td><strong>Admin</strong></td><td>Everything: billing, API keys, team settings</td></tr>
          <tr><td><strong>Editor</strong></td><td>Create, edit, publish any post</td></tr>
          <tr><td><strong>Author</strong></td><td>Create and edit their own posts</td></tr>
          <tr><td><strong>Viewer</strong></td><td>Read-only access</td></tr>
        </tbody>
      </table>

      <hr />
      <h2 id="chrome-extension">Chrome Extension</h2>
      <p>Write and publish from any webpage. Press <strong>Cmd+Shift+Y</strong> (Mac) / <strong>Ctrl+Shift+Y</strong> (Windows) to open the side panel.</p>

      <hr />
      <h2 id="mcp-server">MCP Server (Claude Desktop)</h2>
      <p>Connect RankFlo to Claude Desktop for AI-powered content management:</p>
      <pre><code>{`{
  "mcpServers": {
    "rankflo": {
      "command": "node",
      "args": ["/path/to/RankFlo/packages/mcp/dist/index.js"],
      "env": {
        "RANKFLO_API_KEY": "sk_live_...",
        "RANKFLO_URL": "https://app.rankflo.io"
      }
    }
  }
}`}</code></pre>
    </div>
  );
}
