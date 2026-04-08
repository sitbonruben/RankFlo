"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { blocksToHtml } from "@/lib/editor-utils";

type DevicePreset = "desktop" | "tablet" | "mobile";
const DEVICE_WIDTHS: Record<DevicePreset, number> = { desktop: 0, tablet: 768, mobile: 375 };

// ─── Editor Preview Modal ────────────────────────────────
// Shows a rendered HTML preview of the current post content,
// exactly as it will be delivered via the content API.

export function EditorPreview({ onClose }: { onClose: () => void }) {
  const title = useEditorStore((s) => s.title);
  const document = useEditorStore((s) => s.document);
  const featuredImage = useEditorStore((s) => s.featuredImage);
  const excerpt = useEditorStore((s) => s.excerpt);
  const [device, setDevice] = useState<DevicePreset>("desktop");
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
      className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-950"
      role="dialog"
      aria-modal="true"
    >
      {/* Topbar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Preview
        </span>

        {/* Device toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-800 p-0.5">
          {([
            { id: "desktop" as DevicePreset, label: "Desktop", icon: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" },
            { id: "tablet" as DevicePreset, label: "Tablet", icon: "M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" },
            { id: "mobile" as DevicePreset, label: "Mobile", icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" },
          ]).map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDevice(id)}
              title={label}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                device === id
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 px-3 text-sm text-gray-600 dark:text-gray-400 hover:border-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Close (Esc)
        </button>
      </div>

      {/* Content area */}
      <div className={`flex-1 overflow-y-auto ${device !== "desktop" ? "bg-gray-200 dark:bg-[#111]" : ""}`}>
        <div className={`mx-auto transition-all duration-300 ${device !== "desktop" ? "my-6 rounded-2xl shadow-2xl ring-1 ring-gray-300 dark:ring-gray-700 overflow-hidden" : ""}`}
          style={device !== "desktop" ? { width: DEVICE_WIDTHS[device], maxWidth: "calc(100% - 48px)" } : undefined}
        >
          <div className="bg-white dark:bg-black min-h-full">
            {/* Featured image hero */}
            {featuredImage && (
              <div className={device === "desktop" ? "mx-auto max-w-5xl px-8 pt-8" : "px-4 pt-4"}>
                <div className="overflow-hidden rounded-xl">
                  <img src={featuredImage} alt={title} className="w-full max-h-[480px] object-cover" />
                </div>
              </div>
            )}

            <article className={device === "desktop" ? "mx-auto max-w-3xl px-8 py-12" : "px-4 py-6"}>
              <h1 className={`font-bold leading-tight tracking-tight text-gray-900 dark:text-white ${device === "mobile" ? "text-2xl" : device === "tablet" ? "text-3xl" : "text-4xl sm:text-5xl"}`}>
                {title || "Untitled post"}
              </h1>

              {excerpt && (
                <p className={`mt-4 leading-relaxed text-gray-500 dark:text-gray-400 ${device === "mobile" ? "text-sm" : "text-xl"}`}>
                  {excerpt}
                </p>
              )}

              <div className="mt-4 flex items-center gap-3 text-sm text-gray-400 dark:text-gray-600">
                <span>Draft preview</span>
                <span aria-hidden="true">&middot;</span>
                <span>{Math.max(1, Math.ceil(contentHtml.replace(/<[^>]*>/g, '').split(/\s+/).length / 200))} min read</span>
              </div>

              <hr className="my-6 border-gray-200 dark:border-gray-800" />

              {document.blocks.length === 0 ? (
                <p className="text-gray-400 italic">No content yet.</p>
              ) : (
                <div
                  className={`prose max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-green-600 dark:prose-a:text-accent prose-code:rounded prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-4 prose-blockquote:border-green-500 dark:prose-blockquote:border-accent prose-blockquote:pl-4 prose-blockquote:not-italic prose-img:rounded-xl ${device === "mobile" ? "prose-sm" : "prose-lg"}`}
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              )}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
