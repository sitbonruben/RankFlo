"use client";

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Label,
  Button,
} from "@rankflo/ui";
import { useEditorStore } from "@/stores/editor-store";

// ─── Types ──────────────────────────────────────────────
export interface DocumentStyles {
  bodyFont: string;
  headingFont: string;
  bodyFontSize: string;
  lineHeight: string;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  contentWidth: number;
  blockGap: string;
}

const DEFAULT_STYLES: DocumentStyles = {
  bodyFont: "system",
  headingFont: "system",
  bodyFontSize: "16px",
  lineHeight: "1.6",
  backgroundColor: "#0a0a0a",
  accentColor: "#39FF14",
  textColor: "#ffffff",
  contentWidth: 720,
  blockGap: "8px",
};

// ─── Font Options ───────────────────────────────────────
const FONT_OPTIONS = [
  { value: "system", label: "System Default" },
  { value: "Inter", label: "Inter" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
  { value: "Newsreader", label: "Newsreader" },
  { value: "Merriweather", label: "Merriweather" },
];

const FONT_SIZE_OPTIONS = [
  { value: "14px", label: "14px" },
  { value: "15px", label: "15px" },
  { value: "16px", label: "16px" },
  { value: "18px", label: "18px" },
];

const LINE_HEIGHT_OPTIONS = [
  { value: "1.4", label: "1.4 - Tight" },
  { value: "1.5", label: "1.5" },
  { value: "1.6", label: "1.6 - Normal" },
  { value: "1.75", label: "1.75" },
  { value: "2.0", label: "2.0 - Spacious" },
];

const BG_COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#0a0a0a", label: "Near Black" },
  { value: "#111111", label: "Dark Gray" },
  { value: "#1a1a1a", label: "Charcoal" },
  { value: "#ffffff", label: "White" },
];

const ACCENT_COLORS = [
  { value: "#39FF14", label: "Neon Green" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#EC4899", label: "Pink" },
];

const GAP_OPTIONS = [
  { value: "4px", label: "Tight (4px)" },
  { value: "8px", label: "Normal (8px)" },
  { value: "16px", label: "Relaxed (16px)" },
  { value: "24px", label: "Loose (24px)" },
];

// ─── Color Swatch ───────────────────────────────────────
function ColorSwatch({
  color,
  selected,
  onClick,
  label,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`h-8 w-8 rounded-md border-2 transition-all ${
        selected
          ? "border-[#39FF14] ring-1 ring-[#39FF14]/30"
          : "border-gray-700 hover:border-gray-500"
      }`}
      style={{ backgroundColor: color }}
    />
  );
}

// ─── Section Header ─────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </h4>
  );
}

