"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ──────────────────────────────────────────────

interface BrandInfo {
  industry?: string;
  targetAudience?: string;
  tone?: string[];
  writingStyle?: string;
}

interface TopicSuggestion {
  topic: string;
  keywords: string[];
  searchVolume: "high" | "medium" | "low";
  difficulty: "easy" | "medium" | "hard";
  contentType: string;
  rationale: string;
  estimatedImpact: string;
}

interface ScanResult {
  projectId: string;
  projectName: string;
  brandVoice: BrandInfo;
  topics: TopicSuggestion[];
}

type Step = "connect" | "scanning" | "dashboard";
type Tab = "overview" | "research" | "seo" | "strategy";

interface ScanStep {
  label: string;
  status: "pending" | "active" | "complete";
}

// ─── Store State ────────────────────────────────────────

interface GrowthState {
  // Step tracking
  step: Step;
  activeTab: Tab;

  // Scan state
  scanUrl: string;
  scanSteps: ScanStep[];
  scanResult: ScanResult | null;

  // Persisted project
  projectId: string | null;
  projectName: string | null;

  // Generation state
  generatingTopicId: string | null;
  lastGeneratedPostId: string | null;

  // Actions
  setScanUrl: (url: string) => void;
  startScan: () => void;
  updateScanStep: (index: number, status: ScanStep["status"]) => void;
  completeScan: (result: ScanResult) => void;
  setActiveTab: (tab: Tab) => void;
  setGeneratingTopic: (topicId: string | null) => void;
  setLastGeneratedPost: (postId: string | null) => void;
  disconnect: () => void;
  reconnect: (projectId: string, projectName: string) => void;
}

// ─── Store ──────────────────────────────────────────────

export const useGrowthStore = create<GrowthState>()(
  persist(
    (set) => ({
      step: "connect",
      activeTab: "overview",

      scanUrl: "",
      scanSteps: [
        { label: "Extracting brand identity", status: "pending" },
        { label: "Analyzing brand voice", status: "pending" },
        { label: "Running SEO analysis", status: "pending" },
        { label: "Researching topic opportunities", status: "pending" },
      ],
      scanResult: null,

      projectId: null,
      projectName: null,

      generatingTopicId: null,
      lastGeneratedPostId: null,

      setScanUrl: (url) => set({ scanUrl: url }),

      startScan: () =>
        set({
          step: "scanning",
          scanSteps: [
            { label: "Extracting brand identity", status: "active" },
            { label: "Analyzing brand voice", status: "pending" },
            { label: "Running SEO analysis", status: "pending" },
            { label: "Researching topic opportunities", status: "pending" },
          ],
        }),

      updateScanStep: (index, status) =>
        set((state) => {
          const steps = [...state.scanSteps];
          steps[index] = { ...steps[index], status };
          // Auto-activate next step
          if (status === "complete" && index < steps.length - 1) {
            steps[index + 1] = { ...steps[index + 1], status: "active" };
          }
          return { scanSteps: steps };
        }),

      completeScan: (result) =>
        set({
          step: "dashboard",
          scanResult: result,
          projectId: result.projectId,
          projectName: result.projectName,
          scanSteps: [
            { label: "Extracting brand identity", status: "complete" },
            { label: "Analyzing brand voice", status: "complete" },
            { label: "Running SEO analysis", status: "complete" },
            { label: "Researching topic opportunities", status: "complete" },
          ],
        }),

      setActiveTab: (tab) => set({ activeTab: tab }),
      setGeneratingTopic: (topicId) => set({ generatingTopicId: topicId }),
      setLastGeneratedPost: (postId) => set({ lastGeneratedPostId: postId }),

      disconnect: () =>
        set({
          step: "connect",
          scanUrl: "",
          scanResult: null,
          projectId: null,
          projectName: null,
          activeTab: "overview",
          generatingTopicId: null,
          lastGeneratedPostId: null,
          scanSteps: [
            { label: "Extracting brand identity", status: "pending" },
            { label: "Analyzing brand voice", status: "pending" },
            { label: "Running SEO analysis", status: "pending" },
            { label: "Researching topic opportunities", status: "pending" },
          ],
        }),

      reconnect: (projectId, projectName) =>
        set({
          step: "dashboard",
          projectId,
          projectName,
        }),
    }),
    {
      name: "rankflo-growth",
      partialize: (state) => ({
        projectId: state.projectId,
        projectName: state.projectName,
        step: state.projectId ? "dashboard" : "connect",
      }),
    },
  ),
);
