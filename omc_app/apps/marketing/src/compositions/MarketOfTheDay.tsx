import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO, hardShadow } from "../brand";
import { Background } from "../components/Background";
import { OpinionCard } from "../components/OpinionCard";
import { MusicBed, Sfx } from "../components/audio";

export type MarketOfTheDayProps = {
  question: string;
  answer: string;
  price: number;
  category: string;
  owner: string;
  changePct: number;
};

/**
 * Daily parameterized clip (~10s, 1080×1080). Render with:
 *   npx remotion render MarketOfTheDay out/daily/clip.mp4 \
 *     --props='{"question":"GOAT of basketball?","answer":"Jordan","price":3,"category":"SPORTS"}'
 * Or use `npm run daily` (scripts/daily.mjs) which also writes the caption.
 */
export const MarketOfTheDay: React.FC<MarketOfTheDayProps> = ({
  question,
  answer,
  price,
  category,
  owner,
  changePct,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // header slams in
  const headPop = spring({ frame: frame - 4, fps, config: { damping: 10, mass: 0.6, stiffness: 140 } });
  // card pops after header
  const cardPop = spring({ frame: frame - 26, fps, config: { damping: 12, mass: 0.6, stiffness: 120 } });
  // CTA at the end
  const ctaPop = spring({ frame: frame - 150, fps, config: { damping: 11, mass: 0.6, stiffness: 130 } });
  // gentle idle wobble on the card so the clip never feels frozen
  const wobble = Math.sin((frame / durationInFrames) * Math.PI * 4) * 1.2;

  return (
    <AbsoluteFill>
      <MusicBed volume={0.24} />
      <Sfx src="whoosh.wav" at={2} volume={0.7} />
      <Sfx src="pop.wav" at={26} volume={0.7} />
      <Sfx src="chaching.wav" at={150} volume={0.75} />
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 64, gap: 40 }}>
        {/* header */}
        <div
          style={{
            transform: `scale(${headPop}) rotate(-2deg)`,
            opacity: headPop,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: COLORS.canvas,
              background: COLORS.ink,
              borderRadius: 999,
              padding: "10px 26px",
            }}
          >
            ★ Market of the day ★
          </span>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize: 58,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: COLORS.ink,
              textAlign: "center",
              lineHeight: 1,
            }}
          >
            Disagree? <span style={{ color: COLORS.pop }}>Take the slot.</span>
          </span>
        </div>

        {/* the live market card */}
        <div style={{ transform: `scale(${cardPop}) rotate(${-2 + wobble}deg)`, opacity: cardPop }}>
          <OpinionCard
            category={category}
            question={question}
            answer={answer}
            owner={owner}
            changePct={changePct}
            width={860}
            priceLabel={<span style={{ fontFamily: FONT_MONO }}>${price.toFixed(2)}</span>}
          />
        </div>

        {/* CTA */}
        <div
          style={{
            transform: `scale(${ctaPop})`,
            opacity: ctaPop,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize: 40,
              textTransform: "uppercase",
              color: COLORS.canvas,
              background: COLORS.ink,
              borderRadius: 999,
              padding: "16px 40px",
              boxShadow: hardShadow(8),
            }}
          >
            app.opinionmarketcap.xyz
          </span>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 26, color: COLORS.ink }}>
            95% back when you're outbid · minter keeps 3% forever ★
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
