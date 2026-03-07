"use client";

import type { CalloutBlockProps } from "@rankflo/core/types";
import { useEditorStore } from "@/stores/editor-store";

// ─── Props ──────────────────────────────────────────────
interface CalloutBlockComponentProps {
  id: string;
  props: CalloutBlockProps;
}

// ─── Icons for callout types ───────────────────────────
function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

// ─── Callout type config ───────────────────────────────
const calloutConfig: Record<
  CalloutBlockProps["type"],
  { borderColor: string; iconColor: string; bgColor: string; icon: React.ReactNode }
> = {
  info: {
    borderColor: "border-l-blue-500",
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/5",
    icon: <InfoIcon />,
  },
  warning: {
    borderColor: "border-l-amber-500",
    iconColor: "text-amber-400",
    bgColor: "bg-amber-500/5",
    icon: <WarningIcon />,
  },
  success: {
    borderColor: "border-l-green-500",
    iconColor: "text-green-400",
    bgColor: "bg-green-500/5",
    icon: <SuccessIcon />,
  },
  error: {
    borderColor: "border-l-red-500",
    iconColor: "text-red-400",
    bgColor: "bg-red-500/5",
    icon: <ErrorIcon />,
  },
};

// ─── Component ─────────────────────────────────────────
export function CalloutBlock({ id, props }: CalloutBlockComponentProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const { text, type, title } = props;
  const config = calloutConfig[type];

  return (
    <div className="px-4 py-3">
      <div
        className={`rounded-lg border border-gray-800 border-l-4 ${config.borderColor} ${config.bgColor} p-4`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`mt-0.5 shrink-0 ${config.iconColor}`}>
            {config.icon}
          </div>

          <div className="flex-1 space-y-1">
            {/* Editable title */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="font-semibold text-white outline-none focus:ring-1 focus:ring-[#39FF14]/50"
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

            {/* Editable text */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="text-sm text-gray-300 outline-none focus:ring-1 focus:ring-[#39FF14]/50"
              onBlur={(e) => {
                const newText = e.currentTarget.textContent || "";
                if (newText !== text) {
                  updateBlock(id, { text: newText });
                }
              }}
            >
              {text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
