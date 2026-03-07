"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { TextBlockProps } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";

// ─── Props ──────────────────────────────────────────────
interface TextBlockComponentProps {
  id: string;
  props: TextBlockProps;
}

// ─── Inline Toolbar Icons ──────────────────────────────
function BoldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

// ─── Alignment Map ─────────────────────────────────────
const alignmentMap: Record<TextBlockProps["alignment"], string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

// ─── Component ─────────────────────────────────────────
export function TextBlock({ id, props }: TextBlockComponentProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });

  const { html, alignment } = props;

  // Check for text selection and show toolbar
  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (
      !selection ||
      selection.isCollapsed ||
      !contentRef.current?.contains(selection.anchorNode)
    ) {
      setShowToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = contentRef.current.getBoundingClientRect();

    setToolbarPos({
      top: rect.top - containerRect.top - 40,
      left: rect.left - containerRect.left + rect.width / 2 - 80,
    });
    setShowToolbar(true);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, [handleSelection]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Sync content after command
    if (contentRef.current) {
      updateBlock(id, { html: contentRef.current.innerHTML });
    }
  };

  const handleLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  return (
    <div className="relative px-4 py-2">
      {/* Floating inline toolbar */}
      {showToolbar && (
        <div
          ref={toolbarRef}
          className="absolute z-30 flex items-center gap-0.5 rounded-md border border-gray-700 bg-gray-900 px-1 py-0.5 shadow-xl"
          style={{
            top: `${toolbarPos.top}px`,
            left: `${toolbarPos.left}px`,
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={() => execCommand("bold")}
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            title="Bold"
          >
            <BoldIcon />
          </button>
          <button
            type="button"
            onClick={() => execCommand("italic")}
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            title="Italic"
          >
            <ItalicIcon />
          </button>
          <button
            type="button"
            onClick={handleLink}
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            title="Link"
          >
            <LinkIcon />
          </button>
          <button
            type="button"
            onClick={() => execCommand("insertHTML", "<code>" + window.getSelection()?.toString() + "</code>")}
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            title="Inline code"
          >
            <CodeIcon />
          </button>
        </div>
      )}

      {/* Editable content */}
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        className={`prose prose-invert max-w-none text-gray-300 outline-none ${alignmentMap[alignment]} [&_a]:text-[#39FF14] [&_a]:underline [&_code]:rounded [&_code]:bg-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-gray-200`}
        dangerouslySetInnerHTML={{ __html: html }}
        onBlur={(e) => {
          updateBlock(id, { html: e.currentTarget.innerHTML });
        }}
        onInput={() => {
          // Keep selection checks live while typing
          handleSelection();
        }}
      />
    </div>
  );
}
