"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@rankflo/ui";
import { BlockPalette } from "./block-palette";
import { TemplateGallery } from "./template-gallery";
import { StylesPanel } from "./styles-panel";
import { BrandingPanel } from "./branding-panel";
import { AiChatPanel } from "./ai-chat-panel";

// ─── Panel Definitions ──────────────────────────────────
type PanelId = "blocks" | "templates" | "styles" | "branding" | "ai-chat";

interface ToolItem {
  id: PanelId;
  label: string;
  icon: React.ReactNode;
  position: "top" | "bottom";
}

const TOOLS: ToolItem[] = [
  {
    id: "blocks",
    label: "Blocks",
    position: "top",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="2.5"
          y="2.5"
          width="6"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="11.5"
          y="2.5"
          width="6"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="2.5"
          y="11.5"
          width="6"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="11.5"
          y="11.5"
          width="6"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: "templates",
    label: "Templates",
    position: "top",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="2.5"
          y="2.5"
          width="15"
          height="15"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M2.5 7.5h15M7.5 7.5V17.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: "styles",
    label: "Styles",
    position: "top",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 14.5l4.5-9.5L12 14.5M4.5 12h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 6.5c1.5 0 3 .75 3 2.5s-1.5 2.5-3 2.5M14 11.5c1.5 0 3 .75 3 2.25S15.5 16 14 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "branding",
    label: "Branding",
    position: "top",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2.5L4 10l6 7.5L16 10l-6-7.5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 2.5L7 10l3 3.5L13 10l-3-7.5z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
          opacity="0.4"
        />
      </svg>
    ),
  },
  {
    id: "ai-chat",
    label: "AI Chat",
    position: "bottom",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 3l1.8 3.6L16 7.4l-3 2.6.7 4L10 12.2 6.3 14l.7-4-3-2.6 4.2-.8L10 3z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
];

// ─── Panel Content ──────────────────────────────────────
function PanelContent({ panelId }: { panelId: PanelId }) {
  switch (panelId) {
    case "blocks":
      return <BlockPalette />;
    case "templates":
      return <TemplateGallery />;
    case "styles":
      return <StylesPanel />;
    case "branding":
      return <BrandingPanel />;
    case "ai-chat":
      return <AiChatPanel />;
  }
}

// ─── Panel Title ────────────────────────────────────────
function getPanelTitle(id: PanelId): string {
  switch (id) {
    case "blocks":
      return "Blocks";
    case "templates":
      return "Templates";
    case "styles":
      return "Document Styles";
    case "branding":
      return "Branding";
    case "ai-chat":
      return "AI Chat";
  }
}

// ─── Toolbar Button ─────────────────────────────────────
function ToolbarButton({
  tool,
  isActive,
  onClick,
}: {
  tool: ToolItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
            isActive
              ? "bg-[#39FF14]/10 text-[#39FF14]"
              : "text-gray-500 hover:bg-gray-800/50 hover:text-gray-300"
          }`}
        >
          {tool.icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {tool.label}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Left Panel ─────────────────────────────────────────
export function LeftPanel() {
  const [activePanel, setActivePanel] = React.useState<PanelId | null>(null);

  const togglePanel = React.useCallback(
    (id: PanelId) => {
      setActivePanel((prev) => (prev === id ? null : id));
    },
    [],
  );

  const topTools = TOOLS.filter((t) => t.position === "top");
  const bottomTools = TOOLS.filter((t) => t.position === "bottom");

  return (
    <TooltipProvider>
      <div className="flex h-full shrink-0">
        {/* ─── Icon Toolbar (48px) ─────────────────── */}
        <div className="flex w-12 flex-col items-center border-r border-gray-800 bg-[#0a0a0a] py-2">
          {/* Top tools */}
          <div className="flex flex-col items-center gap-1">
            {topTools.map((tool) => (
              <ToolbarButton
                key={tool.id}
                tool={tool}
                isActive={activePanel === tool.id}
                onClick={() => togglePanel(tool.id)}
              />
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom tools */}
          <div className="flex flex-col items-center gap-1">
            {bottomTools.map((tool) => (
              <ToolbarButton
                key={tool.id}
                tool={tool}
                isActive={activePanel === tool.id}
                onClick={() => togglePanel(tool.id)}
              />
            ))}
          </div>
        </div>

        {/* ─── Sliding Content Panel (280px) ───────── */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            activePanel !== null ? "w-[280px]" : "w-0"
          }`}
        >
          <div className="flex h-full w-[280px] flex-col border-r border-gray-800 bg-black">
            {activePanel !== null && (
              <>
                {/* Panel header */}
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-800 px-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {getPanelTitle(activePanel)}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActivePanel(null)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M3 3l6 6M9 3l-6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Panel content */}
                <div className="flex-1 overflow-y-auto">
                  <PanelContent panelId={activePanel} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
