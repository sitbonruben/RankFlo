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
import { trpc } from "@/trpc/client";

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

// ─── Free Images Grid ───────────────────────────────────
function FreeImagesGrid() {
  const title = useEditorStore((s) => s.title);
  const addBlockData = useEditorStore((s) => s.addBlockData);

  const searchTerm = React.useMemo(() => {
    if (!title) return "technology";
    const skip = new Set(["how","to","the","a","an","in","for","and","or","of","is","it","that","this","your","you","with","from","what","why","when","where","which","on","at","by","be","as","are","was","were","will","can","do","not","no","vs","best","top","guide","complete","ultimate","2024","2025","2026","2027"]);
    const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !skip.has(w)).slice(0, 3);
    return words.join(" ") || "technology";
  }, [title]);

  const { data, isLoading } = trpc.ai.searchImages.useQuery(
    { query: searchTerm, page: 1 },
    { staleTime: 60_000 },
  );

  const images = data?.images ?? [];

  function insertImage(img: { url: string; alt: string; photographer: string }) {
    addBlockData({
      id: crypto.randomUUID(),
      type: "image",
      props: { src: img.url, alt: img.alt || searchTerm, caption: `Photo by ${img.photographer}`, width: "large", rounded: true, shadow: false },
    } as never);
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-video animate-pulse rounded-lg bg-gray-900" />
        ))}
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {images.slice(0, 12).map((img) => (
        <button
          key={img.id}
          type="button"
          onClick={() => insertImage(img)}
          className="group relative aspect-video overflow-hidden rounded-lg border border-gray-800 transition-all hover:border-accent hover:shadow-md"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.thumbUrl} alt={img.alt} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 right-0 p-1 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="truncate text-[9px] text-white">{img.photographer}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Block Palette ──────────────────────────────────────
export function BlockPalette() {
  return (
    <div className="space-y-5 p-3">
      {/* Free stock images based on post title */}
      <div>
        <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Free Images
        </h3>
        <FreeImagesGrid />
        <p className="mt-1.5 px-1 text-[9px] text-gray-600">
          Click to insert · from <a href="https://pexels.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">Pexels</a>
        </p>
      </div>

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
