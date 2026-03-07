"use client";

import type { TableOfContentsBlockProps, HeadingBlockProps } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";

// ─── Props ──────────────────────────────────────────────
interface TableOfContentsBlockComponentProps {
  id: string;
  props: TableOfContentsBlockProps;
}

// ─── List Icon ─────────────────────────────────────────
function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

// ─── Indentation by heading level ──────────────────────
const indentMap: Record<number, string> = {
  1: "pl-0",
  2: "pl-4",
  3: "pl-8",
  4: "pl-12",
};

// ─── Component ─────────────────────────────────────────
export function TableOfContentsBlock({ id, props }: TableOfContentsBlockComponentProps) {
  const blocks = useEditorStore((s) => s.document.blocks);
  const { style, maxDepth } = props;

  // Extract heading blocks
  const headings = blocks
    .filter((b) => b.type === "heading")
    .map((b) => {
      const headingProps = b.props as HeadingBlockProps;
      return {
        id: b.id,
        text: headingProps.text,
        level: headingProps.level,
      };
    })
    .filter((h) => h.level <= maxDepth);

  const isBoxed = style === "boxed";

  return (
    <div className="px-4 py-3">
      <div
        className={`${
          isBoxed
            ? "rounded-lg border border-gray-700 bg-gray-950 p-5"
            : ""
        }`}
      >
        {/* Header */}
        <div className="mb-3 flex items-center gap-2 text-gray-400">
          <ListIcon />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Table of Contents
          </span>
        </div>

        {/* Heading list */}
        {headings.length > 0 ? (
          <nav>
            <ul className="space-y-1.5">
              {headings.map((heading) => (
                <li
                  key={heading.id}
                  className={`${indentMap[heading.level] || "pl-0"}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      // Scroll to heading block in editor
                      const el = document.querySelector(
                        `[data-block-id="${heading.id}"]`,
                      );
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    className={`text-left text-sm transition-colors hover:text-[#39FF14] ${
                      heading.level === 1
                        ? "font-semibold text-gray-200"
                        : "text-gray-400"
                    }`}
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <p className="text-sm italic text-gray-600">
            Add heading blocks to generate a table of contents.
          </p>
        )}
      </div>
    </div>
  );
}
