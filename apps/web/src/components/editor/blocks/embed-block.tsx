"use client";

import { useState } from "react";
import type { EmbedBlockProps } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";

// ─── Props ──────────────────────────────────────────────
interface EmbedBlockComponentProps {
  id: string;
  props: EmbedBlockProps;
}

// ─── Link Icon ─────────────────────────────────────────
function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

// ─── Play Icon ─────────────────────────────────────────
function PlayIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

// ─── External Link Icon ────────────────────────────────
function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ─── YouTube ID extractor ──────────────────────────────
function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}

// ─── Detect embed type from URL ────────────────────────
function detectEmbedType(url: string): EmbedBlockProps["type"] {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/twitter\.com|x\.com/.test(url)) return "twitter";
  return "generic";
}

// ─── Aspect ratio map ──────────────────────────────────
const aspectRatioMap: Record<EmbedBlockProps["aspectRatio"], string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
};

// ─── Component ─────────────────────────────────────────
export function EmbedBlock({ id, props }: EmbedBlockComponentProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const [inputUrl, setInputUrl] = useState("");
  const { url, type, aspectRatio } = props;

  const handleEmbed = () => {
    if (!inputUrl.trim()) return;
    const detectedType = detectEmbedType(inputUrl);
    updateBlock(id, { url: inputUrl.trim(), type: detectedType });
    setInputUrl("");
  };

  // No URL yet — show input
  if (!url) {
    return (
      <div className="px-4 py-3">
        <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="text-gray-500">
              <LinkIcon />
            </div>
            <div className="flex w-full max-w-md items-center gap-2">
              <input
                type="url"
                placeholder="Paste a YouTube, Twitter, or any URL..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleEmbed();
                  }
                }}
                className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-[#39FF14]/50 focus:ring-1 focus:ring-[#39FF14]/50"
              />
              <button
                type="button"
                onClick={handleEmbed}
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                Embed
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // YouTube embed
  if (type === "youtube") {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return (
        <div className="px-4 py-3">
          <div className={`overflow-hidden rounded-lg ${aspectRatioMap[aspectRatio]}`}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      );
    }
  }

  // Twitter embed placeholder
  if (type === "twitter") {
    return (
      <div className="px-4 py-3">
        <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
          <div className="flex items-center gap-3">
            {/* Twitter/X logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
              <span className="text-lg font-bold text-white">X</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400">Embedded tweet</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#39FF14] hover:underline"
              >
                {url}
                <ExternalLinkIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generic URL card
  return (
    <div className="px-4 py-3">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border border-gray-800 bg-gray-950 p-4 transition-colors hover:border-gray-700 hover:bg-gray-900"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-800">
            <ExternalLinkIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {url}
            </p>
            <p className="text-xs text-gray-500">External link</p>
          </div>
        </div>
      </a>
    </div>
  );
}
