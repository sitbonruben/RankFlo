import React, { useState, useEffect } from "react";
import { callApi } from "./api";

interface PageInfo {
  title: string;
  url: string;
  description: string;
  body: string;
}

interface Project {
  id: string;
  name: string;
}

interface GenerateProps {
  token?: string;
  apiKey?: string;
  projects: Project[];
  onBack: () => void;
  onPublished: () => void;
}

export function Generate({ token, apiKey, projects, onBack, onPublished }: GenerateProps) {
  const [page, setPage] = useState<PageInfo | null>(null);
  const [topic, setTopic] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [tone, setTone] = useState("informative");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<{ title: string; content: string } | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">("draft");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Get page info from content script
    chrome.runtime.sendMessage({ type: "GET_PAGE_INFO" }, (info: PageInfo) => {
      if (info && !chrome.runtime.lastError) {
        setPage(info);
        setTopic(info.title || "");
      }
    });
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const result = (await callApi(
        "ai.generatePost",
        {
          projectId,
          topic: topic.trim(),
          tone,
          pageUrl: page?.url,
          pageContext: page?.body ? `${page.description}\n\n${page.body}`.slice(0, 500) : undefined,
        },
        token,
        apiKey,
      )) as { title?: string; content?: string };

      const title = result?.title ?? topic;
      const content = result?.content ?? "";
      setGenerated({ title, content });
      setEditedTitle(title);
      setEditedContent(content);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      alert(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // Create post
      const post = (await callApi(
        "post.create",
        {
          projectId,
          title: editedTitle,
          content: editedContent,
          status: publishStatus === "published" ? "PUBLISHED" : "DRAFT",
        },
        token,
        apiKey,
      )) as { id: string };

      setDone(true);
      setTimeout(onPublished, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Publish failed";
      alert(msg);
    } finally {
      setPublishing(false);
    }
  };

  if (done) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎉</div>
        <p style={{ color: "#22c55e", fontWeight: 700 }}>Post saved!</p>
        <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "4px" }}>Returning to dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          borderBottom: "1px solid #1f2937",
        }}
      >
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 0, fontSize: "18px" }}
        >
          ←
        </button>
        <span style={{ fontWeight: 600, fontSize: "14px", color: "#fff" }}>Generate Post</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        {/* Page context badge */}
        {page?.url && (
          <div
            style={{
              padding: "6px 10px",
              background: "#0f1f0f",
              border: "1px solid #166534",
              borderRadius: "6px",
              marginBottom: "14px",
              fontSize: "11px",
              color: "#4ade80",
            }}
          >
            📄 {page.title || page.url}
          </div>
        )}

        {/* Topic */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>
            Topic / Title
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={2}
            style={{
              width: "100%",
              padding: "8px",
              background: "#111",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "13px",
              resize: "none",
              outline: "none",
            }}
          />
        </div>

        {/* Tone + Project */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 8px",
                background: "#111",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
            >
              <option value="informative">Informative</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="persuasive">Persuasive</option>
              <option value="seo">SEO-focused</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 8px",
                background: "#111",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!generated ? (
          <button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            style={{
              width: "100%",
              padding: "10px",
              background: topic.trim() ? "#22c55e" : "#1f2937",
              color: topic.trim() ? "#000" : "#6b7280",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: topic.trim() ? "pointer" : "default",
            }}
          >
            {generating ? "✨ Generating..." : "✨ Generate with AI"}
          </button>
        ) : (
          <>
            {/* Edit generated content */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Title</label>
              <input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "#111",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  outline: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>
                Content (Markdown)
              </label>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={10}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "#111",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#d1d5db",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>

            {/* Publish controls */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              {(["draft", "published"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setPublishStatus(s)}
                  style={{
                    flex: 1,
                    padding: "7px",
                    borderRadius: "6px",
                    border: `1px solid ${publishStatus === s ? "#22c55e" : "#374151"}`,
                    background: publishStatus === s ? "#0f1f0f" : "transparent",
                    color: publishStatus === s ? "#22c55e" : "#9ca3af",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {s === "draft" ? "💾 Draft" : "🚀 Publish"}
                </button>
              ))}
            </div>
            <button
              onClick={handlePublish}
              disabled={publishing}
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
              {publishing ? "Saving..." : publishStatus === "draft" ? "Save as Draft" : "Publish Post"}
            </button>
            <button
              onClick={() => setGenerated(null)}
              style={{
                width: "100%",
                padding: "8px",
                background: "transparent",
                color: "#6b7280",
                border: "none",
                fontSize: "12px",
                cursor: "pointer",
                marginTop: "8px",
              }}
            >
              ↺ Regenerate
            </button>
          </>
        )}
      </div>
    </div>
  );
}
