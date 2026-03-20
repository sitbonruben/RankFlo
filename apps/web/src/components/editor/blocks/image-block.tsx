"use client";

import { useState } from "react";
import type { ImageBlockProps } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";
import { trpc } from "@/trpc/client";

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

// ─── Icons ─────────────────────────────────────────────
function CameraIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.9 5.1 5.1 1.9-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    </svg>
  );
}

// ─── Image Placeholder ──────────────────────────────────
function ImagePlaceholder({ id, props }: ImageBlockComponentProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);

  const [mode, setMode] = useState<"pick" | "url" | "ai">("pick");
  const [urlInput, setUrlInput] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  const generateImage = trpc.ai.generateImage.useMutation({
    onSuccess: (data) => {
      updateBlock(id, { src: data.url });
    },
  });

  if (mode === "pick") {
    return (
      <div className="px-4 py-3">
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-700 bg-gray-950 py-10">
          <CameraIcon />
          <p className="text-sm text-gray-500">Add an image</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("url")}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-3 text-xs font-medium text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
            >
              Enter URL
            </button>
            <button
              type="button"
              onClick={() => setMode("ai")}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
            >
              <SparkleIcon />
              Generate with AI
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "url") {
    return (
      <div className="px-4 py-3">
        <div className="flex flex-col gap-2 rounded-lg border border-gray-700 bg-gray-950 p-4">
          <label className="text-xs font-medium text-gray-400">Image URL</label>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && urlInput.trim()) {
                updateBlock(id, { src: urlInput.trim() });
              } else if (e.key === "Escape") {
                setMode("pick");
              }
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { if (urlInput.trim()) updateBlock(id, { src: urlInput.trim() }); }}
              disabled={!urlInput.trim()}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
            >
              Insert
            </button>
            <button
              type="button"
              onClick={() => setMode("pick")}
              className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AI generation mode
  return (
    <div className="px-4 py-3">
      <div className="flex flex-col gap-2 rounded-lg border border-accent/20 bg-gray-950 p-4">
        <label className="text-xs font-medium text-gray-400">
          <span className="text-accent">✦</span> AI Image Prompt
        </label>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Describe the image you want to generate…"
          rows={2}
          className="rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none resize-none"
          autoFocus
        />
        {generateImage.error && (
          <p className="text-xs text-red-400">{generateImage.error.message}</p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (aiPrompt.trim()) {
                generateImage.mutate({
                  prompt: aiPrompt.trim(),
                  aspectRatio: props.width === "small" ? "1:1" : "16:9",
                });
              }
            }}
            disabled={!aiPrompt.trim() || generateImage.isPending}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-black disabled:opacity-50"
          >
            {generateImage.isPending ? (
              <>
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <SparkleIcon />
                Generate
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMode("pick")}
            disabled={generateImage.isPending}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────
export function ImageBlock({ id, props }: ImageBlockComponentProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const { src, alt, caption, width, rounded, shadow } = props;

  if (!src) {
    return <ImagePlaceholder id={id} props={props} />;
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
