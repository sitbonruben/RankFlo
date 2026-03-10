"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import { GrowthTips } from "@/components/growth-tips";

function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "Just now" : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function OverviewPage() {
  const { data: postsData, isLoading: postsLoading } = trpc.post.list.useQuery({
    page: 1,
    pageSize: 5,
    sort: "newest",
  });
  const { data: projectsData } = trpc.project.list.useQuery({ page: 1, pageSize: 1 });

  const recentPosts = postsData?.items ?? [];
  const hasProjects = (projectsData?.total ?? 0) > 0;
  const firstProject = projectsData?.items?.[0];
  const hasAutopilot = firstProject?.autopilotEnabled ?? false;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome. Here&apos;s what&apos;s happening.
          </p>
        </div>
        <Link
          href="/posts/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total posts", value: postsData?.total ?? "—", href: "/posts" },
          { label: "Published", value: postsData?.items.filter(p => p.status === "PUBLISHED").length ?? "—", href: "/posts" },
          { label: "Drafts", value: postsData?.items.filter(p => p.status === "DRAFT").length ?? "—", href: "/posts" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <div className="mt-2">
              <span className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {postsLoading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" /> : stat.value}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Growth Tips */}
      <GrowthTips
        hasProjects={hasProjects}
        hasAutopilot={hasAutopilot}
        postCount={postsData?.total ?? 0}
        projectId={firstProject?.id}
        apiKey={firstProject?.apiKey}
      />

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent posts */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/50">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">Recent posts</h2>
            <Link href="/posts" className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              View all
            </Link>
          </div>

          {postsLoading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                </div>
              ))}
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="h-8 w-8 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="mt-3 text-sm text-gray-500">No posts yet</p>
              <Link
                href="/posts/new"
                className="mt-3 text-xs font-medium text-green-600 hover:underline dark:text-accent"
              >
                Create your first post →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}/edit`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gray-900 dark:text-white">{post.title || "Untitled"}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600">{timeAgo(post.updatedAt)}</p>
                  </div>
                  <div className="ml-4 flex items-center gap-3 shrink-0">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                        post.status === "PUBLISHED"
                          ? "bg-green-50 text-green-700 border border-green-200 dark:bg-accent-1 dark:text-accent dark:border-accent/20"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {post.status === "PUBLISHED" ? "Published" : post.status === "DRAFT" ? "Draft" : post.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/50">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">Quick actions</h2>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {[
              { label: "Create a post", href: "/posts/new", icon: "M12 4.5v15m7.5-7.5h-15" },
              { label: "Connect a project", href: "/projects/new", icon: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" },
              { label: "Upload media", href: "/media", icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" },
              { label: "Growth Hub", href: "/growth", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
              { label: "Invite team member", href: "/settings/team", icon: "M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                <svg className="h-4 w-4 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                </svg>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
