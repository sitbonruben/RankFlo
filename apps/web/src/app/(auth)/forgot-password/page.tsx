"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const request = trpc.user.requestPasswordReset.useMutation({
    onSuccess: () => setSent(true),
  });

  if (sent) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-green-900/30 bg-green-950/20 p-5 text-center">
          <svg className="mx-auto h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-white">Check your email</p>
          <p className="mt-1 text-sm text-gray-400">
            If <strong className="text-white">{email}</strong> has an account, you&apos;ll receive a reset link shortly.
          </p>
        </div>
        <Link href="/login" className="text-center text-sm text-gray-600 hover:text-gray-400">
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          request.mutate({ email });
        }}
        className="flex flex-col gap-4"
      >
        {request.error && (
          <div className="rounded-lg bg-red-950/30 px-3 py-2 text-sm text-red-400">
            {request.error.message}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm text-gray-400">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="h-10 rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          disabled={request.isPending}
          className="flex h-10 items-center justify-center rounded-lg bg-white text-sm font-medium text-black transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          {request.isPending ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        <Link href="/login" className="hover:text-gray-400">← Back to sign in</Link>
      </p>
    </div>
  );
}
