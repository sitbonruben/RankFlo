"use client";

import { useState } from "react";
import { TopicCard } from "./topic-card";
import { useGrowthStore } from "@/stores/growth-store";

interface TopicSuggestion {
  topic: string;
  keywords: string[];
  searchVolume: "high" | "medium" | "low";
  difficulty: "easy" | "medium" | "hard";
  contentType: string;
  rationale: string;
  estimatedImpact: string;
}

export function TopicResearch({
  topics,
  isLoading,
  onRefresh,
  onGenerate,
}: {
  topics: TopicSuggestion[];
  isLoading: boolean;
  onRefresh: () => void;
  onGenerate: (topic: TopicSuggestion) => void;
}) {
  const generatingTopicId = useGrowthStore((s) => s.generatingTopicId);
  const [filter, setFilter] = useState<"all" | "high" | "easy">("all");

  const filtered = topics.filter((t) => {
    if (filter === "high") return t.searchVolume === "high";
    if (filter === "easy") return t.difficulty === "easy";
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Topic Opportunities
          </h3>
          <p className="text-sm text-gray-500">
            AI-suggested topics based on your brand and industry
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-800">
            {[
              { label: "All", value: "all" as const },
              { label: "High Volume", value: "high" as const },
              { label: "Easy Wins", value: "easy" as const },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 disabled:opacity-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:text-gray-300"
          >
            <svg
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && topics.length === 0 && (
        <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
          <svg className="h-8 w-8 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
            <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p className="mt-4 text-sm text-gray-500">Researching topic opportunities...</p>
        </div>
      )}

      {/* Topics grid */}
      {filtered.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((topic, i) => (
            <TopicCard
              key={`${topic.topic}-${i}`}
              topic={topic}
              isGenerating={generatingTopicId === topic.topic}
              onGenerate={() => onGenerate(topic)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && topics.length > 0 && (
        <div className="mt-8 text-center py-8">
          <p className="text-sm text-gray-500">
            No topics match this filter. Try &quot;All&quot; to see everything.
          </p>
        </div>
      )}
    </div>
  );
}
