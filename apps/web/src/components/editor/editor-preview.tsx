"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { blocksToHtml } from "@/lib/editor-utils";

// ─── Editor Preview Modal ────────────────────────────────
// Shows a rendered HTML preview of the current post content,
// exactly as it will be delivered via the content API.

export function EditorPreview({ onClose }: { onClose: () => void }) {
  const title = useEditorStore((s) => s.title);
  const document = useEditorStore((s) => s.document);
  const featuredImage = useEditorStore((s) => s.featuredImage);
  const excerpt = useEditorStore((s) => s.excerpt);
  const overlayRef = useRef<HTMLDivElement>(null);

  const contentHtml = blocksToHtml(document.blocks);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col bg-white"
      role="dialog"
      aria-modal="true"
    >
      {/* Topbar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <span className="text-sm font-medium text-gray-700">
          Preview — <span className="text-gray-400">how your content is delivered</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Close (Esc)
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-12">
          {/* Featured image */}
          {featuredImage && (
            <div className="mb-8 overflow-hidden rounded-xl">
              <img
                src={featuredImage}
                alt={title}
                className="h-[400px] w-full object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900">
            {title || "Untitled post"}
          </h1>

          {/* Excerpt */}
          {excerpt && (
            <p className="mb-8 text-xl leading-relaxed text-gray-500">
              {excerpt}
            </p>
          )}

          {/* Divider */}
          <hr className="mb-8 border-gray-200" />

          {/* Rendered blocks */}
          {document.blocks.length === 0 ? (
            <p className="text-gray-400 italic">No content yet — add blocks to see the preview.</p>
          ) : (
            <div
              className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-code:bg-gray-100 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
