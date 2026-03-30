"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";

const SENTIMENT_STYLES = {
  positive: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  neutral: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  negative: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

export default function TopicsPage() {
  const { data: topics, isLoading } = trpc.llm.topics.useQuery();

  const withMentions = topics?.filter((t) => t.llmMentions > 0) ?? [];
  const withoutMentions = topics?.filter((t) => t.llmMentions === 0) ?? [];
  const maxCount = topics ? Math.max(...topics.map((t) => t.count), 1) : 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/llms" className="hover:text-gray-700 dark:hover:text-gray-300">LLM Search</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">Topics</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Topics</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your content topics and whether AI mentions them when asked about your brand.
          </p>
        </div>
        <Link
          href="/llms/mentions"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          Log mention
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total topics", value: topics?.length ?? 0 },
          { label: "Topics in AI mentions", value: withMentions.length, accent: withMentions.length > 0 },
          { label: "Topics not yet mentioned", value: withoutMentions.length },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.accent ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20" : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"}`}>
            <p className={`text-sm font-medium ${s.accent ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>{s.label}</p>
            {isLoading ? (
              <div className="mt-2 h-8 w-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            ) : (
              <p className={`mt-1 text-3xl font-bold tracking-tight ${s.accent ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>{s.value}</p>
            )}
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : (topics?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <svg className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">No topics found</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
            Topics are derived from the tags on your published posts. Add tags to your posts to populate this view.
          </p>
          <Link href="/posts" className="mt-3 inline-flex text-sm font-medium text-green-600 hover:underline dark:text-accent">
            Go to posts →
          </Link>
        </div>
      ) : (
        <>
          {/* Topics with AI mentions */}
          {withMentions.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
              <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Topics mentioned by AI</h3>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">AI queries in your mentions library matched these topics</p>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-900">
                {withMentions.map((topic) => (
                  <div key={topic.slug} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {topic.color && (
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: topic.color }} />
                        )}
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{topic.name}</p>
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <div className="flex h-1.5 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${(topic.count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-600">{topic.count} post{topic.count !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums text-green-600 dark:text-green-400">
                        {topic.llmMentions} AI mention{topic.llmMentions !== 1 ? "s" : ""}
                      </span>
                      {topic.llmSentiment && (
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${SENTIMENT_STYLES[topic.llmSentiment as keyof typeof SENTIMENT_STYLES]}`}>
                          {topic.llmSentiment}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topics not yet mentioned */}
          {withoutMentions.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
              <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Topics not yet in AI mentions</h3>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">These topics exist in your content but haven&apos;t appeared in any logged AI mention query yet</p>
              </div>
              <div className="flex flex-wrap gap-2 p-5">
                {withoutMentions.map((topic) => (
                  <span
                    key={topic.slug}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                  >
                    {topic.color && (
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: topic.color }} />
                    )}
                    {topic.name}
                    <span className="text-xs text-gray-400 dark:text-gray-600">{topic.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tips */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm font-medium text-gray-900 dark:text-white">Improve your topic coverage</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Topics not yet mentioned by AI are opportunities. Add them to your{" "}
          <Link href="/llms/prompts" className="font-medium text-green-600 hover:underline dark:text-accent">prompt library</Link>{" "}
          and test whether AI knows you cover those topics. If not, publish more content targeting those specific keywords.
        </p>
      </div>
    </div>
  );
}
