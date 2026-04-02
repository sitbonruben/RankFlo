"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [localError, setLocalError] = useState("");

  const reset = trpc.user.resetPassword.useMutation({
    onSuccess: () => setDone(true),
    onError: (err) => setLocalError(err.message),
  });

  if (!token) {
    return (
      <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-5 text-center">
        <p className="text-sm text-red-400">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="mt-3 inline-flex text-sm text-accent hover:underline">
          Request a new link →
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-green-900/30 bg-green-950/20 p-5 text-center">
          <svg className="mx-auto h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-white">Password updated!</p>
          <p className="mt-1 text-sm text-gray-400">Your password has been reset successfully.</p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="flex h-10 items-center justify-center rounded-lg bg-white text-sm font-medium text-black transition-colors hover:bg-gray-100"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
        <p className="mt-1 text-sm text-gray-500">Choose a strong password for your account.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setLocalError("");
          if (password !== confirm) { setLocalError("Passwords don't match"); return; }
          reset.mutate({ token, password });
        }}
        className="flex flex-col gap-4"
      >
        {(localError || reset.error) && (
          <div className="rounded-lg bg-red-950/30 px-3 py-2 text-sm text-red-400">
            {localError || reset.error?.message}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm text-gray-400">New password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoFocus
            className="h-10 rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="Minimum 8 characters"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm" className="text-sm text-gray-400">Confirm password</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="h-10 rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="Repeat password"
          />
        </div>
        <button
          type="submit"
          disabled={reset.isPending}
          className="flex h-10 items-center justify-center rounded-lg bg-white text-sm font-medium text-black transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          {reset.isPending ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
