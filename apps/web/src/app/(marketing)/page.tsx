import type { Metadata } from "next";
import HomeContent from "./_home-content";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export const metadata: Metadata = {
  alternates: {
    canonical: BASE_URL,
  },
};

export default function HomePage() {
  return <HomeContent />;
}
