"use client";

import * as React from "react";
import { Input, Label, Button } from "@rankflo/ui";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@rankflo/ui";
import { useEditorStore } from "@/stores/editor-store";

// ─── Types ──────────────────────────────────────────────
interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface BrandingSettings {
  logoUrl: string;
  logoPosition: "left" | "center";
  logoMaxHeight: string;
  primaryColor: string;
  secondaryColor: string;
  linkColor: string;
  socialLinks: SocialLink[];
  authorName: string;
  authorAvatar: string;
  authorBio: string;
}

const DEFAULT_BRANDING: BrandingSettings = {
  logoUrl: "",
  logoPosition: "left",
  logoMaxHeight: "32px",
  primaryColor: "#39FF14",
  secondaryColor: "#3B82F6",
  linkColor: "",
  socialLinks: [],
  authorName: "",
  authorAvatar: "",
  authorBio: "",
};

const PLATFORMS = [
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "website", label: "Website" },
];

const LOGO_HEIGHTS = [
  { value: "24px", label: "24px" },
  { value: "32px", label: "32px" },
  { value: "40px", label: "40px" },
  { value: "48px", label: "48px" },
];

// ─── Section Header ─────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </h4>
  );
}

// ─── Color Input ────────────────────────────────────────
function ColorInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-400">{label}</Label>
      <div className="flex gap-2">
        <button
          type="button"
          className="h-9 w-9 shrink-0 rounded-md border border-gray-700"
          style={{ backgroundColor: value || placeholder || "#000" }}
          onClick={() => {
            // Simple toggle through preset colors
          }}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "#000000"}
          className="h-9 font-mono text-xs"
        />
      </div>
    </div>
  );
}

