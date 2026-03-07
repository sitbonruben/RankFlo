"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor-store";
import type { EditorBlock } from "@rankflo/core/types";

// ─── Helpers ────────────────────────────────────────────

/** Strip HTML tags and return plain text */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Count syllables in a word (simple approximation) */
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  let count = 0;
  const vowels = "aeiouy";
  let prevVowel = false;
  for (let i = 0; i < w.length; i++) {
    const isVowel = vowels.includes(w[i]);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  // Adjust for silent e
  if (w.endsWith("e") && count > 1) count--;
  return Math.max(1, count);
}

/** Extract all plain text content from blocks recursively */
function extractText(blocks: EditorBlock[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "text":
        parts.push(stripHtml((block.props as { html: string }).html));
        break;
      case "heading":
        parts.push((block.props as { text: string }).text);
        break;
      case "quote":
        parts.push((block.props as { text: string }).text);
        break;
      case "callout":
        parts.push((block.props as { text: string }).text);
        if ((block.props as { title?: string }).title) {
          parts.push((block.props as { title: string }).title);
        }
        break;
      case "hero":
        parts.push((block.props as { title: string }).title);
        if ((block.props as { subtitle?: string }).subtitle) {
          parts.push((block.props as { subtitle: string }).subtitle);
        }
        break;
      case "code":
        parts.push((block.props as { code: string }).code);
        break;
      case "list":
        parts.push(
          ((block.props as { items: string[] }).items || []).join(" "),
        );
        break;
      case "newsletter-cta":
        parts.push((block.props as { title: string }).title);
        parts.push((block.props as { description: string }).description);
        break;
      case "author-bio":
        parts.push((block.props as { bio: string }).bio);
        break;
      case "two-column": {
        const tcProps = block.props as {
          leftChildren: EditorBlock[];
          rightChildren: EditorBlock[];
        };
        parts.push(extractText(tcProps.leftChildren || []));
        parts.push(extractText(tcProps.rightChildren || []));
        break;
      }
    }
  }

  return parts.filter(Boolean).join(" ");
}

/** Count specific block types */
function countBlockType(blocks: EditorBlock[], type: string): number {
  let count = 0;
  for (const block of blocks) {
    if (block.type === type) count++;
    if (block.type === "two-column") {
      const props = block.props as {
        leftChildren: EditorBlock[];
        rightChildren: EditorBlock[];
      };
      count += countBlockType(props.leftChildren || [], type);
      count += countBlockType(props.rightChildren || [], type);
    }
  }
  return count;
}

/** Count links in HTML content */
function countLinks(blocks: EditorBlock[]): number {
  let count = 0;
  for (const block of blocks) {
    if (block.type === "text") {
      const html = (block.props as { html: string }).html;
      const matches = html.match(/<a\s/gi);
      if (matches) count += matches.length;
    }
    if (block.type === "embed") count++;
    if (block.type === "two-column") {
      const props = block.props as {
        leftChildren: EditorBlock[];
        rightChildren: EditorBlock[];
      };
      count += countLinks(props.leftChildren || []);
      count += countLinks(props.rightChildren || []);
    }
  }
  return count;
}

// ─── Content Analysis Hook ──────────────────────────────
function useContentAnalysis() {
  const blocks = useEditorStore((s) => s.document.blocks);

  return React.useMemo(() => {
    const text = extractText(blocks);
    const words = text
      .split(/\s+/)
      .filter((w) => w.length > 0);
    const wordCount = words.length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    // Sentence count (approximate)
    const sentences = text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const sentenceCount = Math.max(1, sentences.length);

    // Syllable count
    const totalSyllables = words.reduce(
      (sum, w) => sum + countSyllables(w),
      0,
    );

    // Flesch Reading Ease
    const flesch =
      wordCount > 0
        ? Math.round(
            206.835 -
              1.015 * (wordCount / sentenceCount) -
              84.6 * (totalSyllables / wordCount),
          )
        : 0;
    const fleschClamped = Math.max(0, Math.min(100, flesch));

    // Grade level (Flesch-Kincaid)
    const gradeLevel =
      wordCount > 0
        ? Math.max(
            1,
            Math.round(
              0.39 * (wordCount / sentenceCount) +
                11.8 * (totalSyllables / wordCount) -
                15.59,
            ),
          )
        : 0;

    const headingCount = countBlockType(blocks, "heading");
    const imageCount = countBlockType(blocks, "image");
    const linkCount = countLinks(blocks);
    const paragraphCount = countBlockType(blocks, "text");

    return {
      wordCount,
      readingTime,
      headingCount,
      imageCount,
      linkCount,
      paragraphCount,
      flesch: fleschClamped,
      gradeLevel,
    };
  }, [blocks]);
}

