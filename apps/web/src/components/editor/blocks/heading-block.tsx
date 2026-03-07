"use client";

import type { HeadingBlockProps } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";

// ─── Props ──────────────────────────────────────────────
interface HeadingBlockComponentProps {
  id: string;
  props: HeadingBlockProps;
}

// ─── Level → Tailwind size ─────────────────────────────
const levelStyles: Record<number, string> = {
  1: "text-3xl md:text-4xl font-bold",
  2: "text-2xl md:text-3xl font-bold",
  3: "text-xl md:text-2xl font-semibold",
  4: "text-lg md:text-xl font-semibold",
};

// ─── Alignment Map ─────────────────────────────────────
const alignmentMap: Record<HeadingBlockProps["alignment"], string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

// ─── Component ─────────────────────────────────────────
export function HeadingBlock({ id, props }: HeadingBlockComponentProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const { text, level, alignment } = props;

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent || "";
    if (newText !== text) {
      updateBlock(id, { text: newText });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const Tag = `h${level}` as const;
  const sizeClass = levelStyles[level] || levelStyles[2];

  return (
    <div className="px-4 py-3">
      <div
        role="heading"
        aria-level={level}
        contentEditable
        suppressContentEditableWarning
        className={`${sizeClass} ${alignmentMap[alignment]} text-white outline-none transition-colors focus:ring-1 focus:ring-[#39FF14]/50`}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        data-block-heading-level={level}
      >
        {text}
      </div>
    </div>
  );
}
