import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How RankFlo collects, uses, and protects your personal data.",
  alternates: { canonical: "https://rankflo.io/legal/privacy" },
};

const LAST_UPDATED = "March 28, 2026";
const CONTACT_EMAIL = "privacy@rankflo.io";
const COMPANY = "RankFlo";
const APP_URL = "https://app.rankflo.io";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="mt-3 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-10 text-gray-700 dark:text-gray-300">

        <section>
          <p className="text-base leading-relaxed">
            {COMPANY} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates {APP_URL} and related services (the &quot;Service&quot;).
            This Privacy Policy explains what information we collect, how we use it, and your rights.
            By using the Service, you agree to the practices described here.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">Account information</h3>
          <p>When you create an account we collect your name, email address, and password (hashed). If you sign in via Google or GitHub OAuth, we receive your name, email, and profile photo from that provider.</p>

          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Usage data</h3>
          <p>We collect server logs, page views, feature usage, and error reports to operate and improve the Service. This data is linked to your account and IP address.</p>

          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Content you create</h3>
          <p>Blog posts, media files, settings, and other content you create within the Service are stored on our servers and processed to deliver the Service to you.</p>

          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Payment information</h3>
          <p>Payments are processed by Stripe. We do not store credit card numbers. We receive billing metadata (plan type, last 4 digits, subscription status) from Stripe.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide, operate, and improve the Service</li>
            <li>To process payments and manage your subscription</li>
            <li>To send transactional emails (receipts, account alerts, password resets)</li>
            <li>To respond to support requests</li>
            <li>To detect and prevent fraud, abuse, and security incidents</li>
            <li>To comply with legal obligations</li>
          </ul>
          <p className="mt-4">We do not sell your personal data to third parties. We do not use your content to train AI models.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Data Sharing</h2>
          <p>We share data only with trusted service providers who process it on our behalf:</p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Hetzner</strong> — cloud infrastructure and data storage (EU)</li>
            <li><strong>KIE.ai</strong> — AI image generation (only the text prompts you submit)</li>
            <li><strong>OpenAI / Anthropic / Google</strong> — AI text generation (only the content you send to AI features)</li>
          </ul>
          <p className="mt-4">All providers are contractually bound to process data only as instructed and with appropriate security measures.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Cookies &amp; Tracking</h2>
          <p>We use a single session cookie (<code className="text-sm bg-gray-100 dark:bg-gray-800 rounded px-1">rankflo_session</code>) to keep you logged in. We do not use third-party advertising trackers or fingerprinting. Analytics are collected server-side without client-side JavaScript trackers.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Data Retention</h2>
          <p>We retain your account data for as long as your account is active. If you delete your account, we permanently delete your personal data within 30 days, except where retention is required by law (e.g., billing records for 7 years).</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Your Rights (GDPR / CCPA)</h2>
          <p>Depending on your location, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data (&quot;right to be forgotten&quot;)</li>
            <li>Export your data in a portable format</li>
            <li>Object to or restrict processing of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p className="mt-4">To exercise any of these rights, email <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-600 dark:text-accent underline">{CONTACT_EMAIL}</a>. We will respond within 30 days.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Security</h2>
          <p>We use TLS encryption for all data in transit, bcrypt hashing for passwords, and AES-256 encryption for sensitive credentials stored at rest. Our infrastructure is hosted in ISO 27001-certified data centers. We conduct regular security reviews.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Children</h2>
          <p>The Service is not directed to children under 16. We do not knowingly collect personal data from children. If you believe we have collected data from a child, contact us immediately.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Changes to This Policy</h2>
          <p>We may update this policy from time to time. We will notify you of material changes by email or by posting a notice in the dashboard. Continued use of the Service after changes constitutes acceptance.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Contact</h2>
          <p>For privacy questions or requests:</p>
          <p className="mt-2">
            <strong>{COMPANY}</strong><br />
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-600 dark:text-accent underline">{CONTACT_EMAIL}</a>
          </p>
        </section>
      </div>
    </div>
  );
}
