import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO } from "../brand";
import { Background } from "../components/Background";
import { OpinionCard } from "../components/OpinionCard";
import { MusicBed, Sfx } from "../components/audio";

/**
 * Square feed loop. Price ratchets up in discrete "takes", a +royalty chip
 * flies out on each take, and the whole thing loops cleanly.
 */
export const PriceLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Each new answer that takes the slot sets a new price.
  const steps: [string, string, number][] = [
    ["Base", "0x9a…D8c", 12.0],
    ["Optimism", "0x4f…A1b", 17.4],
    ["Arbitrum", "0x7c…E22", 24.1],
    ["zkSync", "0x1d…9Fe", 31.8],
    ["Base", "0x9a…D8c", 42.5],
  ];
  const seg = durationInFrames / steps.length;
  const idx = Math.min(steps.length - 1, Math.floor(frame / seg));
  const localT = (frame - idx * seg) / seg;
  const [answer, owner, price] = steps[idx];
  const prev = idx === 0 ? price : steps[idx - 1][2];
  const changePct = ((price - prev) / prev) * 100;

  // royalty chip pops at the start of each segment
  const chipT = interpolate(localT, [0, 0.18, 0.7, 0.95], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chipY = interpolate(chipT, [0, 1], [30, -40]);
  const royalty = price * 0.03; // 3% creator royalty on the new price

  return (
    <AbsoluteFill>
      <MusicBed />
      {steps.map((_, i) => (
        <Sfx key={i} src="chaching.wav" at={Math.round(i * seg)} volume={0.7} />
      ))}
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 70 }}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 900,
            fontSize: 56,
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
            color: COLORS.ink,
            marginBottom: 36,
            textAlign: "center",
          }}
        >
          Price moves when <span style={{ color: COLORS.pop }}>the answer changes</span>
        </div>

        <div style={{ position: "relative" }}>
          <OpinionCard
            category="CRYPTO"
            question="Best L2 to build on right now?"
            answer={answer}
            owner={owner}
            changePct={idx === 0 ? 0 : changePct}
            width={840}
            rotate={-2}
            priceLabel={
              <span style={{ fontFamily: FONT_MONO }}>
                ${price.toFixed(2)}
              </span>
            }
          />

          {/* royalty chip flying up on each take */}
          <div
            style={{
              position: "absolute",
              top: 130,
              right: -50,
              transform: `translateY(${chipY}px) rotate(6deg)`,
              opacity: chipT,
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 34,
              color: COLORS.ink,
              background: COLORS.cool,
              border: `5px solid ${COLORS.ink}`,
              borderRadius: 14,
              padding: "10px 18px",
              boxShadow: `6px 6px 0 ${COLORS.ink}`,
            }}
          >
            +${royalty.toFixed(2)} to you
          </div>
        </div>

        <div
          style={{
            marginTop: 44,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: COLORS.ink,
          }}
        >
          Mint it → you keep 3% forever ★
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
