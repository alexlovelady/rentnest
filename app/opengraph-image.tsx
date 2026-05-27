import { ImageResponse } from "next/og";

export const alt = "RentNest — Online Rent Collection & Landlord Software";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FDFAF5",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "#C4622D",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: "#C4622D",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            R
          </div>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#1A2332",
              letterSpacing: "-0.5px",
            }}
          >
            RentNest
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#1A2332",
            lineHeight: 1.1,
            letterSpacing: "-1px",
            marginBottom: 24,
            maxWidth: 800,
          }}
        >
          The simple landlord software Cozy used to be.
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: 24,
            color: "#6b7280",
            lineHeight: 1.5,
            marginBottom: 48,
          }}
        >
          Collect rent online, track maintenance, store leases & give tenants a portal.
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 12 }}>
          {["$19/month", "No % of rent", "Free 14-day trial"].map((label) => (
            <div
              key={label}
              style={{
                background: "#fff",
                border: "1.5px solid #e5e7eb",
                borderRadius: 999,
                padding: "8px 20px",
                fontSize: 18,
                color: "#374151",
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom right CTA pill */}
        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 80,
            background: "#C4622D",
            borderRadius: 12,
            padding: "16px 32px",
            fontSize: 20,
            fontWeight: 700,
            color: "white",
          }}
        >
          Start Free Trial →
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
