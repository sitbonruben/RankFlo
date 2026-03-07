"use client";

import { useRef } from "react";
import type { HeroBlockProps } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";

// ─── Props ──────────────────────────────────────────────
interface HeroBlockComponentProps {
  id: string;
  props: HeroBlockProps;
}

// ─── Height Map ────────────────────────────────────────
const heightMap: Record<HeroBlockProps["height"], string> = {
  small: "min-h-[200px]",
  medium: "min-h-[300px]",
  large: "min-h-[400px]",
  full: "min-h-[500px]",
};

// ─── Alignment Map ─────────────────────────────────────
const alignmentMap: Record<HeroBlockProps["alignment"], string> = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
};

// ─── Component ─────────────────────────────────────────
export function HeroBlock({ id, props }: HeroBlockComponentProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const { title, subtitle, backgroundImage, overlay, alignment, height } = props;

  // Build background style
  const bgStyle: React.CSSProperties = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  // Overlay classes
  let overlayClass = "";
  switch (overlay) {
    case "dark":
      overlayClass = "bg-black/60";
      break;
    case "light":
      overlayClass = "bg-white/30";
      break;
    case "gradient":
      overlayClass = "bg-gradient-to-t from-black/80 to-transparent";
      break;
    case "none":
    default:
      overlayClass = "";
      break;
  }

  return (
    <div
      className={`relative flex w-full flex-col justify-center overflow-hidden rounded-lg ${heightMap[height]} ${
        !backgroundImage ? "bg-gray-950" : ""
      }`}
      style={bgStyle}
    >
      {/* Overlay */}
      {overlay !== "none" && (
        <div className={`absolute inset-0 ${overlayClass}`} />
      )}

      {/* Content */}
      <div
        className={`relative z-10 flex w-full flex-col justify-center gap-3 px-8 py-12 ${alignmentMap[alignment]}`}
      >
        <h1
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          className="text-3xl font-bold leading-tight text-white outline-none focus:ring-1 focus:ring-[#39FF14]/50 focus:ring-offset-2 focus:ring-offset-transparent md:text-4xl lg:text-5xl"
          onBlur={(e) => {
            const newTitle = e.currentTarget.textContent || "";
            if (newTitle !== title) {
              updateBlock(id, { title: newTitle });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {title}
        </h1>

        <p
          ref={subtitleRef}
          contentEditable
          suppressContentEditableWarning
          className="max-w-2xl text-lg text-gray-300 outline-none focus:ring-1 focus:ring-[#39FF14]/50 focus:ring-offset-2 focus:ring-offset-transparent md:text-xl"
          onBlur={(e) => {
            const newSubtitle = e.currentTarget.textContent || "";
            if (newSubtitle !== subtitle) {
              updateBlock(id, { subtitle: newSubtitle });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Background hint when no image */}
      {!backgroundImage && (
        <div className="absolute bottom-3 right-3 z-10 rounded bg-gray-800/80 px-2 py-1 text-xs text-gray-500">
          Set background image in properties
        </div>
      )}
    </div>
  );
}
