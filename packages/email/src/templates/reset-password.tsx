import * as React from "react";

interface ResetPasswordEmailProps {
  name: string;
  resetUrl: string;
}

export function ResetPasswordEmail({ name, resetUrl }: ResetPasswordEmailProps) {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: "#0A0A0A", padding: "40px 16px" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>
        {/* Logo */}
        <div style={{ textAlign: "center" as const, marginBottom: "32px" }}>
          <div style={{ display: "inline-block", width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "#141414", border: "1px solid #262626", padding: "6px" }}>
            <img src="https://rankflo.io/logo.png" alt="RankFlo" width="44" height="44" style={{ display: "block" }} />
          </div>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: "#141414", borderRadius: "12px", border: "1px solid #262626", overflow: "hidden" }}>
          <div style={{ height: "3px", background: "linear-gradient(90deg, #39FF14, #00CC44)" }} />

          <div style={{ padding: "40px 32px" }}>
            <h1 style={{ color: "#FAFAFA", fontSize: "22px", fontWeight: 600, margin: "0 0 8px 0" }}>
              Reset your password
            </h1>
            <p style={{ color: "#A1A1AA", fontSize: "15px", lineHeight: "1.6", margin: "0 0 28px 0" }}>
              Hi {name}, we received a request to reset your password. Click below to choose a new one — this link expires in 1 hour.
            </p>

            <a
              href={resetUrl}
              style={{
                display: "inline-block",
                padding: "14px 32px",
                backgroundColor: "#39FF14",
                color: "#000000",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.3px",
              }}
            >
              Reset Password
            </a>

            <div style={{ borderTop: "1px solid #262626", margin: "32px 0 24px 0" }} />

            <p style={{ color: "#52525B", fontSize: "13px", lineHeight: "1.5", margin: 0 }}>
              If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" as const, padding: "24px 0 0 0" }}>
          <p style={{ color: "#52525B", fontSize: "12px", margin: "0", lineHeight: "1.5" }}>
            RankFlo — The blog platform built for what's next.
          </p>
        </div>
      </div>
    </div>
  );
}
