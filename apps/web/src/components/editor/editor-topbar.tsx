"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import Link from "next/link";
import { useEditorStore } from "@/stores/editor-store";
import { trpc } from "@/trpc/client";
import { slugify } from "@/lib/seo-utils";
import { blocksToHtml, blocksToPlainText } from "@/lib/editor-utils";
import { EditorPreview } from "@/components/editor/editor-preview";

// ─── Icons ──────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </svg>
  );
}

// ─── Status Badge ───────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  let dotColor = "bg-gray-500";
  let textColor = "text-gray-400";
  let label = "Draft";

  switch (status) {
    case "PUBLISHED":
      dotColor = "bg-green-500";
      textColor = "text-green-400";
      label = "Published";
      break;
    case "SCHEDULED":
      dotColor = "bg-blue-500";
      textColor = "text-blue-400";
      label = "Scheduled";
      break;
    case "REVIEW":
      dotColor = "bg-yellow-500";
      textColor = "text-yellow-400";
      label = "In Review";
      break;
    case "ARCHIVED":
      dotColor = "bg-red-500";
      textColor = "text-red-400";
      label = "Archived";
      break;
    default:
      break;
  }

  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium ${textColor}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}

// ─── Save Status ────────────────────────────────────────

function SaveStatus({
  isSaving,
  isDirty,
  lastSavedAt,
}: {
  isSaving: boolean;
  isDirty: boolean;
  lastSavedAt: Date | null;
}) {
  const [, setTick] = useState(0);

  // Re-render every 30s to update relative time
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (isSaving) {
    return <span className="text-xs text-gray-500">Saving...</span>;
  }

  if (isDirty) {
    return <span className="text-xs text-yellow-500/70">Unsaved changes</span>;
  }

  if (lastSavedAt) {
    const seconds = Math.floor(
      (Date.now() - lastSavedAt.getTime()) / 1000,
    );
    let timeAgo: string;
    if (seconds < 10) {
      timeAgo = "just now";
    } else if (seconds < 60) {
      timeAgo = `${seconds}s ago`;
    } else if (seconds < 3600) {
      timeAgo = `${Math.floor(seconds / 60)}m ago`;
    } else {
      timeAgo = `${Math.floor(seconds / 3600)}h ago`;
    }
    return (
      <span className="text-xs text-gray-600">Saved {timeAgo}</span>
    );
  }

  return null;
}

// ─── Derived content helper ──────────────────────────────

function computeDerivedContent(state: ReturnType<typeof useEditorStore.getState>) {
  const blocks = state.document?.blocks ?? [];
  const contentHtml = blocksToHtml(blocks);
  const contentPlain = blocksToPlainText(blocks);
  const wordCount = contentPlain.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  return { contentHtml, contentPlain, readingTime };
}

// ─── Editor Topbar ──────────────────────────────────────

