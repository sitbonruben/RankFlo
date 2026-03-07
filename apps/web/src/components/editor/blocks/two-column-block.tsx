"use client";

import type { TwoColumnBlockProps, EditorBlock } from "@rankflo/core/types";

// ─── Props ──────────────────────────────────────────────
interface TwoColumnBlockComponentProps {
  id: string;
  props: TwoColumnBlockProps;
  renderBlock: (block: EditorBlock) => React.ReactNode;
}

// ─── Ratio → grid cols ─────────────────────────────────
const ratioStyles: Record<TwoColumnBlockProps["ratio"], { left: string; right: string; label: string }> = {
  "50-50": { left: "col-span-6", right: "col-span-6", label: "50 / 50" },
  "60-40": { left: "col-span-7", right: "col-span-5", label: "60 / 40" },
  "40-60": { left: "col-span-5", right: "col-span-7", label: "40 / 60" },
  "70-30": { left: "col-span-8", right: "col-span-4", label: "70 / 30" },
  "30-70": { left: "col-span-4", right: "col-span-8", label: "30 / 70" },
};

// ─── Gap Map ───────────────────────────────────────────
const gapMap: Record<TwoColumnBlockProps["gap"], string> = {
  small: "gap-2",
  medium: "gap-4",
  large: "gap-8",
};

// ─── Component ─────────────────────────────────────────
export function TwoColumnBlock({ id, props, renderBlock }: TwoColumnBlockComponentProps) {
  const { ratio, gap, leftChildren, rightChildren } = props;
  const ratioStyle = ratioStyles[ratio];

  return (
    <div className="px-4 py-3">
      {/* Ratio label */}
      <div className="mb-2 text-center">
        <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-500">
          {ratioStyle.label}
        </span>
      </div>

      <div className={`grid grid-cols-12 ${gapMap[gap]}`}>
        {/* Left column */}
        <div className={ratioStyle.left}>
          {leftChildren.length > 0 ? (
            <div className="space-y-2">
              {leftChildren.map((block) => (
                <div key={block.id}>{renderBlock(block)}</div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-950/50 transition-colors hover:border-gray-600">
              <span className="text-sm text-gray-600">Left column</span>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className={ratioStyle.right}>
          {rightChildren.length > 0 ? (
            <div className="space-y-2">
              {rightChildren.map((block) => (
                <div key={block.id}>{renderBlock(block)}</div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-950/50 transition-colors hover:border-gray-600">
              <span className="text-sm text-gray-600">Right column</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
