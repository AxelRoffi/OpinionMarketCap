import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  COLORS,
  FONT_DISPLAY,
  FONT_MONO,
  hardShadow,
  INK_BORDER,
  RADIUS,
} from "../brand";

/** Spring that pops from 0 → 1, scale + slight overshoot. Returns scale. */
export const usePopIn = (delay = 0, damping = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping, mass: 0.6, stiffness: 120 },
  });
};

/** A tilted hard-shadow card — the core "sticker" of the brand. */
export const Sticker: React.FC<{
  children: React.ReactNode;
  rotate?: number;
  bg?: string;
  shadow?: number;
  padding?: number | string;
  style?: React.CSSProperties;
  delay?: number;
}> = ({
  children,
  rotate = -3,
  bg = COLORS.paper,
  shadow = 16,
  padding = 40,
  style,
  delay = 0,
}) => {
  const pop = usePopIn(delay);
  return (
    <div
      style={{
        background: bg,
        border: INK_BORDER,
        borderRadius: RADIUS,
        boxShadow: hardShadow(shadow),
        padding,
        transform: `rotate(${rotate}deg) scale(${pop})`,
        opacity: pop,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Big all-caps display headline with tight tracking. */
export const BigType: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, size = 110, color = COLORS.ink, style }) => (
  <div
    style={{
      fontFamily: FONT_DISPLAY,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 0.95,
      letterSpacing: "-0.04em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Small pill eyebrow: ★ TEXT ★ */
export const Eyebrow: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
}> = ({ children, bg = COLORS.ink, color = COLORS.canvas }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      fontFamily: FONT_DISPLAY,
      fontWeight: 800,
      fontSize: 26,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color,
      background: bg,
      padding: "12px 26px",
      borderRadius: 999,
    }}
  >
    <span>★</span>
    {children}
    <span>★</span>
  </div>
);

/** The OPINION MARKET CAP. wordmark, "MARKET" in pop color. */
export const Wordmark: React.FC<{ size?: number; color?: string }> = ({
  size = 64,
  color = COLORS.ink,
}) => (
  <div
    style={{
      fontFamily: FONT_DISPLAY,
      fontWeight: 900,
      fontSize: size,
      letterSpacing: "-0.04em",
      textTransform: "uppercase",
      color,
      whiteSpace: "nowrap",
    }}
  >
    Opinion <span style={{ color: COLORS.pop }}>Market</span> Cap
    <span style={{ color: COLORS.pop }}>.</span>
  </div>
);

/** Monospaced USDC number that animates from `from` → `to`. */
export const MoneyCounter: React.FC<{
  from: number;
  to: number;
  startFrame: number;
  durationInFrames: number;
  size?: number;
  color?: string;
  prefix?: string;
  decimals?: number;
}> = ({
  from,
  to,
  startFrame,
  durationInFrames,
  size = 64,
  color = COLORS.ink,
  prefix = "$",
  decimals = 2,
}) => {
  const frame = useCurrentFrame();
  const value = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [from, to],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <span
      style={{
        fontFamily: FONT_MONO,
        fontWeight: 800,
        fontSize: size,
        color,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {prefix}
      {value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
};
