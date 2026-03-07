import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center">
      <h1 className="text-8xl font-extrabold tracking-tighter text-[#39FF14]">404</h1>
      <p className="mt-4 text-xl font-semibold text-white">Page not found</p>
      <p className="mt-2 text-sm text-gray-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#39FF14] px-6 py-3 text-sm font-medium text-black hover:bg-[#39FF14]/90 transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to RankFlo
      </Link>
      <p className="mt-12 text-xs text-gray-700">
        <span className="text-[#39FF14]/50">●</span> RankFlo
      </p>
    </div>
  );
}
