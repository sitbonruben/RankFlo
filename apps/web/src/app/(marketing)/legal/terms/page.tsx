import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using RankFlo.",
  alternates: { canonical: "https://rankflo.io/legal/terms" },
};

const LAST_UPDATED = "March 28, 2026";
const CONTACT_EMAIL = "legal@rankflo.io";
const COMPANY = "RankFlo";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Terms of Service</h1>
        <p className="mt-3 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-10 text-gray-700 dark:text-gray-300">

        <section>
          <p className="text-base leading-relaxed">
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of {COMPANY}&apos;s website, platform, and APIs
            (collectively, the &quot;Service&quot;). By creating an account or using the Service, you agree to these Terms.
            If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Eligibility</h2>
          <p>You must be at least 16 years old to use the Service. By using the Service, you represent that you meet this requirement and have the legal capacity to enter into these Terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Your Account</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately at <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-600 dark:text-accent underline">{CONTACT_EMAIL}</a> if you suspect unauthorized access.</p>
          <p className="mt-3">You may not share your account, create accounts through automated means, or create accounts to circumvent plan limits.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>Publish content that is illegal, defamatory, harassing, or infringes third-party rights</li>
            <li>Send spam or generate content designed to deceive or mislead</li>
            <li>Attempt to access systems or data you are not authorized to access</li>
            <li>Reverse-engineer, decompile, or scrape the Service beyond what is permitted by the API</li>
            <li>Use the Service to build a competing product without our written consent</li>
            <li>Overload or disrupt the Service (DDoS, abuse of AI credits, etc.)</li>
          </ul>
          <p className="mt-4">We reserve the right to suspend or terminate accounts that violate these rules without notice.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Plans, Billing &amp; Credits</h2>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">Subscriptions</h3>
          <p>Paid plans are billed in advance on a monthly or annual basis. You authorize us to charge your payment method on each renewal date. Prices may change with 30 days&apos; notice.</p>

          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Free trial</h3>
          <p>A 7-day free trial is available on the Pro plan. No credit card is required to start the trial. After the trial, you will be charged unless you cancel before the trial ends.</p>

          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">AI Credits</h3>
          <p>Monthly AI credits are granted at the start of each billing cycle and expire at the end of that cycle. Credits purchased in packs never expire and are consumed first. Credits are non-refundable once used.</p>

          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">Refunds</h3>
          <p>We offer a 7-day refund on your first subscription payment if you are unsatisfied. Credit pack purchases are non-refundable. To request a refund, email <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-600 dark:text-accent underline">{CONTACT_EMAIL}</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Your Content</h2>
          <p>You retain ownership of all content you create using the Service. By using the Service, you grant us a limited, non-exclusive license to host, store, and display your content solely to operate the Service.</p>
          <p className="mt-3">You are solely responsible for your content and represent that you have all necessary rights to publish it.</p>
          <p className="mt-3">We do not use your content to train AI models.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. AI-Generated Content</h2>
          <p>The Service uses third-party AI models to generate content at your request. AI-generated content may be inaccurate, incomplete, or not unique. You are responsible for reviewing, editing, and publishing any AI-generated content. We make no warranties about the accuracy or originality of AI outputs.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Open Source</h2>
          <p>The RankFlo source code is available under the AGPL-3.0 license. Self-hosted deployments are free for personal and commercial use under that license. If you modify and distribute the software, you must make your modifications available under the same license.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Uptime &amp; SLA</h2>
          <p>We target 99.9% monthly uptime for the cloud Service. We do not guarantee uninterrupted service and are not liable for downtime caused by maintenance, third-party providers, or events outside our control.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Termination</h2>
          <p>You may cancel your account at any time from the billing settings. We may suspend or terminate your account for violations of these Terms, non-payment, or at our discretion with 30 days&apos; notice (or immediately for serious violations).</p>
          <p className="mt-3">Upon termination, you may export your data within 30 days. After that, we will delete your data in accordance with our Privacy Policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Disclaimer of Warranties</h2>
          <p>THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. USE OF THE SERVICE IS AT YOUR OWN RISK.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, {COMPANY.toUpperCase()}&apos;S TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THESE TERMS OR THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM. WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12. Governing Law</h2>
          <p>These Terms are governed by the laws of the European Union and the country in which {COMPANY} is incorporated, without regard to conflict of law provisions. Disputes will be resolved in the courts of that jurisdiction.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13. Changes to These Terms</h2>
          <p>We may update these Terms. We will notify you of material changes by email or in-app notice at least 30 days in advance. Continued use of the Service after the effective date constitutes acceptance.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14. Contact</h2>
          <p>
            <strong>{COMPANY}</strong><br />
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-600 dark:text-accent underline">{CONTACT_EMAIL}</a>
          </p>
        </section>

      </div>
    </div>
  );
}
