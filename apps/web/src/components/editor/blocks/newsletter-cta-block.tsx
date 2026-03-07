"use client";

import type { NewsletterCtaBlockProps } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";

// ─── Props ──────────────────────────────────────────────
interface NewsletterCtaBlockComponentProps {
  id: string;
  props: NewsletterCtaBlockProps;
}

// ─── Mail Icon ─────────────────────────────────────────
function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────
export function NewsletterCtaBlock({ id, props }: NewsletterCtaBlockComponentProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const { title, description, buttonText, style, placeholder } = props;

  // Style variants
  let containerClass = "";
  switch (style) {
    case "minimal":
      containerClass = "py-4";
      break;
    case "card":
      containerClass = "rounded-lg border border-gray-700 bg-gray-950 p-6 shadow-lg";
      break;
    case "banner":
      containerClass = "rounded-lg bg-[#39FF14]/5 border border-[#39FF14]/20 p-6";
      break;
  }

  return (
    <div className="px-4 py-3">
      <div className={containerClass}>
        <div
          className={`${
            style === "minimal"
              ? "flex items-center gap-6"
              : "flex flex-col items-center gap-4 text-center"
          }`}
        >
          {/* Icon (for card and banner) */}
          {style !== "minimal" && (
            <div className="text-[#39FF14]">
              <MailIcon />
            </div>
          )}

          {/* Text content */}
          <div className={style === "minimal" ? "flex-1" : ""}>
            {/* Editable title */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="text-lg font-bold text-white outline-none focus:ring-1 focus:ring-[#39FF14]/50"
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
            </div>

            {/* Editable description */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="mt-1 text-sm text-gray-400 outline-none focus:ring-1 focus:ring-[#39FF14]/50"
              onBlur={(e) => {
                const newDesc = e.currentTarget.textContent || "";
                if (newDesc !== description) {
                  updateBlock(id, { description: newDesc });
                }
              }}
            >
              {description}
            </div>
          </div>

          {/* Email input + button (non-functional in editor, just visual) */}
          <div
            className={`flex gap-2 ${
              style === "minimal" ? "shrink-0" : "mt-2 w-full max-w-sm"
            }`}
          >
            <input
              type="email"
              disabled
              placeholder={placeholder}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-500 placeholder-gray-600"
            />
            <div
              contentEditable
              suppressContentEditableWarning
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:ring-1 focus:ring-[#39FF14]/50 ${
                style === "banner"
                  ? "bg-[#39FF14] text-black"
                  : "bg-gray-700 text-white"
              }`}
              onBlur={(e) => {
                const newButtonText = e.currentTarget.textContent || "";
                if (newButtonText !== buttonText) {
                  updateBlock(id, { buttonText: newButtonText });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            >
              {buttonText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
