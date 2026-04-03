"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const NAV = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs/getting-started" },
      { title: "Self-Hosting", href: "/docs/self-hosting" },
      { title: "Webhooks", href: "/docs/webhooks" },
    ],
  },
  {
    title: "User Guide",
    items: [
      { title: "Dashboard overview", href: "/docs/user-guide" },
      { title: "AI writing", href: "/docs/user-guide#ai-writing" },
      { title: "SEO audit", href: "/docs/user-guide#seo-audit" },
      { title: "Analytics setup", href: "/docs/analytics-setup" },
      { title: "LLM visibility", href: "/docs/llm-visibility" },
      { title: "Team & roles", href: "/docs/user-guide#team" },
      { title: "Chrome extension", href: "/docs/user-guide#chrome-extension" },
      { title: "MCP server", href: "/docs/user-guide#mcp-server" },
    ],
  },
  {
    title: "Content API",
    items: [
      { title: "Overview & auth", href: "/docs/api-reference" },
      { title: "GET /content", href: "/docs/api-reference#get-content" },
      { title: "GET /search", href: "/docs/api-reference#get-search" },
      { title: "GET /tags", href: "/docs/api-reference#get-tags" },
      { title: "Webhooks", href: "/docs/api-reference#webhooks" },
      { title: "Next.js integration", href: "/docs/api-reference#nextjs" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── Scroll-spy: observe all heading[id] elements ──────────
  useEffect(() => {
    const headings = document.querySelectorAll("h2[id], h3[id]");
    if (headings.length === 0) return;

    // Track which headings are visible
    const visible = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visible.delete(entry.target.id);
          }
        }
        // Pick the one closest to the top of the viewport
        if (visible.size > 0) {
          let closest = "";
          let closestDist = Infinity;
          for (const [id, top] of visible) {
            const dist = Math.abs(top);
            if (dist < closestDist) {
              closestDist = dist;
              closest = id;
            }
          }
          setActiveId(closest);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    headings.forEach((h) => observerRef.current!.observe(h));
    return () => observerRef.current?.disconnect();
  }, [pathname]);

  // ── Determine active link ──────────────────────────────────
  function isActive(href: string) {
    const [base, hash] = href.split("#");
    if (pathname !== base) return false;
    if (hash) return activeId === hash;
    // No hash: active if no activeId or if we're at the top of the page
    return !activeId || activeId === "";
  }

  function handleClick(href: string) {
    setMobileOpen(false);
    const hash = href.split("#")[1];
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-20 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-800 bg-gray-950 text-gray-400 lg:hidden"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 9h16.5m-16.5 6.75h16.5"} />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-56 overflow-y-auto border-r border-gray-800 bg-black transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Navigation — starts right below the marketing nav */}
        <nav className="px-3 py-4">
          {NAV.map((section) => {
            const sectionActive = section.items.some((item) => {
              const base = item.href.split("#")[0];
              return pathname === base;
            });

            return (
              <div key={section.title} className="mb-5">
                <p className={`mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-widest ${sectionActive ? "text-gray-300" : "text-gray-600"}`}>
                  {section.title}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={(e) => {
                            if (item.href.includes("#")) {
                              e.preventDefault();
                              handleClick(item.href);
                              window.history.pushState(null, "", item.href);
                            } else {
                              setMobileOpen(false);
                            }
                          }}
                          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-all ${
                            active
                              ? "bg-accent/10 font-medium text-accent"
                              : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
                          }`}
                        >
                          <span className={`h-1 w-1 rounded-full ${active ? "bg-accent" : "bg-gray-700"}`} />
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800/60 px-5 py-3">
          <div className="flex items-center gap-3 text-[11px] text-gray-600">
            <a href="https://github.com/sitbonruben/RankFlo" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">GitHub</a>
            <span className="text-gray-800">|</span>
            <Link href="/blog" className="hover:text-gray-400">Blog</Link>
            <span className="text-gray-800">|</span>
            <span>v1.0</span>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
