import * as React from "react";

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ padding: "40px 20px", backgroundColor: "#000000", color: "#FFFFFF" }}>
        <h1 style={{ fontSize: "24px", margin: "0 0 8px 0" }}>
          <span style={{ color: "#39FF14" }}>RankFlo</span>
        </h1>
      </div>
      <div style={{ padding: "32px 20px", backgroundColor: "#FFFFFF", color: "#09090B" }}>
        <h2 style={{ fontSize: "20px", margin: "0 0 16px 0" }}>
          Welcome, {name}
        </h2>
        <p style={{ fontSize: "16px", lineHeight: "1.5", color: "#52525B" }}>
          Your RankFlo account is ready. Start creating, publishing, and growing your audience.
        </p>
        <a
          href={loginUrl}
          style={{
            display: "inline-block",
            marginTop: "24px",
            padding: "12px 24px",
            backgroundColor: "#000000",
            color: "#39FF14",
            textDecoration: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          Go to Dashboard
        </a>
      </div>
      <div style={{ padding: "20px", backgroundColor: "#F4F4F5", color: "#71717A", fontSize: "12px" }}>
        <p style={{ margin: 0 }}>RankFlo — The blog platform built for what's next.</p>
      </div>
    </div>
  );
}