// ─── Social Link Row ────────────────────────────────────
function SocialLinkRow({
  link,
  onUpdate,
  onRemove,
}: {
  link: SocialLink;
  onUpdate: (id: string, field: "platform" | "url", value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <Select
        value={link.platform}
        onValueChange={(v) => onUpdate(link.id, "platform", v)}
      >
        <SelectTrigger className="h-9 w-[120px] shrink-0 text-xs">
          <SelectValue placeholder="Platform" />
        </SelectTrigger>
        <SelectContent>
          {PLATFORMS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        value={link.url}
        onChange={(e) => onUpdate(link.id, "url", e.target.value)}
        placeholder="https://..."
        className="h-9 text-xs"
      />
      <button
        type="button"
        onClick={() => onRemove(link.id)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-800 text-gray-500 transition-colors hover:border-red-900 hover:bg-red-950 hover:text-red-400"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M5 5L9 9M9 5L5 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

// ─── Branding Panel ─────────────────────────────────────
export function BrandingPanel() {
  const [branding, setBranding] =
    React.useState<BrandingSettings>(DEFAULT_BRANDING);

  const update = React.useCallback(
    <K extends keyof BrandingSettings>(key: K, value: BrandingSettings[K]) => {
      setBranding((prev) => {
        const next = { ...prev, [key]: value };
        useEditorStore.setState({
          brandingSettings: next,
        } as Record<string, unknown>);
        return next;
      });
    },
    [],
  );

  const addSocialLink = React.useCallback(() => {
    const newLink: SocialLink = {
      id: `social-${Date.now()}`,
      platform: "twitter",
      url: "",
    };
    setBranding((prev) => {
      const next = {
        ...prev,
        socialLinks: [...prev.socialLinks, newLink],
      };
      useEditorStore.setState({
        brandingSettings: next,
      } as Record<string, unknown>);
      return next;
    });
  }, []);

  const updateSocialLink = React.useCallback(
    (id: string, field: "platform" | "url", value: string) => {
      setBranding((prev) => {
        const next = {
          ...prev,
          socialLinks: prev.socialLinks.map((l) =>
            l.id === id ? { ...l, [field]: value } : l,
          ),
        };
        useEditorStore.setState({
          brandingSettings: next,
        } as Record<string, unknown>);
        return next;
      });
    },
    [],
  );

  const removeSocialLink = React.useCallback((id: string) => {
    setBranding((prev) => {
      const next = {
        ...prev,
        socialLinks: prev.socialLinks.filter((l) => l.id !== id),
      };
      useEditorStore.setState({
        brandingSettings: next,
      } as Record<string, unknown>);
      return next;
    });
  }, []);

  return (
    <div className="space-y-6 p-4">
      {/* ─── Logo ────────────────────────────────────── */}
      <div>
        <SectionHeader>Logo</SectionHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Logo URL</Label>
            <Input
              value={branding.logoUrl}
              onChange={(e) => update("logoUrl", e.target.value)}
              placeholder="https://example.com/logo.svg"
              className="h-9 text-xs"
            />
          </div>

          {branding.logoUrl && (
            <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-950 p-4">
              <img
                src={branding.logoUrl}
                alt="Logo preview"
                className="max-w-full object-contain"
                style={{ maxHeight: branding.logoMaxHeight }}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Position</Label>
            <div className="flex gap-1">
              {(["left", "center"] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => update("logoPosition", pos)}
                  className={`flex h-8 flex-1 items-center justify-center rounded-md border text-xs font-medium capitalize transition-colors ${
                    branding.logoPosition === pos
                      ? "border-[#39FF14]/50 bg-[#39FF14]/10 text-[#39FF14]"
                      : "border-gray-800 bg-gray-950 text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Max Height</Label>
            <Select
              value={branding.logoMaxHeight}
              onValueChange={(v) => update("logoMaxHeight", v)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOGO_HEIGHTS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ─── Brand Colors ────────────────────────────── */}
      <div className="border-t border-gray-800 pt-5">
        <SectionHeader>Brand Colors</SectionHeader>
        <div className="space-y-3">
          <ColorInput
            label="Primary Color"
            value={branding.primaryColor}
            onChange={(v) => update("primaryColor", v)}
            placeholder="#39FF14"
          />
          <ColorInput
            label="Secondary Color"
            value={branding.secondaryColor}
            onChange={(v) => update("secondaryColor", v)}
            placeholder="#3B82F6"
          />
          <ColorInput
            label="Link Color"
            value={branding.linkColor}
            onChange={(v) => update("linkColor", v)}
            placeholder={branding.primaryColor || "#39FF14"}
          />
          {!branding.linkColor && (
            <p className="text-[10px] text-gray-600">
              Defaults to primary color when empty
            </p>
          )}
        </div>
      </div>

      {/* ─── Social Links ────────────────────────────── */}
      <div className="border-t border-gray-800 pt-5">
        <SectionHeader>Social Links</SectionHeader>
        <div className="space-y-2">
          {branding.socialLinks.map((link) => (
            <SocialLinkRow
              key={link.id}
              link={link}
              onUpdate={updateSocialLink}
              onRemove={removeSocialLink}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={addSocialLink}
          >
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 2v8M2 6h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Add Social Link
            </span>
          </Button>
        </div>
      </div>

      {/* ─── Author Defaults ─────────────────────────── */}
      <div className="border-t border-gray-800 pt-5">
        <SectionHeader>Author Defaults</SectionHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Author Name</Label>
            <Input
              value={branding.authorName}
              onChange={(e) => update("authorName", e.target.value)}
              placeholder="John Doe"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Avatar URL</Label>
            <Input
              value={branding.authorAvatar}
              onChange={(e) => update("authorAvatar", e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="h-9 text-xs"
            />
          </div>

          {branding.authorAvatar && (
            <div className="flex items-center gap-3">
              <img
                src={branding.authorAvatar}
                alt="Author avatar"
                className="h-10 w-10 rounded-full border border-gray-700 object-cover"
              />
              <span className="text-xs text-gray-400">
                {branding.authorName || "Preview"}
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Author Bio</Label>
            <textarea
              value={branding.authorBio}
              onChange={(e) => update("authorBio", e.target.value)}
              placeholder="A short bio about the author..."
              rows={3}
              className="w-full resize-none rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-300 placeholder:text-gray-600 focus:border-[#39FF14]/50 focus:outline-none focus:ring-1 focus:ring-[#39FF14]/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
