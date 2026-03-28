"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const WPM = 238; // average adult reading speed

function fleschScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length || 1;
  const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
  return 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount);
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

function fleschLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Very Easy", color: "text-green-600 dark:text-green-400" };
  if (score >= 70) return { label: "Easy", color: "text-green-600 dark:text-green-400" };
  if (score >= 60) return { label: "Standard", color: "text-accent" };
  if (score >= 50) return { label: "Fairly Difficult", color: "text-yellow-600 dark:text-yellow-400" };
  if (score >= 30) return { label: "Difficult", color: "text-orange-600 dark:text-orange-400" };
  return { label: "Very Difficult", color: "text-red-600 dark:text-red-400" };
}

export default function ReadingTimeCalculatorPage() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;
    const charCount = text.length;
    const charNoSpaces = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    const readingSeconds = (wordCount / WPM) * 60;
    const readingMins = Math.floor(readingSeconds / 60);
    const readingSecs = Math.round(readingSeconds % 60);
    const flesch = wordCount > 20 ? Math.round(fleschScore(text)) : null;
    const fleschInfo = flesch !== null ? fleschLabel(flesch) : null;
    return { wordCount, charCount, charNoSpaces, sentences, paragraphs, readingMins, readingSecs, flesch, fleschInfo };
  }, [text]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/tools" className="hover:text-gray-600 dark:hover:text-gray-300">Tools</Link>
        <span>/</span>
        <span className="text-gray-600 dark:text-gray-300">Reading Time Calculator</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Reading Time Calculator
        </h1>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
          Paste your article to get word count, estimated reading time, and a Flesch readability score.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder="Paste your article or blog post here…"
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600"
      />

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Words", value: stats.wordCount.toLocaleString() },
          { label: "Characters", value: stats.charCount.toLocaleString() },
          { label: "Sentences", value: stats.sentences.toLocaleString() },
          { label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-950">
            <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{s.value}</p>
            <p className="mt-1 text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Reading time + readability */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Reading time</p>
          {stats.wordCount === 0 ? (
            <p className="text-3xl font-bold text-gray-400">—</p>
          ) : stats.readingMins === 0 ? (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.readingSecs}s</p>
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.readingMins} min{stats.readingMins !== 1 ? "s" : ""}
              {stats.readingSecs > 0 && <span className="text-lg text-gray-400"> {stats.readingSecs}s</span>}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400">at {WPM} wpm average</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Flesch Readability</p>
          {stats.flesch === null ? (
            <p className="text-3xl font-bold text-gray-400">—</p>
          ) : (
            <>
              <p className={`text-3xl font-bold tabular-nums ${stats.fleschInfo?.color}`}>{stats.flesch}</p>
              <p className={`mt-1 text-sm font-medium ${stats.fleschInfo?.color}`}>{stats.fleschInfo?.label}</p>
            </>
          )}
          {stats.flesch === null && <p className="mt-1 text-xs text-gray-400">Add more text</p>}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-12 border-t border-gray-200 pt-10 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Blog post length guide</h2>
        <div className="space-y-3">
          {[
            { range: "300–600 words", label: "Short post / listicle", desc: "Good for quick tips, announcements, or social shares. Rarely ranks." },
            { range: "800–1,200 words", label: "Standard blog post", desc: "Covers a topic well. Can rank for low-competition keywords." },
            { range: "1,500–2,500 words", label: "In-depth article", desc: "The sweet spot for most SEO content. Enough depth to rank and earn links." },
            { range: "3,000+ words", label: "Pillar / ultimate guide", desc: "Best for competitive keywords. Targets multiple related queries." },
          ].map((row) => (
            <div key={row.range} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <div className="w-32 shrink-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{row.range}</p>
                <p className="text-xs text-accent">{row.label}</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{row.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm font-medium text-gray-900 dark:text-white">Publish posts with built-in reading time display</p>
        <p className="mt-1 text-sm text-gray-500">RankFlo automatically calculates and displays reading time on every post.</p>
        <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">
          Start for free
        </Link>
      </div>
    </div>
  );
}
