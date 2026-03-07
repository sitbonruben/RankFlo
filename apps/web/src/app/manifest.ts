import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RankFlo",
    short_name: "RankFlo",
    description:
      "The open-source blog platform with AI content generation, built-in analytics, and SEO tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#39FF14",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
