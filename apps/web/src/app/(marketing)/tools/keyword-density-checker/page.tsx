"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface KeywordResult {
  word: string;
  count: number;
  density: number;
}

const STOP_WORDS = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","by","is","it","as","was","are","be","this","that","from","not","have","has","had","will","would","can","could","may","been","do","does","did","its","my","your","we","they","he","she","our","their","i","you","me","him","her","us","them","what","which","who","how","when","where","why","all","each","every","no","so","if","than","then","more","also","very","just","about","up","out","into","over","after","before","between","under","through","during","only","other","some","such","these","those","most","own","same","both","few","much","many","well","back","still","even","here","there","new","now"]);

export default function KeywordDensityCheckerPage() {
  const [text, setText] = useState("");
  const [keyword, setKeyword] = useState("");

  const results = useMemo(() => {
    const words = text.toLowerCase().replace(/[^a-z0-9\s'-]/g, "").split(/\s+/).filter(Boolean);
    const totalWords = words.length;
    if (totalWords === 0) return { totalWords: 0, topWords: [], keywordData: null };

    // Count word frequency (exclude stop words)
    const freq = new Map<string, number>();
    for (const w of words) {
      if (w.length < 3 || STOP_WORDS.has(w)) continue;
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }

    const topWords: KeywordResult[] = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({
        word,
        count,
        density: Math.round((count / totalWords) * 10000) / 100,
      }));

    // Check target keyword
    let keywordData: { count: number; density: number; inTitle: boolean } | null = null;
    if (keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      const kwWords = kw.split(/\s+/);
      let kwCount = 0;
      if (kwWords.length === 1) {
        kwCount = freq.get(kw) ?? 0;
      } else {
        // Multi-word keyword — count phrase occurrences
        const textLower = text.toLowerCase();
        let idx = 0;
        while ((idx = textLower.indexOf(kw, idx)) !== -1) { kwCount++; idx += kw.length; }
      }
      keywordData = {
        count: kwCount,
        density: Math.round((kwCount / totalWords) * 10000) / 100,
        inTitle: text.split("\n")[0]?.toLowerCase().includes(kw) ?? false,
      };
    }

    return { totalWords, topWords, keywordData };
  }, [text, keyword]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Keyword Density Checker</h1>
      <p className="mt-2 text-gray-400">Analyze keyword frequency and density in your content. Check if your target keyword appears enough (but not too much) for SEO.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-400">Target keyword (optional)</label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="headless cms"
              className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400">Paste your content</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={16} placeholder="Paste your blog post or article text here..."
              className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none resize-none leading-relaxed" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Stats */}
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
            <p className="text-xs text-gray-500 mb-2">Total words</p>
            <p className="text-2xl font-bold text-white">{results.totalWords.toLocaleString()}</p>
          </div>

          {/* Target keyword */}
          {results.keywordData && (
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
              <p className="text-xs text-gray-500 mb-2">Target: &quot;{keyword}&quot;</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Occurrences</span>
                  <span className="text-sm font-semibold text-white">{results.keywordData.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Density</span>
                  <span className={`text-sm font-semibold ${results.keywordData.density >= 0.5 && results.keywordData.density <= 2.5 ? "text-green-400" : results.keywordData.density > 2.5 ? "text-red-400" : "text-amber-400"}`}>
                    {results.keywordData.density}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-600">
                  {results.keywordData.density < 0.5 ? "Too low — add more mentions" : results.keywordData.density > 2.5 ? "Too high — may look like keyword stuffing" : "Good density — natural keyword usage"}
                </p>
              </div>
            </div>
          )}

          {/* Top keywords */}
          {results.topWords.length > 0 && (
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
              <p className="text-xs text-gray-500 mb-3">Top keywords</p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {results.topWords.map((w) => (
                  <div key={w.word} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 truncate mr-2">{w.word}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500">{w.count}x</span>
                      <span className="text-xs text-gray-600 w-12 text-right">{w.density}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-gray-800 bg-gray-950 p-8 text-center">
        <h2 className="text-lg font-bold text-white">RankFlo checks keyword density as you write</h2>
        <p className="mt-2 text-sm text-gray-400">Built-in SEO scoring monitors keyword usage, density, and placement in real-time.</p>
        <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">Start free</Link>
      </div>
    </div>
  );
}
