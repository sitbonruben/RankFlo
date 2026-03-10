import React, { useState, useEffect } from "react";
import { Login } from "./Login";
import { Generate } from "./Generate";
import { callApi, getStoredAuth, clearAuth } from "./api";

interface Project {
  id: string;
  name: string;
  status: string;
}

interface UserInfo {
  name: string;
  email: string;
}

type Screen = "login" | "dashboard" | "generate";

export function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [token, setToken] = useState<string | undefined>();
  const [apiKey, setApiKey] = useState<string | undefined>();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    getStoredAuth().then(async ({ token: t, apiKey: k }) => {
      if (t || k) {
        setToken(t);
        setApiKey(k);
        await loadUserData(t, k);
        setScreen("dashboard");
      }
      setLoading(false);
    });
  }, []);

  const loadUserData = async (t?: string, k?: string) => {
    try {
      const [me, projs, billing] = await Promise.allSettled([
        callApi("user.me", {}, t, k),
        callApi("project.list", { page: 1, pageSize: 20 }, t, k),
        callApi("billing.getCredits", {}, t, k),
      ]);

      if (me.status === "fulfilled" && me.value) {
        const u = me.value as { name?: string; email?: string };
        setUser({ name: u.name ?? "User", email: u.email ?? "" });
      }
      if (projs.status === "fulfilled" && projs.value) {
        const p = projs.value as { projects?: Project[]; items?: Project[] };
        setProjects(p.projects ?? p.items ?? []);
      }
      if (billing.status === "fulfilled" && billing.value) {
        const b = billing.value as { balance?: number };
        setCredits(b.balance ?? null);
      }
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await clearAuth();
    setToken(undefined);
    setApiKey(undefined);
    setUser(null);
    setProjects([]);
    setScreen("login");
  };

  const handleLogin = async () => {
    const auth = await getStoredAuth();
    setToken(auth.token);
    setApiKey(auth.apiKey);
    await loadUserData(auth.token, auth.apiKey);
    setScreen("dashboard");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div style={{ color: "#6b7280", fontSize: "13px" }}>Loading...</div>
      </div>
    );
  }

  if (screen === "login") {
    return <Login onLogin={handleLogin} />;
  }

  if (screen === "generate") {
    return (
      <Generate
        token={token}
        apiKey={apiKey}
        projects={projects}
        onBack={() => setScreen("dashboard")}
        onPublished={() => setScreen("dashboard")}
      />
    );
  }

  // Dashboard
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #1f2937",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>✍️</span>
          <span style={{ fontWeight: 700, fontSize: "14px", color: "#fff" }}>RankFlo</span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
            fontSize: "11px",
            cursor: "pointer",
            padding: "2px 6px",
          }}
        >
          Sign out
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        {/* User card */}
        {user && (
          <div
            style={{
              padding: "10px 14px",
              background: "#0a0a0a",
              border: "1px solid #1f2937",
              borderRadius: "10px",
              marginBottom: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{user.name}</p>
              <p style={{ fontSize: "11px", color: "#6b7280" }}>{user.email}</p>
            </div>
            {credits !== null && (
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "#22c55e" }}>{credits}</p>
                <p style={{ fontSize: "10px", color: "#6b7280" }}>AI credits</p>
              </div>
            )}
          </div>
        )}

        {/* Primary action */}
        <button
          onClick={() => setScreen("generate")}
          style={{
            width: "100%",
            padding: "14px",
            background: "#22c55e",
            color: "#000",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          ✨ Generate Blog Post
        </button>

        {/* Projects list */}
        {projects.length > 0 && (
          <div>
            <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Projects
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {projects.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: "8px 12px",
                    background: "#0a0a0a",
                    border: "1px solid #1f2937",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#e5e7eb" }}>{p.name}</span>
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: p.status === "ACTIVE" ? "#0f1f0f" : "#1a1a1a",
                      color: p.status === "ACTIVE" ? "#22c55e" : "#6b7280",
                    }}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 && (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              border: "1px dashed #374151",
              borderRadius: "10px",
              color: "#6b7280",
              fontSize: "12px",
            }}
          >
            No projects yet. Create one at app.rankflo.io
          </div>
        )}
      </div>
    </div>
  );
}
