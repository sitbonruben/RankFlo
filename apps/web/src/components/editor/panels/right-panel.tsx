"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor-store";
import { trpc } from "@/trpc/client";
import {
  Input,
  Label,
  Switch,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
} from "@rankflo/ui";
import {
  BLOCK_META,
  type BlockType,
  type BlockPropsMap,
} from "@rankflo/core/types";
import { computeSeoScore, slugify, type SeoCheck } from "@/lib/seo-utils";
import { BlockTypeIcon } from "../dnd-provider";
import { AlignmentPicker, SizeSelect, SpacingSelect } from "./style-controls";
import { InternalLinksPanel } from "./internal-links-panel";

// ─── Collapsible Section ────────────────────────────────
function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-gray-800">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-gray-900/50"
      >
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </h4>
        {/* Chevron icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`text-gray-600 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
        >
          <path
            d="M3.5 5.5L7 9L10.5 5.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Field Wrapper ──────────────────────────────────────
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-400">{label}</Label>
      {children}
    </div>
  );
}

// ─── Score Gauge (compact) ──────────────────────────────
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
    <div className="flex justify-center py-3">
      <div className="relative h-[120px] w-[120px]">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
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
        <path d="M4.5 7L6.5 9L9.5 5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    warning: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1.5L13 12.5H1L7 1.5Z" stroke="#eab308" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 6V8.5M7 10V10.5" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    fail: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#ef4444" strokeWidth="1.5" />
        <path d="M5 5L9 9M9 5L5 9" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
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

// ─── Post Settings Content ──────────────────────────────
function PostSettingsContent() {
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
    projectId,
    setProjectId,
  } = useEditorStore();

  // Load org projects for the project selector
  const { data: projectsData } = trpc.project.list.useQuery(
    { page: 1, pageSize: 50 },
    { staleTime: 60_000 },
  );

  const [tagsInput, setTagsInput] = React.useState(tagIds.join(", "));
  const [scheduledDate, setScheduledDate] = React.useState("");

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
    <div className="space-y-4">
      {/* Project */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-400">Project</Label>
        <Select
          value={projectId ?? "none"}
          onValueChange={(v) => setProjectId(v === "none" ? null : v)}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Select a project…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="flex items-center gap-2 text-gray-400">
                <span className="h-2 w-2 rounded-full bg-gray-500" />
                No project
              </span>
            </SelectItem>
            {projectsData?.items.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#39FF14]" />
                  {p.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!projectId && (
          <p className="text-[10px] text-yellow-500/80">⚠ Select a project to enable publishing</p>
        )}
      </div>

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

      {/* Scheduled Date */}
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
        <p className="text-[10px] text-gray-600">Separate tags with commas</p>
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
                    <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
            <img src={featuredImage} alt="Featured" className="h-[100px] w-full object-cover" />
          </div>
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

// ─── SEO Content ────────────────────────────────────────
function SeoContent() {
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
    <div className="space-y-4">
      {/* Score Gauge */}
      <ScoreGauge score={result.score} />

      {/* Checks */}
      <div className="space-y-0.5">
        {result.checks.map((check) => (
          <CheckItem key={check.id} check={check} />
        ))}
      </div>

      {/* Meta Fields */}
      <div className="space-y-3 border-t border-gray-800 pt-4">
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
              <img src={ogImage} alt="OG preview" className="h-[80px] w-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Block Properties Content ───────────────────────────
function BlockPropertiesContent() {
  const { selectedBlockId, document, updateBlock } = useEditorStore();

  const block = React.useMemo(() => {
    if (!selectedBlockId) return null;
    return document.blocks.find((b) => b.id === selectedBlockId) ?? null;
  }, [selectedBlockId, document.blocks]);

  if (!block) return null;

  const props = block.props as Record<string, unknown>;
  const update = (newProps: Partial<BlockPropsMap[BlockType]>) => {
    updateBlock(block.id, newProps);
  };

  return (
    <div className="space-y-3">{renderFields(block.type, props, update)}</div>
  );
}

// ─── Quick Actions Bar ──────────────────────────────────
function QuickActions() {
  const { selectedBlockId, document, duplicateBlock, removeBlock, moveBlock } =
    useEditorStore();

  if (!selectedBlockId) return null;

  const blockIndex = document.blocks.findIndex(
    (b) => b.id === selectedBlockId
  );
  const canMoveUp = blockIndex > 0;
  const canMoveDown = blockIndex < document.blocks.length - 1;

  return (
    <div className="flex items-center gap-1">
      {/* Move Up */}
      <button
        type="button"
        title="Move up"
        disabled={!canMoveUp}
        onClick={() => canMoveUp && moveBlock(blockIndex, blockIndex - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-800 bg-gray-950 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 3L3 7.5M7 3L11 7.5M7 3V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {/* Move Down */}
      <button
        type="button"
        title="Move down"
        disabled={!canMoveDown}
        onClick={() => canMoveDown && moveBlock(blockIndex, blockIndex + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-800 bg-gray-950 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 11L3 6.5M7 11L11 6.5M7 11V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {/* Duplicate */}
      <button
        type="button"
        title="Duplicate"
        onClick={() => duplicateBlock(selectedBlockId)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-800 bg-gray-950 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 4.5V2.5C9.5 1.67 8.83 1 8 1H2.5C1.67 1 1 1.67 1 2.5V8C1 8.83 1.67 9.5 2.5 9.5H4.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {/* Delete */}
      <button
        type="button"
        title="Delete"
        onClick={() => removeBlock(selectedBlockId)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-800 bg-gray-950 text-red-400 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 4H11.5M5.5 6.5V10M8.5 6.5V10M3.5 4L4 12C4 12.55 4.45 13 5 13H9C9.55 13 10 12.55 10 12L10.5 4M5 4V2C5 1.45 5.45 1 6 1H8C8.55 1 9 1.45 9 2V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

// ─── Right Panel (Main Export) ──────────────────────────
export function RightPanel() {
  const { selectedBlockId, selectBlock, document } = useEditorStore();

  const selectedBlock = React.useMemo(() => {
    if (!selectedBlockId) return null;
    return document.blocks.find((b) => b.id === selectedBlockId) ?? null;
  }, [selectedBlockId, document.blocks]);

  const meta = selectedBlock
    ? BLOCK_META.find((m) => m.type === selectedBlock.type)
    : null;

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-gray-800 bg-black">
      {/* ─── Block Selected Mode ─────────────────────── */}
      {selectedBlock ? (
        <>
          {/* Block Header */}
          <div className="border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#39FF14]/10">
                  <BlockTypeIcon
                    type={selectedBlock.type}
                    className="h-4 w-4 text-[#39FF14]"
                  />
                </div>
                <span className="text-sm font-medium text-white">
                  {meta?.label ?? selectedBlock.type}
                </span>
              </div>
              {/* Close / Deselect button */}
              <button
                type="button"
                title="Deselect block"
                onClick={() => selectBlock(null)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Block Properties */}
          <div className="flex-1 overflow-y-auto">
            <CollapsibleSection title="Properties" defaultOpen={true}>
              <BlockPropertiesContent />
            </CollapsibleSection>

            <CollapsibleSection title="Quick Actions" defaultOpen={true}>
              <QuickActions />
            </CollapsibleSection>
          </div>

          {/* Deselect footer */}
          <div className="border-t border-gray-800 p-3">
            <button
              type="button"
              onClick={() => selectBlock(null)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-400 transition-colors hover:border-gray-700 hover:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Deselect Block
            </button>
          </div>
        </>
      ) : (
        /* ─── No Block Selected Mode ─────────────────── */
        <div className="flex-1 overflow-y-auto">
          <CollapsibleSection title="Post Settings" defaultOpen={true}>
            <PostSettingsContent />
          </CollapsibleSection>

          <CollapsibleSection title="SEO" defaultOpen={true}>
            <SeoContent />
          </CollapsibleSection>

          <CollapsibleSection title="Internal Links" defaultOpen={false}>
            <InternalLinksPanel />
          </CollapsibleSection>
        </div>
      )}
    </aside>
  );
}

// ─── Render Fields by Block Type ────────────────────────
function renderFields(
  type: BlockType,
  props: Record<string, unknown>,
  update: (p: Record<string, unknown>) => void
) {
  switch (type) {
    case "hero":
      return (
        <>
          <Field label="Title">
            <Input
              value={(props.title as string) || ""}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Hero title"
              className="h-9 text-xs"
            />
          </Field>
          <Field label="Subtitle">
            <Input
              value={(props.subtitle as string) || ""}
              onChange={(e) => update({ subtitle: e.target.value })}
              placeholder="Hero subtitle"
              className="h-9 text-xs"
            />
          </Field>
          <Field label="Overlay">
            <Select
              value={(props.overlay as string) || "none"}
              onValueChange={(v) => update({ overlay: v })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Alignment">
            <AlignmentPicker
              value={(props.alignment as "left" | "center" | "right") || "center"}
              onChange={(v) => update({ alignment: v })}
            />
          </Field>
          <Field label="Height">
            <SizeSelect
              value={(props.height as string) || "medium"}
              onChange={(v) => update({ height: v })}
              options={[
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
                { value: "full", label: "Full Screen" },
              ]}
            />
          </Field>
          <Field label="Background Image URL">
            <Input
              value={(props.backgroundImage as string) || ""}
              onChange={(e) => update({ backgroundImage: e.target.value })}
              placeholder="https://..."
              className="h-9 text-xs"
            />
          </Field>
        </>
      );

    case "heading":
      return (
        <>
          <Field label="Level">
            <Select
              value={String((props.level as number) || 2)}
              onValueChange={(v) => update({ level: Number(v) })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">H1</SelectItem>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
                <SelectItem value="4">H4</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Alignment">
            <AlignmentPicker
              value={(props.alignment as "left" | "center" | "right") || "left"}
              onChange={(v) => update({ alignment: v })}
            />
          </Field>
        </>
      );

    case "text":
      return (
        <Field label="Alignment">
          <AlignmentPicker
            value={(props.alignment as "left" | "center" | "right") || "left"}
            onChange={(v) => update({ alignment: v })}
          />
        </Field>
      );

    case "image":
      return (
        <>
          <Field label="Image URL">
            <Input
              value={(props.src as string) || ""}
              onChange={(e) => update({ src: e.target.value })}
              placeholder="https://..."
              className="h-9 text-xs"
            />
          </Field>
          {props.src && (
            <div className="rounded-lg border border-gray-800 overflow-hidden">
              <img
                src={props.src as string}
                alt={(props.alt as string) || ""}
                className="max-h-[120px] w-full object-cover"
              />
            </div>
          )}
          <Field label="Alt Text">
            <Input
              value={(props.alt as string) || ""}
              onChange={(e) => update({ alt: e.target.value })}
              placeholder="Describe the image"
              className="h-9 text-xs"
            />
          </Field>
          <Field label="Caption">
            <Input
              value={(props.caption as string) || ""}
              onChange={(e) => update({ caption: e.target.value })}
              placeholder="Image caption"
              className="h-9 text-xs"
            />
          </Field>
          <Field label="Width">
            <SizeSelect
              value={(props.width as string) || "large"}
              onChange={(v) => update({ width: v })}
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 px-3 py-2">
            <Label className="text-xs text-gray-400">Rounded</Label>
            <Switch
              checked={Boolean(props.rounded)}
              onCheckedChange={(v) => update({ rounded: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 px-3 py-2">
            <Label className="text-xs text-gray-400">Shadow</Label>
            <Switch
              checked={Boolean(props.shadow)}
              onCheckedChange={(v) => update({ shadow: v })}
            />
          </div>
        </>
      );

    case "quote":
      return (
        <Field label="Style">
          <Select
            value={(props.style as string) || "bordered"}
            onValueChange={(v) => update({ style: v })}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="bordered">Bordered</SelectItem>
              <SelectItem value="highlighted">Highlighted</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      );

    case "code":
      return (
        <>
          <Field label="Language">
            <Input
              value={(props.language as string) || ""}
              onChange={(e) => update({ language: e.target.value })}
              placeholder="typescript, python, etc."
              className="h-9 text-xs"
            />
          </Field>
          <Field label="Filename">
            <Input
              value={(props.filename as string) || ""}
              onChange={(e) => update({ filename: e.target.value })}
              placeholder="index.ts"
              className="h-9 text-xs"
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 px-3 py-2">
            <Label className="text-xs text-gray-400">Line Numbers</Label>
            <Switch
              checked={Boolean(props.showLineNumbers)}
              onCheckedChange={(v) => update({ showLineNumbers: v })}
            />
          </div>
        </>
      );

    case "callout":
      return (
        <>
          <Field label="Type">
            <Select
              value={(props.type as string) || "info"}
              onValueChange={(v) => update({ type: v })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Title">
            <Input
              value={(props.title as string) || ""}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Callout title"
              className="h-9 text-xs"
            />
          </Field>
        </>
      );

    case "divider":
      return (
        <>
          <Field label="Style">
            <Select
              value={(props.style as string) || "line"}
              onValueChange={(v) => update({ style: v })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="dots">Dots</SelectItem>
                <SelectItem value="space">Space</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Spacing">
            <SpacingSelect
              value={(props.spacing as string) || "medium"}
              onChange={(v) => update({ spacing: v })}
            />
          </Field>
        </>
      );

    case "two-column":
      return (
        <Field label="Column Ratio">
          <Select
            value={(props.ratio as string) || "50-50"}
            onValueChange={(v) => update({ ratio: v })}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50-50">50 / 50</SelectItem>
              <SelectItem value="60-40">60 / 40</SelectItem>
              <SelectItem value="40-60">40 / 60</SelectItem>
              <SelectItem value="70-30">70 / 30</SelectItem>
              <SelectItem value="30-70">30 / 70</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      );

    case "list":
      return (
        <Field label="Style">
          <Select
            value={(props.style as string) || "bullet"}
            onValueChange={(v) => update({ style: v })}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bullet">Bullet</SelectItem>
              <SelectItem value="number">Numbered</SelectItem>
              <SelectItem value="check">Checklist</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      );

    case "embed":
      return (
        <>
          <Field label="URL">
            <Input
              value={(props.url as string) || ""}
              onChange={(e) => update({ url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className="h-9 text-xs"
            />
          </Field>
          <Field label="Type">
            <Select
              value={(props.type as string) || "generic"}
              onValueChange={(v) => update({ type: v })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="generic">Generic</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </>
      );

    case "table-of-contents":
      return (
        <>
          <Field label="Style">
            <Select
              value={(props.style as string) || "minimal"}
              onValueChange={(v) => update({ style: v })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="boxed">Boxed</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Max Depth">
            <Select
              value={String((props.maxDepth as number) || 3)}
              onValueChange={(v) => update({ maxDepth: Number(v) })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">H2 only</SelectItem>
                <SelectItem value="3">H2 - H3</SelectItem>
                <SelectItem value="4">H2 - H4</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </>
      );

    case "newsletter-cta":
      return (
        <>
          <Field label="Title">
            <Input
              value={(props.title as string) || ""}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Stay Updated"
              className="h-9 text-xs"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={(props.description as string) || ""}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Subscribe description"
              className="min-h-[60px] text-xs"
            />
          </Field>
          <Field label="Button Text">
            <Input
              value={(props.buttonText as string) || ""}
              onChange={(e) => update({ buttonText: e.target.value })}
              placeholder="Subscribe"
              className="h-9 text-xs"
            />
          </Field>
          <Field label="Style">
            <Select
              value={(props.style as string) || "card"}
              onValueChange={(v) => update({ style: v })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </>
      );

    case "author-bio":
      return (
        <>
          <Field label="Name">
            <Input
              value={(props.name as string) || ""}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Author name"
              className="h-9 text-xs"
            />
          </Field>
          <Field label="Avatar URL">
            <Input
              value={(props.avatar as string) || ""}
              onChange={(e) => update({ avatar: e.target.value })}
              placeholder="https://..."
              className="h-9 text-xs"
            />
          </Field>
          <Field label="Bio">
            <Textarea
              value={(props.bio as string) || ""}
              onChange={(e) => update({ bio: e.target.value })}
              placeholder="A short author bio"
              className="min-h-[80px] text-xs"
            />
          </Field>
        </>
      );

    default:
      return (
        <p className="text-xs text-gray-500">
          No editable properties for this block type.
        </p>
      );
  }
}
