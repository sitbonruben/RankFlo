"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/trpc/client";

function buildUtmUrl(
  baseUrl: string,
  source: string,
  medium: string,
  campaign: string,
  term: string,
  content: string,
): string {
  if (!baseUrl) return "";
  try {
    const url = new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`);
    if (source) url.searchParams.set("utm_source", source);
    if (medium) url.searchParams.set("utm_medium", medium);
    if (campaign) url.searchParams.set("utm_campaign", campaign);
    if (term) url.searchParams.set("utm_term", term);
    if (content) url.searchParams.set("utm_content", content);
    return url.toString();
  } catch {
    return "";
  }
}

export default function UtmPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [baseUrl, setBaseUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [linkName, setLinkName] = useState("");

  // tRPC queries
  const linksQuery = trpc.utm.list.useQuery({ page: 1, limit: 50 });
  const statsQuery = trpc.utm.stats.useQuery();

  // tRPC mutations
  const utils = trpc.useUtils();

  const createMutation = trpc.utm.create.useMutation({
    onSuccess: () => {
      utils.utm.list.invalidate();
      utils.utm.stats.invalidate();
      setBaseUrl("");
      setSource("");
      setMedium("");
      setCampaign("");
      setTerm("");
      setContent("");
      setLinkName("");
    },
  });

  const deleteMutation = trpc.utm.delete.useMutation({
    onSuccess: () => {
      utils.utm.list.invalidate();
      utils.utm.stats.invalidate();
    },
  });

  const links = linksQuery.data?.links ?? [];
  const stats = statsQuery.data;

  const sortedLinks = useMemo(
    () => [...links].sort((a, b) => b.clicks - a.clicks),
    [links],
  );

  const previewUrl = useMemo(
    () => buildUtmUrl(baseUrl, source, medium, campaign, term, content),
    [baseUrl, source, medium, campaign, term, content],
  );

  function handleCreate() {
    if (!baseUrl || !source || !medium || !campaign || !linkName) return;
    createMutation.mutate({
      name: linkName,
      baseUrl: baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`,
      utmSource: source,
      utmMedium: medium,
      utmCampaign: campaign,
      utmTerm: term || undefined,
      utmContent: content || undefined,
    });
  }

  function handleCopy(link: (typeof links)[0]) {
    navigator.clipboard.writeText(link.fullUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleDelete(id: string) {
    deleteMutation.mutate({ id });
  }

  const canCreate = baseUrl && source && medium && campaign && linkName && !createMutation.isPending;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          UTM Builder
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Create and track campaign links
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Links", value: stats?.totalLinks.toString() ?? "--" },
          { label: "Total Clicks", value: stats?.totalClicks.toLocaleString() ?? "--" },
          { label: "Top Campaign", value: stats?.topCampaigns[0]?.campaign ?? "--" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Link Builder Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h2 className="text-sm font-medium text-gray-900 dark:text-white">Create a new link</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Base URL */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Base URL <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-accent dark:focus:ring-accent"
            />
          </div>

          {/* UTM Source */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              UTM Source <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder='e.g. "twitter", "newsletter"'
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-accent dark:focus:ring-accent"
            />
          </div>

          {/* UTM Medium */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              UTM Medium <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder='e.g. "social", "email"'
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-accent dark:focus:ring-accent"
            />
          </div>

          {/* UTM Campaign */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              UTM Campaign <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder='e.g. "spring-launch"'
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-accent dark:focus:ring-accent"
            />
          </div>

          {/* UTM Term (optional) */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              UTM Term <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Paid keyword"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-accent dark:focus:ring-accent"
            />
          </div>

          {/* UTM Content (optional) */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              UTM Content <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ad variation or CTA"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-accent dark:focus:ring-accent"
            />
          </div>

          {/* Link Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Link Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              placeholder="A friendly name for this link"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-accent dark:focus:ring-accent"
            />
          </div>
        </div>

        {/* Live Preview */}
        {previewUrl && (
          <div className="mt-5 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Preview
            </p>
            <p className="break-all text-sm text-green-700 dark:text-accent">{previewUrl}</p>
          </div>
        )}

        {createMutation.isError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {createMutation.error.message}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-accent dark:text-gray-950 dark:hover:bg-accent/90"
          >
            {createMutation.isPending ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
            {createMutation.isPending ? "Creating..." : "Create Link"}
          </button>
        </div>
      </div>

      {/* Existing Links Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/50">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">
            Tracked Links
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">Sorted by clicks (highest first)</p>
        </div>

        {/* Table header */}
        <div className="hidden border-b border-gray-100 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 sm:grid sm:grid-cols-12 dark:border-gray-800/50">
          <span className="col-span-3">Name</span>
          <span className="col-span-2">Campaign</span>
          <span className="col-span-2">Source / Medium</span>
          <span className="col-span-2 text-right">Clicks</span>
          <span className="col-span-2 text-right">Created</span>
          <span className="col-span-1 text-right">Actions</span>
        </div>

        {linksQuery.isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 px-5 py-3.5 sm:grid-cols-12 sm:items-center sm:gap-0">
                <div className="sm:col-span-3">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="mt-1.5 h-3 w-44 animate-pulse rounded bg-gray-100 dark:bg-gray-800/50" />
                </div>
                <div className="sm:col-span-2">
                  <div className="h-5 w-20 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800/50" />
                </div>
                <div className="sm:col-span-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-800/50" />
                </div>
                <div className="sm:col-span-2 sm:text-right">
                  <div className="ml-auto h-4 w-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800/50" />
                </div>
                <div className="sm:col-span-2 sm:text-right">
                  <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-800/50" />
                </div>
                <div className="sm:col-span-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {sortedLinks.map((link) => (
              <div
                key={link.id}
                className="group grid grid-cols-1 gap-2 px-5 py-3.5 transition-colors hover:bg-gray-50 sm:grid-cols-12 sm:items-center sm:gap-0 dark:hover:bg-gray-900/50"
              >
                {/* Name */}
                <div className="sm:col-span-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {link.name}
                  </span>
                  <p className="mt-0.5 max-w-[200px] truncate text-[11px] text-gray-400">
                    {link.baseUrl}
                  </p>
                </div>

                {/* Campaign */}
                <div className="sm:col-span-2">
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-accent/10 dark:text-accent">
                    {link.utmCampaign}
                  </span>
                </div>

                {/* Source / Medium */}
                <div className="sm:col-span-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {link.utmSource}
                  </span>
                  <span className="mx-1 text-gray-300 dark:text-gray-600">/</span>
                  <span className="text-sm text-gray-500">{link.utmMedium}</span>
                </div>

                {/* Clicks */}
                <div className="sm:col-span-2 sm:text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {link.clicks.toLocaleString()}
                  </span>
                </div>

                {/* Created */}
                <div className="sm:col-span-2 sm:text-right">
                  <span className="text-sm text-gray-500">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 sm:col-span-1">
                  <button
                    onClick={() => handleCopy(link)}
                    title="Copy UTM URL"
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  >
                    {copiedId === link.id ? (
                      <svg className="h-4 w-4 text-green-600 dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m0 0a9.06 9.06 0 011.5-.124H12" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    disabled={deleteMutation.isPending}
                    title="Delete link"
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!linksQuery.isLoading && links.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            No links yet. Create your first UTM link above.
          </div>
        )}
      </div>
    </div>
  );
}
