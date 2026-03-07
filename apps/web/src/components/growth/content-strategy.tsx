"use client";

import { useState } from "react";

interface TopicSuggestion {
  topic: string;
  keywords: string[];
  searchVolume: "high" | "medium" | "low";
  difficulty: "easy" | "medium" | "hard";
  contentType: string;
  rationale: string;
  estimatedImpact: string;
}

interface ContentStrategy {
  overview: string;
  targetAudience: string;
  pillars: {
    name: string;
    description: string;
    topics: TopicSuggestion[];
  }[];
  contentCalendar: {
    week: number;
    topics: TopicSuggestion[];
    focus: string;
  }[];
  competitorGaps: string[];
  quickWins: TopicSuggestion[];
}

const DEFAULT_GOALS = [
  "Increase organic traffic",
  "Build thought leadership",
  "Generate leads",
  "Improve brand awareness",
  "Support product launches",
  "Educate customers",
];

export function ContentStrategyPanel({
  strategy,
  isLoading,
  onGenerate,
}: {
  strategy: ContentStrategy | null;
  isLoading: boolean;
  onGenerate: (goals: string[]) => void;
}) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Increase organic traffic",
    "Build thought leadership",
  ]);

  function toggleGoal(goal: string) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  }

  // Setup form
  if (!strategy && !isLoading) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Content Strategy Generator
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Select your business goals and AI will create a tailored 8-week content
            plan with pillars, calendar, and quick wins.
          </p>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Select your goals
          </p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_GOALS.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  selectedGoals.includes(goal)
                    ? "bg-accent/20 font-medium text-green-700 ring-1 ring-accent/30 dark:text-accent"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onGenerate(selectedGoals)}
          disabled={selectedGoals.length === 0}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-black transition-all hover:bg-accent-9 disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Generate Strategy
        </button>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="h-8 w-8 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="mt-4 text-sm text-gray-500">
          Creating your content strategy...
        </p>
        <p className="mt-1 text-xs text-gray-400">This may take a minute</p>
      </div>
    );
  }

  if (!strategy) return null;

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Strategy Overview
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {strategy.overview}
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Target: {strategy.targetAudience}
        </p>
      </div>

      {/* Pillars */}
      {strategy.pillars.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
            Content Pillars
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {strategy.pillars.map((pillar) => (
              <div
                key={pillar.name}
                className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
              >
                <h4 className="text-sm font-semibold text-green-600 dark:text-accent">
                  {pillar.name}
                </h4>
                <p className="mt-1 text-xs text-gray-500">{pillar.description}</p>
                <div className="mt-3 space-y-1">
                  {pillar.topics.slice(0, 3).map((t, i) => (
                    <p key={i} className="text-xs text-gray-600 dark:text-gray-400">
                      &bull; {t.topic}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      {strategy.contentCalendar.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
            Content Calendar
          </h3>
          <div className="overflow-x-auto">
            <div className="inline-flex gap-4 pb-4">
              {strategy.contentCalendar.map((week) => (
                <div
                  key={week.week}
                  className="w-56 shrink-0 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
                >
                  <p className="text-xs font-semibold text-green-600 dark:text-accent">
                    Week {week.week}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-400">{week.focus}</p>
                  <div className="mt-3 space-y-2">
                    {week.topics.map((t, i) => (
                      <p
                        key={i}
                        className="text-xs text-gray-700 dark:text-gray-300"
                      >
                        {t.topic}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick wins */}
      {strategy.quickWins.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
            Quick Wins
          </h3>
          <div className="space-y-2">
            {strategy.quickWins.map((topic, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {topic.topic}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">{topic.rationale}</p>
                </div>
                <span className="shrink-0 rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-accent">
                  {topic.estimatedImpact}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor gaps */}
      {strategy.competitorGaps.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Competitor Gaps
          </h3>
          <ul className="mt-3 space-y-2">
            {strategy.competitorGaps.map((gap, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                  />
                </svg>
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
