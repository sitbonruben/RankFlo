import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webhooks — RankFlo Docs",
  description: "Subscribe to real-time events, verify payloads with HMAC-SHA256 signatures, and build integrations.",
};

export default function WebhooksPage() {
  return (
    <div>
      <h1>Webhooks</h1>
      <p>RankFlo webhooks deliver real-time notifications to your server when events occur. Use them to trigger deployments, update caches, and keep external systems in sync.</p>

      <h2>Event Types</h2>
      <table>
        <thead><tr><th>Event</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>post.published</code></td><td>A post is published or goes live after scheduling</td></tr>
          <tr><td><code>post.updated</code></td><td>A published post is edited</td></tr>
          <tr><td><code>post.deleted</code></td><td>A post is deleted</td></tr>
          <tr><td><code>media.uploaded</code></td><td>A file is uploaded</td></tr>
        </tbody>
      </table>

      <h2>Payload Format</h2>
      <pre><code>{`{
  "id": "evt_01abc123",
  "type": "post.published",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "id": "post_01xyz",
    "title": "Hello World",
    "slug": "hello-world",
    "status": "PUBLISHED"
  }
}`}</code></pre>

      <p>Headers included with every delivery:</p>
      <table>
        <thead><tr><th>Header</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>X-RankFlo-Event</code></td><td>Event type</td></tr>
          <tr><td><code>X-RankFlo-Delivery</code></td><td>Unique delivery ID</td></tr>
          <tr><td><code>X-RankFlo-Signature</code></td><td>HMAC-SHA256 signature</td></tr>
          <tr><td><code>X-RankFlo-Timestamp</code></td><td>Unix timestamp</td></tr>
        </tbody>
      </table>

      <h2>Signature Verification</h2>
      <p>The signature is computed over: <code>{`{timestamp}.{raw_request_body}`}</code></p>

      <h3>Node.js</h3>
      <pre><code>{`import crypto from "node:crypto";

function verifyWebhookSignature(payload, signature, timestamp, secret) {
  const signedPayload = \`\${timestamp}.\${payload}\`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}</code></pre>

      <h3>Python</h3>
      <pre><code>{`import hmac, hashlib

def verify_webhook_signature(payload, signature, timestamp, secret):
    signed_payload = f"{timestamp}.{payload.decode()}"
    expected = hmac.new(
        secret.encode(), signed_payload.encode(), hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)`}</code></pre>

      <h2>Retry Policy</h2>
      <table>
        <thead><tr><th>Attempt</th><th>Delay</th></tr></thead>
        <tbody>
          <tr><td>1st retry</td><td>1 minute</td></tr>
          <tr><td>2nd retry</td><td>5 minutes</td></tr>
          <tr><td>3rd retry</td><td>30 minutes</td></tr>
          <tr><td>4th retry</td><td>2 hours</td></tr>
          <tr><td>5th retry</td><td>12 hours</td></tr>
        </tbody>
      </table>

      <h2>Configuring Webhooks</h2>
      <ol>
        <li>Navigate to <strong>Settings → Webhooks</strong></li>
        <li>Click <strong>Add endpoint</strong></li>
        <li>Enter your endpoint URL (must be HTTPS)</li>
        <li>Select the events you want to subscribe to</li>
        <li>Copy the generated signing secret</li>
      </ol>

      <h2>Best Practices</h2>
      <ul>
        <li><strong>Return 200 quickly.</strong> Process payloads asynchronously.</li>
        <li><strong>Verify signatures.</strong> Always validate the HMAC header.</li>
        <li><strong>Handle duplicates.</strong> Use the event ID to deduplicate.</li>
        <li><strong>Use HTTPS.</strong> Plain HTTP endpoints are rejected.</li>
        <li><strong>Monitor failures.</strong> Check the dashboard for failed deliveries.</li>
      </ul>
    </div>
  );
}
