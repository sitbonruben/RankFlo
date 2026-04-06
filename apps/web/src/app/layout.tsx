import type { Metadata } from "next";
import Script from "next/script";

import "@/styles/globals.css";
import { TRPCProvider } from "@/trpc/client";
import { ThemeProvider } from "@/components/theme-provider";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export const metadata: Metadata = {
  title: {
    default: "RankFlo",
    template: "%s | RankFlo",
  },
  description:
    "The open-source blog platform with AI content generation, built-in analytics, SEO scoring, and headless CMS API. Self-host or use our cloud.",
  metadataBase: new URL(BASE_URL),
  keywords: [
    "blog platform",
    "open source CMS",
    "headless CMS",
    "SEO tools",
    "AI content generation",
    "blogging software",
    "self-hosted blog",
    "content management",
    "analytics",
    "TypeScript",
  ],
  authors: [{ name: "RankFlo", url: BASE_URL }],
  creator: "RankFlo",
  publisher: "RankFlo",
  openGraph: {
    title: "RankFlo — The Blog Platform Built for What's Next",
    description:
      "Open-source blog platform with AI content generation, built-in analytics, SEO scoring, and headless CMS API.",
    url: BASE_URL,
    siteName: "RankFlo",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${BASE_URL}/api/og?title=RankFlo&description=The+blog+platform+built+for+what's+next`,
        width: 1200,
        height: 630,
        alt: "RankFlo — The Blog Platform Built for What's Next",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RankFlo — The Blog Platform Built for What's Next",
    description:
      "Open-source blog platform with AI content generation, built-in analytics, SEO scoring, and headless CMS API.",
    images: [
      `${BASE_URL}/api/og?title=RankFlo&description=The+blog+platform+built+for+what's+next`,
    ],
  },
  alternates: {
    canonical: BASE_URL,
    types: {
      "application/rss+xml": `${BASE_URL}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    shortcut: "/favicon-32.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans text-gray-950 antialiased dark:bg-black dark:text-white">
        <ThemeProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </ThemeProvider>
        {/* Tracker is in (marketing)/layout.tsx only — not here, to avoid tracking dashboard navigation */}

        {/* HelpZen support chat — available everywhere (marketing + dashboard) */}
        <Script
          src="https://api.helpzen.io/api/v1/widget/script.js?v=2"
          data-workspace="helpzen"
          data-color-dark="#39FF14"
          data-color-light="#16a34a"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
