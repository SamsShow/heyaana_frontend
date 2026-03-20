import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HeyAnna — The Terminal for Prediction Markets";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a14 0%, #111128 40%, #1a1040 70%, #0a0a14 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", textTransform: "uppercase" as const }}>
            HEYANNA
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#ffffff", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            The Terminal for
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, background: "linear-gradient(90deg, #818cf8, #6366f1, #4f46e5)", backgroundClip: "text", color: "transparent", lineHeight: 1.15, letterSpacing: "-0.02em", marginTop: -16 }}>
            Prediction Markets
          </div>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, maxWidth: 700, marginTop: 8 }}>
            AI-powered signals, whale tracking, copy trading & real-time market intelligence
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, padding: "8px 20px", borderRadius: 12, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)" }}>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>beta.heyanna.trade</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
