import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync } from "fs";

// Plugin to copy manifest.json to dist after build
const copyManifest = {
  name: "copy-manifest",
  closeBundle() {
    copyFileSync(resolve(__dirname, "manifest.json"), resolve(__dirname, "dist/manifest.json"));
  },
};

export default defineConfig({
  plugins: [react(), copyManifest],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "sidepanel.html"),
        background: resolve(__dirname, "src/background/worker.ts"),
        content: resolve(__dirname, "src/content/extract.ts"),
      },
      output: {
        entryFileNames: (chunk) => {
          // Keep background and content as flat JS files (Chrome MV3 requires this)
          if (chunk.name === "background" || chunk.name === "content") {
            return "[name].js";
          }
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
