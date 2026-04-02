"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

const APP_HOST = "app.rankflo.io";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="ml-2 rounded px-2 py-0.5 text-xs text-gray-500 transition-colors hover:text-white"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function DomainsPage() {
  const { data, isLoading, refetch } = trpc.organization.getDomains.useQuery();
  const [input, setInput] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const utils = trpc.useUtils();

  const set = trpc.organization.setCustomDomain.useMutation({
    onSuccess: () => {
      utils.organization.getDomains.invalidate();
      setEditMode(false);
      setError("");
    },
    onError: (err) => setError(err.message),
  });

  const remove = trpc.organization.setCustomDomain.useMutation({
    onSuccess: () => utils.organization.getDomains.invalidate(),
    onError: (err) => setError(err.message),
  });

  const defaultSubdomain = data?.slug ? `${data.slug}.rankflo.io` : null;

  function startEdit() {
    setInput(data?.customDomain ?? "");
    setError("");
    setEditMode(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Domains</h2>
        <p className="text-sm text-gray-500">Configure the domain where your blog is served.</p>
      </div>

      {/* Default subdomain */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Default subdomain</p>
            {isLoading ? (
              <p className="mt-0.5 text-sm text-gray-500">Loading…</p>
            ) : (
              <p className="mt-0.5 font-mono text-sm text-accent">{defaultSubdomain ?? "—"}</p>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Active
          </span>
        </div>
      </div>

      {/* Custom domain */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Custom domain</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Serve your blog from your own domain (e.g. blog.yourcompany.com).
            </p>
          </div>
          {data?.customDomain && !editMode ? (
            <div className="flex gap-2">
              <button
                onClick={startEdit}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-gray-300 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white"
              >
                Edit
              </button>
              <button
                onClick={() => remove.mutate({ customDomain: null })}
                disabled={remove.isPending}
                className="rounded-lg border border-red-900/40 px-3 py-1.5 text-xs text-red-500 hover:border-red-700 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          ) : !editMode ? (
            <button
              onClick={startEdit}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-gray-100 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
            >
              Add domain
            </button>
          ) : null}
        </div>

        {!editMode && data?.customDomain && (
          <div className="mt-3 flex items-center gap-2">
            <span className="font-mono text-sm text-white">{data.customDomain}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-500/20">
              Verify DNS
            </span>
          </div>
        )}

        {editMode && (
          <div className="mt-4 flex flex-col gap-3">
            {error && (
              <p className="rounded-lg bg-red-950/30 px-3 py-2 text-sm text-red-400">{error}</p>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              placeholder="blog.yourdomain.com"
              className="h-10 rounded-lg border border-gray-700 bg-gray-900 px-3 font-mono text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setEditMode(false); setError(""); }}
                className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => set.mutate({ customDomain: input.trim() || null })}
                disabled={set.isPending}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                {set.isPending ? "Saving…" : "Save domain"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DNS instructions */}
      {data?.customDomain && !editMode && (
        <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-5">
          <p className="text-sm font-medium text-white">DNS configuration</p>
          <p className="mt-1 text-xs text-gray-500">
            Add this CNAME record at your DNS provider to verify and activate your domain.
          </p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500">
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 font-mono text-gray-300">CNAME</td>
                  <td className="px-4 py-3 font-mono text-gray-300">
                    {data.customDomain.split(".").slice(0, -2).join(".")}
                    <CopyButton text={data.customDomain.split(".").slice(0, -2).join(".")} />
                  </td>
                  <td className="px-4 py-3 font-mono text-accent">
                    {APP_HOST}
                    <CopyButton text={APP_HOST} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            DNS changes can take up to 48 hours to propagate. Once resolved, your blog will be served from your custom domain automatically.
          </p>
        </div>
      )}
    </div>
  );
}
