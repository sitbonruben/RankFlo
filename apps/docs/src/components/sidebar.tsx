"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";

interface NavItem {
  title: string;
  href: string;
}

interface NavSection {
  title: string;
  href: string; // section landing page
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Getting Started",
    href: "/docs/getting-started",
    items: [
      { title: "Introduction", href: "/docs/getting-started" },
      { title: "Self-Hosting", href: "/docs/self-hosting" },
      { title: "Webhooks", href: "/docs/webhooks" },
    ],
  },
  {
    title: "User Guide",
    href: "/docs/user-guide",
    items: [
      { title: "Dashboard overview", href: "/docs/user-guide#dashboard-overview" },
      { title: "Projects", href: "/docs/user-guide#projects" },
      { title: "Writing posts", href: "/docs/user-guide#writing-posts" },
      { title: "AI writing", href: "/docs/user-guide#ai-writing" },
      { title: "SEO audit", href: "/docs/user-guide#seo-audit" },
      { title: "Analytics", href: "/docs/user-guide#analytics" },
      { title: "Scheduling", href: "/docs/user-guide#scheduling-posts" },
      { title: "Team & roles", href: "/docs/user-guide#team" },
      { title: "Chrome extension", href: "/docs/user-guide#chrome-extension" },
      { title: "MCP server", href: "/docs/user-guide#mcp-server-claude-desktop" },
    ],
  },
  {
    title: "Content API",
    href: "/docs/api-reference",
    items: [
      { title: "Overview & auth", href: "/docs/api-reference" },
      { title: "GET /content", href: "/docs/api-reference#get-apiv1content" },
      { title: "GET /search", href: "/docs/api-reference#get-apiv1search" },
      { title: "GET /tags", href: "/docs/api-reference#get-apiv1tags" },
      { title: "GET /feed.xml", href: "/docs/api-reference#get-apiv1feedxml" },
      { title: "GET /sitemap.xml", href: "/docs/api-reference#get-apiv1sitemapxml" },
      { title: "GET /og", href: "/docs/api-reference#get-apiv1og" },
      { title: "POST /analytics/track", href: "/docs/api-reference#post-apiv1analyticstrack" },
      { title: "POST /subscribe", href: "/docs/api-reference#post-apiv1subscribe" },
      { title: "Webhooks", href: "/docs/api-reference#webhooks" },
      { title: "Next.js integration", href: "/docs/api-reference#integrating-with-nextjs" },
    ],
  },
];

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-neutral-500">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      className={`shrink-0 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavSectionComponent({
  section,
  query,
}: {
  section: NavSection;
  query: string;
}) {
  const pathname = usePathname();
  const isSectionActive = section.items.some(
    (item) => pathname === item.href.split("#")[0]
  );
  const [open, setOpen] = useState(true);

  const filteredItems = useMemo(() => {
    if (!query) return section.items;
    return section.items.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [section.items, query]);

  if (query && filteredItems.length === 0) return null;

  return (
    <div className="mb-1">
      <div className="flex items-center">
        <Link
          href={section.href}
          className={`flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            isSectionActive ? "text-neutral-200" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          {section.title}
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-7 w-7 items-center justify-center rounded text-neutral-600 transition-colors hover:text-neutral-400"
          aria-label={open ? "Collapse" : "Expand"}
        >
          <ChevronIcon open={open} />
        </button>
      </div>

      {(open || query) && (
        <ul className="mt-0.5 space-y-0.5">
          {filteredItems.map((item) => {
            const itemBase = item.href.split("#")[0];
            const isActive = pathname === itemBase;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  scroll={true}
                  className={`block border-l-2 py-1.5 pl-4 pr-3 text-sm transition-colors ${
                    isActive
                      ? "border-accent text-accent font-medium"
                      : "border-transparent text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                  }`}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Sidebar() {
  const [query, setQuery] = useState("");

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-neutral-800/80 bg-[#0a0a0a]">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-neutral-800/80 px-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-white">RankFlo</span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="ml-1 rounded border border-neutral-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
            docs
          </span>
        </Link>
      </div>

      {/* Search */}
      <div className="border-b border-neutral-800/80 px-3 py-3">
        <div className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2 focus-within:border-neutral-700">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search docs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-neutral-600 hover:text-neutral-400"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navigation.map((section) => (
          <NavSectionComponent key={section.title} section={section} query={query} />
        ))}
        {query &&
          navigation.every((s) =>
            s.items.every((i) => !i.title.toLowerCase().includes(query.toLowerCase()))
          ) && (
            <p className="px-3 py-4 text-sm text-neutral-600">No results for "{query}"</p>
          )}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-800/80 px-5 py-3">
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/sitbonruben/RankFlo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            GitHub
          </a>
          <span className="text-neutral-800">|</span>
          <a
            href="mailto:hello@rankflo.io"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Contact
          </a>
        </div>
        <p className="mt-1 text-[10px] text-neutral-700">v1.0.0</p>
      </div>
    </aside>
  );
}
