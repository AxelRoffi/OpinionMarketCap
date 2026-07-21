import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO, hardShadow, INK_BORDER } from "../brand";
import { Background } from "../components/Background";
import { MusicBed, Sfx } from "../components/audio";

/**
 * Static stat images for the on-chain lane (L2), rendered via `remotion still`.
 * No animation — stills render frame 0. Use scripts/stat.mjs.
 */

const F = FONT_DISPLAY;
const M = FONT_MONO;

/** Preset styling per event kind. */
const KINDS: Record<string, { eyebrow: string; accent: string; defaultCaption: string }> = {
  payout: { eyebrow: "Payout claimed", accent: COLORS.cool, defaultCaption: "Someone just got paid for holding an opinion." },
  surge: { eyebrow: "Price surge", accent: COLORS.pop, defaultCaption: "This debate is heating up." },
  record: { eyebrow: "New record", accent: COLORS.pop, defaultCaption: "Biggest one yet." },
  war: { eyebrow: "Bidding war", accent: COLORS.pop, defaultCaption: "The slot keeps flipping." },
  hot: { eyebrow: "Born hot", accent: COLORS.cool, defaultCaption: "Trading from minute one." },
};

const TopBar: React.FC = () => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ fontFamily: F, fontWeight: 900, fontSize: 28, letterSpacing: "-0.02em", textTransform: "uppercase", color: COLORS.ink }}>
      Opinion <span style={{ color: COLORS.pop }}>Market</span> Cap
    </span>
    <span style={{ fontFamily: F, fontWeight: 800, fontSize: 22, textTransform: "uppercase", color: COLORS.ink, background: COLORS.cool, border: `3px solid ${COLORS.ink}`, borderRadius: 999, padding: "6px 18px" }}>
      ★ Live on Base
    </span>
  </div>
);

const Footer: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <span style={{ fontFamily: F, fontWeight: 900, fontSize: 30, textTransform: "uppercase", color: COLORS.canvas, background: COLORS.ink, borderRadius: 999, padding: "12px 30px" }}>
      app.opinionmarketcap.xyz
    </span>
    <span style={{ fontFamily: F, fontWeight: 800, fontSize: 24, color: COLORS.ink }}>
      Take a stand. Get paid for it. ★
    </span>
  </div>
);

export type StatCardProps = {
  kind: string; // payout | surge | record | war | hot
  value: string; // the big number, e.g. "$47.20" or "×3.2"
  caption: string; // headline under the value ("" → kind default)
  question: string;
  answer: string;
  detail: string; // small factual line, e.g. "95% of the taker's bid — claimed onchain"
};

