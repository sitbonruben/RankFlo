"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

const PROVIDERS = [
  {
    id: "anthropic",
    label: "Anthropic",
    description: "Claude models (Sonnet, Opus)",
    placeholder: "sk-ant-api03-...",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "openai",
    label: "OpenAI",
    description: "GPT models (gpt-4o, gpt-4-turbo)",
    placeholder: "sk-proj-...",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "google",
    label: "Google AI",
    description: "Gemini models (gemini-2.0-flash)",
    placeholder: "AIza...",
    docsUrl: "https://aistudio.google.com/apikey",
  },
  {
    id: "kie",
    label: "KIE.ai",
    description: "Gemini & GPT models + image generation",
    placeholder: "kie-...",
    docsUrl: "https://kie.ai",
  },
] as const;

type ProviderId = (typeof PROVIDERS)[number]["id"];

export default function SettingsAIPage() {
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [imageKey, setImageKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [imageSaved, setImageSaved] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const { data, refetch } = trpc.organization.getAISettings.useQuery();

  const update = trpc.organization.updateAISettings.useMutation({
    onSuccess: () => {
      setApiKey("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      refetch();
    },
  });

  const updateImage = trpc.organization.updateKieImageKey.useMutation({
    onSuccess: () => {
      setImageKey("");
      setImageSaved(true);
      setTimeout(() => setImageSaved(false), 3000);
      refetch();
    },
  });

  const clear = trpc.organization.clearAISettings.useMutation({
    onSuccess: () => {
      setClearConfirm(false);
      refetch();
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    update.mutate({ provider: selectedProvider, apiKey: apiKey.trim() });
  };

  const handleImageSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageKey.trim()) return;
    updateImage.mutate({ apiKey: imageKey.trim() });
  };

  const activeProvider = PROVIDERS.find((p) => p.id === selectedProvider)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white">AI Provider</h2>
        <p className="text-sm text-gray-400">
          Connect an AI provider to enable content generation, topic suggestions, and the AI writing assistant.
          Your key is stored securely and takes precedence over any server environment variables.
        </p>
      </div>

      {/* Current key status */}
      {data?.hasKey && (
        <div className="flex items-center justify-between rounded-xl border border-green-800/40 bg-green-950/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-900/50 text-green-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-green-400">API key connected</p>
              <p className="text-xs text-gray-500">
                Provider: <span className="text-gray-400 capitalize">{data.provider}</span>
                {" · "}Key: <code className="text-gray-400">{data.maskedKey}</code>
              </p>
            </div>
          </div>
          {clearConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Remove key?</span>
              <button
                onClick={() => clear.mutate()}
                disabled={clear.isPending}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Yes, remove
              </button>
              <button
                onClick={() => setClearConfirm(false)}
                className="text-xs text-gray-500 hover:text-gray-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setClearConfirm(true)}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}

      {/* Provider selector */}
      <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 space-y-5">
        <div>
          <p className="text-sm font-medium text-white mb-3">Select provider</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProvider(p.id)}
                className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                  selectedProvider === p.id
                    ? "border-accent/60 bg-accent/10 text-white"
                    : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                }`}
              >
                <p className="text-sm font-medium">{p.label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{p.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* API key input */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-white">
              {activeProvider.label} API Key
            </label>
            <p className="mt-0.5 text-xs text-gray-500">
              Get your key from{" "}
              <a
                href={activeProvider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {activeProvider.docsUrl.replace("https://", "")}
              </a>
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={data?.hasKey && data.provider === selectedProvider ? data.maskedKey ?? activeProvider.placeholder : activeProvider.placeholder}
              className="mt-2 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm font-mono text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
              autoComplete="off"
            />
          </div>

          {update.error && (
            <p className="text-xs text-red-400">{update.error.message}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={update.isPending || !apiKey.trim()}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-9 disabled:opacity-50 transition-colors"
            >
              {update.isPending ? "Saving..." : saved ? "Saved!" : "Save key"}
            </button>
            {saved && (
              <span className="text-xs text-green-400">
                AI features are now active.
              </span>
            )}
          </div>
        </form>
      </div>

      {/* KIE Image Generation */}
      <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Image Generation</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            KIE.ai Nano Banana (Gemini 2.5 Flash) — generate images directly inside blog posts.
            Requires a separate KIE API key.
          </p>
        </div>

        {data?.hasImageKey && (
          <div className="flex items-center gap-3 rounded-lg border border-green-800/30 bg-green-950/20 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <p className="text-xs text-green-400">
              Image key connected: <code className="text-gray-400">{data.maskedImageKey}</code>
            </p>
          </div>
        )}

        <form onSubmit={handleImageSave} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-white">KIE API Key (for images)</label>
            <p className="mt-0.5 text-xs text-gray-500">
              Get your key from{" "}
              <a href="https://kie.ai" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                kie.ai
              </a>
            </p>
            <input
              type="password"
              value={imageKey}
              onChange={(e) => setImageKey(e.target.value)}
              placeholder={data?.hasImageKey ? data.maskedImageKey ?? "kie-..." : "kie-..."}
              className="mt-2 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm font-mono text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
              autoComplete="off"
            />
          </div>
          {updateImage.error && (
            <p className="text-xs text-red-400">{updateImage.error.message}</p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={updateImage.isPending || !imageKey.trim()}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-9 disabled:opacity-50 transition-colors"
            >
              {updateImage.isPending ? "Saving..." : imageSaved ? "Saved!" : "Save image key"}
            </button>
            {imageSaved && <span className="text-xs text-green-400">Image generation enabled.</span>}
          </div>
        </form>
      </div>

      {/* Info box */}
      <div className="rounded-xl border border-gray-800 bg-gray-950/50 px-4 py-3">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-400">Security:</strong> Your API keys are stored encrypted in your organization settings. They are never exposed in the browser or logs. They are only used server-side when you trigger AI features.
          {" "}
          <strong className="text-gray-400">Priority:</strong> Org-level keys override any server environment variables.
        </p>
      </div>
    </div>
  );
}
