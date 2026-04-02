"use client";

import Link from "next/link";
import Script from "next/script";
import { useState } from "react";
import { Logo } from "@/components/logo";

function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-800/50 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-wide items-center justify-between px-6">
        <Logo size={28} />

        <nav className="hidden items-center gap-8 md:flex">
          {[
            { href: "/pricing", label: "Pricing" },
            { href: "/features", label: "Features" },
            { href: "/blog", label: "Blog" },
            { href: "/tools", label: "Tools" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-400 transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
          <a href="https://docs.rankflo.io" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 transition-colors hover:text-white">
            Docs
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm text-gray-400 transition-colors hover:text-white sm:inline-flex">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="hidden h-9 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-black transition-colors hover:bg-accent-9 sm:inline-flex"
          >
            Start free
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-900 hover:text-white md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-800/50 bg-black md:hidden">
          <nav className="flex flex-col px-6 py-4">
            {[
              { href: "/pricing", label: "Pricing" },
              { href: "/features", label: "Features" },
              { href: "/blog", label: "Blog" },
              { href: "/tools", label: "Tools" },
            ].map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="py-3 text-sm text-gray-400 transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
            <a href="https://docs.rankflo.io" target="_blank" rel="noopener noreferrer" className="py-3 text-sm text-gray-400 transition-colors hover:text-white">
              Docs
            </a>
            <div className="mt-3 flex flex-col gap-2 border-t border-gray-800/50 pt-4">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex h-10 items-center justify-center rounded-lg border border-gray-700 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-900">
                Sign in
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex h-10 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-black transition-colors hover:bg-accent-9">
                Start free
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function MarketingFooter() {
  return (
    <footer className="border-t border-gray-800/50 bg-black">
      <div className="mx-auto max-w-wide px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            {
              title: "Product",
              links: [
                { href: "/pricing", label: "Pricing" },
                { href: "/features", label: "Features" },
                { href: "/blog", label: "Blog" },
                { href: "/tools", label: "Free Tools" },
                { href: "https://github.com/sitbonruben/RankFlo/releases", label: "Changelog", external: true },
              ],
            },
            {
              title: "Developers",
              links: [
                { href: "https://docs.rankflo.io/docs/getting-started", label: "Documentation", external: true },
                { href: "https://docs.rankflo.io/docs/api-reference", label: "API Reference", external: true },
                { href: "https://docs.rankflo.io/docs/self-hosting", label: "Self-hosting", external: true },
                { href: "https://github.com/sitbonruben/RankFlo", label: "GitHub", external: true },
              ],
            },
            {
              title: "Company",
              links: [
                { href: "/about", label: "About" },
                { href: "mailto:hello@rankflo.io", label: "Contact", external: true },
              ],
            },
            {
              title: "Legal",
              links: [
                { href: "/legal/privacy", label: "Privacy" },
                { href: "/legal/terms", label: "Terms" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold text-white">{col.title}</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                {col.links.map((l) =>
                  l.external ? (
                    <li key={l.label}><a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">{l.label}</a></li>
                  ) : (
                    <li key={l.label}><Link href={l.href} className="hover:text-gray-300">{l.label}</Link></li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-gray-800/50 pt-8">
          <span className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} RankFlo. Open source.
          </span>
          <a href="https://github.com/sitbonruben/RankFlo" target="_blank" rel="noopener noreferrer" className="text-gray-600 transition-colors hover:text-gray-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingNav />

      {/* Decorative vertical guide lines */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="mx-auto h-full w-full max-w-wide px-6">
          <div className="flex h-full justify-between">
            <div className="w-px bg-gradient-to-b from-transparent via-gray-800/40 to-transparent" />
            <div className="w-px bg-gradient-to-b from-transparent via-gray-800/30 to-transparent" />
            <div className="w-px bg-gradient-to-b from-transparent via-gray-800/40 to-transparent" />
            <div className="w-px bg-gradient-to-b from-transparent via-gray-800/30 to-transparent" />
            <div className="w-px bg-gradient-to-b from-transparent via-gray-800/40 to-transparent" />
          </div>
        </div>
      </div>

      <main className="relative z-10 pt-16 bg-black">{children}</main>
      <MarketingFooter />

      {/* RankFlo analytics — eating our own dog food */}
      <Script
        src="/tracker.js"
        data-project-key={process.env.NEXT_PUBLIC_SELF_PROJECT_KEY ?? ""}
        strategy="afterInteractive"
      />
    </>
  );
}
