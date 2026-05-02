"use client";

import { useState } from "react";

interface EmailCaptureProps {
  variant?: "inline" | "card" | "footer";
  title?: string;
  description?: string;
  source?: string;
  postId?: string;
}

const SELF_PROJECT_KEY = process.env.NEXT_PUBLIC_SELF_PROJECT_KEY ?? "";

export function EmailCapture({
  variant = "card",
  title = "Weekly SEO & content tips",
  description = "Join 1,000+ founders and marketers getting actionable blog growth tactics every Tuesday. No spam, unsubscribe anytime.",
  source = "blog-footer",
  postId,
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !SELF_PROJECT_KEY) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          project_key: SELF_PROJECT_KEY,
          source,
          ...(postId ? { sourcePostId: postId } : {}),
          referrer: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to subscribe");
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (variant === "footer") {
    return (
      <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          disabled={status === "loading" || status === "success"}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="shrink-0 rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 dark:bg-accent dark:text-black dark:hover:bg-accent/90"
        >
          {status === "success" ? "✓ Subscribed" : status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>
    );
  }

  return (
    <aside
      className={`rounded-2xl border border-accent/30 bg-accent-light-1 p-8 dark:bg-accent-1 ${
        variant === "inline" ? "my-12" : ""
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-md">
          <h3 className="text-lg font-bold text-gray-950 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{description}</p>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:shrink-0">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            disabled={status === "loading" || status === "success"}
            aria-label="Email address"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 md:w-72"
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="shrink-0 rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-accent dark:text-black dark:hover:bg-accent/90"
          >
            {status === "success" ? "✓ Subscribed" : status === "loading" ? "Subscribing…" : "Get weekly tips"}
          </button>
        </form>
      </div>
      {status === "success" && (
        <p className="mt-3 text-sm font-medium text-green-700 dark:text-accent">
          Thanks! Check your inbox for a confirmation email.
        </p>
      )}
      {status === "error" && errorMsg && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
      )}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
        No spam. Unsubscribe anytime. We respect your privacy.
      </p>
    </aside>
  );
}
