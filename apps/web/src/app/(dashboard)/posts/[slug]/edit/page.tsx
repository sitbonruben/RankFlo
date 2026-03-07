"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { useEditorStore } from "@/stores/editor-store";
import { EditorLayout } from "@/components/editor/editor-layout";
import { useEffect } from "react";
import type { EditorDocument } from "@rankflo/core/types";

export default function EditPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const hydrate = useEditorStore((s) => s.hydrate);

  const { data: post, isLoading } = trpc.post.getBySlug.useQuery({
    slug,
    locale: "en",
  });

  useEffect(() => {
    if (post) {
      hydrate({
        postId: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        featuredImage: post.featuredImage || "",
        status: post.status as "DRAFT" | "REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED",
        content: post.content as EditorDocument,
        tagIds:
          post.tags
            ?.map((t: { tag?: { id: string } | null; tagId: string }) =>
              t.tag?.id || t.tagId,
            )
            .filter(Boolean) || [],
        locale: post.locale,
        metaTitle: post.seoMeta?.metaTitle || "",
        metaDescription: post.seoMeta?.metaDescription || "",
        ogImage: post.seoMeta?.ogImage || "",
      });
    }
  }, [post, hydrate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-800 border-t-white" />
      </div>
    );
  }

  return <EditorLayout />;
}
