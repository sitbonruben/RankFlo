"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

const PLATFORMS: Record<string, { label: string; bg: string }> = {
  NEXTJS:      { label: "Next.js",      bg: "bg-gray-200/50 dark:bg-white/10" },
  REACT:       { label: "React",        bg: "bg-cyan-100/50 dark:bg-cyan-500/10" },
  VUE:         { label: "Vue",          bg: "bg-emerald-100/50 dark:bg-emerald-500/10" },
  ANGULAR:     { label: "Angular",      bg: "bg-red-100/50 dark:bg-red-500/10" },
  SVELTE:      { label: "Svelte",       bg: "bg-orange-100/50 dark:bg-orange-500/10" },
  SHOPIFY:     { label: "Shopify",      bg: "bg-lime-100/50 dark:bg-lime-500/10" },
  WIX:         { label: "Wix",          bg: "bg-amber-100/50 dark:bg-amber-500/10" },
  WORDPRESS:   { label: "WordPress",    bg: "bg-sky-100/50 dark:bg-sky-500/10" },
  SQUARESPACE: { label: "Squarespace",  bg: "bg-gray-200/50 dark:bg-white/10" },
  WEBFLOW:     { label: "Webflow",      bg: "bg-indigo-100/50 dark:bg-indigo-500/10" },
  HUGO:        { label: "Hugo",         bg: "bg-pink-100/50 dark:bg-pink-500/10" },
  GATSBY:      { label: "Gatsby",       bg: "bg-purple-100/50 dark:bg-purple-500/10" },
  ASTRO:       { label: "Astro",        bg: "bg-orange-100/50 dark:bg-orange-500/10" },
  REMIX:       { label: "Remix",        bg: "bg-gray-200/50 dark:bg-white/10" },
  NUXT:        { label: "Nuxt",         bg: "bg-emerald-100/50 dark:bg-emerald-500/10" },
  CUSTOM:      { label: "Custom",       bg: "bg-gray-100/50 dark:bg-gray-500/10" },
};

const STATUS_MAP: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
  ACTIVE:   { label: "Active",   dotClass: "bg-green-500 dark:bg-accent", badgeClass: "bg-green-50 text-green-700 border border-green-200 dark:bg-accent-1 dark:text-accent dark:border-accent/20" },
  SETUP:    { label: "Setup",    dotClass: "bg-amber-400",                badgeClass: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20" },
  PAUSED:   { label: "Paused",   dotClass: "bg-gray-400 dark:bg-gray-500", badgeClass: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  ARCHIVED: { label: "Archived", dotClass: "bg-gray-300 dark:bg-gray-700", badgeClass: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600" },
};

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function SvgIcon({ path, className = "h-4 w-4" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

type FilterType = "all" | "ACTIVE" | "SETUP" | "PAUSED" | "ARCHIVED";

export default function ProjectsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = trpc.project.list.useQuery({
    page: 1,
    pageSize: 50,
    sort: "newest",
    status: filter === "all" ? undefined : (filter as any),
    search: search || undefined,
  });

  const projects = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect your websites, apps, and stores.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Connect project
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Total projects", value: isLoading ? "…" : total.toString(),
            icon: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" },
          { label: "Active",         value: isLoading ? "…" : projects.filter(p => p.status === "ACTIVE").length.toString(),
            icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Total posts",    value: isLoading ? "…" : projects.reduce((acc, p) => acc + (p._count?.posts ?? 0), 0).toString(),
            icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-2">
              <SvgIcon path={stat.icon} className="h-4 w-4 text-gray-400 dark:text-gray-600" />
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "ACTIVE", "SETUP", "PAUSED", "ARCHIVED"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                filter === f
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {f === "all" ? "All" : STATUS_MAP[f]?.label ?? f}
            </button>
          ))}
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-64 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-green-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:placeholder-gray-600 dark:focus:border-gray-700"
          />
        </div>
      </div>

      {/* Project cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 dark:border-gray-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900">
            <SvgIcon path="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" className="h-6 w-6 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No projects found</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-600">
            {search ? "Try a different search term" : "Connect your first project to get started"}
          </p>
          {!search && (
            <Link
              href="/projects/new"
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
            >
              Connect project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const platform = PLATFORMS[project.platform] ?? PLATFORMS.CUSTOM;
            const status = STATUS_MAP[project.status] ?? STATUS_MAP.SETUP;
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700 dark:hover:bg-gray-900/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 overflow-hidden text-lg font-bold text-gray-700 dark:bg-gray-800 dark:text-white">
                      {project.brandLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.brandLogo} alt={project.name} className="h-10 w-10 object-cover" />
                      ) : (
                        project.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-green-600 dark:text-white dark:group-hover:text-accent">
                        {project.name}
                      </h3>
                      {project.url && (
                        <p className="max-w-[200px] truncate text-xs text-gray-400 dark:text-gray-600">
                          {project.url.replace("https://", "")}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${status.badgeClass}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                    {status.label}
                  </span>
                </div>

                {project.description && (
                  <p className="mt-3 line-clamp-2 text-xs text-gray-500">{project.description}</p>
                )}

                <div className="mt-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${platform.bg} text-gray-700 dark:text-gray-300`}>
                    {platform.label}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <SvgIcon path="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      <span className="text-xs text-gray-500">{project._count?.posts ?? 0} posts</span>
                    </div>
                    {(project.totalViews ?? 0) > 0 && (
                      <div className="flex items-center gap-1.5">
                        <SvgIcon path="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <span className="text-xs text-gray-500">{formatViews(project.totalViews ?? 0)} views</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
