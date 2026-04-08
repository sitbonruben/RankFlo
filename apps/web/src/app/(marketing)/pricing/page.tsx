import type { Metadata } from "next";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing. Start free, scale when you're ready. 14-day free trial on Pro — $5/month or $49/year.",
};

export default function PricingPage() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-wide px-6">
        <PricingContent />
      </div>
    </section>
  );
}
