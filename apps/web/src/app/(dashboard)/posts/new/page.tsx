"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { EditorLayout } from "@/components/editor/editor-layout";

export default function NewPostPage() {
  const reset = useEditorStore((s) => s.reset);

  useEffect(() => {
    reset(); // Start fresh
  }, [reset]);

  return <EditorLayout />;
}
