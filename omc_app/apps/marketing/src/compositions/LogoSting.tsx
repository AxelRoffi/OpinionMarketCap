import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY } from "../brand";
import { Background } from "../components/Background";
import { MusicBed, Sfx } from "../components/audio";

/**
 * ~2.5s reusable logo sting. A big ★ slams in, the wordmark snaps under it,
 * and a pink underline wipes across. Works at any aspect ratio.
 * `playMusic` is false when embedded in a longer video that owns the music bed.
 */
export const LogoSting: React.FC<{ tagline?: string; playMusic?: boolean }> = ({
  tagline = "Opinions are free. Yours isn't.",
  playMusic = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const compact = width < 1000; // vertical / square

  const starPop = spring({ frame, fps, config: { damping: 9, mass: 0.7, stiffness: 140 } });
  const starRot = interpolate(starPop, [0, 1], [-120, 0]);

  const wordPop = spring({
    frame: frame - 8,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 120 },
  });
  const wordY = interpolate(wordPop, [0, 1], [60, 0]);

  const underline = spring({
    frame: frame - 18,
    fps,
    config: { damping: 16, mass: 0.5, stiffness: 90 },
  });

  const tagOpacity = interpolate(frame, [26, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const wordSize = compact ? 96 : 150;

  return (
    <AbsoluteFill>
      {playMusic && <MusicBed volume={0.32} />}
      <Sfx src="sparkle.wav" at={0} volume={0.9} />
      <Sfx src="pop.wav" at={8} volume={0.7} />
      <Background drift={false} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          padding: 60,
        }}
      >
        <div
          style={{
            fontSize: compact ? 200 : 260,
            lineHeight: 1,
            color: COLORS.pop,
            textShadow: `8px 8px 0 ${COLORS.ink}`,
            transform: `rotate(${starRot}deg) scale(${starPop})`,
          }}
        >
          ★
        </div>

        <div
          style={{
            transform: `translateY(${wordY}px) scale(${wordPop})`,
            opacity: wordPop,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize: wordSize,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              color: COLORS.ink,
            }}
          >
            Opinion
            <br />
            <span style={{ color: COLORS.pop }}>Market</span> Cap
            <span style={{ color: COLORS.pop }}>.</span>
          </div>
          <div
            style={{
              height: 14,
              marginTop: 18,
              borderRadius: 999,
              background: COLORS.pop,
              transform: `scaleX(${underline})`,
              transformOrigin: "left center",
            }}
          />
        </div>

        <div
          style={{
            opacity: tagOpacity,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: compact ? 30 : 38,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: COLORS.ink,
            textAlign: "center",
          }}
        >
          {tagline}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
