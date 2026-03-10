import React, { useState, useEffect } from "react";
import { saveAuth, BASE_URL } from "./api";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [tab, setTab] = useState<"connect" | "apikey">("connect");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  // Listen for session detected from background worker
  useEffect(() => {
    const listener = (message: { type: string; token?: string }) => {
      if (message.type === "SESSION_DETECTED" && message.token) {
        saveAuth({ token: message.token }).then(onLogin);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [onLogin]);

  const handleConnect = () => {
    chrome.runtime.sendMessage({ type: "OPEN_LOGIN", url: `${BASE_URL}/login` });
  };

  const handleApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setChecking(true);
    try {
      const res = await fetch(`${BASE_URL}/api/trpc/user.me`, {
        headers: { Authorization: `Bearer ${apiKeyInput.trim()}` },
      });
      if (!res.ok) throw new Error("Invalid key");
      await saveAuth({ apiKey: apiKeyInput.trim() });
      onLogin();
    } catch {
      setError("Invalid API key. Check it and try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>✍️</div>
        <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
          RankFlo
        </h1>
        <p style={{ fontSize: "12px", color: "#6b7280" }}>Research. Generate. Publish.</p>
      </div>

      {/* Tab selector */}
      <div
        style={{
          display: "flex",
          background: "#111",
          borderRadius: "8px",
          padding: "2px",
          marginBottom: "20px",
          border: "1px solid #1f2937",
        }}
      >
        {(["connect", "apikey"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "6px",
              borderRadius: "6px",
              border: "none",
              background: tab === t ? "#1f2937" : "transparent",
              color: tab === t ? "#fff" : "#6b7280",
              fontSize: "12px",
              fontWeight: tab === t ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {t === "connect" ? "Connect Account" : "API Key"}
          </button>
        ))}
      </div>

      {tab === "connect" ? (
        <div>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "16px", lineHeight: 1.5 }}>
            Opens app.rankflo.io in a new tab. Log in there, then come back — the extension will
            connect automatically.
          </p>
          <button
            onClick={handleConnect}
            style={{
              width: "100%",
              padding: "10px",
              background: "#22c55e",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Connect RankFlo Account →
          </button>
        </div>
      ) : (
        <form onSubmit={handleApiKey}>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "12px", lineHeight: 1.5 }}>
            Generate an API key in{" "}
            <strong style={{ color: "#fff" }}>Settings → API Keys</strong> and paste it here.
          </p>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="sk_live_..."
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "#111",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "13px",
              marginBottom: "10px",
              outline: "none",
            }}
          />
          {error && (
            <p style={{ color: "#f87171", fontSize: "11px", marginBottom: "8px" }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={checking || !apiKeyInput.trim()}
            style={{
              width: "100%",
              padding: "10px",
              background: apiKeyInput.trim() ? "#22c55e" : "#1f2937",
              color: apiKeyInput.trim() ? "#000" : "#6b7280",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: apiKeyInput.trim() ? "pointer" : "default",
            }}
          >
            {checking ? "Connecting..." : "Connect"}
          </button>
        </form>
      )}
    </div>
  );
}
