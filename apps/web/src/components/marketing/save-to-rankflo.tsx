"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  // The tool slug — used for source attribution
  toolSlug: string;
  // What the user just generated / is about to save
  generatedContent: string | null;
  // Short noun like "title", "meta description", "slug"
  contentLabel: string;
  // Friendly description of what pressing Save does
  description?: string;
};

/**
 * Conversion CTA block shown at the bottom of free tool pages.
 * Turns anonymous tool users into signups by letting them save
 * their generated output as a draft post in RankFlo.
 *
 * Flow: email -> /signup?email=...&tool=...&content=... -> account created,
 * content pre-filled as a DRAFT in their first project.
 */
export function SaveToRankflo({
  toolSlug,
  generatedContent,
  contentLabel,
  description,
}: Props) {
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const disabled = !generatedContent || !email.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setSaving(true);
    // Pre-fill signup with email + content. Server uses tool + content to
    // seed the new user's first draft post.
    const url = new URL("/signup", window.location.origin);
    url.searchParams.set("email", email);
    url.searchParams.set("from_tool", toolSlug);
    if (generatedContent) {
      // Cap to avoid URL explosion; server truncates further.
      url.searchParams.set("seed_content", generatedContent.slice(0, 2000));
    }
    window.location.href = url.toString();
  }

  return (
    <div className="mt-16 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent-light-1/40 via-white to-accent-light-1/20 p-8 dark:from-accent-1/30 dark:via-gray-950 dark:to-accent-1/10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-accent">
            Save your {contentLabel} & keep going
          </p>
          <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
            Don&apos;t lose this — save it to RankFlo
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {description ??
              `Save this ${contentLabel}, publish a full blog post from it, and get AI SEO scoring — all free. No credit card required.`}
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-gray-600 dark:text-gray-400 sm:grid-cols-2">
            <li className="flex gap-2"><span className="text-green-600 dark:text-accent">✓</span> Free forever tier</li>
            <li className="flex gap-2"><span className="text-green-600 dark:text-accent">✓</span> AI content generation</li>
            <li className="flex gap-2"><span className="text-green-600 dark:text-accent">✓</span> Real-time SEO scoring</li>
            <li className="flex gap-2"><span className="text-green-600 dark:text-accent">✓</span> Cookieless analytics</li>
          </ul>
        </div>

        <form onSubmit={submit} className="flex shrink-0 flex-col gap-2 md:min-w-[320px]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            autoComplete="email"
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={disabled || saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-black transition-all hover:bg-accent-9 disabled:opacity-50"
          >
            {saving ? "Redirecting…" : `Save ${contentLabel} & continue →`}
          </button>
          <p className="text-center text-[10px] text-gray-500">
            No credit card. Free account in 10 seconds.{" "}
            <Link href="/pricing" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              View pricing
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
