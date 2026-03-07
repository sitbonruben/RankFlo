"use client";

import { DndProvider } from "@/components/editor/dnd-provider";
import { EditorTopbar } from "@/components/editor/editor-topbar";
import { EditorCanvas } from "@/components/editor/editor-canvas";
import { LeftPanel } from "@/components/editor/panels/left-panel";
import { RightPanel } from "@/components/editor/panels/right-panel";
import { useEditorShortcuts } from "@/hooks/use-editor-shortcuts";
import { useAutoSave } from "@/hooks/use-auto-save";

// ─── Editor Layout ──────────────────────────────────────

export function EditorLayout() {
  useEditorShortcuts();
  useAutoSave();

  return (
    <DndProvider>
      <div className="flex h-screen flex-col bg-black">
        <EditorTopbar />
        <div className="flex flex-1 overflow-hidden">
          <LeftPanel />
          <EditorCanvas />
          <RightPanel />
        </div>
      </div>
    </DndProvider>
  );
}
