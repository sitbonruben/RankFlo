"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor-store";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@rankflo/ui";
import { TEMPLATES, type Template } from "../templates/index";
import { TemplatePreview } from "./template-preview";

// ─── Category Filter ────────────────────────────────────
type CategoryFilter = "all" | "general" | "technical" | "marketing";

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "All",
  general: "General",
  technical: "Technical",
  marketing: "Marketing",
};

function countBlocks(template: Template): number {
  let count = 0;
  const walk = (blocks: unknown[]) => {
    for (const block of blocks) {
      count++;
      const b = block as Record<string, unknown>;
      const props = b.props as Record<string, unknown> | undefined;
      if (props) {
        if (Array.isArray(props.leftChildren)) walk(props.leftChildren);
        if (Array.isArray(props.rightChildren)) walk(props.rightChildren);
      }
    }
  };
  walk(template.document.blocks);
  return count;
}

// ─── Template Card ──────────────────────────────────────
function TemplateCard({
  template,
  onApply,
}: {
  template: Template;
  onApply: (template: Template) => void;
}) {
  const blockCount = React.useMemo(() => countBlocks(template), [template]);

  return (
    <div className="group relative rounded-xl border border-gray-800 bg-gray-950 transition-all duration-200 hover:border-[#39FF14]/40 hover:shadow-[0_0_20px_rgba(57,255,20,0.08)]">
      {/* Block count badge */}
      <div className="absolute right-3 top-3 z-10 rounded-full bg-gray-900/90 px-2 py-0.5 text-[10px] font-medium text-gray-400 backdrop-blur-sm">
        {blockCount} blocks
      </div>

      {/* Preview area */}
      <div className="p-3">
        <TemplatePreview document={template.document} />
      </div>

      {/* Info area */}
      <div className="border-t border-gray-800 p-3">
        <div className="mb-1 flex items-center gap-2">
          <h4 className="text-sm font-medium text-white">{template.name}</h4>
          <span className="rounded-md bg-gray-800 px-1.5 py-0.5 text-[10px] capitalize text-gray-500">
            {template.category}
          </span>
        </div>
        <p className="mb-3 text-[11px] leading-relaxed text-gray-500">
          {template.description}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs transition-colors group-hover:border-[#39FF14]/30 group-hover:text-[#39FF14]"
          onClick={() => onApply(template)}
        >
          Use Template
        </Button>
      </div>
    </div>
  );
}

// ─── Template Gallery ───────────────────────────────────
export function TemplateGallery() {
  const { document, applyTemplate } = useEditorStore();
  const [pendingTemplate, setPendingTemplate] =
    React.useState<Template | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [category, setCategory] = React.useState<CategoryFilter>("all");

  const filteredTemplates = React.useMemo(() => {
    if (category === "all") return TEMPLATES;
    return TEMPLATES.filter((t) => t.category === category);
  }, [category]);

  const handleApply = React.useCallback(
    (template: Template) => {
      // If document has blocks, ask for confirmation first
      if (document.blocks.length > 0) {
        setPendingTemplate(template);
        setConfirmOpen(true);
      } else {
        applyTemplate(template.document);
      }
    },
    [document.blocks.length, applyTemplate]
  );

  const handleConfirm = React.useCallback(() => {
    if (pendingTemplate) {
      applyTemplate(pendingTemplate.document);
    }
    setConfirmOpen(false);
    setPendingTemplate(null);
  }, [pendingTemplate, applyTemplate]);

  const handleCancel = React.useCallback(() => {
    setConfirmOpen(false);
    setPendingTemplate(null);
  }, []);

  return (
    <div className="p-3">
      <p className="mb-3 px-1 text-[11px] text-gray-500">
        Choose a template to get started quickly. Your current content will be
        replaced.
      </p>

      {/* Category Filter Pills */}
      <div className="mb-4 flex flex-wrap gap-1.5 px-1">
        {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((cat) => {
          const isActive = category === cat;
          const count =
            cat === "all"
              ? TEMPLATES.length
              : TEMPLATES.filter((t) => t.category === cat).length;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                isActive
                  ? "bg-[#39FF14]/10 text-[#39FF14] ring-1 ring-[#39FF14]/30"
                  : "bg-gray-900 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
              }`}
            >
              {CATEGORY_LABELS[cat]}
              <span
                className={`text-[10px] ${
                  isActive ? "text-[#39FF14]/60" : "text-gray-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Template Grid */}
      <div className="space-y-3">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onApply={handleApply}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-xs text-gray-600">No templates in this category.</p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace current content?</DialogTitle>
            <DialogDescription>
              Your current blocks will be replaced with the{" "}
              <span className="font-medium text-white">
                {pendingTemplate?.name}
              </span>{" "}
              template. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="primary" onClick={handleConfirm}>
              Replace Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
