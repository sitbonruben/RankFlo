"use client";

import Link from "next/link";
import Script from "next/script";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

const TOOLS = [
  { href: "/tools/blog-title-generator", label: "Blog Title Generator", desc: "10 SEO titles from a topic", icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" },
  { href: "/tools/schema-generator", label: "Schema Generator", desc: "Article, FAQ, HowTo JSON-LD", icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" },
  { href: "/tools/keyword-density-checker", label: "Keyword Density", desc: "Check keyword frequency & density", icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" },
  { href: "/tools/slug-generator", label: "URL Slug Generator", desc: "Clean SEO-friendly URLs", icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" },
  { href: "/tools/og-preview", label: "OG Preview", desc: "Facebook & Twitter card mockup", icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" },
  { href: "/tools/markdown-to-html", label: "Markdown → HTML", desc: "Convert MD to clean HTML", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
  { href: "/tools/robots-txt-generator", label: "Robots.txt Generator", desc: "AI bot rules for GPTBot, Claude", icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3" },
  { href: "/tools/sitemap-generator", label: "Sitemap Generator", desc: "XML sitemap from URL list", icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" },
];

function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-800/50 bg-black/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6 lg:px-10 xl:px-16">
        <Logo size={28} />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/" className="text-sm text-gray-400 transition-colors hover:text-white">Home</Link>

          {/* Tools dropdown */}
          <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <button className={`flex items-center gap-1 text-sm transition-colors ${toolsOpen ? "text-white" : "text-gray-400 hover:text-white"}`}>
              Tools
              <svg className={`h-3 w-3 transition-transform ${toolsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {toolsOpen && (
              <div className="absolute left-1/2 top-full -translate-x-1/2 pt-4">
                <div className="w-[480px] rounded-xl border border-gray-800 bg-gray-950 p-3 shadow-2xl shadow-black/60">
                  <div className="grid grid-cols-2 gap-0.5">
                    {TOOLS.map((t) => (
                      <Link key={t.href} href={t.href} onClick={() => setToolsOpen(false)}
                        className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-900">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-900 text-gray-500 group-hover:text-accent transition-colors">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={t.icon} /></svg>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-gray-200 group-hover:text-white">{t.label}</p>
                          <p className="text-[11px] text-gray-600 group-hover:text-gray-400">{t.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-gray-800 pt-2 px-3">
                    <Link href="/tools" onClick={() => setToolsOpen(false)} className="text-xs font-medium text-accent hover:underline">
                      View all tools →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

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
            <Link href="/" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-gray-300 font-medium hover:text-white">Home</Link>
            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-gray-300 font-medium hover:text-white">Pricing</Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-gray-300 font-medium hover:text-white">Blog</Link>
            <Link href="/docs" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-gray-300 font-medium hover:text-white">Docs</Link>

            <p className="mt-3 pt-3 border-t border-gray-800/50 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Tools</p>
            {TOOLS.slice(0, 4).map((t) => (
              <Link key={t.href} href={t.href} onClick={() => setMobileOpen(false)} className="py-2 pl-2 text-sm text-gray-400 hover:text-white">{t.label}</Link>
            ))}
            <Link href="/tools" onClick={() => setMobileOpen(false)} className="py-2 pl-2 text-sm text-accent">All tools →</Link>

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
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Product</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
              <li><Link href="/pricing" className="hover:text-gray-300">Pricing</Link></li>
              <li><Link href="/blog" className="hover:text-gray-300">Blog</Link></li>
              <li><Link href="/tools" className="hover:text-gray-300">Free Tools</Link></li>
              <li><Link href="/about" className="hover:text-gray-300">About</Link></li>
              <li><a href="https://github.com/sitbonruben/RankFlo/releases" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">Changelog</a></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Free Tools</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/tools/blog-title-generator" className="hover:text-gray-300">Blog Title Generator</Link></li>
              <li><Link href="/tools/schema-generator" className="hover:text-gray-300">Schema Generator</Link></li>
              <li><Link href="/tools/keyword-density-checker" className="hover:text-gray-300">Keyword Density</Link></li>
              <li><Link href="/tools/og-preview" className="hover:text-gray-300">OG Preview</Link></li>
              <li><Link href="/tools/slug-generator" className="hover:text-gray-300">Slug Generator</Link></li>
              <li><Link href="/tools/robots-txt-generator" className="hover:text-gray-300">Robots.txt Generator</Link></li>
              <li><Link href="/tools/word-counter" className="hover:text-gray-300">Word Counter</Link></li>
              <li><Link href="/tools/markdown-to-html" className="hover:text-gray-300">Markdown to HTML</Link></li>
            </ul>
          </div>

          {/* Docs */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Documentation</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/docs/getting-started" className="hover:text-gray-300">Getting Started</Link></li>
              <li><Link href="/docs/api-reference" className="hover:text-gray-300">API Reference</Link></li>
              <li><Link href="/docs/self-hosting" className="hover:text-gray-300">Self-Hosting</Link></li>
              <li><Link href="/docs/user-guide" className="hover:text-gray-300">User Guide</Link></li>
              <li><Link href="/docs/webhooks" className="hover:text-gray-300">Webhooks</Link></li>
              <li><Link href="/docs/analytics-setup" className="hover:text-gray-300">Analytics Setup</Link></li>
              <li><Link href="/docs/llm-visibility" className="hover:text-gray-300">LLM Visibility</Link></li>
            </ul>
          </div>

          {/* Comparisons */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Compare</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/blog/rankflo-vs-wordpress-developers" className="hover:text-gray-300">vs WordPress</Link></li>
              <li><Link href="/blog/rankflo-vs-ghost-comparison" className="hover:text-gray-300">vs Ghost</Link></li>
              <li><Link href="/blog/rankflo-vs-contentful-comparison" className="hover:text-gray-300">vs Contentful</Link></li>
              <li><Link href="/blog/rankflo-vs-strapi-headless-cms" className="hover:text-gray-300">vs Strapi</Link></li>
              <li><Link href="/blog/rankflo-vs-sanity-comparison" className="hover:text-gray-300">vs Sanity</Link></li>
              <li><Link href="/blog/rankflo-vs-payload-cms" className="hover:text-gray-300">vs Payload</Link></li>
              <li><Link href="/blog/rankflo-vs-medium" className="hover:text-gray-300">vs Medium</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Resources</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/blog/what-is-headless-cms-guide" className="hover:text-gray-300">What is Headless CMS?</Link></li>
              <li><Link href="/blog/best-headless-cms-startups-2025" className="hover:text-gray-300">Best CMS for Startups</Link></li>
              <li><Link href="/blog/ai-content-generation-seo-guide" className="hover:text-gray-300">AI Content & SEO</Link></li>
              <li><Link href="/blog/llm-visibility-guide-ai-search-optimization" className="hover:text-gray-300">LLM Visibility Guide</Link></li>
              <li><Link href="/blog/blog-seo-technical-checklist-2024" className="hover:text-gray-300">SEO Checklist</Link></li>
              <li><Link href="/blog/what-is-llms-txt-guide" className="hover:text-gray-300">What is llms.txt?</Link></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Company</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><a href="mailto:hello@rankflo.io" className="hover:text-gray-300">Contact</a></li>
              <li><a href="https://github.com/sitbonruben/RankFlo" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">GitHub</a></li>
              <li><Link href="/feed.xml" className="hover:text-gray-300">RSS Feed</Link></li>
              <li><Link href="/llms.txt" className="hover:text-gray-300">llms.txt</Link></li>
            </ul>

            <h3 className="mb-3 mt-6 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/legal/privacy" className="hover:text-gray-300">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-gray-300">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800/50 pt-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <Logo size={20} />
            <span className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} RankFlo. Open source headless CMS.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/sitbonruben/RankFlo" target="_blank" rel="noopener noreferrer" className="text-gray-600 transition-colors hover:text-gray-400" aria-label="GitHub">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="https://twitter.com/rankflo" target="_blank" rel="noopener noreferrer" className="text-gray-600 transition-colors hover:text-gray-400" aria-label="Twitter">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://linkedin.com/company/rankflo" target="_blank" rel="noopener noreferrer" className="text-gray-600 transition-colors hover:text-gray-400" aria-label="LinkedIn">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
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

      {/* HelpZen support chat widget */}
      <Script
        src="https://api.helpzen.io/api/v1/widget/script.js?v=2"
        data-workspace="helpzen"
        strategy="lazyOnload"
      />
    </>
  );
}
