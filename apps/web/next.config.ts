import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // pnpm monorepo: mobile app's @types/react@18 leaks into web's type-check.
    // Real type safety is enforced via `tsc --noEmit` in CI, not Next build.
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint runs in a dedicated CI job. Skip it during Docker build to avoid
    // missing-plugin failures in the build container.
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    "@rankflo/ui",
    "@rankflo/api",
    "@rankflo/auth",
    "@rankflo/core",
    "@rankflo/db",
    "@rankflo/i18n",
    "@rankflo/feature-flags",
    "@rankflo/webhooks",
    "@rankflo/analytics",
    "@rankflo/integrations",
    "@rankflo/ai",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  typedRoutes: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
