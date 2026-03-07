"use client";

import type { DividerBlockProps } from "@rankflo/core/types";

// ─── Props ──────────────────────────────────────────────
interface DividerBlockComponentProps {
  id: string;
  props: DividerBlockProps;
}

// ─── Spacing Map ───────────────────────────────────────
const spacingMap: Record<DividerBlockProps["spacing"], string> = {
  small: "py-2",
  medium: "py-4",
  large: "py-8",
};

// ─── Component ─────────────────────────────────────────
export function DividerBlock({ id, props }: DividerBlockComponentProps) {
  const { style, spacing } = props;

  return (
    <div className={`px-4 ${spacingMap[spacing]}`}>
      {style === "line" && (
        <hr className="border-0 border-t border-gray-800" />
      )}

      {style === "dots" && (
        <div className="flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
        </div>
      )}

      {style === "space" && <div className="h-4" />}
    </div>
  );
}
