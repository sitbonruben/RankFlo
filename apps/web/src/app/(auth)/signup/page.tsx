"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { trpc } from "@/trpc/client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signUp = trpc.user.signUp.useMutation({
    onSuccess: (data) => {
      document.cookie = `rankflo_session=${data.token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
      router.push("/overview");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    signUp.mutate({ name, email, password });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Start building your blog in minutes.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <a
          href="/api/auth/google"
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-700 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
        >
          Continue with Google
        </a>
        <a
          href="/api/auth/github"
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-700 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
        >
          Continue with GitHub
        </a>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-black px-2 text-gray-600">or</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm text-gray-400">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-10 rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="Full name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm text-gray-400">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10 rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm text-gray-400">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="h-10 rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="Min. 8 characters"
          />
        </div>

        <button
          type="submit"
          disabled={signUp.isPending}
          className="mt-2 flex h-10 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-black transition-colors hover:bg-accent-9 disabled:opacity-50"
        >
          {signUp.isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
