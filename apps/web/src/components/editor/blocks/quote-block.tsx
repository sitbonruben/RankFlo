"use client";

import type { QuoteBlockProps } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";

// ─── Props ──────────────────────────────────────────────
interface QuoteBlockComponentProps {
  id: string;
  props: QuoteBlockProps;
}

// ─── Component ─────────────────────────────────────────
export function QuoteBlock({ id, props }: QuoteBlockComponentProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const { text, author, style } = props;

  // Style variants
  let containerClass = "";
  switch (style) {
    case "minimal":
      containerClass = "border-l-4 border-[#39FF14] pl-4";
      break;
    case "bordered":
      containerClass = "rounded-lg border border-gray-700 p-6";
      break;
    case "highlighted":
      containerClass = "rounded-lg bg-[#39FF14]/5 border border-[#39FF14]/20 p-6";
      break;
  }

  return (
    <div className="px-4 py-3">
      <blockquote className={containerClass}>
        {/* Quote text */}
        <div
          contentEditable
          suppressContentEditableWarning
          className={`text-lg outline-none focus:ring-1 focus:ring-[#39FF14]/50 ${
            style === "minimal" ? "italic text-gray-300" : "text-gray-200"
          }`}
          onBlur={(e) => {
            const newText = e.currentTarget.textContent || "";
            if (newText !== text) {
              updateBlock(id, { text: newText });
            }
          }}
        >
          {style !== "minimal" && (
            <span className="mr-1 text-2xl text-gray-600">&ldquo;</span>
          )}
          {text}
          {style !== "minimal" && (
            <span className="ml-1 text-2xl text-gray-600">&rdquo;</span>
          )}
        </div>

        {/* Author */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-gray-600">&mdash;</span>
          <div
            contentEditable
            suppressContentEditableWarning
            className="text-sm text-gray-400 outline-none focus:ring-1 focus:ring-[#39FF14]/50"
            onBlur={(e) => {
              const newAuthor = e.currentTarget.textContent || "";
              if (newAuthor !== author) {
                updateBlock(id, { author: newAuthor });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
          >
            {author || "Attribution"}
          </div>
        </div>
      </blockquote>
    </div>
  );
}
