"use client";

import { useRef } from "react";
import type { ListBlockProps } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";

// ─── Props ──────────────────────────────────────────────
interface ListBlockComponentProps {
  id: string;
  props: ListBlockProps;
}

// ─── Plus Icon ─────────────────────────────────────────
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ─── Close Icon ────────────────────────────────────────
function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Marker rendering ──────────────────────────────────
function ListMarker({ style, index, checked }: { style: ListBlockProps["style"]; index: number; checked?: boolean }) {
  switch (style) {
    case "bullet":
      return (
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
      );
    case "number":
      return (
        <span className="w-6 shrink-0 text-right text-sm text-gray-500">
          {index + 1}.
        </span>
      );
    case "check":
      return (
        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? "border-[#39FF14] bg-[#39FF14]/20" : "border-gray-600 bg-gray-800"}`}>
          {checked && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
      );
  }
}

// ─── Component ─────────────────────────────────────────
export function ListBlock({ id, props }: ListBlockComponentProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const { items, style } = props;
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    updateBlock(id, { items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    updateBlock(id, { items: newItems.length > 0 ? newItems : [""] });
  };

  const addItem = () => {
    updateBlock(id, { items: [...items, ""] });
    // Focus the new item after render
    requestAnimationFrame(() => {
      const newIndex = items.length;
      const el = itemRefs.current.get(newIndex);
      if (el) el.focus();
    });
  };

  const Tag = style === "number" ? "ol" : "ul";

  return (
    <div className="px-4 py-3">
      <Tag className="space-y-1">
        {items.map((item, index) => (
          <li
            key={index}
            className="group/item flex items-start gap-2"
          >
            <ListMarker style={style} index={index} />

            {/* Editable item text */}
            <div
              ref={(el) => {
                if (el) itemRefs.current.set(index, el);
              }}
              contentEditable
              suppressContentEditableWarning
              className="flex-1 text-gray-300 outline-none focus:ring-1 focus:ring-[#39FF14]/50"
              onBlur={(e) => {
                const newText = e.currentTarget.textContent || "";
                if (newText !== item) {
                  updateItem(index, newText);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  // Insert new item below
                  const newItems = [...items];
                  newItems.splice(index + 1, 0, "");
                  updateBlock(id, { items: newItems });
                  requestAnimationFrame(() => {
                    const el = itemRefs.current.get(index + 1);
                    if (el) el.focus();
                  });
                }
                if (e.key === "Backspace" && !e.currentTarget.textContent && items.length > 1) {
                  e.preventDefault();
                  removeItem(index);
                }
              }}
            >
              {item}
            </div>

            {/* Remove button (on hover) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeItem(index);
              }}
              className="shrink-0 rounded p-0.5 text-gray-600 opacity-0 transition-opacity hover:bg-gray-800 hover:text-red-400 group-hover/item:opacity-100"
              title="Remove item"
            >
              <CloseIcon />
            </button>
          </li>
        ))}
      </Tag>

      {/* Add item button */}
      <button
        type="button"
        onClick={addItem}
        className="mt-2 flex items-center gap-1.5 rounded px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
      >
        <PlusIcon />
        Add item
      </button>
    </div>
  );
}
