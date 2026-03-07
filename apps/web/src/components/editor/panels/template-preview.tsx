"use client";

import * as React from "react";
import type { EditorDocument, EditorBlock } from "@rankflo/core/types";

// ─── Template Preview ───────────────────────────────────
interface TemplatePreviewProps {
  document: EditorDocument;
}

export function TemplatePreview({ document }: TemplatePreviewProps) {
  return (
    <div className="relative h-[220px] w-full overflow-hidden rounded-lg border border-gray-800 bg-white">
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{
          transform: "scale(0.22)",
          width: "454%", // 100/0.22 to fill container width
        }}
      >
        <MiniPostRenderer blocks={document.blocks} />
      </div>
    </div>
  );
}

// ─── Mini Post Renderer ─────────────────────────────────
function MiniPostRenderer({ blocks }: { blocks: EditorBlock[] }) {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", color: "#1a1a1a", lineHeight: 1.6 }}>
      {blocks.map((block, i) => (
        <MiniBlockRenderer key={i} block={block} />
      ))}
    </div>
  );
}

// ─── Individual Block Renderers ─────────────────────────
function MiniBlockRenderer({ block }: { block: EditorBlock }) {
  const props = block.props as Record<string, unknown>;

  switch (block.type) {
    case "hero": {
      const title = (props.title as string) || "Untitled";
      const subtitle = (props.subtitle as string) || "";
      const bgImage = props.backgroundImage as string;
      const overlay = (props.overlay as string) || "none";
      const alignment = (props.alignment as string) || "center";
      const height = (props.height as string) || "medium";

      const heightMap: Record<string, string> = {
        small: "200px",
        medium: "300px",
        large: "420px",
        full: "500px",
      };

      const overlayStyle: React.CSSProperties =
        overlay === "dark"
          ? { backgroundColor: "rgba(0,0,0,0.6)" }
          : overlay === "light"
            ? { backgroundColor: "rgba(255,255,255,0.3)" }
            : overlay === "gradient"
              ? { background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7))" }
              : {};

      const textAlignMap: Record<string, React.CSSProperties["textAlign"]> = {
        left: "left",
        center: "center",
        right: "right",
      };

      return (
        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: heightMap[height] || "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: bgImage
              ? `url(${bgImage}) center/cover no-repeat`
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            overflow: "hidden",
          }}
        >
          {/* Overlay */}
          <div style={{ position: "absolute", inset: 0, ...overlayStyle }} />
          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              padding: "40px 48px",
              textAlign: textAlignMap[alignment] || "center",
              width: "100%",
              maxWidth: "800px",
            }}
          >
            <h1
              style={{
                fontSize: "36px",
                fontWeight: 800,
                color: "#fff",
                margin: "0 0 12px 0",
                lineHeight: 1.2,
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: "18px",
                  color: "rgba(255,255,255,0.85)",
                  margin: 0,
                  lineHeight: 1.5,
                  textShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      );
    }

    case "heading": {
      const text = (props.text as string) || "Heading";
      const level = (props.level as number) || 2;
      const alignment = (props.alignment as string) || "left";

      const sizeMap: Record<number, string> = {
        1: "32px",
        2: "26px",
        3: "22px",
        4: "18px",
      };
      const weightMap: Record<number, number> = {
        1: 800,
        2: 700,
        3: 600,
        4: 600,
      };

      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag
          style={{
            fontSize: sizeMap[level] || "26px",
            fontWeight: weightMap[level] || 700,
            color: "#111",
            margin: "24px 48px 8px",
            textAlign: (alignment as React.CSSProperties["textAlign"]) || "left",
            lineHeight: 1.3,
          }}
        >
          {text}
        </Tag>
      );
    }

    case "text": {
      const html = (props.html as string) || "";
      const alignment = (props.alignment as string) || "left";

      return (
        <div
          style={{
            fontSize: "16px",
            color: "#374151",
            margin: "8px 48px 12px",
            textAlign: (alignment as React.CSSProperties["textAlign"]) || "left",
            lineHeight: 1.7,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    case "image": {
      const src = props.src as string;
      const alt = (props.alt as string) || "";
      const caption = props.caption as string;
      const rounded = Boolean(props.rounded);
      const shadow = Boolean(props.shadow);

      return (
        <div style={{ margin: "16px 48px", textAlign: "center" }}>
          {src ? (
            <img
              src={src}
              alt={alt}
              style={{
                width: "100%",
                maxHeight: "320px",
                objectFit: "cover",
                borderRadius: rounded ? "12px" : "4px",
                boxShadow: shadow ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "180px",
                backgroundColor: "#f3f4f6",
                borderRadius: rounded ? "12px" : "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed #d1d5db",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ color: "#9ca3af" }}>
                <rect x="2" y="3" width="20" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 17L7 13L11 16L15 11L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          {caption && (
            <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px", fontStyle: "italic" }}>
              {caption}
            </p>
          )}
        </div>
      );
    }

    case "quote": {
      const text = (props.text as string) || "";
      const author = props.author as string;

      return (
        <blockquote
          style={{
            margin: "20px 48px",
            padding: "16px 24px",
            borderLeft: "4px solid #6366f1",
            backgroundColor: "#f8fafc",
            borderRadius: "0 8px 8px 0",
          }}
        >
          <p style={{ fontSize: "17px", color: "#374151", fontStyle: "italic", margin: 0, lineHeight: 1.6 }}>
            &ldquo;{text}&rdquo;
          </p>
          {author && (
            <footer style={{ fontSize: "14px", color: "#6b7280", marginTop: "10px", fontWeight: 500 }}>
              &mdash; {author}
            </footer>
          )}
        </blockquote>
      );
    }

    case "code": {
      const code = (props.code as string) || "// code here";
      const filename = props.filename as string;
      const language = props.language as string;

      return (
        <div style={{ margin: "16px 48px" }}>
          {(filename || language) && (
            <div
              style={{
                backgroundColor: "#1e1e1e",
                borderRadius: "8px 8px 0 0",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {filename && (
                <span style={{ fontSize: "12px", color: "#9ca3af", fontFamily: "monospace" }}>
                  {filename}
                </span>
              )}
              {language && !filename && (
                <span style={{ fontSize: "12px", color: "#6b7280", fontFamily: "monospace" }}>
                  {language}
                </span>
              )}
            </div>
          )}
          <pre
            style={{
              backgroundColor: "#1e1e1e",
              color: "#d4d4d8",
              padding: "16px",
              borderRadius: filename || language ? "0 0 8px 8px" : "8px",
              overflow: "hidden",
              fontSize: "13px",
              lineHeight: 1.6,
              fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
              margin: 0,
            }}
          >
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    case "callout": {
      const text = (props.text as string) || "";
      const type = (props.type as string) || "info";
      const title = props.title as string;

      const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
        info: { bg: "#eff6ff", border: "#3b82f6", icon: "#2563eb" },
        warning: { bg: "#fffbeb", border: "#f59e0b", icon: "#d97706" },
        success: { bg: "#f0fdf4", border: "#22c55e", icon: "#16a34a" },
        error: { bg: "#fef2f2", border: "#ef4444", icon: "#dc2626" },
      };
      const colors = colorMap[type] || colorMap.info;

      return (
        <div
          style={{
            margin: "16px 48px",
            padding: "16px 20px",
            backgroundColor: colors.bg,
            borderLeft: `4px solid ${colors.border}`,
            borderRadius: "0 8px 8px 0",
          }}
        >
          {title && (
            <p style={{ fontSize: "15px", fontWeight: 700, color: colors.icon, margin: "0 0 6px 0" }}>
              {title}
            </p>
          )}
          <p style={{ fontSize: "15px", color: "#374151", margin: 0, lineHeight: 1.6 }}>
            {text}
          </p>
        </div>
      );
    }

    case "divider": {
      return (
        <hr
          style={{
            margin: "24px 48px",
            border: "none",
            borderTop: "1px solid #e5e7eb",
          }}
        />
      );
    }

    case "two-column": {
      const leftChildren = (props.leftChildren as EditorBlock[]) || [];
      const rightChildren = (props.rightChildren as EditorBlock[]) || [];

      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            margin: "16px 48px",
          }}
        >
          <div>
            {leftChildren.map((child, i) => (
              <MiniBlockRenderer key={`l-${i}`} block={child} />
            ))}
          </div>
          <div>
            {rightChildren.map((child, i) => (
              <MiniBlockRenderer key={`r-${i}`} block={child} />
            ))}
          </div>
        </div>
      );
    }

    case "list": {
      const items = (props.items as string[]) || [];
      const style = (props.style as string) || "bullet";

      if (style === "number") {
        return (
          <ol style={{ margin: "12px 48px", paddingLeft: "24px", color: "#374151", fontSize: "15px", lineHeight: 2 }}>
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      }

      return (
        <ul
          style={{
            margin: "12px 48px",
            paddingLeft: "24px",
            color: "#374151",
            fontSize: "15px",
            lineHeight: 2,
            listStyleType: style === "check" ? "none" : "disc",
          }}
        >
          {items.map((item, i) => (
            <li key={i} style={{ paddingLeft: style === "check" ? 0 : undefined }}>
              {style === "check" && (
                <span style={{ marginRight: "8px", color: "#22c55e" }}>&#10003;</span>
              )}
              {item}
            </li>
          ))}
        </ul>
      );
    }

    case "embed": {
      const url = (props.url as string) || "";

      return (
        <div
          style={{
            margin: "16px 48px",
            height: "180px",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #d1d5db",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ color: "#9ca3af" }}>
            <rect x="2" y="3" width="20" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.5 8.5V15.5L16 12L9.5 8.5Z" fill="currentColor" />
          </svg>
          {url && (
            <span style={{ fontSize: "11px", color: "#9ca3af", marginTop: "8px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
              {url}
            </span>
          )}
        </div>
      );
    }

    case "table-of-contents": {
      return (
        <nav
          style={{
            margin: "20px 48px",
            padding: "20px 24px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#374151", margin: "0 0 12px 0", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
            Table of Contents
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "14px", color: "#6366f1", textDecoration: "none" }}>1. Section One</span>
            <span style={{ fontSize: "14px", color: "#6366f1", textDecoration: "none", paddingLeft: "16px" }}>1.1 Subsection</span>
            <span style={{ fontSize: "14px", color: "#6366f1", textDecoration: "none" }}>2. Section Two</span>
          </div>
        </nav>
      );
    }

    case "newsletter-cta": {
      const title = (props.title as string) || "Subscribe";
      const description = (props.description as string) || "";
      const buttonText = (props.buttonText as string) || "Subscribe";
      const placeholder = (props.placeholder as string) || "your@email.com";

      return (
        <div
          style={{
            margin: "24px 48px",
            padding: "32px",
            background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
            borderRadius: "12px",
            border: "1px solid #bbf7d0",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#111", margin: "0 0 8px 0" }}>
            {title}
          </h3>
          {description && (
            <p style={{ fontSize: "15px", color: "#6b7280", margin: "0 0 20px 0", lineHeight: 1.5 }}>
              {description}
            </p>
          )}
          <div style={{ display: "flex", gap: "8px", maxWidth: "400px", margin: "0 auto" }}>
            <div
              style={{
                flex: 1,
                height: "42px",
                backgroundColor: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                paddingLeft: "12px",
                fontSize: "14px",
                color: "#9ca3af",
              }}
            >
              {placeholder}
            </div>
            <div
              style={{
                height: "42px",
                padding: "0 20px",
                backgroundColor: "#16a34a",
                color: "#fff",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {buttonText}
            </div>
          </div>
        </div>
      );
    }

    case "author-bio": {
      const name = (props.name as string) || "Author";
      const avatar = props.avatar as string;
      const bio = (props.bio as string) || "";

      return (
        <div
          style={{
            margin: "24px 48px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            backgroundColor: "#f9fafb",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Avatar */}
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "22px",
                fontWeight: 700,
                color: "#9ca3af",
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#111", margin: "0 0 4px 0" }}>
              {name}
            </p>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
              {bio}
            </p>
          </div>
        </div>
      );
    }

    default:
      return (
        <div style={{ margin: "8px 48px", padding: "12px", backgroundColor: "#f3f4f6", borderRadius: "6px" }}>
          <span style={{ fontSize: "13px", color: "#9ca3af" }}>Unknown block</span>
        </div>
      );
  }
}
