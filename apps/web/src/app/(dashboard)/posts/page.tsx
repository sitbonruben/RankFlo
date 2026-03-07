"use client";

import Link from "next/link";

export default function PostsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Posts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your blog posts.
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

      {/* Filters */}
      <div className="flex items-center gap-3">
        {["All", "Published", "Draft", "Scheduled", "Archived"].map((filter) => (
          <button
            key={filter}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              filter === "All"
                ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Posts table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-950">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Title
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Author
              </th>
              <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell">
                Updated
              </th>
              <th className="hidden px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 xl:table-cell">
                Views
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                SEO
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {[
              { title: "Welcome to RankFlo", slug: "welcome-to-rankflo", status: "Published", author: "Admin", updated: "2 hours ago", views: "1,234", seo: 94 },
              { title: "Getting Started with the API", slug: "getting-started-api", status: "Published", author: "Admin", updated: "1 day ago", views: "567", seo: 87 },
              { title: "Self-Hosting Guide", slug: "self-hosting-guide", status: "Draft", author: "Admin", updated: "3 days ago", views: "—", seo: 62 },
            ].map((post) => (
              <tr
                key={post.slug}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/posts/${post.slug}/edit`}
                    className="text-sm font-medium text-gray-900 hover:text-green-600 dark:text-white dark:hover:text-accent"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-gray-400 dark:text-gray-600">/{post.slug}</p>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
                      post.status === "Published"
                        ? "bg-green-50 text-green-700 border border-green-200 dark:bg-accent-1 dark:text-accent dark:border-accent/20"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        post.status === "Published" ? "bg-green-500 dark:bg-accent" : "bg-gray-400 dark:bg-gray-600"
                      }`}
                    />
                    {post.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{post.author}</span>
                </td>
                <td className="hidden px-5 py-4 lg:table-cell">
                  <span className="text-sm text-gray-400 dark:text-gray-600">{post.updated}</span>
                </td>
                <td className="hidden px-5 py-4 text-right xl:table-cell">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{post.views}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span
                    className={`text-sm font-medium ${
                      post.seo >= 80 ? "text-green-600 dark:text-accent" : post.seo >= 50 ? "text-amber-500 dark:text-warning" : "text-red-500 dark:text-error"
                    }`}
                  >
                    {post.seo}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
