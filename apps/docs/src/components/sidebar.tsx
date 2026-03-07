"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs/getting-started" },
      { title: "Installation", href: "/docs/getting-started#installation" },
      { title: "Configuration", href: "/docs/getting-started#configuration" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Self-Hosting", href: "/docs/self-hosting" },
      { title: "Docker Compose", href: "/docs/self-hosting#docker-compose" },
      {
        title: "Environment Variables",
        href: "/docs/self-hosting#environment-variables",
      },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "Overview", href: "/docs/api-reference" },
      {
        title: "Authentication",
        href: "/docs/api-reference#authentication",
      },
      { title: "Endpoints", href: "/docs/api-reference#endpoints" },
      { title: "Rate Limits", href: "/docs/api-reference#rate-limits" },
      { title: "Webhooks", href: "/docs/webhooks" },
    ],
  },
  {
    title: "Packages",
    items: [
      { title: "@rankflo/sdk", href: "/docs/api-reference#sdk" },
      { title: "@rankflo/ui", href: "/docs/api-reference#ui" },
      { title: "@rankflo/core", href: "/docs/api-reference#core" },
    ],
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavSectionComponent({ section }: { section: NavSection }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const isSectionActive = section.items.some(
    (item) => pathname === item.href || pathname === item.href.split("#")[0]
  );

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 transition-colors hover:text-neutral-200"
      >
        <span>{section.title}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul className="mt-0.5 space-y-0.5">
          {section.items.map((item) => {
            const itemBase = item.href.split("#")[0];
            const isActive = pathname === itemBase;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block border-l-2 py-1.5 pl-4 pr-3 text-sm transition-colors ${
                    isActive
                      ? "border-accent text-accent font-medium"
                      : "border-transparent text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
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
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col border-r border-neutral-800 bg-black">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-neutral-800 px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-white">
            RankFlo
          </span>
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          <span className="ml-1 rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
            docs
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigation.map((section) => (
          <NavSectionComponent key={section.title} section={section} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/rankflo/rankflo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
          >
            GitHub
          </a>
          <span className="text-neutral-700">|</span>
          <a
            href="https://docs.rankflo.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
          >
            Community
          </a>
        </div>
        <p className="mt-2 text-[10px] text-neutral-600">v0.0.1</p>
      </div>
    </aside>
  );
}
