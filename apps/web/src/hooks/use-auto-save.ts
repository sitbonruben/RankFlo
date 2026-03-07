"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { trpc } from "@/trpc/client";
import { blocksToHtml, blocksToPlainText } from "@/lib/editor-utils";
import { slugify } from "@/lib/seo-utils";

const AUTO_SAVE_DELAY = 3000; // 3 seconds

export function useAutoSave() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const postId = useEditorStore((s) => s.postId);
  const title = useEditorStore((s) => s.title);
  const slug = useEditorStore((s) => s.slug);
  const excerpt = useEditorStore((s) => s.excerpt);
  const featuredImage = useEditorStore((s) => s.featuredImage);
  const status = useEditorStore((s) => s.status);
  const tagIds = useEditorStore((s) => s.tagIds);
  const locale = useEditorStore((s) => s.locale);
  const document = useEditorStore((s) => s.document);
  const isDirty = useEditorStore((s) => s.isDirty);
  const setIsSaving = useEditorStore((s) => s.setIsSaving);
  const setLastSavedAt = useEditorStore((s) => s.setLastSavedAt);
  const markClean = useEditorStore((s) => s.markClean);
  const setPostId = useEditorStore((s) => s.setPostId);
  const setSlug = useEditorStore((s) => s.setSlug);

  const createPost = trpc.post.create.useMutation();
  const updatePost = trpc.post.update.useMutation();

  const save = useCallback(async () => {
    const currentTitle = useEditorStore.getState().title;
    const currentSlug = useEditorStore.getState().slug;
    const currentExcerpt = useEditorStore.getState().excerpt;
    const currentFeaturedImage = useEditorStore.getState().featuredImage;
    const currentStatus = useEditorStore.getState().status;
    const currentTagIds = useEditorStore.getState().tagIds;
    const currentLocale = useEditorStore.getState().locale;
    const currentDocument = useEditorStore.getState().document;
    const currentPostId = useEditorStore.getState().postId;

    if (!currentTitle.trim()) return;

    const resolvedSlug = currentSlug || slugify(currentTitle);
    const contentHtml = blocksToHtml(currentDocument.blocks);
    const contentPlain = blocksToPlainText(currentDocument.blocks);

    setIsSaving(true);

    try {
      if (currentPostId) {
        // Update existing post
        await updatePost.mutateAsync({
          id: currentPostId,
          title: currentTitle,
          slug: resolvedSlug,
          content: currentDocument,
          excerpt: currentExcerpt || undefined,
          featuredImage: currentFeaturedImage || undefined,
          status: currentStatus,
          tagIds: currentTagIds.length > 0 ? currentTagIds : undefined,
        });
      } else {
        // Create new post
        const result = await createPost.mutateAsync({
          title: currentTitle,
          slug: resolvedSlug,
          content: currentDocument,
          excerpt: currentExcerpt || undefined,
          featuredImage: currentFeaturedImage || undefined,
          status: currentStatus,
          locale: currentLocale,
          tagIds: currentTagIds.length > 0 ? currentTagIds : undefined,
        });

        // Store the new post ID for subsequent updates
        setPostId(result.id);

        // Set the slug if it was auto-generated
        if (!currentSlug) {
          setSlug(resolvedSlug);
        }
      }

      setLastSavedAt(new Date());
      markClean();
    } catch (error) {
      console.error("Auto-save failed:", error);
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

  // Watch isDirty and debounce the save
  useEffect(() => {
    if (!isDirty) return;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new debounce timer
    timerRef.current = setTimeout(() => {
      save();
    }, AUTO_SAVE_DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isDirty, title, slug, excerpt, featuredImage, status, tagIds, locale, document, save]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { save };
}
