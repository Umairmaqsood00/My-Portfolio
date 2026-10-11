import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} | ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(ellipse 70% 80% at 85% 90%, #1f2e0f 0%, #090a09 65%)",
          color: "#ecece4",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, color: "#a3a59c", letterSpacing: 4 }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#b4ff39" }} />
          {site.role.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 150, fontWeight: 600, letterSpacing: -6, lineHeight: 0.9 }}>
          <span>{site.firstName}</span>
          <span style={{ display: "flex" }}>
            {site.lastName}
            <span style={{ color: "#b4ff39" }}>.</span>
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#a3a59c" }}>
          <span>Full-stack · Mobile · AI/ML</span>
          <span>{site.location}</span>
        </div>
      </div>
    ),
    size,
  );
}
