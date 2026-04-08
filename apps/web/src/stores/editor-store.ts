"use client";

import { create } from "zustand";
import { temporal } from "zundo";
import type {
  BlockType,
  EditorBlock,
  EditorDocument,
} from "@rankflo/core/types";
import {
  createBlock,
  createEmptyDocument,
} from "@/lib/editor-utils";

// ─── Store State ───────────────────────────────────────
interface EditorState {
  // Document
  document: EditorDocument;
  postId: string | null;
  projectId: string | null;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  status: "DRAFT" | "REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  tagIds: string[];
  locale: string;

  // SEO meta
  metaTitle: string;
  metaDescription: string;
  ogImage: string;

  // UI state
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  isAiWriting: boolean;
  lastSavedAt: Date | null;
  rightPanelOpen: boolean;

  // Actions
  setDocument: (doc: EditorDocument) => void;
  setTitle: (title: string) => void;
  setSlug: (slug: string) => void;
  setExcerpt: (excerpt: string) => void;
  setFeaturedImage: (url: string) => void;
  setStatus: (status: EditorState["status"]) => void;
  setTagIds: (ids: string[]) => void;
  setMetaTitle: (title: string) => void;
  setMetaDescription: (desc: string) => void;
  setOgImage: (url: string) => void;
  setPostId: (id: string) => void;
  setProjectId: (id: string | null) => void;
  setIsSaving: (saving: boolean) => void;
  setIsAiWriting: (writing: boolean) => void;
  setLastSavedAt: (date: Date) => void;
  markClean: () => void;
  setRightPanelOpen: (open: boolean) => void;

  // Block actions
  addBlock: (type: BlockType, index?: number) => void;
  addBlockData: (block: EditorBlock, index?: number) => void;
  updateBlock: (id: string, props: Partial<EditorBlock["props"]>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  duplicateBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  hoverBlock: (id: string | null) => void;

  // Template
  applyTemplate: (doc: EditorDocument) => void;

  // Hydrate from API
  hydrate: (data: {
    postId: string;
    projectId?: string | null;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string;
    status: EditorState["status"];
    content: EditorDocument;
    tagIds: string[];
    locale: string;
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  }) => void;

  // Reset
  reset: () => void;
}

// ─── Initial State ─────────────────────────────────────
const initialState = {
  document: createEmptyDocument(),
  postId: null,
  projectId: null,
  title: "",
  slug: "",
  excerpt: "",
  featuredImage: "",
  status: "DRAFT" as const,
  tagIds: [],
  locale: "en",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  selectedBlockId: null,
  hoveredBlockId: null,
  isDirty: false,
  isSaving: false,
  isAiWriting: false,
  lastSavedAt: null,
  rightPanelOpen: true,
};

// ─── Store ─────────────────────────────────────────────
export const useEditorStore = create<EditorState>()(
  temporal(
    (set, get) => ({
      ...initialState,

      // Document
      setDocument: (doc) => set({ document: doc, isDirty: true }),
      setTitle: (title) => set({ title, isDirty: true }),
      setSlug: (slug) => set({ slug, isDirty: true }),
      setExcerpt: (excerpt) => set({ excerpt, isDirty: true }),
      setFeaturedImage: (url) => set({ featuredImage: url, isDirty: true }),
      setStatus: (status) => set({ status, isDirty: true }),
      setTagIds: (ids) => set({ tagIds: ids, isDirty: true }),
      setMetaTitle: (title) => set({ metaTitle: title, isDirty: true }),
      setMetaDescription: (desc) => set({ metaDescription: desc, isDirty: true }),
      setOgImage: (url) => set({ ogImage: url, isDirty: true }),
      setPostId: (id) => set({ postId: id }),
      setProjectId: (id) => set({ projectId: id }),
      setIsSaving: (saving) => set({ isSaving: saving }),
      setIsAiWriting: (writing) => set({ isAiWriting: writing }),
      setLastSavedAt: (date) => set({ lastSavedAt: date }),
      markClean: () => set({ isDirty: false }),
      setRightPanelOpen: (open) => set({ rightPanelOpen: open }),

      // Block CRUD
      addBlock: (type, index) => {
        const block = createBlock(type);
        const blocks = [...get().document.blocks];
        const insertAt = index !== undefined ? index : blocks.length;
        blocks.splice(insertAt, 0, block);
        set({
          document: { ...get().document, blocks },
          isDirty: true,
          selectedBlockId: block.id,
        });
      },

      addBlockData: (block, index) => {
        const blocks = [...get().document.blocks];
        const insertAt = index !== undefined ? index : blocks.length;
        blocks.splice(insertAt, 0, block);
        set({
          document: { ...get().document, blocks },
          isDirty: true,
          selectedBlockId: block.id,
        });
      },

      updateBlock: (id, props) => {
        const blocks = get().document.blocks.map((b) =>
          b.id === id ? { ...b, props: { ...b.props, ...props } } : b,
        );
        set({ document: { ...get().document, blocks }, isDirty: true });
      },

      removeBlock: (id) => {
        const blocks = get().document.blocks.filter((b) => b.id !== id);
        const selectedBlockId =
          get().selectedBlockId === id ? null : get().selectedBlockId;
        set({
          document: { ...get().document, blocks },
          isDirty: true,
          selectedBlockId,
        });
      },

      moveBlock: (fromIndex, toIndex) => {
        const blocks = [...get().document.blocks];
        const [moved] = blocks.splice(fromIndex, 1);
        blocks.splice(toIndex, 0, moved);
        set({ document: { ...get().document, blocks }, isDirty: true });
      },

      duplicateBlock: (id) => {
        const blocks = [...get().document.blocks];
        const idx = blocks.findIndex((b) => b.id === id);
        if (idx === -1) return;
        const original = blocks[idx];
        const copy: EditorBlock = {
          ...structuredClone(original),
          id: createBlock(original.type).id,
        };
        blocks.splice(idx + 1, 0, copy);
        set({
          document: { ...get().document, blocks },
          isDirty: true,
          selectedBlockId: copy.id,
        });
      },

      selectBlock: (id) => set({ selectedBlockId: id }),
      hoverBlock: (id) => set({ hoveredBlockId: id }),

      // Template
      applyTemplate: (doc) =>
        set({
          document: doc,
          isDirty: true,
          selectedBlockId: null,
        }),

      // Hydrate
      hydrate: (data) => {
        // Validate content is a proper EditorDocument (has blocks array).
        // Posts seeded/imported with Tiptap JSONB format won't have blocks, so
        // we fall back to an empty document rather than crashing.
        const isValidDoc =
          data.content &&
          typeof data.content === "object" &&
          Array.isArray((data.content as EditorDocument).blocks);
        return set({
          postId: data.postId,
          projectId: data.projectId ?? null,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || "",
          featuredImage: data.featuredImage || "",
          status: data.status,
          document: isValidDoc ? data.content : createEmptyDocument(),
          tagIds: data.tagIds || [],
          locale: data.locale || "en",
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          ogImage: data.ogImage || "",
          isDirty: false,
          selectedBlockId: null,
          hoveredBlockId: null,
        });
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      // zundo config — only track document changes for undo/redo
      partialize: (state) => ({
        document: state.document,
        title: state.title,
      }),
      limit: 100,
    },
  ),
);