export function EditorTopbar() {
  const title = useEditorStore((s) => s.title);
  const slug = useEditorStore((s) => s.slug);
  const status = useEditorStore((s) => s.status);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);
  const postId = useEditorStore((s) => s.postId);
  const setTitle = useEditorStore((s) => s.setTitle);
  const setSlug = useEditorStore((s) => s.setSlug);
  const setIsSaving = useEditorStore((s) => s.setIsSaving);
  const setLastSavedAt = useEditorStore((s) => s.setLastSavedAt);
  const setPostId = useEditorStore((s) => s.setPostId);
  const setStatus = useEditorStore((s) => s.setStatus);
  const markClean = useEditorStore((s) => s.markClean);

  // Track whether user has manually edited the slug
  const slugManuallyEdited = useRef(false);

  const createPost = trpc.post.create.useMutation();
  const updatePost = trpc.post.update.useMutation();

  // Auto-generate slug from title if slug hasn't been manually edited
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      if (!slugManuallyEdited.current) {
        setSlug(slugify(newTitle));
      }
    },
    [setTitle, setSlug],
  );

  const handleSlugChange = useCallback(
    (newSlug: string) => {
      slugManuallyEdited.current = true;
      setSlug(slugify(newSlug));
    },
    [setSlug],
  );

  // ─── Build common post payload ──────────────────────────
  function buildPayload(state: ReturnType<typeof useEditorStore.getState>, resolvedSlug: string) {
    const { contentHtml, contentPlain, readingTime } = computeDerivedContent(state);
    return {
      title: state.title,
      slug: resolvedSlug,
      content: state.document,
      contentHtml,
      contentPlain,
      readingTime,
      excerpt: state.excerpt || undefined,
      featuredImage: state.featuredImage || undefined,
      tagIds: state.tagIds.length > 0 ? state.tagIds : undefined,
      metaTitle: state.metaTitle || undefined,
      metaDescription: state.metaDescription || undefined,
      ogImage: state.ogImage || undefined,
    };
  }

  // ─── Save Draft ────────────────────────────────────────
  const handleSaveDraft = useCallback(async () => {
    const state = useEditorStore.getState();
    if (!state.title.trim()) return;

    const resolvedSlug = state.slug || slugify(state.title);
    setIsSaving(true);

    try {
      if (state.postId) {
        await updatePost.mutateAsync({
          id: state.postId,
          ...buildPayload(state, resolvedSlug),
          status: state.status,
        });
      } else {
        const result = await createPost.mutateAsync({
          ...buildPayload(state, resolvedSlug),
          status: "DRAFT",
          locale: state.locale,
        });
        setPostId(result.id);
        if (!state.slug) {
          setSlug(resolvedSlug);
        }
      }
      setLastSavedAt(new Date());
      markClean();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    createPost,
    updatePost,
    setIsSaving,
    setLastSavedAt,
    markClean,
    setPostId,
    setSlug,
  ]);

  // ─── Publish / Update ──────────────────────────────────
  // Always saves all current content + SEO meta atomically with status=PUBLISHED.
  // This ensures BugWizz (and any other consumer) immediately gets the latest content.
  const handlePublish = useCallback(async () => {
    const state = useEditorStore.getState();
    if (!state.title.trim()) return;

    const resolvedSlug = state.slug || slugify(state.title);
    setIsSaving(true);

    try {
      if (state.postId) {
        // Existing post: update all fields + publish in one call
        await updatePost.mutateAsync({
          id: state.postId,
          ...buildPayload(state, resolvedSlug),
          status: "PUBLISHED",
        });
      } else {
        // New post: create directly as published
        const result = await createPost.mutateAsync({
          ...buildPayload(state, resolvedSlug),
          status: "PUBLISHED",
          locale: state.locale,
        });
        setPostId(result.id);
        if (!state.slug) setSlug(resolvedSlug);
      }
      setStatus("PUBLISHED");
      setLastSavedAt(new Date());
      markClean();
    } catch (error) {
      console.error("Publish failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    createPost,
    updatePost,
    setIsSaving,
    setLastSavedAt,
    markClean,
    setPostId,
    setSlug,
    setStatus,
  ]);

  // ─── Undo/Redo state (reactive via useStore subscription) ────────────────
  const canUndo = useStore(useEditorStore.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(useEditorStore.temporal, (s) => s.futureStates.length > 0);

  const rightPanelOpen = useEditorStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useEditorStore((s) => s.setRightPanelOpen);

  const [showPreview, setShowPreview] = useState(false);
  const isPublished = status === "PUBLISHED";

  return (
    <>
    {showPreview && <EditorPreview onClose={() => setShowPreview(false)} />}
    <div className="flex h-14 w-full items-center border-b border-gray-800 bg-black px-4">
      {/* Left: Back + Title */}
      <div className="flex flex-1 items-center gap-3">
        <Link
          href="/posts"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-900 hover:text-white"
        >
          <ArrowLeftIcon />
        </Link>

        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled post"
          className="w-full max-w-md bg-transparent text-lg font-semibold text-white placeholder:text-gray-700 focus:outline-none"
        />
      </div>

      {/* Center: Status + Save status */}
      <div className="flex items-center gap-4">
        <StatusBadge status={status} />
        <SaveStatus
          isSaving={isSaving}
          isDirty={isDirty}
          lastSavedAt={lastSavedAt}
        />
      </div>

      {/* Right: Undo, Redo, Save, Publish/Update */}
      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => useEditorStore.temporal.getState().undo()}
          disabled={!canUndo}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          title="Undo"
        >
          <UndoIcon />
        </button>

        <button
          type="button"
          onClick={() => useEditorStore.temporal.getState().redo()}
          disabled={!canRedo}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          title="Redo"
        >
          <RedoIcon />
        </button>

        <div className="mx-1 h-5 w-px bg-gray-800" />

        {/* Right panel toggle */}
        <button
          type="button"
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            rightPanelOpen
              ? "bg-gray-800 text-white"
              : "text-gray-500 hover:bg-gray-900 hover:text-white"
          }`}
          title={rightPanelOpen ? "Hide settings panel" : "Show settings panel"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M15 3v18" />
          </svg>
        </button>

        {/* Preview — shows rendered output exactly as delivered to connected projects */}
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-700 px-3 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
          title="Preview content as delivered to connected projects"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview
        </button>

        {/* Save Draft — always available (saves current status, not PUBLISHED) */}
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isSaving}
          className="inline-flex h-8 items-center rounded-lg border border-gray-700 px-3 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save draft
        </button>

        {/* Publish / Update — saves everything + sets PUBLISHED */}
        <button
          type="button"
          onClick={handlePublish}
          disabled={isSaving || !title.trim()}
          className="inline-flex h-8 items-center rounded-lg bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPublished ? "Update" : "Publish"}
        </button>
      </div>
    </div>
    </>
  );
}
