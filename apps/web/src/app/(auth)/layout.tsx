import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo size={26} />
        </Link>
        <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          Back to home
        </Link>
      </header>

      {/* Centered form */}
      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-700">
        &copy; {new Date().getFullYear()} RankFlo — Open source headless CMS
      </footer>
    </div>
  );
}