// ─── Stat Card ──────────────────────────────────────────
function MiniStat({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950 p-3">
      <div className="flex items-start justify-between">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-gray-500">
          {icon}
        </div>
        {badge && (
          <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-400">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

function ContentStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-800/50 bg-gray-950/50 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">{icon}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <span className="text-xs font-medium text-white">{value}</span>
    </div>
  );
}

// ─── Readability Badge ──────────────────────────────────
function ReadabilityBadge({ score }: { score: number }) {
  let label: string;
  let color: string;
  if (score >= 80) {
    label = "Very Easy";
    color = "#22c55e";
  } else if (score >= 60) {
    label = "Easy";
    color = "#39FF14";
  } else if (score >= 40) {
    label = "Moderate";
    color = "#eab308";
  } else if (score >= 20) {
    label = "Difficult";
    color = "#f97316";
  } else {
    label = "Very Difficult";
    color = "#ef4444";
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-[100px] w-[100px]">
        <svg viewBox="0 0 90 90" className="h-full w-full -rotate-90">
          <circle
            cx="45"
            cy="45"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="6"
          />
          <circle
            cx="45"
            cy="45"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <span className="text-[11px] font-medium" style={{ color }}>
        {label}
      </span>
    </div>
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

// ─── Analytics Panel ────────────────────────────────────
export function AnalyticsPanel() {
  const analysis = useContentAnalysis();

  return (
    <div className="space-y-6 p-4">
      {/* ─── Post Stats (Mock) ───────────────────────── */}
      <div>
        <SectionHeader>Post Performance</SectionHeader>
        <div className="grid grid-cols-2 gap-2">
          <MiniStat
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 2.5C4 2.5 1.5 7 1.5 7s2.5 4.5 5.5 4.5S13 7 13 7s-2.5-4.5-6-4.5z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <circle
                  cx="7"
                  cy="7"
                  r="1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            }
            label="Views"
            value="12,459"
            badge="+18%"
          />
          <MiniStat
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle
                  cx="7"
                  cy="7"
                  r="5.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M7 4v3.5l2 1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            label="Avg. Read Time"
            value="4.2 min"
          />
          <MiniStat
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1.5l1.7 3.45 3.8.55-2.75 2.68.65 3.77L7 10.15l-3.4 1.8.65-3.77L1.5 5.5l3.8-.55L7 1.5z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            }
            label="Engagement"
            value="67%"
          />
          <MiniStat
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M12 8.5A5.5 5.5 0 1 1 7 2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 2v3h-3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            label="Bounce Rate"
            value="23%"
          />
        </div>
        <p className="mt-2 text-center text-[10px] text-gray-600">
          Mock data -- connect analytics for real stats
        </p>
      </div>

      {/* ─── Content Analysis ────────────────────────── */}
      <div className="border-t border-gray-800 pt-5">
        <SectionHeader>Content Analysis</SectionHeader>
        <div className="space-y-1.5">
          <ContentStat
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect
                  x="1.5"
                  y="2"
                  width="9"
                  height="1.2"
                  rx="0.6"
                  fill="currentColor"
                />
                <rect
                  x="1.5"
                  y="5.4"
                  width="6"
                  height="1.2"
                  rx="0.6"
                  fill="currentColor"
                />
                <rect
                  x="1.5"
                  y="8.8"
                  width="7.5"
                  height="1.2"
                  rx="0.6"
                  fill="currentColor"
                />
              </svg>
            }
            label="Words"
            value={analysis.wordCount.toLocaleString()}
          />
          <ContentStat
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle
                  cx="6"
                  cy="6"
                  r="4.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M6 3.5v3l1.5 1"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            }
            label="Reading Time"
            value={`${analysis.readingTime} min`}
          />
          <ContentStat
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 3h8M2 6h5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
            label="Headings"
            value={analysis.headingCount}
          />
          <ContentStat
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect
                  x="1.5"
                  y="1.5"
                  width="9"
                  height="9"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M1.5 8l2.5-3 2 2.5 1.5-2L10.5 8"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            label="Images"
            value={analysis.imageCount}
          />
          <ContentStat
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M4 2.5l4 3.5-4 3.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            label="Links"
            value={analysis.linkCount}
          />
          <ContentStat
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect
                  x="1.5"
                  y="2"
                  width="9"
                  height="1"
                  rx="0.5"
                  fill="currentColor"
                />
                <rect
                  x="1.5"
                  y="4.5"
                  width="7"
                  height="1"
                  rx="0.5"
                  fill="currentColor"
                />
                <rect
                  x="1.5"
                  y="7"
                  width="8"
                  height="1"
                  rx="0.5"
                  fill="currentColor"
                />
                <rect
                  x="1.5"
                  y="9.5"
                  width="5"
                  height="1"
                  rx="0.5"
                  fill="currentColor"
                />
              </svg>
            }
            label="Paragraphs"
            value={analysis.paragraphCount}
          />
        </div>
      </div>

      {/* ─── Readability ─────────────────────────────── */}
      <div className="border-t border-gray-800 pt-5">
        <SectionHeader>Readability</SectionHeader>
        <div className="flex flex-col items-center rounded-lg border border-gray-800 bg-gray-950 p-4">
          <ReadabilityBadge score={analysis.flesch} />
          <p className="mt-2 text-[11px] text-gray-500">
            Flesch Reading Ease
          </p>
        </div>
        <div className="mt-2 rounded-lg border border-gray-800 bg-gray-950 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Grade Level</span>
            <span className="text-xs font-medium text-white">
              {analysis.wordCount > 0
                ? `Grade ${analysis.gradeLevel}`
                : "--"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
