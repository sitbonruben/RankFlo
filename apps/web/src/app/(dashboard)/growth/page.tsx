"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { useGrowthStore } from "@/stores/growth-store";
import { UrlScanner } from "@/components/growth/url-scanner";
import { ScanProgress } from "@/components/growth/scan-progress";
import { GrowthOverview } from "@/components/growth/growth-overview";
import { TopicResearch } from "@/components/growth/topic-research";
import { SeoHealth } from "@/components/growth/seo-health";
import { ContentStrategyPanel } from "@/components/growth/content-strategy";
import { QuickGenerate } from "@/components/growth/quick-generate";

type Tab = "overview" | "research" | "seo" | "strategy";

const TABS: { id: Tab; label: string; icon: string }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  },
  {
    id: "research",
    label: "Research",
    icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
  },
  {
    id: "seo",
    label: "SEO Health",
    icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  },
  {
    id: "strategy",
    label: "Strategy",
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  },
];

export default function GrowthPage() {
  const {
    step,
    activeTab,
    projectId,
    projectName,
    scanResult,
    startScan,
    updateScanStep,
    completeScan,
    setActiveTab,
    setGeneratingTopic,
    setLastGeneratedPost,
    disconnect,
    generatingTopicId,
    lastGeneratedPostId,
  } = useGrowthStore();

  // ─── Deep link via ?tab= param ─────────────────────────
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["overview", "research", "seo", "strategy"].includes(tab)) {
      setActiveTab(tab as Tab);
    }
  }, [searchParams, setActiveTab]);

  // ─── tRPC calls ─────────────────────────────────────────

  const scanMutation = trpc.growth.scan.useMutation();
  const quickGenerateMutation = trpc.growth.quickGenerate.useMutation();
  const strategyMutation = trpc.growth.strategy.useMutation();

  const overviewQuery = trpc.growth.overview.useQuery(
    { projectId: projectId! },
    { enabled: step === "dashboard" && !!projectId },
  );

  const researchQuery = trpc.growth.research.useQuery(
    { projectId: projectId!, count: 12 },
    { enabled: step === "dashboard" && activeTab === "research" && !!projectId },
  );

  const auditQuery = trpc.growth.audit.useQuery(
    { projectId: projectId! },
    { enabled: step === "dashboard" && activeTab === "seo" && !!projectId },
  );

  // ─── Topics (combine scan result + research) ───────────
  const topics = researchQuery.data?.topics ?? scanResult?.topics ?? [];

  // ─── Strategy state ─────────────────────────────────────
  const [strategy, setStrategy] = useState<Awaited<
    ReturnType<typeof strategyMutation.mutateAsync>
  > | null>(null);

  // ─── Generation result ──────────────────────────────────
  const [genResult, setGenResult] = useState<Awaited<
    ReturnType<typeof quickGenerateMutation.mutateAsync>
  > | null>(null);

  // ─── Scan handler ───────────────────────────────────────
  const handleScan = useCallback(
    async (url: string) => {
      startScan();

      // Simulate step progression while the actual scan runs
      const stepTimers = [800, 2000, 3500];
      stepTimers.forEach((ms, i) => {
        setTimeout(() => updateScanStep(i, "complete"), ms);
      });

      try {
        const result = await scanMutation.mutateAsync({ url });
        // Complete all steps
        for (let i = 0; i < 4; i++) {
          updateScanStep(i, "complete");
        }
        // Small delay for the final animation
        setTimeout(() => {
          completeScan({
            projectId: result.projectId,
            projectName: result.projectName,
            brandVoice: {
              industry: result.brandVoice.industry,
              targetAudience: result.brandVoice.targetAudience,
              tone: result.brandVoice.tone,
              writingStyle: result.brandVoice.style,
            },
            topics: result.topics,
          });
        }, 500);
      } catch (err) {
        // On error, still show dashboard with whatever we got
        console.error("Scan error:", err);
        completeScan({
          projectId: "error",
          projectName: new URL(url).hostname,
          brandVoice: {},
          topics: [],
        });
      }
    },
    [startScan, updateScanStep, completeScan, scanMutation],
  );

  // ─── Generate handler ──────────────────────────────────
  const handleGenerate = useCallback(
    async (topic: { topic: string; keywords: string[]; contentType: string }) => {
      if (!projectId) return;

      setGeneratingTopic(topic.topic);
      setGenResult(null);

      try {
        const result = await quickGenerateMutation.mutateAsync({
          projectId,
          topic: topic.topic,
          keywords: topic.keywords.length > 0 ? topic.keywords : [topic.topic],
          contentType: (topic.contentType as "blog-post") || "blog-post",
        });
        setGenResult(result);
        setLastGeneratedPost(result.postId);
      } catch (err) {
        console.error("Generation error:", err);
      } finally {
        setGeneratingTopic(null);
      }
    },
    [projectId, setGeneratingTopic, setLastGeneratedPost, quickGenerateMutation],
  );

  // ─── Strategy handler ──────────────────────────────────
  const handleStrategy = useCallback(
    async (goals: string[]) => {
      if (!projectId) return;
      try {
        const result = await strategyMutation.mutateAsync({
          projectId,
          businessGoals: goals,
        });
        setStrategy(result);
      } catch (err) {
        console.error("Strategy error:", err);
      }
    },
    [projectId, strategyMutation],
  );

  // ─── Render ─────────────────────────────────────────────

  // Step: Connect
  if (step === "connect") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <UrlScanner onScan={handleScan} />
      </div>
    );
  }

  // Step: Scanning
  if (step === "scanning") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <ScanProgress />
      </div>
    );
  }

  // Step: Dashboard
  return (
    <div className="pb-24">
      {/* Dashboard header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Growth Hub
            </h1>
            <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:text-accent">
              AI
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {projectName ?? "Your project"}{" "}
            {overviewQuery.data?.project.url && (
              <span className="text-gray-400">
                &middot; {overviewQuery.data.project.url}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={disconnect}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:text-gray-300"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          Switch site
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-gray-900">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-8">
        {activeTab === "overview" && (
          <GrowthOverview data={overviewQuery.data} />
        )}

        {activeTab === "research" && (
          <TopicResearch
            topics={topics}
            isLoading={researchQuery.isLoading}
            onRefresh={() => researchQuery.refetch()}
            onGenerate={handleGenerate}
          />
        )}

        {activeTab === "seo" && (
          <SeoHealth
            data={auditQuery.data}
            isLoading={auditQuery.isLoading}
          />
        )}

        {activeTab === "strategy" && (
          <ContentStrategyPanel
            strategy={strategy}
            isLoading={strategyMutation.isPending}
            onGenerate={handleStrategy}
          />
        )}
      </div>

      {/* Quick generate bottom bar */}
      <QuickGenerate
        result={genResult}
        isGenerating={!!generatingTopicId}
        topic={generatingTopicId}
      />
    </div>
  );
}
