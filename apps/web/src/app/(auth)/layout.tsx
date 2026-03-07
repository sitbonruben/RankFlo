import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen">
      {/* Left: branding panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-gray-950 p-12 lg:flex">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-accent">R</span>ankFlo
        </Link>

        <div>
          <blockquote className="max-w-md">
            <p className="text-2xl font-medium leading-snug text-white">
              The blog platform built for what&apos;s next.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Publish, analyze, and grow. Open source at heart.
            </p>
          </blockquote>
        </div>

        <p className="text-xs text-gray-700">
          &copy; {new Date().getFullYear()} RankFlo
        </p>
      </div>

      {/* Right: auth form */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
