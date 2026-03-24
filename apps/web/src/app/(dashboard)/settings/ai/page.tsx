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
    hasModels: false,
  },
  {
    id: "openai",
    label: "OpenAI",
    description: "GPT models (gpt-4o, gpt-4-turbo)",
    placeholder: "sk-proj-...",
    docsUrl: "https://platform.openai.com/api-keys",
    hasModels: true,
  },
  {
    id: "google",
    label: "Google AI",
    description: "Gemini models (gemini-2.0-flash)",
    placeholder: "AIza...",
    docsUrl: "https://aistudio.google.com/apikey",
    hasModels: false,
  },
  {
    id: "kie",
    label: "KIE.ai",
    description: "Gemini & GPT models + image generation",
    placeholder: "kie-...",
    docsUrl: "https://kie.ai",
    hasModels: false,
  },
  {
    id: "ollama",
    label: "Ollama",
    description: "Local models (Llama, Mistral, Gemma\u2026)",
    placeholder: "http://localhost:11434",
    docsUrl: "https://ollama.com",
    hasModels: true,
  },
] as const;

type ProviderId = (typeof PROVIDERS)[number]["id"];

export default function SettingsAIPage() {
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
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
      void refetch();
    },
  });

  const updateImage = trpc.organization.updateKieImageKey.useMutation({
    onSuccess: () => {
      setImageKey("");
      setImageSaved(true);
      setTimeout(() => setImageSaved(false), 3000);
      void refetch();
    },
  });

  const clear = trpc.organization.clearAISettings.useMutation({
    onSuccess: () => {
      setClearConfirm(false);
      setFetchedModels([]);
      setSelectedModel("");
      void refetch();
    },
  });

  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const activeProvider = PROVIDERS.find((p) => p.id === selectedProvider)!;
  const isOllama = selectedProvider === "ollama";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Ollama: URL is required but API key is optional
    if (isOllama) {
      const url = baseUrl.trim() || "http://localhost:11434";
      update.mutate({
        provider: "ollama",
        baseUrl: url,
        model: selectedModel || undefined,
      });
    } else {
      if (!apiKey.trim()) return;
      update.mutate({
        provider: selectedProvider,
        apiKey: apiKey.trim(),
        model: selectedModel || undefined,
      });
    }
  };

  const handleImageSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageKey.trim()) return;
    updateImage.mutate({ apiKey: imageKey.trim() });
  };

  const handleFetchModels = async () => {
    setFetchError("");
    setFetchLoading(true);
    try {
      if (isOllama) {
        // Fetch directly from the browser — Ollama is local on the user's machine
        const url = (baseUrl.trim() || "http://localhost:11434").replace(/\/$/, "");
        const res = await fetch(`${url}/api/tags`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (!res.ok) throw new Error(`Ollama returned ${res.status}. Is it running?`);
        const data = await res.json() as { models: { name: string }[] };
        const models = data.models.map((m) => m.name);
        setFetchedModels(models);
        if (models.length > 0 && !selectedModel) setSelectedModel(models[0] ?? "");
      } else if (selectedProvider === "openai") {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey.trim()}` },
        });
        if (!res.ok) throw new Error("Invalid API key or network error");
        const data = await res.json() as { data: { id: string }[] };
        const models = data.data.map((m) => m.id).sort();
        setFetchedModels(models);
        if (models.length > 0 && !selectedModel) setSelectedModel(models[0] ?? "");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch models";
      if (msg === "Failed to fetch" && isOllama) {
        setFetchError(
          "Could not reach Ollama. Make sure it's running and has CORS enabled for this domain. " +
          "In Terminal: launchctl setenv OLLAMA_ORIGINS \"https://app.rankflo.io\" — then restart Ollama."
        );
      } else {
        setFetchError(msg);
      }
    } finally {
      setFetchLoading(false);
    }
  };

  // Determine whether the save button should be enabled
  const canSave = isOllama
    ? true // can always save ollama (uses default URL if blank)
    : !!apiKey.trim();

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
              <p className="text-sm font-medium text-green-400">AI provider connected</p>
              <p className="text-xs text-gray-500">
                Provider: <span className="text-gray-400 capitalize">{data.provider}</span>
                {data.model && (
                  <>{" · "}Model: <span className="text-gray-400">{data.model}</span></>
                )}
                {data.maskedKey && (
                  <>{" · "}Key: <code className="text-gray-400">{data.maskedKey}</code></>
                )}
                {data.baseUrl && (
                  <>{" · "}URL: <span className="text-gray-400">{data.baseUrl}</span></>
                )}
              </p>
            </div>
          </div>
          {clearConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Remove settings?</span>
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

      {/* Ollama status (no API key required) */}
      {data?.provider === "ollama" && !data.hasKey && (
        <div className="flex items-center justify-between rounded-xl border border-green-800/40 bg-green-950/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-900/50 text-green-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-green-400">Ollama connected</p>
              <p className="text-xs text-gray-500">
                URL: <span className="text-gray-400">{data.baseUrl ?? "http://localhost:11434"}</span>
                {data.model && <>{" · "}Model: <span className="text-gray-400">{data.model}</span></>}
              </p>
            </div>
          </div>
          {clearConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Remove settings?</span>
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedProvider(p.id);
                  setFetchedModels([]);
                  setSelectedModel("");
                }}
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

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-3">
          {isOllama ? (
            /* Ollama: show URL input instead of API key */
            <div>
              <label className="text-sm font-medium text-white">Ollama URL</label>
              <p className="mt-0.5 text-xs text-gray-500">
                The base URL of your Ollama server. Defaults to{" "}
                <code className="text-gray-400">http://localhost:11434</code> if left blank.{" "}
                See{" "}
                <a
                  href={activeProvider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  ollama.com
                </a>
              </p>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={
                  data?.provider === "ollama" && data.baseUrl
                    ? data.baseUrl
                    : "http://localhost:11434"
                }
                className="mt-2 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm font-mono text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                autoComplete="off"
              />
            </div>
          ) : (
            /* All other providers: API key */
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
                placeholder={
                  data?.hasKey && data.provider === selectedProvider
                    ? (data.maskedKey ?? activeProvider.placeholder)
                    : activeProvider.placeholder
                }
                className="mt-2 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm font-mono text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                autoComplete="off"
              />
            </div>
          )}

          {/* Model selection (Ollama + OpenAI) */}
          {activeProvider.hasModels && (
            <div className="space-y-3">
              {/* Manual model name entry (always works) */}
              {isOllama && (
                <div>
                  <label className="text-xs font-medium text-gray-400">Model name</label>
                  <input
                    type="text"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    placeholder={data?.model && data.provider === "ollama" ? data.model : "e.g. llama3.2, mistral, gemma3"}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm font-mono text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {["llama3.2", "llama3.1", "mistral", "gemma3", "phi4", "qwen2.5", "deepseek-r1"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedModel(m)}
                        className={`rounded px-2 py-0.5 text-xs transition-colors ${selectedModel === m ? "bg-accent/20 text-accent border border-accent/40" : "border border-gray-700 text-gray-500 hover:text-gray-300"}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto-fetch (works when Ollama CORS is configured, or for OpenAI) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleFetchModels()}
                  disabled={fetchLoading}
                  className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-gray-600 hover:text-gray-300 disabled:opacity-50 transition-colors"
                >
                  {fetchLoading ? "Fetching…" : isOllama ? "Auto-detect models" : "Fetch Models"}
                </button>
                {fetchedModels.length > 0 && (
                  <span className="text-xs text-gray-500">{fetchedModels.length} models found</span>
                )}
              </div>

              {fetchError && (
                <p className="text-xs text-red-400">{fetchError}</p>
              )}

              {fetchedModels.length > 0 && !isOllama && (
                <div>
                  <label className="text-xs font-medium text-gray-400">Select model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="">Use default</option>
                    {fetchedModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              {fetchedModels.length > 0 && isOllama && (
                <div className="flex flex-wrap gap-1.5">
                  {fetchedModels.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedModel(m)}
                      className={`rounded px-2 py-0.5 text-xs transition-colors ${selectedModel === m ? "bg-accent/20 text-accent border border-accent/40" : "border border-gray-700 text-gray-500 hover:text-gray-300"}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {update.error && (
            <p className="text-xs text-red-400">{update.error.message}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={update.isPending || !canSave}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-9 disabled:opacity-50 transition-colors"
            >
              {update.isPending ? "Saving\u2026" : saved ? "Saved!" : "Save settings"}
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
              placeholder={data?.hasImageKey ? (data.maskedImageKey ?? "kie-...") : "kie-..."}
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
              {updateImage.isPending ? "Saving\u2026" : imageSaved ? "Saved!" : "Save image key"}
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
          {" "}
          <strong className="text-gray-400">Ollama:</strong> Model fetching happens directly from your browser, so <code className="text-gray-400">http://localhost:11434</code> works for local Ollama. AI generation runs server-side, so the saved URL must also be reachable from the RankFlo server.
        </p>
      </div>
    </div>
  );
}
