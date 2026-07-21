import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Series,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO } from "../brand";
import { Background } from "../components/Background";
import { OpinionCard } from "../components/OpinionCard";
import { BigType, Eyebrow, Sticker, usePopIn, Wordmark } from "../components/ui";
import { MusicBed, Sfx } from "../components/audio";
import { LogoSting } from "./LogoSting";

const Stage: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 70 }) => (
  <AbsoluteFill
    style={{ justifyContent: "center", alignItems: "center", padding: 110, gap }}
  >
    {children}
  </AbsoluteFill>
);

// 1 — What is it
const SceneWhat: React.FC = () => (
  <Stage gap={44}>
    <Eyebrow>Opinions are free. Yours isn't.</Eyebrow>
    <BigType size={130} style={{ textAlign: "center" }}>
      A market for <span style={{ color: COLORS.pop }}>hot takes.</span>
    </BigType>
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: 44,
        color: COLORS.ink,
        textAlign: "center",
        maxWidth: 1300,
        lineHeight: 1.2,
      }}
    >
      Back your opinion with real money — USDC on Base. No right, no wrong: the money decides.
    </div>
  </Stage>
);

// 2 — Mint
const MintPill: React.FC<{ children: React.ReactNode; bg: string; color?: string; delay: number }> = ({
  children,
  bg,
  color = COLORS.ink,
  delay,
}) => {
  const pop = usePopIn(delay);
  return (
    <span
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: 30,
        color,
        background: bg,
        border: `4px solid ${COLORS.ink}`,
        borderRadius: 14,
        padding: "10px 20px",
        transform: `scale(${pop})`,
        opacity: pop,
      }}
    >
      {children}
    </span>
  );
};

const SceneMint: React.FC = () => {
  const pop = usePopIn(6);
  return (
    <Stage>
      <div style={{ display: "flex", alignItems: "center", gap: 90 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, maxWidth: 740 }}>
          <Eyebrow bg={COLORS.pop} color={COLORS.paper}>
            Step 1 — Mint
          </Eyebrow>
          <BigType size={104}>Mint your take.</BigType>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, color: COLORS.ink, lineHeight: 1.2 }}>
            Pick a question. Set your answer and a{" "}
            <span style={{ color: COLORS.pop }}>starting price — $1 to $100.</span>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <MintPill bg={COLORS.cool} delay={14}>
              <span style={{ fontFamily: FONT_MONO }}>$2</span> fee to publish
            </MintPill>
            <MintPill bg={COLORS.paper} delay={20}>
              + description &amp; link (optional)
            </MintPill>
          </div>
        </div>
        <div style={{ transform: `scale(${pop})` }}>
          <OpinionCard
            category="CRYPTO"
            question="Best L2 to build on right now?"
            answer="Base"
            changePct={0}
            width={720}
            rotate={-3}
            priceLabel={<span style={{ fontFamily: FONT_MONO }}>$5.00</span>}
          />
        </div>
      </div>
    </Stage>
  );
};

// 3 — Hold: the price ONLY moves when the answer changes hands
const HOLD_STEPS: [string, number][] = [
  ["Base", 5.0],
  ["Optimism", 8.1],
  ["Arbitrum", 12.6],
  ["zkSync", 19.3],
  ["Base", 28.5],
];
const SceneHold: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const STEP = 22;
  const START = 10;
  const idx = Math.min(HOLD_STEPS.length - 1, Math.max(0, Math.floor((frame - START) / STEP)));
  const [answer, price] = HOLD_STEPS[idx];
  const prev = idx === 0 ? price : HOLD_STEPS[idx - 1][1];
  const pct = ((price - prev) / prev) * 100;
  // bump the card each time the answer flips
  const changeFrame = START + idx * STEP;
  const bump = spring({ frame: frame - changeFrame, fps, config: { damping: 11, mass: 0.5, stiffness: 160 } });
  const scale = interpolate(bump, [0, 1], [0.93, 1]);
  return (
    <Stage>
      <div style={{ display: "flex", alignItems: "center", gap: 90 }}>
        <div style={{ transform: `rotate(2deg) scale(${scale})` }}>
          <OpinionCard
            category="CRYPTO"
            question="Best L2 to build on right now?"
            answer={answer}
            changePct={idx === 0 ? 0 : pct}
            width={720}
            priceLabel={<span style={{ fontFamily: FONT_MONO }}>${price.toFixed(2)}</span>}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, maxWidth: 720 }}>
          <Eyebrow>Step 2 — Hold</Eyebrow>
          <BigType size={108}>
            Hold the <span style={{ color: COLORS.pop }}>floor.</span>
          </BigType>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, color: COLORS.ink, lineHeight: 1.2 }}>
            The price moves <span style={{ color: COLORS.pop }}>only when the answer changes hands.</span>{" "}
            New answer takes the lead → price jumps.
          </div>
        </div>
      </div>
    </Stage>
  );
};

