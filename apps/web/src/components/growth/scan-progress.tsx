"use client";

import { useGrowthStore } from "@/stores/growth-store";

export function ScanProgress() {
  const { scanUrl, scanSteps } = useGrowthStore();

  const completedCount = scanSteps.filter((s) => s.status === "complete").length;
  const progress = (completedCount / scanSteps.length) * 100;

  return (
    <div className="mx-auto max-w-lg">
      <div className="text-center">
        {/* Animated spinner */}
        <div className="relative mx-auto h-20 w-20">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-200 dark:text-gray-800"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
              className="text-green-500 dark:text-accent transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <h2 className="mt-6 text-xl font-bold">Analyzing your site</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs mx-auto">
          {scanUrl}
        </p>
      </div>

      {/* Steps */}
      <div className="mt-10 space-y-4">
        {scanSteps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
          >
            {/* Status icon */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              {step.status === "complete" ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-accent/20">
                  <svg
                    className="h-4 w-4 text-green-600 dark:text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
              ) : step.status === "active" ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-accent" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-400">
                    {i + 1}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  step.status === "complete"
                    ? "text-gray-900 dark:text-white"
                    : step.status === "active"
                      ? "text-green-600 dark:text-accent"
                      : "text-gray-400 dark:text-gray-600"
                }`}
              >
                {step.label}
              </p>
              {step.status === "active" && (
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  <div className="h-full animate-[scan_2s_ease-in-out_infinite] rounded-full bg-accent" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
