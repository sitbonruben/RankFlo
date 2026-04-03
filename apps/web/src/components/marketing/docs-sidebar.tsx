"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
      { title: "Analytics", href: "/docs/user-guide#analytics" },
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
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-20 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-800 bg-gray-950 text-gray-400 lg:hidden"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={open ? "M6 18L18 6M6 6l12 12" : "M3.75 9h16.5m-16.5 6.75h16.5"} />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-gray-800 bg-black px-4 py-6 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-4 flex items-center gap-2 px-3">
          <span className="text-sm font-bold text-white">RankFlo</span>
          <span className="rounded border border-gray-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">docs</span>
        </div>

        <nav className="space-y-4">
          {NAV.map((section) => (
            <div key={section.title}>
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {section.title}
              </p>
              <ul className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const base = item.href.split("#")[0];
                  const isActive = pathname === base;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`block border-l-2 py-1.5 pl-4 pr-3 text-sm transition-colors ${
                          isActive
                            ? "border-accent text-accent font-medium"
                            : "border-transparent text-gray-400 hover:border-gray-700 hover:text-gray-200"
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
