"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

// ─── Types ──────────────────────────────────────────────────────────────────

type Tab = "scheduled" | "published" | "drafts" | "repurpose";

type Platform = "twitter" | "linkedin" | "facebook" | "instagram";

type AccountStatus = "connected" | "expired";

const TONES = ["Professional", "Casual", "Engaging", "Witty"] as const;

interface GeneratedContent {
  platform: Platform;
  content: string;
  charCount: number;
  charLimit: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<Platform, { label: string; icon: string; color: string; darkColor: string; charLimit: number }> = {
  twitter: { label: "Twitter", icon: "\ud835\udd4f", color: "bg-black text-white", darkColor: "dark:bg-white dark:text-black", charLimit: 280 },
  linkedin: { label: "LinkedIn", icon: "in", color: "bg-blue-700 text-white", darkColor: "dark:bg-blue-600", charLimit: 3000 },
  facebook: { label: "Facebook", icon: "f", color: "bg-blue-600 text-white", darkColor: "dark:bg-blue-500", charLimit: 63206 },
  instagram: { label: "Instagram", icon: "ig", color: "bg-gradient-to-tr from-purple-600 to-pink-500 text-white", darkColor: "", charLimit: 2200 },
};

function PlatformBadge({ platform, size = "sm" }: { platform: Platform; size?: "sm" | "md" }) {
  const config = PLATFORM_CONFIG[platform];
  if (!config) return null;
  const sizeClasses = size === "md" ? "h-10 w-10 text-sm" : "h-6 w-6 text-[10px]";

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg font-bold ${sizeClasses} ${config.color} ${config.darkColor}`}
    >
      {config.icon}
    </div>
  );
}

function StatusDot({ status }: { status: AccountStatus }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === "connected" && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75 dark:bg-accent/50" />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
          status === "connected"
            ? "bg-green-500 dark:bg-accent"
            : "bg-amber-400 dark:bg-warning"
        }`}
      />
    </span>
  );
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "";
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<Tab>("scheduled");

  // Repurpose state
  const [selectedBlogPost, setSelectedBlogPost] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [selectedTone, setSelectedTone] = useState<(typeof TONES)[number]>("Professional");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);

  const utils = trpc.useUtils();

  // ─── Queries ──────────────────────────────────────────────────────────────
  const accountsQuery = trpc.social.accounts.list.useQuery();
  const scheduledQuery = trpc.social.posts.list.useQuery({ status: "SCHEDULED" });
  const publishedQuery = trpc.social.posts.list.useQuery({ status: "PUBLISHED" });
  const draftsQuery = trpc.social.posts.list.useQuery({ status: "DRAFT" });
  const blogPostsQuery = trpc.post.list.useQuery({ page: 1, pageSize: 20, status: "PUBLISHED" });

  // ─── Mutations ────────────────────────────────────────────────────────────
  const deleteMutation = trpc.social.posts.delete.useMutation({
    onSuccess: () => {
      utils.social.posts.list.invalidate();
    },
  });

  const repurposeMutation = trpc.social.repurpose.useMutation();

  // ─── Derived data ─────────────────────────────────────────────────────────
  const accounts = accountsQuery.data?.items ?? [];
  const scheduledPosts = scheduledQuery.data?.items ?? [];
  const publishedPosts = publishedQuery.data?.items ?? [];
  const draftPosts = draftsQuery.data?.items ?? [];
  const blogPosts = blogPostsQuery.data?.items ?? [];

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleGenerate = () => {
    if (!selectedBlogPost || selectedPlatforms.length === 0) return;

    setGeneratedContent([]);

    repurposeMutation.mutate(
      {
        postId: selectedBlogPost,
        platforms: selectedPlatforms,
        tone: selectedTone,
      },
      {
        onSuccess: (data) => {
          setGeneratedContent(
            data.items.map((item) => ({
              platform: item.platform.toLowerCase() as Platform,
              content: item.content,
              charCount: item.content.length,
              charLimit: PLATFORM_CONFIG[item.platform.toLowerCase() as Platform]?.charLimit ?? 280,
            }))
          );
        },
      }
    );
  };

  const handleDelete = (postId: string) => {
    deleteMutation.mutate({ id: postId });
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "scheduled", label: "Scheduled" },
    { id: "published", label: "Published" },
    { id: "drafts", label: "Drafts" },
    { id: "repurpose", label: "Repurpose" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Social Media
            </h1>
            <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:text-accent">
              HUB
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Manage your social presence and auto-post content
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.056a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.81" />
          </svg>
          Connect Account
        </button>
      </div>

      {/* ─── Connected Accounts ──────────────────────────────── */}
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
        {accountsQuery.isLoading ? (
          <div className="flex min-w-[220px] items-center justify-center rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <span className="text-sm text-gray-400">Loading accounts...</span>
          </div>
        ) : (
          accounts.map((account) => {
            const platform = account.platform.toLowerCase() as Platform;
            const isExpired = account.tokenExpiresAt ? new Date(account.tokenExpiresAt) < new Date() : false;
            const status: AccountStatus = isExpired ? "expired" : "connected";

            return (
              <div
                key={account.id}
                className="flex min-w-[220px] shrink-0 items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
              >
                <PlatformBadge platform={platform} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {account.accountName}
                    </p>
                    <StatusDot status={status} />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-600">{account.accountId}</p>
                  <div className="mt-1 flex items-center gap-2">
                    {status === "expired" && (
                      <span className="text-[10px] font-medium text-amber-500 dark:text-warning">Reconnect</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Add Account card */}
        <button className="flex min-w-[160px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-4 text-gray-400 transition-colors hover:border-green-400 hover:text-green-600 dark:border-gray-800 dark:text-gray-600 dark:hover:border-accent/50 dark:hover:text-accent">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-current">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-xs font-medium">Add Account</span>
        </button>
      </div>

      {/* ─── Tabs ────────────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-gray-900">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
            {tab.id === "scheduled" && scheduledPosts.length > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-green-100 px-1.5 text-[10px] font-semibold text-green-700 dark:bg-accent/10 dark:text-accent">
                {scheduledPosts.length}
              </span>
            )}
            {tab.id === "drafts" && draftPosts.length > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                {draftPosts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─────────────────────────────────────── */}

      {/* Scheduled Tab */}
      {activeTab === "scheduled" && (
        <div className="space-y-3">
          {scheduledQuery.isLoading ? (
            <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-950">
              <span className="text-sm text-gray-400">Loading scheduled posts...</span>
            </div>
          ) : scheduledPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-950">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                <svg className="h-7 w-7 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No scheduled posts</p>
              <p className="mt-1 text-sm text-gray-500">
                Schedule your first post or use the Repurpose tab to generate content from your blog.
              </p>
            </div>
          ) : (
            scheduledPosts.map((post) => {
              const platform = post.socialAccount.platform.toLowerCase() as Platform;

              return (
                <div
                  key={post.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 sm:flex-row sm:items-start sm:justify-between dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
                >
                  <div className="flex gap-3">
                    <PlatformBadge platform={platform} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {post.content.length > 140 ? `${post.content.slice(0, 140)}...` : post.content}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-600">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(post.scheduledAt)}
                        </span>
                        {post.post?.title && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-accent">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.056a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.81" />
                            </svg>
                            {post.post.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:ml-4">
                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-50 dark:border-gray-700 dark:hover:border-red-900 dark:hover:bg-red-950/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Published Tab */}
      {activeTab === "published" && (
        <div className="space-y-3">
          {publishedQuery.isLoading ? (
            <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-950">
              <span className="text-sm text-gray-400">Loading published posts...</span>
            </div>
          ) : publishedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-950">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                <svg className="h-7 w-7 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No published posts yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Published social posts will appear here.
              </p>
            </div>
          ) : (
            publishedPosts.map((post) => {
              const platform = post.socialAccount.platform.toLowerCase() as Platform;

              return (
                <div
                  key={post.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="flex gap-3">
                    <PlatformBadge platform={platform} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {post.content.length > 160 ? `${post.content.slice(0, 160)}...` : post.content}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="text-xs text-gray-400 dark:text-gray-600">
                          {formatShortDate(post.publishedAt)}
                        </span>
                        <span className="text-xs text-gray-400 italic dark:text-gray-600">
                          No metrics yet
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Drafts Tab */}
      {activeTab === "drafts" && (
        <div className="space-y-3">
          {draftsQuery.isLoading ? (
            <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-950">
              <span className="text-sm text-gray-400">Loading drafts...</span>
            </div>
          ) : draftPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-950">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                <svg className="h-7 w-7 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No drafts yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Saved drafts will appear here.
              </p>
            </div>
          ) : (
            draftPosts.map((draft) => {
              const platform = draft.socialAccount.platform.toLowerCase() as Platform;

              return (
                <div
                  key={draft.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 sm:flex-row sm:items-start sm:justify-between dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
                >
                  <div className="flex gap-3">
                    <PlatformBadge platform={platform} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {draft.content}
                      </p>
                      <p className="mt-2 text-xs text-gray-400 dark:text-gray-600">
                        Last edited {timeAgo(draft.scheduledAt ?? draft.publishedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:ml-4">
                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200">
                      Edit
                    </button>
                    <button className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9">
                      Schedule
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Repurpose Tab */}
      {activeTab === "repurpose" && (
        <div className="space-y-6">
          {/* AI Content Repurposer Header */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Content Repurposer</h2>
              <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:text-accent">
                AI
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Transform your blog posts into platform-optimized social content.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Blog Post Selector */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select blog post
                </label>
                <select
                  value={selectedBlogPost}
                  onChange={(e) => setSelectedBlogPost(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-accent/50"
                >
                  <option value="">Choose a post...</option>
                  {blogPosts.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform Checkboxes */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Target platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["twitter", "linkedin", "facebook", "instagram"] as Platform[]).map((platform) => {
                    const config = PLATFORM_CONFIG[platform];
                    const isSelected = selectedPlatforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        onClick={() => togglePlatform(platform)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          isSelected
                            ? "border-green-300 bg-green-50 text-green-700 dark:border-accent/30 dark:bg-accent/10 dark:text-accent"
                            : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                        }`}
                      >
                        <span className="text-[10px]">{config.icon}</span>
                        {config.label}
                        {isSelected && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tone Selector */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tone
                </label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedTone === tone
                          ? "border-green-300 bg-green-50 text-green-700 dark:border-accent/30 dark:bg-accent/10 dark:text-accent"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGenerate}
                disabled={!selectedBlogPost || selectedPlatforms.length === 0 || repurposeMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
              >
                {repurposeMutation.isPending ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Content Results */}
          {generatedContent.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Generated Content
              </h3>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {generatedContent.map((item) => {
                  const config = PLATFORM_CONFIG[item.platform];
                  const isOverLimit = item.charCount > item.charLimit;

                  return (
                    <div
                      key={item.platform}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
                    >
                      {/* Platform header */}
                      <div className="flex items-center justify-between border-b border-gray-200/50 px-5 py-3 dark:border-gray-800/50">
                        <div className="flex items-center gap-2">
                          <PlatformBadge platform={item.platform} />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {config.label}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isOverLimit
                              ? "text-red-500 dark:text-error"
                              : "text-gray-400 dark:text-gray-600"
                          }`}
                        >
                          {item.charCount}/{item.charLimit.toLocaleString()}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="px-5 py-4">
                        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          {item.content}
                        </p>
                      </div>

                      {/* Character bar */}
                      <div className="px-5 pb-2">
                        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOverLimit
                                ? "bg-red-500 dark:bg-error"
                                : item.charCount / item.charLimit > 0.8
                                  ? "bg-amber-400 dark:bg-warning"
                                  : "bg-green-500 dark:bg-accent"
                            }`}
                            style={{ width: `${Math.min((item.charCount / item.charLimit) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 border-t border-gray-200/50 px-5 py-3 dark:border-gray-800/50">
                        <button className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          Schedule
                        </button>
                        <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                          </svg>
                          Copy
                        </button>
                        <button className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                          </svg>
                          Regenerate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
