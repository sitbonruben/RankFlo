"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { computeSeoScore } from "@/lib/seo-utils";

export function useSeoScore() {
  const title = useEditorStore((s) => s.title);
  const slug = useEditorStore((s) => s.slug);
  const excerpt = useEditorStore((s) => s.excerpt);
  const metaTitle = useEditorStore((s) => s.metaTitle);
  const metaDescription = useEditorStore((s) => s.metaDescription);
  const featuredImage = useEditorStore((s) => s.featuredImage);
  const ogImage = useEditorStore((s) => s.ogImage);
  const blocks = useEditorStore((s) => s.document.blocks);

  const result = useMemo(
    () =>
      computeSeoScore({
        title,
        slug,
        excerpt,
        metaTitle,
        metaDescription,
        featuredImage,
        ogImage,
        blocks,
      }),
    [title, slug, excerpt, metaTitle, metaDescription, featuredImage, ogImage, blocks],
  );

  return { score: result.score, checks: result.checks };
}
