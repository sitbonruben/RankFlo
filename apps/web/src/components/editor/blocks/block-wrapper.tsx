"use client";

import { useRef, type ReactNode } from "react";
import { useEditorStore } from "@/stores/editor-store";
import type { Transform } from "@dnd-kit/utilities";

// ─── Props ──────────────────────────────────────────────
interface BlockWrapperProps {
  id: string;
  children: ReactNode;
  className?: string;
  // DnD props from useSortable
  attributes?: Record<string, unknown>;
  listeners?: Record<string, Function> | undefined;
  setNodeRef?: (node: HTMLElement | null) => void;
  transform?: Transform | null;
  transition?: string;
  isDragging?: boolean;
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
}

// ─── Grip Icon (6 dots) ────────────────────────────────
function GripIcon() {
  return (
    <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor">
      <circle cx="3" cy="3" r="1.5" />
      <circle cx="9" cy="3" r="1.5" />
      <circle cx="3" cy="9" r="1.5" />
      <circle cx="9" cy="9" r="1.5" />
      <circle cx="3" cy="15" r="1.5" />
      <circle cx="9" cy="15" r="1.5" />
    </svg>
  );
}

// ─── Duplicate Icon ────────────────────────────────────
function DuplicateIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

// ─── Arrow Up Icon ─────────────────────────────────────
function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

// ─── Arrow Down Icon ───────────────────────────────────
function ArrowDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

// ─── Trash Icon ────────────────────────────────────────
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

// ─── Block Wrapper ─────────────────────────────────────
export function BlockWrapper({
  id,
  children,
  className = "",
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
  isDragging,
  setActivatorNodeRef,
}: BlockWrapperProps) {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const hoveredBlockId = useEditorStore((s) => s.hoveredBlockId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const hoverBlock = useEditorStore((s) => s.hoverBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const moveBlock = useEditorStore((s) => s.moveBlock);
  const blocks = useEditorStore((s) => s.document.blocks);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedBlockId === id;
  const isHovered = hoveredBlockId === id;

  const blockIndex = blocks.findIndex((b) => b.id === id);
  const canMoveUp = blockIndex > 0;
  const canMoveDown = blockIndex < blocks.length - 1;

  // Compute border color
  let borderColor = "border-transparent";
  if (isSelected) {
    borderColor = "border-[#39FF14]";
  } else if (isHovered) {
    borderColor = "border-gray-800";
  }

  // Transform style for DnD
  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={(node) => {
        if (setNodeRef) setNodeRef(node);
        (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={style}
      {...attributes}
      className={`group/block relative border-2 ${borderColor} rounded-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${isDragging ? "z-50 shadow-2xl" : ""} ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(id);
      }}
      onMouseEnter={() => hoverBlock(id)}
      onMouseLeave={() => hoverBlock(null)}
    >
      {/* Drag handle — top-left */}
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        className={`absolute -left-0.5 top-2 z-10 cursor-grab rounded-md p-1 text-gray-600 opacity-0 transition-opacity hover:bg-gray-800 hover:text-gray-300 active:cursor-grabbing ${
          isHovered || isSelected ? "opacity-100" : "group-hover/block:opacity-100"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <GripIcon />
      </div>

      {/* Floating actions toolbar — top-right */}
      <div
        className={`absolute -top-3 right-2 z-20 flex items-center gap-0.5 rounded-md border border-gray-700 bg-gray-900 px-1 py-0.5 shadow-lg transition-opacity ${
          isHovered || isSelected ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Ask AI — selects this block so AI chat focuses on it */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            selectBlock(id);
          }}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium text-[#39FF14]/70 transition-colors hover:bg-[#39FF14]/10 hover:text-[#39FF14]"
          title="Ask AI about this section"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <path d="M8 2l1.8 3.6L14 6.4l-3 2.6.7 4L8 11.2 4.3 13l.7-4-3-2.6 4.2-.8L8 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
          </svg>
          Ask AI
        </button>
        <div className="mx-0.5 h-3 w-px bg-gray-700" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            duplicateBlock(id);
          }}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          title="Duplicate"
        >
          <DuplicateIcon />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (canMoveUp) moveBlock(blockIndex, blockIndex - 1);
          }}
          disabled={!canMoveUp}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          title="Move up"
        >
          <ArrowUpIcon />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (canMoveDown) moveBlock(blockIndex, blockIndex + 1);
          }}
          disabled={!canMoveDown}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          title="Move down"
        >
          <ArrowDownIcon />
        </button>
        <div className="mx-0.5 h-4 w-px bg-gray-700" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeBlock(id);
          }}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-red-900/50 hover:text-red-400"
          title="Delete"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Block content */}
      <div className="relative">{children}</div>
    </div>
  );
}
