import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT_DISPLAY, hardShadow } from "../brand";
import { Background } from "../components/Background";

/**
 * Static brand images for social profiles, rendered via `remotion still`.
 * XAvatar  → 400×400 (X shows it as a circle — keep content centered).
 * XBanner  → 1500×500 (avatar overlaps bottom-left; sides crop on mobile).
 */

export const XAvatar: React.FC = () => (
  <AbsoluteFill>
    <Background drift={false} />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 2 }}>
      <div style={{ fontSize: 150, color: COLORS.pop, textShadow: hardShadow(8), lineHeight: 1 }}>★</div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 900,
          fontSize: 120,
          letterSpacing: "-0.04em",
          color: COLORS.ink,
          lineHeight: 0.9,
        }}
      >
        OMC<span style={{ color: COLORS.pop }}>.</span>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const XBanner: React.FC = () => (
  <AbsoluteFill>
    <Background drift={false} />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 50 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: COLORS.canvas,
            background: COLORS.ink,
            padding: "9px 22px",
            borderRadius: 999,
          }}
        >
          <span>★</span> Opinions are free. Yours isn't. <span>★</span>
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 900,
            fontSize: 104,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            color: COLORS.ink,
            lineHeight: 0.9,
            whiteSpace: "nowrap",
          }}
        >
          Opinion <span style={{ color: COLORS.pop }}>Market</span> Cap
          <span style={{ color: COLORS.pop }}>.</span>
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 40, color: COLORS.ink }}>
          Take a stand. <span style={{ color: COLORS.pop }}>Get paid for it.</span>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize: 30,
              textTransform: "uppercase",
              color: COLORS.canvas,
              background: COLORS.ink,
              borderRadius: 999,
              padding: "12px 28px",
            }}
          >
            app.opinionmarketcap.xyz
          </span>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize: 30,
              textTransform: "uppercase",
              color: COLORS.ink,
              background: COLORS.cool,
              border: `4px solid ${COLORS.ink}`,
              borderRadius: 999,
              padding: "12px 28px",
            }}
          >
            ★ Live on Base
          </span>
        </div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
