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
import { BigType, Eyebrow, usePopIn } from "../components/ui";
import { MusicBed, Sfx } from "../components/audio";

const SceneWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 70 }}>
    {children}
  </AbsoluteFill>
);

// 1 — Hook
const SceneHook: React.FC = () => (
  <SceneWrap>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      <Eyebrow>Post a banger</Eyebrow>
      <BigType size={120} style={{ textAlign: "center" }}>
        Got a <span style={{ color: COLORS.pop }}>hot take?</span>
      </BigType>
      <div style={{ transform: "rotate(-3deg)" }}>
        <OpinionCard
          category="SPORTS"
          question="GOAT of basketball?"
          answer="Jordan"
          changePct={0}
          width={820}
          priceLabel={<span style={{ fontFamily: FONT_MONO }}>$3.00</span>}
        />
      </div>
    </div>
  </SceneWrap>
);

// 2 — Price moves only when the answer changes hands
const HOLD_STEPS: [string, number][] = [
  ["Jordan", 3.0],
  ["LeBron", 4.4],
  ["Kobe", 6.7],
  ["Jordan", 9.8],
];
const SceneHold: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const STEP = 16;
  const START = 6;
  const idx = Math.min(HOLD_STEPS.length - 1, Math.max(0, Math.floor((frame - START) / STEP)));
  const [answer, price] = HOLD_STEPS[idx];
  const prev = idx === 0 ? price : HOLD_STEPS[idx - 1][1];
  const pct = ((price - prev) / prev) * 100;
  const bump = spring({ frame: frame - (START + idx * STEP), fps, config: { damping: 11, mass: 0.5, stiffness: 160 } });
  const scale = interpolate(bump, [0, 1], [0.92, 1]);
  return (
    <SceneWrap>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Eyebrow bg={COLORS.pop} color={COLORS.paper}>
          The floor
        </Eyebrow>
        <div style={{ transform: `rotate(2deg) scale(${scale})` }}>
          <OpinionCard
            category="SPORTS"
            question="GOAT of basketball?"
            answer={answer}
            changePct={idx === 0 ? 0 : pct}
            width={820}
            priceLabel={<span style={{ fontFamily: FONT_MONO }}>${price.toFixed(2)}</span>}
          />
        </div>
        <BigType size={56} color={COLORS.ink} style={{ textAlign: "center" }}>
          Price moves <span style={{ color: COLORS.pop }}>only when the answer changes.</span>
        </BigType>
      </div>
    </SceneWrap>
  );
};

// 3 — Someone disagrees
const SceneChallenge: React.FC = () => {
  const pop = usePopIn(4);
  return (
    <SceneWrap>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
        <BigType size={120} style={{ textAlign: "center" }}>
          Someone
          <br />
          <span style={{ color: COLORS.pop }}>disagrees.</span>
        </BigType>
        <div
          style={{
            transform: `scale(${pop}) rotate(-4deg)`,
            fontFamily: FONT_DISPLAY,
            fontWeight: 900,
            fontSize: 90,
            textTransform: "uppercase",
            color: COLORS.paper,
            background: COLORS.ink,
            border: `8px solid ${COLORS.ink}`,
            borderRadius: 22,
            padding: "26px 46px",
            boxShadow: `12px 12px 0 ${COLORS.pop}`,
          }}
        >
          "Nah — LeBron"
        </div>
      </div>
    </SceneWrap>
  );
};

// 4 — They pay you
const ScenePayout: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, mass: 0.6, stiffness: 130 } });
  const amount = interpolate(frame, [6, 40], [0, 17.67], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneWrap>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <BigType size={104} style={{ textAlign: "center" }}>
          They pay <span style={{ color: COLORS.pop }}>YOU</span>
          <br />
          to leave.
        </BigType>
        <div
          style={{
            transform: `scale(${pop}) rotate(-2deg)`,
            fontFamily: FONT_MONO,
            fontWeight: 800,
            fontSize: 130,
            color: COLORS.ink,
            background: COLORS.cool,
            border: `9px solid ${COLORS.ink}`,
            borderRadius: 28,
            padding: "30px 56px",
            boxShadow: `14px 14px 0 ${COLORS.ink}`,
          }}
        >
          +${amount.toFixed(2)}
        </div>
        <BigType size={48} style={{ textAlign: "center" }}>
          95% of their bid — <span style={{ color: COLORS.pop }}>yours to claim.</span>
        </BigType>
      </div>
    </SceneWrap>
  );
};

// 5 — CTA
const SceneCTA: React.FC = () => {
  const pop = usePopIn(2);
  return (
    <SceneWrap>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div style={{ fontSize: 150, color: COLORS.pop, textShadow: `8px 8px 0 ${COLORS.ink}` }}>★</div>
        <BigType size={100} style={{ textAlign: "center" }}>
          Take a stand.
          <br />
          <span style={{ color: COLORS.pop }}>Get paid for it.</span>
        </BigType>
        <div
          style={{
            transform: `scale(${pop})`,
            fontFamily: FONT_DISPLAY,
            fontWeight: 900,
            fontSize: 48,
            textTransform: "uppercase",
            color: COLORS.canvas,
            background: COLORS.ink,
            borderRadius: 999,
            padding: "22px 50px",
          }}
        >
          app.opinionmarketcap.xyz
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 30, color: COLORS.ink, textAlign: "center", maxWidth: 900 }}>
          Mint the question? You keep <span style={{ color: COLORS.pop }}>3% of every trade</span> — forever.
        </div>
      </div>
    </SceneWrap>
  );
};

export const OutbidShort: React.FC = () => (
  <AbsoluteFill>
    <MusicBed />
    <Sfx src="pop.wav" at={2} />
    {/* Hold: a pop on each answer change (price jump) — global 81/97/113/129 */}
    <Sfx src="pop.wav" at={81} volume={0.55} />
    <Sfx src="pop.wav" at={97} volume={0.62} />
    <Sfx src="pop.wav" at={113} volume={0.7} />
    <Sfx src="pop.wav" at={129} volume={0.78} />
    <Sfx src="impact.wav" at={154} volume={0.9} />
    <Sfx src="chaching.wav" at={226} volume={0.85} />
    <Sfx src="sparkle.wav" at={302} volume={0.8} />
    <Background />
    <Series>
      <Series.Sequence durationInFrames={75}>
        <SceneHook />
      </Series.Sequence>
      <Series.Sequence durationInFrames={75}>
        <SceneHold />
      </Series.Sequence>
      <Series.Sequence durationInFrames={70}>
        <SceneChallenge />
      </Series.Sequence>
      <Series.Sequence durationInFrames={80}>
        <ScenePayout />
      </Series.Sequence>
      <Series.Sequence durationInFrames={90}>
        <SceneCTA />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
