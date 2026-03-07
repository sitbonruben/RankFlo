"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor-store";
import { computeSeoScore, slugify, type SeoCheck } from "@/lib/seo-utils";
import { Input, Textarea, Label, Button } from "@rankflo/ui";

// ─── Score Gauge ────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 70
      ? "#22c55e"
      : score >= 40
        ? "#eab308"
        : "#ef4444";

  return (
    <div className="flex justify-center py-4">
      <div className="relative h-[140px] w-[140px]">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-bold"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-[10px] text-gray-500">/ 100</span>
        </div>
      </div>
    </div>
  );
}

// ─── Check Item ─────────────────────────────────────────
function CheckItem({ check }: { check: SeoCheck }) {
  const icon = {
    pass: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#22c55e" strokeWidth="1.5" />
        <path
          d="M4.5 7L6.5 9L9.5 5"
          stroke="#22c55e"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    warning: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1.5L13 12.5H1L7 1.5Z"
          stroke="#eab308"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M7 6V8.5M7 10V10.5"
          stroke="#eab308"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    fail: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#ef4444" strokeWidth="1.5" />
        <path
          d="M5 5L9 9M9 5L5 9"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  };

  return (
    <div className="flex items-start gap-2 py-1.5">
      <div className="mt-0.5 shrink-0">{icon[check.status]}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-300">{check.label}</p>
        <p className="text-[11px] text-gray-500">{check.message}</p>
      </div>
    </div>
  );
}

// ─── SEO Panel ──────────────────────────────────────────
export function SeoPanel() {
  const {
    title,
    slug,
    excerpt,
    metaTitle,
    metaDescription,
    featuredImage,
    ogImage,
    document,
    setMetaTitle,
    setMetaDescription,
    setSlug,
    setOgImage,
  } = useEditorStore();

  const result = React.useMemo(
    () =>
      computeSeoScore({
        title,
        slug,
        excerpt,
        metaTitle,
        metaDescription,
        featuredImage,
        ogImage,
        blocks: document.blocks,
      }),
    [title, slug, excerpt, metaTitle, metaDescription, featuredImage, ogImage, document.blocks]
  );

  const metaTitleLen = (metaTitle || title).length;
  const metaDescLen = (metaDescription || excerpt).length;

  const handleAutoSlug = React.useCallback(() => {
    if (title) {
      setSlug(slugify(title));
    }
  }, [title, setSlug]);

  return (
    <div className="space-y-5 p-4">
      {/* Score Gauge */}
      <ScoreGauge score={result.score} />

      {/* Checks */}
      <div className="space-y-0.5 border-b border-gray-800 pb-4">
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Checks
        </h4>
        {result.checks.map((check) => (
          <CheckItem key={check.id} check={check} />
        ))}
      </div>

      {/* Meta Fields */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Meta Tags
        </h4>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">Meta Title</Label>
            <span
              className={`text-[10px] ${
                metaTitleLen >= 30 && metaTitleLen <= 60
                  ? "text-green-500"
                  : metaTitleLen > 60
                    ? "text-red-500"
                    : "text-gray-500"
              }`}
            >
              {metaTitleLen}/60
            </span>
          </div>
          <Input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder={title || "Meta title"}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">Meta Description</Label>
            <span
              className={`text-[10px] ${
                metaDescLen >= 120 && metaDescLen <= 160
                  ? "text-green-500"
                  : metaDescLen > 160
                    ? "text-red-500"
                    : "text-gray-500"
              }`}
            >
              {metaDescLen}/160
            </span>
          </div>
          <Textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder={excerpt || "Meta description"}
            className="min-h-[80px] text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">URL Slug</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1.5 text-[10px] text-gray-500 hover:text-white"
              onClick={handleAutoSlug}
            >
              Auto-generate
            </Button>
          </div>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-blog-post"
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-400">OG Image URL</Label>
          <Input
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            placeholder="https://..."
            className="h-9 text-xs"
          />
          {ogImage && (
            <div className="overflow-hidden rounded-lg border border-gray-800">
              <img
                src={ogImage}
                alt="OG preview"
                className="h-[80px] w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
