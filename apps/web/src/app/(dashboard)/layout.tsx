"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { CommandPalette } from "@/components/command-palette";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { trpc } from "@/trpc/client";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { href: "/overview", label: "Overview", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
      { href: "/projects", label: "Projects", icon: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/posts", label: "Posts", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
      { href: "/pages", label: "Pages", icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" },
      { href: "/media", label: "Media", icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 15.75V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-2.25m-18 0V6a2.25 2.25 0 012.25-2.25h15A2.25 2.25 0 0121.75 6v9.75" },
    ],
  },
  {
    title: "Growth",
    items: [
      { href: "/analytics", label: "Analytics", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
      { href: "/subscribers", label: "Subscribers", icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" },
      { href: "/calendar", label: "Calendar", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
    ],
  },
];

const SETTINGS_ICON = "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z";

function SidebarIcon({ path }: { path: string }) {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: me } = trpc.user.me.useQuery();
  const signOut = trpc.user.signOut.useMutation({
    onSuccess: () => {
      // Clear session cookie
      document.cookie = "rankflo_session=; path=/; max-age=0";
      router.push("/login");
    },
  });

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const name = me?.name ?? "…";
  const email = me?.email ?? "";
  const initial = name.charAt(0).toUpperCase();
  const orgName = me?.memberships?.[0]?.organization?.name ?? "";

  return (
    <div className="border-t border-gray-200/50 p-3 dark:border-gray-800/50" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-gray-950 dark:text-white">{name}</p>
          {orgName && (
            <p className="truncate text-[11px] text-gray-400 dark:text-gray-500">{orgName}</p>
          )}
        </div>
        <svg className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
            <p className="text-[12px] font-medium text-gray-900 dark:text-white">{name}</p>
            <p className="text-[11px] text-gray-500">{email}</p>
          </div>
          <div className="p-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            <Link
              href="/settings/billing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              Billing
            </Link>
          </div>
          <div className="border-t border-gray-100 p-1 dark:border-gray-800">
            <button
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              {signOut.isPending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const isSettingsActive = pathname.startsWith("/settings");

  return (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b border-gray-200/50 dark:border-gray-800/50">
        <Logo href="/overview" size={24} />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="flex flex-col gap-4">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si}>
              {section.title && (
                <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                  {section.title}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                          isActive
                            ? "bg-gray-100 text-gray-950 dark:bg-gray-800 dark:text-white"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-900 dark:hover:text-gray-300"
                        }`}
                      >
                        <SidebarIcon path={item.icon} />
                        {item.label}
                        {item.badge && (
                          <span className="ml-auto rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:text-accent">
                            {item.badge}
                          </span>
                        )}
                        {isActive && !item.badge && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(57,255,20,0.5)]" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* New post CTA */}
        <div className="mt-5 px-0.5">
          <Link
            href="/posts/new"
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 rounded-lg bg-accent/10 px-2.5 py-2 text-[13px] font-semibold text-green-600 transition-colors hover:bg-accent/20 dark:text-accent"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New post
          </Link>
        </div>
      </nav>

      {/* Settings link */}
      <div className="border-t border-gray-200/50 px-2 py-2 dark:border-gray-800/50">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
            isSettingsActive
              ? "bg-gray-100 text-gray-950 dark:bg-gray-800 dark:text-white"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-900 dark:hover:text-gray-300"
          }`}
        >
          <SidebarIcon path={SETTINGS_ICON} />
          Settings
          {isSettingsActive && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(57,255,20,0.5)]" />
          )}
        </Link>
      </div>

      {/* User menu */}
      <UserMenu />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isEditorPage =
    pathname === "/posts/new" ||
    (pathname.startsWith("/posts/") && pathname.endsWith("/edit"));

  if (isEditorPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-black">
      <CommandPalette />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-52 flex-col bg-white dark:bg-gray-950 transition-transform lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-52 flex-col border-r border-gray-200/50 bg-gray-50 dark:border-gray-800/50 dark:bg-gray-950 lg:flex 3xl:w-64">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200/50 px-4 dark:border-gray-800/50 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900 lg:hidden"
              aria-label="Open sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>

            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
              className="hidden h-9 w-52 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-600 dark:hover:border-gray-700 sm:flex"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Search... <kbd className="ml-auto rounded border border-gray-300 px-1.5 py-0.5 text-[10px] text-gray-400 dark:border-gray-700 dark:text-gray-600">⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-900 dark:hover:text-gray-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-wide">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
