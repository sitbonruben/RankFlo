import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get("title") ?? "RankFlo";
  const description = searchParams.get("description") ?? "Next-generation blogging platform";
  const type = searchParams.get("type") ?? "default";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#000000",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#39FF14",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 900,
              color: "#000000",
            }}
          >
            R
          </div>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff" }}>
            RankFlo
          </span>
          {type !== "default" && (
            <span
              style={{
                marginLeft: "12px",
                fontSize: "14px",
                color: "#39FF14",
                border: "1px solid rgba(57,255,20,0.3)",
                borderRadius: "9999px",
                padding: "4px 12px",
              }}
            >
              {type}
            </span>
          )}
        </div>

        {/* Center: content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h1
            style={{
              fontSize: title.length > 50 ? "48px" : "64px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: 0,
              maxWidth: "900px",
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                fontSize: "24px",
                color: "#888888",
                margin: 0,
                maxWidth: "700px",
                lineHeight: 1.4,
              }}
            >
              {description.length > 120
                ? description.slice(0, 120) + "..."
                : description}
            </p>
          )}
        </div>

        {/* Bottom: accent bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              height: "4px",
              width: "120px",
              backgroundColor: "#39FF14",
              borderRadius: "2px",
            }}
          />
          <span style={{ fontSize: "16px", color: "#555555" }}>
            rankflo.io
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
