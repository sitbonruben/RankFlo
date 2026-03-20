// Root ESLint flat config — shared by all workspace packages
// ESLint v9 searches up the directory tree from each package's CWD
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
];
