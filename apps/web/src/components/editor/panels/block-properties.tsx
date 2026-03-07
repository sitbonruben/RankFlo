"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor-store";
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
} from "@rankflo/ui";
import {
  BLOCK_META,
  type BlockType,
  type BlockPropsMap,
} from "@rankflo/core/types";
import { BlockTypeIcon } from "../dnd-provider";
import { AlignmentPicker, SizeSelect, SpacingSelect } from "./style-controls";

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

// ─── Block Properties ───────────────────────────────────
export function BlockProperties() {
  const { selectedBlockId, document, updateBlock } = useEditorStore();

  const block = React.useMemo(() => {
    if (!selectedBlockId) return null;
    return document.blocks.find((b) => b.id === selectedBlockId) ?? null;
  }, [selectedBlockId, document.blocks]);

  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-800 bg-gray-900">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-gray-600"
          >
            <rect
              x="2"
              y="3"
              width="16"
              height="14"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M7 10H13M10 7V13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-400">No block selected</p>
          <p className="mt-0.5 text-xs text-gray-600">
            Select a block to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const meta = BLOCK_META.find((m) => m.type === block.type);
  const props = block.props as Record<string, unknown>;

  const update = (newProps: Partial<BlockPropsMap[BlockType]>) => {
    updateBlock(block.id, newProps);
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2">
        <BlockTypeIcon
          type={block.type}
          className="h-4 w-4 text-[#39FF14]"
        />
        <span className="text-sm font-medium text-white">
          {meta?.label ?? block.type}
        </span>
      </div>

      {/* Type-specific fields */}
      <div className="space-y-3">
        {renderFields(block.type, props, update)}
      </div>
    </div>
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
