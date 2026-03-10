"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

export default function SettingsAPIKeysPage() {
  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showMcpSnippet, setShowMcpSnippet] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);

  const { data: keys, refetch } = trpc.apiKey.list.useQuery();

  const create = trpc.apiKey.create.useMutation({
    onSuccess: (data) => {
      setCreatedKey(data.key);
      setNewKeyName("");
      refetch();
    },
  });

  const revoke = trpc.apiKey.revoke.useMutation({
    onSuccess: () => {
      setRevokeConfirm(null);
      refetch();
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    create.mutate({ name: newKeyName.trim() });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mcpSnippet = `{
  "mcpServers": {
    "rankflo": {
      "command": "npx",
      "args": ["@rankflo/mcp"],
      "env": {
        "RANKFLO_API_KEY": "sk_live_your_key_here",
        "RANKFLO_URL": "${typeof window !== "undefined" ? window.location.origin : "https://app.rankflo.io"}"
      }
    }
  }
}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">API Keys</h2>
          <p className="text-sm text-gray-400">
            Programmatic access to your RankFlo account. Keys inherit your admin permissions.
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setCreatedKey(null); }}
          className="flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-black transition-colors hover:bg-accent-9"
        >
          + Generate Key
        </button>
      </div>

      {/* Claude Desktop MCP snippet */}
      <div className="rounded-xl border border-gray-800 bg-gray-950">
        <button
          onClick={() => setShowMcpSnippet(!showMcpSnippet)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-base">🤖</span>
            <div>
              <p className="text-sm font-medium text-white">Claude Desktop (MCP)</p>
              <p className="text-xs text-gray-400">
                Use Claude to create and publish blog posts directly
              </p>
            </div>
          </div>
          <span className="text-gray-500 text-xs">{showMcpSnippet ? "▲ hide" : "▼ show setup"}</span>
        </button>

        {showMcpSnippet && (
          <div className="border-t border-gray-800 px-4 pb-4">
            <p className="mt-3 text-xs text-gray-400 mb-2">
              1. Generate an API key above. Then add this to{" "}
              <code className="text-accent">~/Library/Application Support/Claude/claude_desktop_config.json</code>
              , replacing <code className="text-accent">sk_live_your_key_here</code>:
            </p>
            <div className="relative">
              <pre className="overflow-x-auto rounded-lg bg-black p-4 text-xs text-gray-300 leading-relaxed">
                {mcpSnippet}
              </pre>
              <button
                onClick={() => handleCopy(mcpSnippet)}
                className="absolute right-2 top-2 rounded px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              2. Restart Claude Desktop. Then ask Claude:{" "}
              <em className="text-gray-400">"List my RankFlo projects"</em> to verify it's working.
            </p>
          </div>
        )}
      </div>

      {/* Keys table */}
      {keys && keys.length > 0 ? (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-950">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Key</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Last used</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {keys.map((k) => (
                <tr key={k.id} className="bg-black hover:bg-gray-950">
                  <td className="px-4 py-3 text-white font-medium">{k.name}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-gray-400 bg-gray-900 px-2 py-0.5 rounded">
                      {k.keyPrefix}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {revokeConfirm === k.id ? (
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs text-gray-400">Revoke?</span>
                        <button
                          onClick={() => revoke.mutate({ id: k.id })}
                          disabled={revoke.isPending}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setRevokeConfirm(null)}
                          className="text-xs text-gray-500 hover:text-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRevokeConfirm(k.id)}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-950 py-12 text-center">
          <p className="text-sm text-gray-500">No API keys yet. Generate one to get started.</p>
        </div>
      )}

      {/* Generate modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-xl">
            {createdKey ? (
              <>
                <h3 className="text-base font-semibold text-white">Save your API key</h3>
                <p className="mt-1 text-sm text-gray-400">
                  This key is shown <strong className="text-white">only once</strong>. Copy it now.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <code className="flex-1 overflow-x-auto rounded-lg bg-black px-3 py-2 text-xs text-accent font-mono select-all">
                    {createdKey}
                  </code>
                  <button
                    onClick={() => handleCopy(createdKey)}
                    className="shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-black hover:bg-accent-9"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <button
                  onClick={() => { setShowModal(false); setCreatedKey(null); }}
                  className="mt-4 w-full rounded-lg border border-gray-700 py-2 text-sm text-gray-300 hover:border-gray-600 hover:text-white"
                >
                  I've saved my key — Close
                </button>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-white">Generate API key</h3>
                <p className="mt-1 text-sm text-gray-400">Give it a descriptive name.</p>
                <form onSubmit={handleCreate} className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Claude Desktop, Chrome Extension"
                    className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                    autoFocus
                  />
                  {create.error && (
                    <p className="text-xs text-red-400">{create.error.message}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={create.isPending || !newKeyName.trim()}
                      className="flex-1 rounded-lg bg-accent py-2 text-sm font-semibold text-black hover:bg-accent-9 disabled:opacity-50"
                    >
                      {create.isPending ? "Generating..." : "Generate"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
