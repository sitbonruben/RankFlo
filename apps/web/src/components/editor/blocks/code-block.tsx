"use client";

import { useRef } from "react";
import type { CodeBlockProps } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";

// ─── Props ──────────────────────────────────────────────
interface CodeBlockComponentProps {
  id: string;
  props: CodeBlockProps;
}

// ─── Component ─────────────────────────────────────────
export function CodeBlock({ id, props }: CodeBlockComponentProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { code, language, filename, showLineNumbers } = props;

  const lines = code.split("\n");
  const lineCount = lines.length;

  return (
    <div className="px-4 py-3">
      <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
        {/* Header with language badge and filename */}
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
          <div className="flex items-center gap-3">
            {/* Traffic light dots */}
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-gray-700" />
              <div className="h-2.5 w-2.5 rounded-full bg-gray-700" />
              <div className="h-2.5 w-2.5 rounded-full bg-gray-700" />
            </div>
            {/* Filename */}
            {filename && (
              <span className="text-xs text-gray-400">{filename}</span>
            )}
          </div>
          {/* Language badge */}
          {language && (
            <span className="rounded bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-400">
              {language}
            </span>
          )}
        </div>

        {/* Code area */}
        <div className="relative flex">
          {/* Line numbers gutter */}
          {showLineNumbers && (
            <div className="select-none border-r border-gray-800 bg-gray-950 px-3 py-4 text-right">
              {Array.from({ length: lineCount }, (_, i) => (
                <div
                  key={i}
                  className="font-mono text-xs leading-6 text-gray-600"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          {/* Textarea for code editing */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => {
              updateBlock(id, { code: e.target.value });
            }}
            spellCheck={false}
            className="w-full resize-none bg-transparent px-4 py-4 font-mono text-sm leading-6 text-gray-200 outline-none placeholder:text-gray-700 focus:ring-0"
            style={{
              minHeight: `${Math.max(lineCount * 24 + 32, 80)}px`,
            }}
            onKeyDown={(e) => {
              // Handle Tab key for indentation
              if (e.key === "Tab") {
                e.preventDefault();
                const textarea = e.currentTarget;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newCode =
                  code.substring(0, start) + "  " + code.substring(end);
                updateBlock(id, { code: newCode });
                // Restore cursor position after React re-render
                requestAnimationFrame(() => {
                  textarea.selectionStart = textarea.selectionEnd = start + 2;
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
