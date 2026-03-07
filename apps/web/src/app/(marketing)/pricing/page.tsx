import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing. Start free, scale when you're ready.",
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For personal blogs and side projects.",
    features: [
      "50 posts",
      "10 pages",
      "3 team members",
      "500 MB media storage",
      "Built-in analytics (30 days)",
      "Full-text search",
      "2 API keys",
      "3 webhooks",
      "Community support",
    ],
    cta: "Start free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For growing teams and businesses.",
    features: [
      "Unlimited posts",
      "Unlimited pages",
      "20 team members",
      "10 GB media storage",
      "Analytics (1 year retention)",
      "Advanced search + Meilisearch",
      "10 API keys",
      "20 webhooks",
      "Custom domain",
      "Priority support",
      "SEO audit tools",
    ],
    cta: "Start free trial",
    href: "/signup?plan=pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with advanced needs.",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Unlimited storage",
      "Unlimited analytics retention",
      "SSO / SAML",
      "Unlimited API keys & webhooks",
      "SLA guarantee",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact sales",
    href: "#",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-wide px-6">
        {/* Header */}
        <div className="relative text-center">
          {/* Gradient orb behind pricing title */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.06)_0%,transparent_70%)]" />
          </div>
          <div className="relative">
            <p className="text-sm font-medium text-green-600 dark:text-accent">Pricing</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Start free. Scale when you&apos;re ready. No surprises.
            </p>
          </div>
        </div>

        {/* Plans grid */}
        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-800 bg-gray-200 dark:bg-gray-800 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between p-8 ${
                plan.highlighted
                  ? "bg-gray-50 dark:bg-gray-950 shadow-[0_0_40px_rgba(57,255,20,0.08)] border-t-2 border-t-accent"
                  : "bg-white dark:bg-black"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-950 dark:text-white">{plan.name}</h3>
                  {plan.highlighted && (
                    <span className="rounded-full bg-accent-1 border border-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent">
                      Popular
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-950 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  )}
                </div>

                <p className="mt-2 text-sm text-gray-500">{plan.description}</p>

                <ul className="mt-8 flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-400">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={plan.href}
                className={`mt-8 flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-accent text-black hover:bg-accent-9 hover:shadow-[0_0_24px_rgba(57,255,20,0.2)]"
                    : "border border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* OSS callout */}
        <div className="relative mt-16 overflow-hidden rounded-2xl border border-gray-800 bg-gray-50 dark:bg-gray-950 p-8 text-center">
          {/* Subtle gradient background */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.04)_0%,transparent_70%)]" />
          </div>
          <div className="relative">
            <h3 className="text-lg font-semibold text-gray-950 dark:text-white">
              Self-host for free, forever
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-500 max-w-md mx-auto">
              RankFlo is open source. Deploy on your own infrastructure with Docker.
              All core features included. No limits.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <a
                href="https://docs.rankflo.io/docs/self-hosting"
                className="inline-flex h-10 items-center rounded-lg border border-gray-700 px-4 text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
              >
                Self-hosting guide
              </a>
              <a
                href="https://github.com/rankflo/rankflo"
                className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm text-gray-500 transition-colors hover:text-gray-300"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                View source
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
