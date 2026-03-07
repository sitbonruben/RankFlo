"use client";

import type { ImageBlockProps } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";

// ─── Props ──────────────────────────────────────────────
interface ImageBlockComponentProps {
  id: string;
  props: ImageBlockProps;
}

// ─── Width Map ─────────────────────────────────────────
const widthMap: Record<ImageBlockProps["width"], string> = {
  small: "max-w-sm",
  medium: "max-w-lg",
  large: "max-w-2xl",
  full: "w-full",
};

// ─── Camera Icon ───────────────────────────────────────
function CameraIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────
export function ImageBlock({ id, props }: ImageBlockComponentProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const { src, alt, caption, width, rounded, shadow } = props;

  if (!src) {
    // Upload placeholder
    return (
      <div className="px-4 py-3">
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-700 bg-gray-950 py-12 transition-colors hover:border-gray-600 hover:bg-gray-900"
          onClick={() => {
            // In a real implementation, this would open a file picker or media library
            const url = prompt("Enter image URL:");
            if (url) {
              updateBlock(id, { src: url });
            }
          }}
        >
          <CameraIcon />
          <span className="text-sm text-gray-500">Click to add image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <figure className={`mx-auto ${widthMap[width]}`}>
        <img
          src={src}
          alt={alt || ""}
          className={`w-full object-cover ${rounded ? "rounded-lg" : ""} ${shadow ? "shadow-lg shadow-black/50" : ""}`}
        />
        {/* Editable caption */}
        <figcaption
          contentEditable
          suppressContentEditableWarning
          className="mt-2 text-center text-sm text-gray-500 outline-none focus:ring-1 focus:ring-[#39FF14]/50"
          onBlur={(e) => {
            const newCaption = e.currentTarget.textContent || "";
            if (newCaption !== caption) {
              updateBlock(id, { caption: newCaption });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {caption || "Add a caption..."}
        </figcaption>
      </figure>
    </div>
  );
}
