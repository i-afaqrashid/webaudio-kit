import { ImageResponse } from "next/og";
import { HOME_DESCRIPTION, SITE_NAME } from "./metadata";

export const alt = "webaudio-kit browser audio toolkit preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#f5f6ef",
        color: "#171915",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, Arial, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: 72,
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 20,
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "#171915",
            borderRadius: 28,
            color: "#f5f6ef",
            display: "flex",
            fontSize: 42,
            fontWeight: 800,
            height: 86,
            justifyContent: "center",
            width: 86,
          }}
        >
          wk
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 800 }}>{SITE_NAME}</div>
          <div style={{ color: "#52605a", fontSize: 24 }}>
            React Web Audio Toolkit
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        <div
          style={{
            fontSize: 78,
            fontWeight: 850,
            letterSpacing: 0,
            lineHeight: 0.96,
            maxWidth: 900,
          }}
        >
          Browser tones, sweeps, and analyser UI.
        </div>
        <div
          style={{
            color: "#3b4541",
            fontSize: 30,
            lineHeight: 1.32,
            maxWidth: 930,
          }}
        >
          {HOME_DESCRIPTION}
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          color: "#52605a",
          display: "flex",
          fontSize: 24,
          justifyContent: "space-between",
        }}
      >
        <span>@webaudio-kit/react</span>
        <span>webaudio-kit.afaqrashid.com</span>
      </div>
    </div>,
    size,
  );
}
