"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { TRIAL_DAYS } from "@rankflo/core/constants";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const plan = searchParams.get("plan");
  const billing = searchParams.get("billing");
  const isPro = plan === "pro";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signUp = trpc.user.signUp.useMutation({
    onSuccess: (data) => {
      document.cookie = `rankflo_session=${data.token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
      if (isPro) {
        router.push(`/settings/billing?autostart=pro&billing=${billing ?? "monthly"}`);
      } else {
        router.push("/onboarding");
      }
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    signUp.mutate({ name, email, password });
  };

  return (
    <div className="flex flex-col">
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
        <p className="mt-2 text-sm text-gray-500">
          {isPro
            ? `Start your ${TRIAL_DAYS}-day Pro trial — no credit card required`
            : "Start publishing in minutes. Free forever."}
        </p>
      </div>

      {/* Pro trial banner */}
      {isPro && (
        <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-center">
          <p className="text-sm font-medium text-accent">{TRIAL_DAYS}-day Pro trial</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Redirected to checkout after signup. No charge during trial.
          </p>
        </div>
      )}

      {/* OAuth */}
      <div className="flex flex-col gap-2.5">
        <a
          href={`/api/auth/google${isPro ? `?plan=${plan}&billing=${billing ?? "monthly"}` : ""}`}
          className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-gray-800 bg-gray-950 text-sm font-medium text-gray-200 transition-all hover:border-gray-700 hover:bg-gray-900"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </a>
        <a
          href={`/api/auth/github${isPro ? `?plan=${plan}&billing=${billing ?? "monthly"}` : ""}`}
          className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-gray-800 bg-gray-950 text-sm font-medium text-gray-200 transition-all hover:border-gray-700 hover:bg-gray-900"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Continue with GitHub
        </a>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-black px-3 text-xs text-gray-600">or continue with email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-xl border border-red-900/30 bg-red-950/20 px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-xs font-medium text-gray-400">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="h-11 rounded-xl border border-gray-800 bg-gray-950 px-4 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="Full name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-medium text-gray-400">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-11 rounded-xl border border-gray-800 bg-gray-950 px-4 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-medium text-gray-400">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="h-11 rounded-xl border border-gray-800 bg-gray-950 px-4 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="Min. 8 characters"
          />
        </div>

        <button
          type="submit"
          disabled={signUp.isPending}
          className="mt-1 flex h-11 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-black transition-all hover:bg-accent-9 hover:shadow-[0_0_20px_rgba(57,255,20,0.15)] disabled:opacity-50"
        >
          {signUp.isPending
            ? "Creating account..."
            : isPro
              ? "Create account & start trial"
              : "Create free account"}
        </button>
      </form>

      {/* Terms */}
      <p className="mt-4 text-center text-[11px] text-gray-600 leading-relaxed">
        By creating an account, you agree to our{" "}
        <Link href="/legal/terms" className="text-gray-500 hover:text-gray-400">Terms</Link>
        {" "}and{" "}
        <Link href="/legal/privacy" className="text-gray-500 hover:text-gray-400">Privacy Policy</Link>
      </p>

      {/* Switch to login */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
