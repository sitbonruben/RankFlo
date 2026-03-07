"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { BlockType } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";
import { BLOCK_META } from "@rankflo/core/types";

// ─── DnD Context ────────────────────────────────────────
interface DndEditorState {
  activeId: string | null;
  activeType: BlockType | null;
  isFromPalette: boolean;
}

const DndEditorContext = React.createContext<DndEditorState>({
  activeId: null,
  activeType: null,
  isFromPalette: false,
});

export function useDndEditor() {
  return React.useContext(DndEditorContext);
}

// ─── Drag Overlay Content ───────────────────────────────
function DragOverlayContent({
  activeId,
  activeType,
  isFromPalette,
}: DndEditorState) {
  const blocks = useEditorStore((s) => s.document.blocks);

  if (!activeId && !activeType) return null;

  if (isFromPalette && activeType) {
    const meta = BLOCK_META.find((m) => m.type === activeType);
    if (!meta) return null;

    return (
      <div className="rounded-lg border border-[#39FF14]/30 bg-gray-900/95 px-4 py-3 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <BlockTypeIcon type={activeType} className="h-4 w-4 text-[#39FF14]" />
          <span className="text-sm font-medium text-white">{meta.label}</span>
        </div>
      </div>
    );
  }

  if (activeId) {
    const block = blocks.find((b) => b.id === activeId);
    if (!block) return null;
    const meta = BLOCK_META.find((m) => m.type === block.type);

    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900/95 px-4 py-3 opacity-80 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <BlockTypeIcon type={block.type} className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-white">
            {meta?.label ?? block.type}
          </span>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Provider ───────────────────────────────────────────
interface DndProviderProps {
  children: React.ReactNode;
}

export function DndProvider({ children }: DndProviderProps) {
  const [state, setState] = React.useState<DndEditorState>({
    activeId: null,
    activeType: null,
    isFromPalette: false,
  });

  const { addBlock, moveBlock, document } = useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeIdStr = String(active.id);

    // Check if dragging from palette (palette items have "palette-" prefix)
    if (activeIdStr.startsWith("palette-")) {
      const blockType = activeIdStr.replace("palette-", "") as BlockType;
      setState({
        activeId: null,
        activeType: blockType,
        isFromPalette: true,
      });
    } else {
      setState({
        activeId: activeIdStr,
        activeType: null,
        isFromPalette: false,
      });
    }
  }, []);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setState({
        activeId: null,
        activeType: null,
        isFromPalette: false,
      });

      if (!over) return;

      const activeIdStr = String(active.id);
      const overIdStr = String(over.id);

      // Dragging from palette
      if (activeIdStr.startsWith("palette-")) {
        const blockType = activeIdStr.replace("palette-", "") as BlockType;
        const blocks = document.blocks;

        // Find the target index
        let targetIndex = blocks.length;
        if (overIdStr === "canvas-droppable") {
          targetIndex = blocks.length;
        } else {
          const overIndex = blocks.findIndex((b) => b.id === overIdStr);
          if (overIndex !== -1) {
            targetIndex = overIndex;
          }
        }

        addBlock(blockType, targetIndex);
        return;
      }

      // Reordering within canvas
      if (activeIdStr !== overIdStr) {
        const blocks = document.blocks;
        const oldIndex = blocks.findIndex((b) => b.id === activeIdStr);
        const newIndex = blocks.findIndex((b) => b.id === overIdStr);

        if (oldIndex !== -1 && newIndex !== -1) {
          moveBlock(oldIndex, newIndex);
        }
      }
    },
    [addBlock, moveBlock, document.blocks]
  );

  return (
    <DndEditorContext.Provider value={state}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          <DragOverlayContent {...state} />
        </DragOverlay>
      </DndContext>
    </DndEditorContext.Provider>
  );
}

// ─── Block Type Icon ────────────────────────────────────
export function BlockTypeIcon({
  type,
  className = "h-4 w-4",
}: {
  type: BlockType;
  className?: string;
}) {
  const iconMap: Record<BlockType, React.ReactNode> = {
    hero: (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8L7.5 5.5L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="11" cy="5.5" r="1" fill="currentColor" />
      </svg>
    ),
    heading: (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <path d="M3 3V13M13 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    text: (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <path d="M2 4H14M2 8H11M2 12H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    image: (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1" />
        <path d="M1.5 11L5 8L8 10.5L11 7.5L14.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    quote: (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <path d="M3 4C3 4 3 8 3 9C3 10.5 4.5 12 6 12M7 4V9M10 4C10 4 10 8 10 9C10 10.5 11.5 12 13 12M14 4V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    code: (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <path d="M5 4L1.5 8L5 12M11 4L14.5 8L11 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 3L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    callout: (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5V9M8 11V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    divider: (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <path d="M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    "two-column": (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="2.5" width="5.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="2.5" width="5.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    list: (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <circle cx="3" cy="4" r="1" fill="currentColor" />
        <circle cx="3" cy="8" r="1" fill="currentColor" />
        <circle cx="3" cy="12" r="1" fill="currentColor" />
        <path d="M6 4H14M6 8H14M6 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    embed: (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 5.5V10.5L11 8L6.5 5.5Z" fill="currentColor" />
      </svg>
    ),
    "table-of-contents": (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <path d="M2 3H14M4 6H12M4 9H12M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    "newsletter-cta": (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1.5 5L8 9L14.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    "author-bio": (
      <svg className={className} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 14C2.5 11 5 9 8 9C11 9 13.5 11 13.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  };

  return <>{iconMap[type] ?? null}</>;
}
