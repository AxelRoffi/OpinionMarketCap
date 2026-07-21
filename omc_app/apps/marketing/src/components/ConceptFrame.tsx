import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO } from "../brand";
import { Background } from "./Background";
import { MusicBed, Sfx } from "./audio";
import { usePopIn } from "./ui";

/**
 * Shared chrome for every concept clip in the explainer thread (square 1:1).
 * Top: wordmark + thread index. Middle: eyebrow + title + animated visual.
 * Bottom: tagline. Carries its own music bed + entrance SFX so each clip is a
 * standalone tweet. When chained in the combined thread, the parent owns music
 * (`playMusic={false}`).
 */
export const ConceptFrame: React.FC<{
  index: number;
  total: number;
  eyebrow: string;
  title: React.ReactNode;
  tagline: React.ReactNode;
  soon?: boolean;
  accent?: string;
  playMusic?: boolean;
  children: React.ReactNode;
}> = ({
  index,
  total,
  eyebrow,
  title,
  tagline,
  soon = false,
  accent = COLORS.pop,
  playMusic = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const head = usePopIn(2);
  const titlePop = usePopIn(6);
  const tagPop = usePopIn(10);
  const tagY = interpolate(tagPop, [0, 1], [30, 0]);

  return (
    <AbsoluteFill>
      {playMusic && <MusicBed volume={0.22} />}
      <Sfx src="pop.wav" at={2} volume={0.6} />
      <Background />
      <AbsoluteFill style={{ padding: 64, display: "flex", flexDirection: "column" }}>
        {/* top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: head,
            transform: `translateY(${interpolate(head, [0, 1], [-20, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize: 26,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: COLORS.ink,
            }}
          >
            Opinion <span style={{ color: COLORS.pop }}>Market</span> Cap
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 24,
              color: COLORS.ink,
              background: COLORS.paper,
              border: `3px solid ${COLORS.ink}`,
              borderRadius: 999,
              padding: "6px 16px",
            }}
          >
            {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </div>
        </div>

        {/* eyebrow + title */}
        <div style={{ marginTop: 40, opacity: head }}>
          <div style={{ display: "inline-flex", gap: 12, alignItems: "center" }}>
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: 24,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: COLORS.canvas,
                background: COLORS.ink,
                borderRadius: 999,
                padding: "8px 20px",
              }}
            >
              ★ {eyebrow}
            </span>
            {soon && (
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  fontSize: 22,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: COLORS.ink,
                  background: COLORS.cool,
                  border: `3px solid ${COLORS.ink}`,
                  borderRadius: 999,
                  padding: "6px 16px",
                }}
              >
                Rolling out
              </span>
            )}
          </div>
          <div
            style={{
              marginTop: 22,
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize: 70,
              lineHeight: 0.96,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              color: COLORS.ink,
              transform: `scale(${titlePop})`,
              transformOrigin: "left top",
              opacity: titlePop,
            }}
          >
            {title}
          </div>
        </div>

        {/* visual */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: 0,
          }}
        >
          {children}
        </div>

        {/* tagline footer */}
        <div
          style={{
            opacity: tagPop,
            transform: `translateY(${tagY}px)`,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span style={{ fontSize: 30, color: accent }}>★</span>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 32,
              letterSpacing: "0.01em",
              color: COLORS.ink,
            }}
          >
            {tagline}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
