"use client";

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@rankflo/ui";

// ─── Alignment Picker ───────────────────────────────────
interface AlignmentPickerProps {
  value: "left" | "center" | "right";
  onChange: (value: "left" | "center" | "right") => void;
}

export function AlignmentPicker({ value, onChange }: AlignmentPickerProps) {
  const options: { key: "left" | "center" | "right"; icon: React.ReactNode; label: string }[] = [
    {
      key: "left",
      label: "Left",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="2" y="7.25" width="8" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="2" y="11.5" width="10" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
      ),
    },
    {
      key: "center",
      label: "Center",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="4" y="7.25" width="8" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="3" y="11.5" width="10" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
      ),
    },
    {
      key: "right",
      label: "Right",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="6" y="7.25" width="8" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="4" y="11.5" width="10" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          title={opt.label}
          onClick={() => onChange(opt.key)}
          className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
            value === opt.key
              ? "border-[#39FF14]/50 bg-[#39FF14]/10 text-[#39FF14]"
              : "border-gray-800 bg-gray-950 text-gray-400 hover:bg-gray-800 hover:text-white"
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

// ─── Size Select ────────────────────────────────────────
interface SizeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export function SizeSelect({
  value,
  onChange,
  options = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "full", label: "Full Width" },
  ],
  placeholder = "Select size",
}: SizeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Spacing Select ─────────────────────────────────────
interface SpacingSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: { value: string; label: string }[];
}

export function SpacingSelect({
  value,
  onChange,
  options = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ],
}: SpacingSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 text-xs">
        <SelectValue placeholder="Select spacing" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