// ─── Styles Panel ───────────────────────────────────────
export function StylesPanel() {
  const [styles, setStyles] = React.useState<DocumentStyles>(DEFAULT_STYLES);
  const [copyFeedback, setCopyFeedback] = React.useState(false);

  const updateStyle = React.useCallback(
    <K extends keyof DocumentStyles>(key: K, value: DocumentStyles[K]) => {
      setStyles((prev) => {
        const next = { ...prev, [key]: value };
        // Auto-compute text color from background
        if (key === "backgroundColor") {
          next.textColor = value === "#ffffff" ? "#000000" : "#ffffff";
        }
        // Persist to editor store
        useEditorStore.setState({
          documentStyles: next,
        } as Record<string, unknown>);
        return next;
      });
    },
    [],
  );

  const generateCSS = React.useCallback(() => {
    const fontFamily =
      styles.bodyFont === "system"
        ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : `"${styles.bodyFont}", sans-serif`;
    const headingFamily =
      styles.headingFont === "system"
        ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : `"${styles.headingFont}", sans-serif`;

    return `:root {
  --font-body: ${fontFamily};
  --font-heading: ${headingFamily};
  --font-size-body: ${styles.bodyFontSize};
  --line-height: ${styles.lineHeight};
  --bg-color: ${styles.backgroundColor};
  --accent-color: ${styles.accentColor};
  --text-color: ${styles.textColor};
  --content-width: ${styles.contentWidth}px;
  --block-gap: ${styles.blockGap};
}`;
  }, [styles]);

  const handleCopyCSS = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateCSS());
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      // Fallback if clipboard API is unavailable
    }
  }, [generateCSS]);

  return (
    <div className="space-y-6 p-4">
      {/* ─── Typography ──────────────────────────────── */}
      <div>
        <SectionHeader>Typography</SectionHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Body Font</Label>
            <Select
              value={styles.bodyFont}
              onValueChange={(v) => updateStyle("bodyFont", v)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Heading Font</Label>
            <Select
              value={styles.headingFont}
              onValueChange={(v) => updateStyle("headingFont", v)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Body Size</Label>
            <Select
              value={styles.bodyFontSize}
              onValueChange={(v) => updateStyle("bodyFontSize", v)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Line Height</Label>
            <Select
              value={styles.lineHeight}
              onValueChange={(v) => updateStyle("lineHeight", v)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LINE_HEIGHT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ─── Colors ──────────────────────────────────── */}
      <div className="border-t border-gray-800 pt-5">
        <SectionHeader>Colors</SectionHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Background</Label>
            <div className="flex gap-2">
              {BG_COLORS.map((c) => (
                <ColorSwatch
                  key={c.value}
                  color={c.value}
                  label={c.label}
                  selected={styles.backgroundColor === c.value}
                  onClick={() => updateStyle("backgroundColor", c.value)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Accent Color</Label>
            <div className="flex gap-2">
              {ACCENT_COLORS.map((c) => (
                <ColorSwatch
                  key={c.value}
                  color={c.value}
                  label={c.label}
                  selected={styles.accentColor === c.value}
                  onClick={() => updateStyle("accentColor", c.value)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Text Color</Label>
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded border border-gray-700"
                style={{ backgroundColor: styles.textColor }}
              />
              <span className="text-xs text-gray-500">
                Auto ({styles.textColor === "#ffffff" ? "White" : "Black"})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Spacing ─────────────────────────────────── */}
      <div className="border-t border-gray-800 pt-5">
        <SectionHeader>Spacing</SectionHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-400">Content Width</Label>
              <span className="text-[10px] text-gray-500">
                {styles.contentWidth}px
              </span>
            </div>
            <input
              type="range"
              min={640}
              max={960}
              step={10}
              value={styles.contentWidth}
              onChange={(e) =>
                updateStyle("contentWidth", Number(e.target.value))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-800 accent-[#39FF14]"
            />
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>640px</span>
              <span>960px</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Block Gap</Label>
            <Select
              value={styles.blockGap}
              onValueChange={(v) => updateStyle("blockGap", v)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GAP_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ─── Export ───────────────────────────────────── */}
      <div className="border-t border-gray-800 pt-5">
        <SectionHeader>Export</SectionHeader>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={handleCopyCSS}
        >
          {copyFeedback ? (
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <circle cx="7" cy="7" r="6" stroke="#22c55e" strokeWidth="1.5" />
                <path
                  d="M4.5 7L6.5 9L9.5 5"
                  stroke="#22c55e"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Copied!
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <rect
                  x="4.5"
                  y="4.5"
                  width="7"
                  height="8"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M9.5 4.5V3A1.5 1.5 0 0 0 8 1.5H3A1.5 1.5 0 0 0 1.5 3v5A1.5 1.5 0 0 0 3 9.5h1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
              Copy CSS Variables
            </span>
          )}
        </Button>

        {/* Preview */}
        <div className="mt-3 rounded-lg border border-gray-800 bg-gray-950 p-3">
          <pre className="overflow-x-auto text-[10px] leading-relaxed text-gray-500">
            {generateCSS()}
          </pre>
        </div>
      </div>
    </div>
  );
}
