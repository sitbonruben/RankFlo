// Root ESLint flat config — shared by all workspace packages
// ESLint v9 searches up the directory tree from each package's CWD
import nextPlugin from "./tooling/eslint/node_modules/@next/eslint-plugin-next/dist/index.js";
import reactHooks from "./tooling/eslint/node_modules/eslint-plugin-react-hooks/index.js";

import base from "./tooling/eslint/base.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/*.config.{js,mjs,cjs,ts}",
      "**/prisma/generated/**",
      "**/*.mdx",
      "**/*.md",
      "apps/mobile/**",
    ],
  },
  ...base,
  // Next.js app: add Next.js + react-hooks plugins so disable comments work
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "import/no-default-export": "off",
    },
  },
];
