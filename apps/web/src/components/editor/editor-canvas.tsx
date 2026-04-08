"use client";

import * as React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { EditorBlock } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";
import { useDndEditor } from "./dnd-provider";
import { BlockWrapper } from "./blocks/block-wrapper";
import { BlockRenderer } from "./blocks/block-renderer";

// ─── Sortable Block ─────────────────────────────────────
function SortableBlock({ block }: { block: EditorBlock }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  return (
    <BlockWrapper
      id={block.id}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      setActivatorNodeRef={setActivatorNodeRef}
      transform={transform}
      transition={transition}
      isDragging={isDragging}
    >
      <BlockRenderer block={block} />
    </BlockWrapper>
  );
}

// ─── Empty State ────────────────────────────────────────
function EmptyState() {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-droppable",
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
        isOver
          ? "border-[#39FF14]/50 bg-[#39FF14]/5"
          : "border-gray-800 bg-gray-950/50"
      }`}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="text-gray-600"
          >
            <rect
              x="3"
              y="5"
              width="26"
              height="22"
              rx="3"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M16 11V21M11 16H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-400">
            Start building your post
          </p>
          <p className="mt-1 max-w-[280px] text-xs text-gray-600">
            Drag a block from the left panel or pick a template to get started
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Editor Canvas ──────────────────────────────────────
export function EditorCanvas() {
  const { document, selectBlock, isAiWriting } = useEditorStore();
  const { isFromPalette } = useDndEditor();
  const blocks = document.blocks;

  const { setNodeRef: setDroppableRef, isOver: isCanvasOver } = useDroppable({
    id: "canvas-droppable",
  });

  const handleCanvasClick = React.useCallback(
    (e: React.MouseEvent) => {
      // Only deselect if clicking on the canvas background itself
      if (e.target === e.currentTarget) {
        selectBlock(null);
      }
    },
    [selectBlock]
  );

  return (
    <div
      className="relative flex-1 overflow-y-auto"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
      onClick={handleCanvasClick}
    >
      {/* AI writing indicator */}
      {isAiWriting && (
        <div className="sticky top-0 z-10 flex items-center justify-center gap-2 bg-accent/10 border-b border-accent/20 px-4 py-2 backdrop-blur-sm">
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-xs font-medium text-accent">AI is writing...</span>
        </div>
      )}
      <div className="mx-auto max-w-3xl px-16 py-8" onClick={handleCanvasClick}>
        {blocks.length === 0 ? (
          <EmptyState />
        ) : (
          <div ref={setDroppableRef}>
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {blocks.map((block) => (
                  <SortableBlock key={block.id} block={block} />
                ))}
              </div>
            </SortableContext>

            {/* Drop zone at the bottom when dragging from palette */}
            {isFromPalette && (
              <div
                className={`mt-4 flex h-12 items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  isCanvasOver
                    ? "border-[#39FF14]/50 bg-[#39FF14]/5 text-[#39FF14]"
                    : "border-gray-800 text-gray-600"
                }`}
              >
                <span className="text-xs">Drop here to add at the end</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
