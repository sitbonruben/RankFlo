"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/stores/editor-store";

export function useEditorShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // ─── Undo: Cmd+Z / Ctrl+Z ────────────────────────
      if (isMod && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        useEditorStore.temporal.getState().undo();
        return;
      }

      // ─── Redo: Cmd+Shift+Z / Ctrl+Shift+Z ────────────
      if (isMod && e.shiftKey && e.key === "z") {
        e.preventDefault();
        useEditorStore.temporal.getState().redo();
        return;
      }

      // ─── Save: Cmd+S / Ctrl+S ────────────────────────
      if (isMod && e.key === "s") {
        e.preventDefault();
        // Mark dirty to trigger auto-save immediately
        const state = useEditorStore.getState();
        if (!state.isDirty) {
          // Force a save by marking dirty -- the auto-save hook will pick it up
          useEditorStore.setState({ isDirty: true });
        }
        return;
      }

      // ─── Duplicate: Cmd+D / Ctrl+D ───────────────────
      if (isMod && e.key === "d") {
        e.preventDefault();
        const { selectedBlockId, duplicateBlock } = useEditorStore.getState();
        if (selectedBlockId) {
          duplicateBlock(selectedBlockId);
        }
        return;
      }

      // ─── Delete: Delete/Backspace (when not in text input) ──
      if (e.key === "Delete" || e.key === "Backspace") {
        const target = e.target as HTMLElement;
        const isTextInput =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest("[contenteditable]") !== null;

        if (!isTextInput) {
          const { selectedBlockId, removeBlock } = useEditorStore.getState();
          if (selectedBlockId) {
            e.preventDefault();
            removeBlock(selectedBlockId);
          }
        }
        return;
      }

      // ─── Escape: Deselect block ──────────────────────
      if (e.key === "Escape") {
        useEditorStore.getState().selectBlock(null);
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
