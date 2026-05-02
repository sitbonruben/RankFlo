import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/marketing/docs-code";
import { Callout } from "@/components/marketing/docs-callout";

export const metadata: Metadata = {
  title: "Analytics Setup — RankFlo Docs",
  description: "Set up cookieless, privacy-first analytics on your website with one line of code. Track pageviews, traffic sources, AI referrers, and more.",
  alternates: { canonical: "/docs/analytics-setup" },
};

export default function AnalyticsSetupPage() {
  return (
    <div>
      <h1>Analytics Setup</h1>
      <p>RankFlo includes built-in, <strong>cookieless analytics</strong> — no GDPR consent banner needed. One line of JavaScript gives you pageviews, traffic sources, device breakdown, country detection, AI referrer tracking, and custom events.</p>

      <hr />

      <h2 id="install">Install the tracker</h2>
      <p>Add this script tag to your website&apos;s <code>&lt;head&gt;</code> or before <code>&lt;/body&gt;</code>:</p>
      <CodeBlock language="html" code={`<script
  async
  src="https://app.rankflo.io/tracker.js"
  data-project-key="blg_YOUR_PROJECT_KEY"
></script>`} />
      <p>Replace <code>blg_YOUR_PROJECT_KEY</code> with your project API key from <strong>Dashboard → Projects → your project</strong>.</p>

      <Callout type="tip">
        <p>For self-hosted instances, replace <code>app.rankflo.io</code> with your own domain.</p>
      </Callout>

      <h3>Next.js</h3>
      <CodeBlock language="typescript" code={`// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://app.rankflo.io/tracker.js"
          data-project-key="blg_YOUR_PROJECT_KEY"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}`} />

      <h3>Astro</h3>
      <CodeBlock language="html" code={`<!-- src/layouts/Layout.astro -->
<html>
  <body>
    <slot />
    <script
      src="https://app.rankflo.io/tracker.js"
      data-project-key="blg_YOUR_PROJECT_KEY"
      async
    ></script>
  </body>
</html>`} />

      <h3>Plain HTML</h3>
      <CodeBlock language="html" code={`<!-- Add before </body> -->
<script
  src="https://app.rankflo.io/tracker.js"
  data-project-key="blg_YOUR_PROJECT_KEY"
  async
></script>`} />

      <hr />

      <h2 id="what-it-tracks">What it tracks</h2>
      <p>The tracker automatically captures:</p>
      <table>
        <thead><tr><th>Data point</th><th>How</th></tr></thead>
        <tbody>
          <tr><td><strong>Page views</strong></td><td>Every page load and SPA navigation</td></tr>
          <tr><td><strong>Unique visitors</strong></td><td>Anonymous ID stored in localStorage (not a cookie)</td></tr>
          <tr><td><strong>Sessions</strong></td><td>Session ID in sessionStorage, resets on tab close</td></tr>
          <tr><td><strong>Referrer</strong></td><td><code>document.referrer</code> — where the visitor came from</td></tr>
          <tr><td><strong>Device type</strong></td><td>Desktop, mobile, or tablet (from screen width)</td></tr>
          <tr><td><strong>Browser</strong></td><td>Detected server-side from User-Agent</td></tr>
          <tr><td><strong>Operating system</strong></td><td>Detected server-side from User-Agent</td></tr>
          <tr><td><strong>Country</strong></td><td>IP geolocation (server-side, IP not stored)</td></tr>
          <tr><td><strong>UTM parameters</strong></td><td>utm_source, utm_medium, utm_campaign, utm_term, utm_content</td></tr>
          <tr><td><strong>Session duration</strong></td><td>Time between first and last event in a session</td></tr>
          <tr><td><strong>Language</strong></td><td><code>navigator.language</code></td></tr>
        </tbody>
      </table>

      <Callout type="info">
        <p><strong>No cookies, no IP storage, no fingerprinting.</strong> The tracker uses localStorage for visitor IDs and sessionStorage for session IDs. Your visitor&apos;s IP is used server-side for country detection but is never stored in the database.</p>
      </Callout>

      <hr />

      <h2 id="ai-referrers">AI referrer tracking</h2>
      <p>RankFlo automatically detects traffic from AI platforms and shows them separately in the <strong>AI Referrers</strong> section of your analytics dashboard:</p>
      <table>
        <thead><tr><th>Platform</th><th>Referrer domain</th></tr></thead>
        <tbody>
          <tr><td>ChatGPT</td><td><code>chat.openai.com</code>, <code>chatgpt.com</code></td></tr>
          <tr><td>Perplexity</td><td><code>perplexity.ai</code></td></tr>
          <tr><td>Claude</td><td><code>claude.ai</code></td></tr>
          <tr><td>Google Gemini</td><td><code>gemini.google.com</code></td></tr>
          <tr><td>Microsoft Copilot</td><td><code>copilot.microsoft.com</code></td></tr>
          <tr><td>Grok</td><td><code>grok.com</code></td></tr>
          <tr><td>You.com</td><td><code>you.com</code></td></tr>
          <tr><td>Phind</td><td><code>phind.com</code></td></tr>
          <tr><td>Poe</td><td><code>poe.com</code></td></tr>
        </tbody>
      </table>
      <p>No setup needed — if a visitor arrives from any of these platforms, it appears in your AI Referrers panel automatically.</p>

      <hr />

      <h2 id="custom-events">Custom events</h2>
      <p>Track signups, button clicks, and other conversion events:</p>
      <CodeBlock language="javascript" code={`// Track a custom event
window.rankflo.track("signup", { plan: "pro" });

// Track a button click
document.getElementById("cta").addEventListener("click", () => {
  window.rankflo.track("cta_click", { location: "hero" });
});`} />
      <p>Custom events appear in your analytics dashboard alongside pageviews.</p>

      <hr />

      <h2 id="spa-support">SPA support</h2>
      <p>The tracker automatically detects client-side navigation (Next.js, Remix, Astro with view transitions) by listening for <code>history.pushState</code> and <code>popstate</code> events. No additional configuration needed.</p>

      <hr />

      <h2 id="dashboard">Viewing analytics</h2>
      <p>Go to <strong>Analytics</strong> in the sidebar. You&apos;ll see:</p>
      <ul>
        <li><strong>Overview</strong> — page views, unique visitors, sessions, engagement metrics</li>
        <li><strong>Posts</strong> — top performing content with view counts</li>
        <li><strong>Sources</strong> — referrers, AI referrers, UTM breakdown</li>
        <li><strong>Locations</strong> — visitor countries</li>
      </ul>
      <p>Use the date range picker (7d, 30d, 90d, 1yr) and project filter to narrow down the data.</p>

      <Callout type="tip">
        <p>The <strong>tracking snippet</strong> button at the top of the analytics page shows your project key and a ready-to-copy code snippet.</p>
      </Callout>

      <hr />

      <h2 id="self-hosted">Self-hosted configuration</h2>
      <p>When self-hosting RankFlo, the tracker script is served from your own domain. Update the script URL to point to your instance:</p>
      <CodeBlock language="html" code={`<script
  async
  src="https://your-rankflo-domain.com/tracker.js"
  data-project-key="blg_YOUR_PROJECT_KEY"
></script>`} />
      <p>All analytics data stays on your server — nothing is sent to third parties (except the optional IP geolocation lookup for country detection).</p>
    </div>
  );
}
