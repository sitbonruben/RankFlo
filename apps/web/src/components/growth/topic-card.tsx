"use client";

interface TopicSuggestion {
  topic: string;
  keywords: string[];
  searchVolume: "high" | "medium" | "low";
  difficulty: "easy" | "medium" | "hard";
  contentType: string;
  rationale: string;
  estimatedImpact: string;
}

const VOLUME_STYLES = {
  high: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const DIFFICULTY_STYLES = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function TopicCard({
  topic,
  isGenerating,
  onGenerate,
}: {
  topic: TopicSuggestion;
  isGenerating: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <div>
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${VOLUME_STYLES[topic.searchVolume]}`}
          >
            {topic.searchVolume} vol
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${DIFFICULTY_STYLES[topic.difficulty]}`}
          >
            {topic.difficulty}
          </span>
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {topic.contentType}
          </span>
        </div>

        {/* Title */}
        <h4 className="mt-3 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
          {topic.topic}
        </h4>

        {/* Rationale */}
        <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
          {topic.rationale}
        </p>

        {/* Keywords */}
        {topic.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {topic.keywords.slice(0, 4).map((kw) => (
              <span
                key={kw}
                className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-900 dark:text-gray-500"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent/10 py-2 text-xs font-semibold text-green-700 transition-colors hover:bg-accent/20 disabled:opacity-50 dark:text-accent"
      >
        {isGenerating ? (
          <>
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-20"
              />
              <path
                d="M12 2a10 10 0 019.95 9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
            Generate Post
          </>
        )}
      </button>
    </div>
  );
}