export const StatCard: React.FC<StatCardProps> = ({ kind, value, caption, question, answer, detail }) => {
  const preset = KINDS[kind] ?? KINDS.payout;
  const cap = caption || preset.defaultCaption;
  return (
    <AbsoluteFill>
      <Background drift={false} />
      <AbsoluteFill style={{ padding: 64, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <TopBar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <span style={{ fontFamily: F, fontWeight: 800, fontSize: 28, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.canvas, background: COLORS.ink, borderRadius: 999, padding: "10px 28px" }}>
            ★ {preset.eyebrow} ★
          </span>
          <div
            style={{
              fontFamily: M,
              fontWeight: 800,
              fontSize: 170,
              lineHeight: 1,
              color: COLORS.ink,
              background: preset.accent,
              border: `9px solid ${COLORS.ink}`,
              borderRadius: 30,
              padding: "30px 70px",
              boxShadow: hardShadow(16),
              transform: "rotate(-2deg)",
            }}
          >
            {value}
          </div>
          <div style={{ fontFamily: F, fontWeight: 900, fontSize: 52, letterSpacing: "-0.03em", textTransform: "uppercase", color: COLORS.ink, textAlign: "center", lineHeight: 1.05, maxWidth: 900 }}>
            {cap}
          </div>
          {question && (
            <div style={{ background: COLORS.paper, border: INK_BORDER, borderRadius: 20, boxShadow: hardShadow(10), padding: "22px 34px", display: "flex", flexDirection: "column", gap: 8, maxWidth: 900 }}>
              <span style={{ fontFamily: F, fontWeight: 800, fontSize: 30, color: COLORS.ink }}>{question}</span>
              {answer && (
                <span style={{ fontFamily: F, fontWeight: 900, fontSize: 34, textTransform: "uppercase", color: COLORS.ink }}>
                  → <span style={{ background: COLORS.cool, border: `3px solid ${COLORS.ink}`, borderRadius: 10, padding: "2px 14px" }}>{answer}</span>
                </span>
              )}
            </div>
          )}
          {detail && (
            <span style={{ fontFamily: F, fontWeight: 700, fontSize: 26, color: "#5c574e", textAlign: "center" }}>{detail}</span>
          )}
        </div>
        <Footer />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Animated StatCard (~6s) for the BIG moments — record, bidding war, huge payout.
 * Same props as StatCard; render with `npm run stat -- card … --video`.
 */
export const StatCardClip: React.FC<StatCardProps> = ({ kind, value, caption, question, answer, detail }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const preset = KINDS[kind] ?? KINDS.payout;
  const cap = caption || preset.defaultCaption;

  // counting value: parse "$47.20" → prefix "$", number 47.20, suffix ""
  const match = value.match(/^([^0-9\-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
  const target = match ? parseFloat(match[2].replace(/,/g, "")) : NaN;
  const decimals = match && match[2].includes(".") ? match[2].split(".")[1].length : 0;
  const counted = interpolate(frame, [18, 66], [0, Number.isNaN(target) ? 0 : target], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shownValue = match
    ? `${match[1]}${counted.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${match[3]}`
    : value;

  const eyebrowPop = spring({ frame: frame - 4, fps, config: { damping: 10, mass: 0.6, stiffness: 140 } });
  const valuePop = spring({ frame: frame - 14, fps, config: { damping: 11, mass: 0.7, stiffness: 120 } });
  const capPop = spring({ frame: frame - 62, fps, config: { damping: 12, mass: 0.6, stiffness: 120 } });
  const marketPop = spring({ frame: frame - 84, fps, config: { damping: 12, mass: 0.6, stiffness: 120 } });
  // little celebratory pulse once the counter lands
  const landed = frame > 66 ? 1 + Math.sin((frame - 66) * 0.25) * 0.012 : 1;

  return (
    <AbsoluteFill>
      <MusicBed volume={0.24} />
      <Sfx src="whoosh.wav" at={2} volume={0.7} />
      <Sfx src="riser.wav" at={14} volume={0.5} />
      <Sfx src="chaching.wav" at={66} volume={0.85} />
      <Sfx src="sparkle.wav" at={90} volume={0.7} />
      <Background />
      <AbsoluteFill style={{ padding: 64, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <TopBar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <span
            style={{
              fontFamily: F,
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: COLORS.canvas,
              background: COLORS.ink,
              borderRadius: 999,
              padding: "10px 28px",
              transform: `scale(${eyebrowPop})`,
              opacity: eyebrowPop,
            }}
          >
            ★ {preset.eyebrow} ★
          </span>
          <div
            style={{
              fontFamily: M,
              fontWeight: 800,
              fontSize: 170,
              lineHeight: 1,
              color: COLORS.ink,
              background: preset.accent,
              border: `9px solid ${COLORS.ink}`,
              borderRadius: 30,
              padding: "30px 70px",
              boxShadow: hardShadow(16),
              transform: `rotate(-2deg) scale(${valuePop * landed})`,
              opacity: valuePop,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {shownValue}
          </div>
          <div
            style={{
              fontFamily: F,
              fontWeight: 900,
              fontSize: 52,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: COLORS.ink,
              textAlign: "center",
              lineHeight: 1.05,
              maxWidth: 900,
              transform: `scale(${capPop})`,
              opacity: capPop,
            }}
          >
            {cap}
          </div>
          {question && (
            <div
              style={{
                background: COLORS.paper,
                border: INK_BORDER,
                borderRadius: 20,
                boxShadow: hardShadow(10),
                padding: "22px 34px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxWidth: 900,
                transform: `scale(${marketPop})`,
                opacity: marketPop,
              }}
            >
              <span style={{ fontFamily: F, fontWeight: 800, fontSize: 30, color: COLORS.ink }}>{question}</span>
              {answer && (
                <span style={{ fontFamily: F, fontWeight: 900, fontSize: 34, textTransform: "uppercase", color: COLORS.ink }}>
                  → <span style={{ background: COLORS.cool, border: `3px solid ${COLORS.ink}`, borderRadius: 10, padding: "2px 14px" }}>{answer}</span>
                </span>
              )}
              {detail && <span style={{ fontFamily: F, fontWeight: 700, fontSize: 24, color: "#5c574e" }}>{detail}</span>}
            </div>
          )}
        </div>
        <Footer />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export type DailyPulseProps = {
  dateLabel: string; // e.g. "Mon, Jul 7"
  volume: string; // "$1,240"
  trades: string; // "87"
  topMarket: string; // question of the hottest market
  topPayout: string; // "$47.20"
};

const Tile: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent = COLORS.paper }) => (
  <div style={{ flex: 1, background: accent, border: INK_BORDER, borderRadius: 22, boxShadow: hardShadow(9), padding: "26px 28px", display: "flex", flexDirection: "column", gap: 8 }}>
    <span style={{ fontFamily: F, fontWeight: 800, fontSize: 24, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5c574e" }}>{label}</span>
    <span style={{ fontFamily: M, fontWeight: 800, fontSize: 64, color: COLORS.ink }}>{value}</span>
  </div>
);

export const DailyPulse: React.FC<DailyPulseProps> = ({ dateLabel, volume, trades, topMarket, topPayout }) => (
  <AbsoluteFill>
    <Background drift={false} />
    <AbsoluteFill style={{ padding: 64, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <TopBar />
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
          <span style={{ fontFamily: F, fontWeight: 900, fontSize: 72, letterSpacing: "-0.03em", textTransform: "uppercase", color: COLORS.ink }}>
            Daily <span style={{ color: COLORS.pop }}>pulse</span>
          </span>
          <span style={{ fontFamily: M, fontWeight: 700, fontSize: 30, color: "#5c574e" }}>{dateLabel}</span>
        </div>
        <div style={{ display: "flex", gap: 22 }}>
          <Tile label="24h volume" value={volume} accent={COLORS.cool} />
          <Tile label="Trades" value={trades} />
        </div>
        <div style={{ display: "flex", gap: 22 }}>
          <Tile label="Top payout" value={topPayout} accent={COLORS.pop} />
        </div>
        <div style={{ background: COLORS.paper, border: INK_BORDER, borderRadius: 22, boxShadow: hardShadow(9), padding: "24px 30px", display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: F, fontWeight: 800, fontSize: 24, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5c574e" }}>
            Hottest market
          </span>
          <span style={{ fontFamily: F, fontWeight: 900, fontSize: 40, color: COLORS.ink, lineHeight: 1.1 }}>{topMarket}</span>
        </div>
      </div>
      <Footer />
    </AbsoluteFill>
  </AbsoluteFill>
);
