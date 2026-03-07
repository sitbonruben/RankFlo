"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  BLOCK_META,
  BLOCK_CATEGORIES,
  type BlockType,
  type BlockCategory,
} from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";
import { BlockTypeIcon } from "../dnd-provider";

// ─── Category Labels ────────────────────────────────────
const CATEGORY_LABELS: Record<BlockCategory, string> = {
  content: "Content",
  media: "Media",
  layout: "Layout",
  engagement: "Engagement",
};

const CATEGORY_ORDER: BlockCategory[] = [
  "content",
  "media",
  "layout",
  "engagement",
];

// ─── Draggable Block Card ───────────────────────────────
function DraggableBlockCard({ type }: { type: BlockType }) {
  const meta = BLOCK_META.find((m) => m.type === type);
  const addBlock = useEditorStore((s) => s.addBlock);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
  });

  if (!meta) return null;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={() => addBlock(type)}
      className={`flex cursor-grab items-start gap-3 rounded-lg border border-gray-800 bg-gray-950 p-3 transition-all hover:border-gray-700 hover:bg-gray-800 active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-900 text-gray-400">
        <BlockTypeIcon type={type} className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{meta.label}</p>
        <p className="text-[11px] leading-tight text-gray-500">
          {meta.description}
        </p>
      </div>
    </div>
  );
}

// ─── Block Palette ──────────────────────────────────────
export function BlockPalette() {
  return (
    <div className="space-y-5 p-3">
      {CATEGORY_ORDER.map((category) => {
        const blockTypes = BLOCK_CATEGORIES[category];

        return (
          <div key={category}>
            <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="space-y-1.5">
              {blockTypes.map((type) => (
                <DraggableBlockCard key={type} type={type} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
