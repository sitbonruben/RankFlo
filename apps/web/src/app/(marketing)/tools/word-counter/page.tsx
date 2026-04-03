"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export default function WordCounterPage() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim()).length || (text.trim() ? 1 : 0);
    const readingTime = Math.max(1, Math.ceil(words / 238)); // 238 wpm average
    const speakingTime = Math.max(1, Math.ceil(words / 150)); // 150 wpm speaking

    // Flesch-Kincaid grade level (simplified)
    const syllables = text.toLowerCase().replace(/[^a-z]/g, " ").split(/\s+/).filter(Boolean)
      .reduce((sum, word) => {
        let count = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").match(/[aeiouy]{1,2}/g)?.length ?? 1;
        if (count === 0) count = 1;
        return sum + count;
      }, 0);
    const gradeLevel = words > 0 && sentences > 0
      ? Math.round((0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59) * 10) / 10
      : 0;
    const readability = gradeLevel <= 6 ? "Easy" : gradeLevel <= 10 ? "Medium" : gradeLevel <= 14 ? "Hard" : "Very Hard";

    return { words, chars, charsNoSpaces, sentences, paragraphs, readingTime, speakingTime, gradeLevel: Math.max(0, gradeLevel), readability };
  }, [text]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Word Count & Readability Analyzer</h1>
      <p className="mt-2 text-gray-400">Paste your text to get word count, character count, reading time, and readability grade level — instantly.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here..."
            rows={16}
            className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="space-y-3">
          {[
            { label: "Words", value: stats.words.toLocaleString() },
            { label: "Characters", value: stats.chars.toLocaleString() },
            { label: "Characters (no spaces)", value: stats.charsNoSpaces.toLocaleString() },
            { label: "Sentences", value: stats.sentences.toLocaleString() },
            { label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
            { label: "Reading time", value: `${stats.readingTime} min` },
            { label: "Speaking time", value: `${stats.speakingTime} min` },
            { label: "Grade level", value: stats.gradeLevel > 0 ? `${stats.gradeLevel}` : "—" },
            { label: "Readability", value: stats.readability },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 px-4 py-3">
              <span className="text-xs text-gray-500">{s.label}</span>
              <span className="text-sm font-semibold text-white">{s.value}</span>
            </div>
          ))}

          {stats.words >= 1500 && (
            <div className="rounded-lg border border-green-800/40 bg-green-950/20 px-4 py-2">
              <p className="text-xs text-green-400">1,500+ words — ideal for SEO guides</p>
            </div>
          )}
          {stats.words > 0 && stats.words < 300 && (
            <div className="rounded-lg border border-amber-800/40 bg-amber-950/20 px-4 py-2">
              <p className="text-xs text-amber-400">Under 300 words — may be too thin for SEO</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-gray-800 bg-gray-950 p-8 text-center">
        <h2 className="text-lg font-bold text-white">RankFlo shows word count and readability as you write</h2>
        <p className="mt-2 text-sm text-gray-400">Built-in SEO scoring includes reading time, word count, and content quality checks.</p>
        <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">Start free</Link>
      </div>
    </div>
  );
}
