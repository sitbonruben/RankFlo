"use client";

import * as React from "react";
import { useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { ImagePickerModal } from "@/components/image-picker-modal";
import {
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@rankflo/ui";

// ─── Post Settings Panel ────────────────────────────────
export function PostSettingsPanel() {
  const {
    status,
    setStatus,
    tagIds,
    setTagIds,
    featuredImage,
    setFeaturedImage,
    excerpt,
    setExcerpt,
    locale,
  } = useEditorStore();

  const [showImagePicker, setShowImagePicker] = useState<"search" | "generate" | null>(null);

  // Local state for locale since it's part of initial state but may not have a dedicated setter
  const store = useEditorStore();

  const [tagsInput, setTagsInput] = React.useState(tagIds.join(", "));
  const [scheduledDate, setScheduledDate] = React.useState("");

  // Sync tags input when tagIds change externally
  React.useEffect(() => {
    setTagsInput(tagIds.join(", "));
  }, [tagIds]);

  const handleTagsBlur = React.useCallback(() => {
    const newTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setTagIds(newTags);
  }, [tagsInput, setTagIds]);

  const handleTagsKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleTagsBlur();
      }
    },
    [handleTagsBlur]
  );

  const excerptLen = excerpt.length;

  return (
    <div className="space-y-5 p-4">
      {/* Status */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-400">Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-500" />
                Draft
              </span>
            </SelectItem>
            <SelectItem value="REVIEW">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                Review
              </span>
            </SelectItem>
            <SelectItem value="SCHEDULED">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Scheduled
              </span>
            </SelectItem>
            <SelectItem value="PUBLISHED">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Published
              </span>
            </SelectItem>
            <SelectItem value="ARCHIVED">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Archived
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Scheduled Date (conditional) */}
      {status === "SCHEDULED" && (
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-400">Scheduled Date</Label>
          <Input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      )}

      {/* Tags */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-400">Tags</Label>
        <Input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          onBlur={handleTagsBlur}
          onKeyDown={handleTagsKeyDown}
          placeholder="tag1, tag2, tag3"
          className="h-9 text-xs"
        />
        <p className="text-[10px] text-gray-600">
          Separate tags with commas
        </p>
        {tagIds.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tagIds.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-gray-800 px-2 py-0.5 text-[10px] text-gray-300"
              >
                {tag}
                <button
                  type="button"
                  className="text-gray-500 hover:text-white"
                  onClick={() => setTagIds(tagIds.filter((t) => t !== tag))}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path
                      d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Featured Image */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-400">Featured Image</Label>
        <Input
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
          placeholder="https://..."
          className="h-9 text-xs"
        />
        {featuredImage && (
          <div className="overflow-hidden rounded-lg border border-gray-800">
            <img
              src={featuredImage}
              alt="Featured"
              className="h-[100px] w-full object-cover"
            />
          </div>
        )}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setShowImagePicker("search")}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-800 px-2 py-1.5 text-[11px] text-gray-400 hover:bg-gray-900 hover:text-white transition-colors"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            Search free
          </button>
          <button
            type="button"
            onClick={() => setShowImagePicker("generate")}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-800 px-2 py-1.5 text-[11px] text-gray-400 hover:bg-gray-900 hover:text-white transition-colors"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
            Generate AI
          </button>
        </div>
        {showImagePicker && (
          <ImagePickerModal
            defaultTab={showImagePicker}
            onSelect={(url) => { setFeaturedImage(url); setShowImagePicker(null); }}
            onClose={() => setShowImagePicker(null)}
          />
        )}
      </div>

      {/* Excerpt */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-400">Excerpt</Label>
          <span
            className={`text-[10px] ${
              excerptLen > 500
                ? "text-red-500"
                : excerptLen > 0
                  ? "text-gray-500"
                  : "text-gray-600"
            }`}
          >
            {excerptLen}/500
          </span>
        </div>
        <Textarea
          value={excerpt}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              setExcerpt(e.target.value);
            }
          }}
          placeholder="A brief summary of your post"
          className="min-h-[80px] text-xs"
        />
      </div>

      {/* Locale */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-400">Locale</Label>
        <Select
          value={locale || "en"}
          onValueChange={(v) => {
            // The store doesn't expose a setLocale but we can use the hydrate approach
            // For now, just update via the store's internal state
            useEditorStore.setState({ locale: v });
          }}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
            <SelectItem value="pt">Portuguese</SelectItem>
            <SelectItem value="ja">Japanese</SelectItem>
            <SelectItem value="ko">Korean</SelectItem>
            <SelectItem value="zh">Chinese</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
