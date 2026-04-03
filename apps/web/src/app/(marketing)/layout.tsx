"use client";

import Link from "next/link";
import Script from "next/script";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

const FEATURES = [
  { href: "/features", label: "Blog & SEO", desc: "AI editor, SEO scoring, structured data", icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" },
  { href: "/features", label: "Analytics", desc: "Cookieless tracking, AI referrers, UTM", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" },
  { href: "/features", label: "LLM Visibility", desc: "Track AI mentions, share of voice", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
  { href: "/features", label: "AI Writer", desc: "OpenAI, Claude, Gemini, Ollama — BYO key", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },
];

const TOOLS = [
  { href: "/tools/blog-title-generator", label: "Blog Title Generator" },
  { href: "/tools/meta-description-generator", label: "Meta Description Generator" },
  { href: "/tools/reading-time-calculator", label: "Reading Time Calculator" },
  { href: "/tools/schema-generator", label: "JSON-LD Schema Generator" },
  { href: "/tools/og-preview", label: "Open Graph Preview" },
  { href: "/tools/robots-txt-generator", label: "Robots.txt Generator" },
  { href: "/tools/heading-checker", label: "Heading Structure Checker" },
  { href: "/tools/word-counter", label: "Word Count & Readability" },
];

const QUICK_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Documentation" },
  { href: "/docs/self-hosting", label: "Self-Hosting Guide" },
  { href: "/docs/api-reference", label: "API Reference" },
];

function NavDropdown({ label, children, isOpen, onToggle }: { label: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="relative" onMouseEnter={onToggle} onMouseLeave={onToggle}>
      <button className={`flex items-center gap-1 text-sm transition-colors ${isOpen ? "text-white" : "text-gray-400 hover:text-white"}`}>
        {label}
        <svg className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3">
          <div className="rounded-xl border border-gray-800 bg-gray-950 shadow-2xl shadow-black/50">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-800/50 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-wide items-center justify-between px-6">
        <Logo size={28} />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {/* Features dropdown */}
          <NavDropdown label="Features" isOpen={openDrop === "features"} onToggle={() => setOpenDrop(openDrop === "features" ? null : "features")}>
            <div className="flex w-[540px]">
              <div className="flex-1 border-r border-gray-800 p-4">
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Platform</p>
                {FEATURES.map((f) => (
                  <Link key={f.label} href={f.href} onClick={() => setOpenDrop(null)} className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-gray-900">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-900 text-accent">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{f.label}</p>
                      <p className="text-xs text-gray-500">{f.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="w-44 p-4">
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Quick links</p>
                {QUICK_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setOpenDrop(null)} className="block rounded-lg px-2 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-900 hover:text-white">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </NavDropdown>

          {/* Tools dropdown */}
          <NavDropdown label="Tools" isOpen={openDrop === "tools"} onToggle={() => setOpenDrop(openDrop === "tools" ? null : "tools")}>
            <div className="w-[380px] p-4">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Free SEO Tools</p>
              <div className="grid grid-cols-2 gap-1">
                {TOOLS.map((t) => (
                  <Link key={t.href} href={t.href} onClick={() => setOpenDrop(null)} className="rounded-lg px-2 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-900 hover:text-white">
                    {t.label}
                  </Link>
                ))}
              </div>
              <div className="mt-3 border-t border-gray-800 pt-3">
                <Link href="/tools" onClick={() => setOpenDrop(null)} className="flex items-center gap-1 px-2 text-sm font-medium text-accent hover:underline">
                  View all tools →
                </Link>
              </div>
            </div>
          </NavDropdown>

          <Link href="/pricing" className="text-sm text-gray-400 transition-colors hover:text-white">Pricing</Link>
          <Link href="/blog" className="text-sm text-gray-400 transition-colors hover:text-white">Blog</Link>
          <Link href="/docs" className="text-sm text-gray-400 transition-colors hover:text-white">Docs</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm text-gray-400 transition-colors hover:text-white sm:inline-flex">Sign in</Link>
          <Link href="/signup" className="hidden h-9 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-black transition-colors hover:bg-accent-9 sm:inline-flex">Start free</Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-900 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 9h16.5m-16.5 6.75h16.5"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-800/50 bg-black md:hidden">
          <nav className="flex flex-col px-6 py-4">
            <p className="py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Features</p>
            {FEATURES.map((f) => (
              <Link key={f.label} href={f.href} onClick={() => setMobileOpen(false)} className="py-2 pl-3 text-sm text-gray-400 hover:text-white">{f.label}</Link>
            ))}
            <p className="mt-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Free Tools</p>
            {TOOLS.slice(0, 4).map((t) => (
              <Link key={t.href} href={t.href} onClick={() => setMobileOpen(false)} className="py-2 pl-3 text-sm text-gray-400 hover:text-white">{t.label}</Link>
            ))}
            <Link href="/tools" onClick={() => setMobileOpen(false)} className="py-2 pl-3 text-sm text-accent">All tools →</Link>
            <div className="mt-3 border-t border-gray-800/50 pt-3 space-y-2">
              <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white">Pricing</Link>
              <Link href="/blog" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white">Blog</Link>
              <Link href="/docs" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white">Docs</Link>
            </div>
            <div className="mt-3 flex flex-col gap-2 border-t border-gray-800/50 pt-4">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex h-10 items-center justify-center rounded-lg border border-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-900">Sign in</Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex h-10 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-black hover:bg-accent-9">Start free</Link>
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
                { href: "/docs/docs/getting-started", label: "Documentation", external: true },
                { href: "/docs/docs/api-reference", label: "API Reference", external: true },
                { href: "/docs/docs/self-hosting", label: "Self-hosting", external: true },
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
  const pathname = usePathname();
  const isDocs = pathname.startsWith("/docs");

  return (
    <>
      <MarketingNav />

      {/* Decorative vertical guide lines — hidden on docs pages */}
      {!isDocs && (
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
      )}

      <main className="relative z-10 pt-16 bg-black">{children}</main>
      {!isDocs && <MarketingFooter />}

      {/* RankFlo analytics — eating our own dog food */}
      <Script
        src="/tracker.js"
        data-project-key={process.env.NEXT_PUBLIC_SELF_PROJECT_KEY ?? ""}
        strategy="afterInteractive"
      />
    </>
  );
}
