import * as React from "react";

interface InviteEmailProps {
  inviterName: string;
  organizationName: string;
  role: string;
  acceptUrl: string;
}

export function InviteEmail({ inviterName, organizationName, role, acceptUrl }: InviteEmailProps) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ padding: "40px 20px", backgroundColor: "#000000", color: "#FFFFFF" }}>
        <h1 style={{ fontSize: "24px", margin: 0 }}>
          <span style={{ color: "#39FF14" }}>RankFlo</span>
        </h1>
      </div>
      <div style={{ padding: "32px 20px", backgroundColor: "#FFFFFF", color: "#09090B" }}>
        <h2 style={{ fontSize: "20px", margin: "0 0 16px 0" }}>
          You've been invited
        </h2>
        <p style={{ fontSize: "16px", lineHeight: "1.5", color: "#52525B" }}>
          {inviterName} has invited you to join <strong>{organizationName}</strong> as {role}.
        </p>
        <a
          href={acceptUrl}
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
          Accept Invitation
        </a>
      </div>
    </div>
  );
}
