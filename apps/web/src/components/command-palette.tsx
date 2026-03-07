"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  href?: string;
  action?: () => void;
  icon?: React.ReactNode;
  section: string;
}

const COMMANDS: CommandItem[] = [
  // Navigation
  { id: "overview", label: "Overview", href: "/overview", section: "Navigation", icon: iconSvg("M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6") },
  { id: "projects", label: "Projects", href: "/projects", section: "Navigation", icon: iconSvg("M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z") },
  { id: "posts", label: "Posts", href: "/posts", section: "Navigation", icon: iconSvg("M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z") },
  { id: "pages", label: "Pages", href: "/pages", section: "Navigation", icon: iconSvg("M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z") },
  { id: "media", label: "Media", href: "/media", section: "Navigation", icon: iconSvg("M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z") },
  { id: "growth-hub", label: "Growth Hub", href: "/growth", section: "Navigation", icon: iconSvg("M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z") },
  { id: "analytics", label: "Analytics", href: "/analytics", section: "Navigation", icon: iconSvg("M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z") },
  { id: "search", label: "Search", href: "/search", section: "Navigation", icon: iconSvg("M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z") },

  // Actions
  { id: "new-post", label: "New Post", href: "/posts/new", section: "Actions" },
  { id: "new-page", label: "New Page", href: "/pages", section: "Actions" },
  { id: "connect-project", label: "Connect Project", href: "/projects", section: "Actions" },

  // Growth
  { id: "seo-health", label: "SEO Health", href: "/growth?tab=seo", section: "Growth" },
  { id: "topic-research", label: "Topic Research", href: "/growth?tab=research", section: "Growth" },
  { id: "content-strategy", label: "Content Strategy", href: "/growth?tab=strategy", section: "Growth" },

  // Settings
  { id: "settings-general", label: "General", href: "/settings", section: "Settings" },
  { id: "settings-team", label: "Team", href: "/settings/team", section: "Settings" },
  { id: "settings-billing", label: "Billing", href: "/settings/billing", section: "Settings" },
  { id: "settings-domains", label: "Domains", href: "/settings/domains", section: "Settings" },
  { id: "settings-integrations", label: "Integrations", href: "/settings/integrations", section: "Settings" },
  { id: "settings-api-keys", label: "API Keys", href: "/settings/api-keys", section: "Settings" },
  { id: "settings-webhooks", label: "Webhooks", href: "/settings/webhooks", section: "Settings" },
];

function iconSvg(d: string) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query
    ? COMMANDS.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.section.toLowerCase().includes(query.toLowerCase()),
      )
    : COMMANDS;

  const sections = [...new Set(filtered.map((cmd) => cmd.section))];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const execute = useCallback(
    (cmd: CommandItem) => {
      setOpen(false);
      if (cmd.href) router.push(cmd.href);
      else if (cmd.action) cmd.action();
    },
    [router],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      execute(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-2xl shadow-black/10 dark:border-gray-800 dark:bg-gray-950 dark:shadow-black/50 animate-in fade-in zoom-in-95 duration-150">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 dark:border-gray-800">
          <svg
            className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none dark:text-white dark:placeholder:text-gray-600"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-300 bg-gray-100 px-1.5 text-[10px] font-medium text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No results found.
            </div>
          ) : (
            sections.map((section) => (
              <div key={section}>
                <div className="px-2 pb-1 pt-3 text-xs font-medium text-gray-400 dark:text-gray-600">
                  {section}
                </div>
                {filtered
                  .filter((cmd) => cmd.section === section)
                  .map((cmd) => {
                    flatIndex++;
                    const isSelected = flatIndex === selectedIndex;
                    const currentIndex = flatIndex;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => execute(cmd)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          isSelected
                            ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-300"
                        }`}
                      >
                        {cmd.icon && (
                          <span className="text-gray-400 dark:text-gray-500">{cmd.icon}</span>
                        )}
                        <span>{cmd.label}</span>
                        {cmd.description && (
                          <span className="ml-auto text-xs text-gray-400 dark:text-gray-600">
                            {cmd.description}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-gray-200 px-4 py-2.5 text-[11px] text-gray-400 dark:border-gray-800 dark:text-gray-600">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-gray-300 px-1 dark:border-gray-700">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-gray-300 px-1 dark:border-gray-700">↵</kbd> select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-gray-300 px-1 dark:border-gray-700">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
