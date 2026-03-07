import Link from "next/link";

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back. Here&apos;s what&apos;s happening.
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Page views", value: "34,291", change: "+18%", trend: "up" },
          { label: "Visitors", value: "12,847", change: "+23%", trend: "up" },
          { label: "Bounce rate", value: "42.3%", change: "-5%", trend: "down" },
          { label: "SEO Score", value: "94", change: "+2", trend: "up" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {stat.value}
              </span>
              <span
                className={`mb-1 text-xs font-medium ${
                  stat.trend === "up" ? "text-green-600 dark:text-accent" : "text-green-600 dark:text-accent"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

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
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {[
              { title: "Welcome to RankFlo", status: "Published", date: "Today", views: "1,234" },
              { title: "Getting Started with the API", status: "Published", date: "Yesterday", views: "567" },
              { title: "Self-Hosting Guide", status: "Draft", date: "2 days ago", views: "—" },
            ].map((post) => (
              <div
                key={post.title}
                className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gray-900 dark:text-white">{post.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600">{post.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 dark:text-gray-600">{post.views} views</span>
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                      post.status === "Published"
                        ? "bg-green-50 text-green-700 border border-green-200 dark:bg-accent-1 dark:text-accent dark:border-accent/20"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/50">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">Quick actions</h2>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {[
              { label: "Create a post", href: "/posts/new", icon: "M12 4.5v15m7.5-7.5h-15" },
              { label: "Upload media", href: "/media", icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" },
              { label: "Invite team member", href: "/settings/team", icon: "M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" },
              { label: "Configure webhooks", href: "/settings/webhooks", icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" },
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
