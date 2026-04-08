"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

type Tab = "search" | "generate";

export function ImagePickerModal({
  defaultTab = "search",
  onSelect,
  onClose,
}: {
  defaultTab?: Tab;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchQ = trpc.ai.searchImages.useQuery(
    { query: searchQuery, page: 1 },
    { enabled: searchQuery.length > 0 },
  );

  const generateImage = trpc.ai.generateImage.useMutation();

  async function handleGenerate() {
    if (!aiPrompt.trim()) return;
    setError(null);
    setGenerating(true);
    try {
      const { url } = await generateImage.mutateAsync({ prompt: aiPrompt, aspectRatio: "16:9" });
      setGeneratedUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  const images = searchQ.data?.images ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header + Tabs */}
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTab("search")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === "search" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                Search free
              </span>
            </button>
            <button
              onClick={() => setTab("generate")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === "generate" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                Generate with AI
              </span>
            </button>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-800 hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Search Tab */}
        {tab === "search" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Search input */}
            <div className="px-5 py-3">
              <form onSubmit={(e) => { e.preventDefault(); setSearchQuery(query); }} className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search free images... (e.g. technology, business, nature)"
                  className="flex-1 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-accent focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-9 disabled:opacity-50"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Results grid */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {searchQ.isLoading && (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-video animate-pulse rounded-lg bg-gray-900" />
                  ))}
                </div>
              )}

              {!searchQ.isLoading && images.length === 0 && searchQuery && (
                <div className="py-12 text-center text-sm text-gray-500">No images found. Try a different search term.</div>
              )}

              {!searchQuery && (
                <div className="py-12 text-center text-sm text-gray-500">
                  Search for free high-quality images from Pexels
                </div>
              )}

              {images.length > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => onSelect(img.url)}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-gray-800 transition-all hover:border-accent hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.thumbUrl} alt={img.alt} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="truncate text-[10px] text-white">by {img.photographer}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-center text-[10px] text-gray-600">
                    Free images from <a href="https://pexels.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">Pexels</a>
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Generate Tab */}
        {tab === "generate" && (
          <div className="flex flex-1 flex-col px-5 py-4">
            <div className="space-y-3">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                rows={3}
                className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-accent focus:outline-none resize-none"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-600">Uses AI credits or your own API key</p>
                <button
                  onClick={() => void handleGenerate()}
                  disabled={generating || !aiPrompt.trim()}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-9 disabled:opacity-50"
                >
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      Generating...
                    </span>
                  ) : "Generate"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-3 rounded-lg bg-red-950/30 border border-red-800/30 px-3 py-2">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {generatedUrl && (
              <div className="mt-4 space-y-3">
                <div className="overflow-hidden rounded-lg border border-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={generatedUrl} alt="Generated" className="w-full object-cover" />
                </div>
                <button
                  onClick={() => onSelect(generatedUrl)}
                  className="w-full rounded-lg bg-accent py-2 text-sm font-semibold text-black hover:bg-accent-9"
                >
                  Use this image
                </button>
              </div>
            )}

            {!generatedUrl && !error && !generating && (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="mx-auto h-10 w-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Describe what you want and AI will create it</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