// 4 — Outbid / payout
const ScenePayout: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 8, fps, config: { damping: 11, mass: 0.6, stiffness: 130 } });
  const amount = interpolate(frame, [14, 56], [0, 26.03], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Stage gap={50}>
      <Eyebrow bg={COLORS.pop} color={COLORS.paper}>
        Step 3 — Get paid
      </Eyebrow>
      <BigType size={108} style={{ textAlign: "center" }}>
        Someone disagrees — they take your answer.
        <br />
        <span style={{ color: COLORS.pop }}>They pay YOU to leave.</span>
      </BigType>
      <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
        <Sticker rotate={-3} bg={COLORS.cool} delay={8} padding="34px 56px">
          <div style={{ fontFamily: FONT_MONO, fontWeight: 800, fontSize: 120, color: COLORS.ink }}>
            +${amount.toFixed(2)}
          </div>
        </Sticker>
        <div
          style={{
            transform: `scale(${pop})`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 40,
            color: COLORS.ink,
            maxWidth: 760,
          }}
        >
          <span>
            <span style={{ fontFamily: FONT_MONO }}>95%</span> of their bid → yours to claim (the owner they replaced)
          </span>
          <span style={{ color: COLORS.pop }}>
            + <span style={{ fontFamily: FONT_MONO }}>3%</span> → whoever minted the question. Forever.
          </span>
        </div>
      </div>
    </Stage>
  );
};

// 5 — CTA
const SceneCTA: React.FC = () => {
  const pop = usePopIn(4);
  return (
    <Stage gap={44}>
      <Wordmark size={90} />
      <BigType size={170} style={{ textAlign: "center" }}>
        Take a stand.
        <br />
        <span style={{ color: COLORS.pop }}>Get paid for it.</span>
      </BigType>
      <div style={{ display: "flex", gap: 30, transform: `scale(${pop})` }}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 900,
            fontSize: 44,
            textTransform: "uppercase",
            color: COLORS.canvas,
            background: COLORS.ink,
            borderRadius: 999,
            padding: "20px 44px",
          }}
        >
          app.opinionmarketcap.xyz
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 900,
            fontSize: 44,
            textTransform: "uppercase",
            color: COLORS.ink,
            background: COLORS.cool,
            border: `5px solid ${COLORS.ink}`,
            borderRadius: 999,
            padding: "20px 44px",
          }}
        >
          ★ Live on Base
        </div>
      </div>
    </Stage>
  );
};

export const HeroExplainer: React.FC = () => (
  <AbsoluteFill>
    <MusicBed volume={0.24} />
    {/* sting (0-70) plays its own sparkle. SFX cue each scene transition: */}
    <Sfx src="whoosh.wav" at={70} />
    <Sfx src="pop.wav" at={74} volume={0.6} />
    <Sfx src="whoosh.wav" at={180} />
    <Sfx src="pop.wav" at={186} volume={0.6} />
    <Sfx src="whoosh.wav" at={300} />
    {/* Step 2: a pop on each answer change (price jump) — local 10/32/54/76/98 */}
    <Sfx src="pop.wav" at={310} volume={0.55} />
    <Sfx src="pop.wav" at={332} volume={0.6} />
    <Sfx src="pop.wav" at={354} volume={0.65} />
    <Sfx src="pop.wav" at={376} volume={0.7} />
    <Sfx src="pop.wav" at={398} volume={0.75} />
    <Sfx src="whoosh.wav" at={430} />
    <Sfx src="chaching.wav" at={444} volume={0.85} />
    <Sfx src="whoosh.wav" at={580} />
    <Sfx src="sparkle.wav" at={584} volume={0.8} />
    <Background />
    <Series>
      <Series.Sequence durationInFrames={70}>
        <LogoSting playMusic={false} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={110}>
        <SceneWhat />
      </Series.Sequence>
      <Series.Sequence durationInFrames={120}>
        <SceneMint />
      </Series.Sequence>
      <Series.Sequence durationInFrames={130}>
        <SceneHold />
      </Series.Sequence>
      <Series.Sequence durationInFrames={150}>
        <ScenePayout />
      </Series.Sequence>
      <Series.Sequence durationInFrames={130}>
        <SceneCTA />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
