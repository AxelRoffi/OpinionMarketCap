import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_MONO, hardShadow } from "../brand";
import { usePopIn } from "./ui";

const F = FONT_DISPLAY;
const M = FONT_MONO;

/** Small popping pill. */
const Pill: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  border?: boolean;
  delay?: number;
  rotate?: number;
  size?: number;
  mono?: boolean;
}> = ({ children, bg = COLORS.paper, color = COLORS.ink, border = true, delay = 0, rotate = 0, size = 30, mono = false }) => {
  const pop = usePopIn(delay);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: mono ? M : F,
        fontWeight: 800,
        fontSize: size,
        color,
        background: bg,
        border: border ? `4px solid ${COLORS.ink}` : "none",
        borderRadius: 16,
        padding: "12px 20px",
        transform: `scale(${pop}) rotate(${rotate}deg)`,
        opacity: pop,
        boxShadow: hardShadow(7),
      }}
    >
      {children}
    </span>
  );
};

const Line: React.FC<{ children: React.ReactNode; size?: number; color?: string; delay?: number }> = ({
  children,
  size = 38,
  color = COLORS.ink,
  delay = 0,
}) => {
  const pop = usePopIn(delay);
  return (
    <div style={{ fontFamily: F, fontWeight: 700, fontSize: size, color, opacity: pop, lineHeight: 1.15 }}>
      {children}
    </div>
  );
};

// 01 — What is OMC: an answer slot that keeps getting replaced (never settles)
export const VisWhatIsOMC: React.FC = () => {
  const frame = useCurrentFrame();
  const answers = ["Bitcoin", "Ethereum", "Solana", "Base"];
  const idx = Math.min(answers.length - 1, Math.floor((frame - 20) / 26));
  const swap = usePopIn(20 + idx * 26);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: "center" }}>
      <Line size={40} delay={14}>
        “Best crypto to hold?”
      </Line>
      <div
        style={{
          fontFamily: F,
          fontWeight: 900,
          fontSize: 96,
          textTransform: "uppercase",
          color: COLORS.ink,
          background: COLORS.cool,
          border: `7px solid ${COLORS.ink}`,
          borderRadius: 22,
          padding: "26px 60px",
          minWidth: 560,
          textAlign: "center",
          transform: `scale(${interpolate(swap, [0, 1], [0.86, 1])})`,
          boxShadow: hardShadow(14),
        }}
      >
        {answers[idx < 0 ? 0 : idx]}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <Pill bg={COLORS.ink} color={COLORS.canvas} border={false} delay={30} size={26}>
          No yes / no
        </Pill>
        <Pill bg={COLORS.ink} color={COLORS.canvas} border={false} delay={36} size={26}>
          No oracle
        </Pill>
        <Pill bg={COLORS.ink} color={COLORS.canvas} border={false} delay={42} size={26}>
          Never resolves
        </Pill>
      </div>
    </div>
  );
};

// 02 — Anyone can mint: the steps
export const VisMint: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
    <Pill delay={16} size={32} bg={COLORS.paper}>
      1 — Ask a question + set your answer <span style={{ color: "#7a756b" }}>(60 chars)</span>
    </Pill>
    <Pill delay={24} size={32} bg={COLORS.paper}>
      2 — Add a description &amp; link <span style={{ color: "#7a756b" }}>(optional)</span>
    </Pill>
    <Pill delay={32} size={32} bg={COLORS.paper}>
      3 — Pay <span style={{ fontFamily: M, color: COLORS.pop }}>$2</span> spam fee + initial price{" "}
      <span style={{ fontFamily: M, color: COLORS.pop }}>$1–$100</span>
    </Pill>
    <Pill delay={40} size={32} bg={COLORS.cool}>
      4 — Earn <span style={{ fontFamily: M }}>3%</span> of every trade, forever
    </Pill>
    <Line size={32} delay={50} color="#5c574e">
      Permissionless. Anyone. ~60 seconds.
    </Line>
  </div>
);

// 03 — Fee split: $200 splits into 95 / 3 / 2
export const VisFeeSplit: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [24, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const seg = (pct: number, color: string) => ({
    width: `${pct * grow}%`,
    background: color,
    height: 90,
    borderRight: `4px solid ${COLORS.ink}`,
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <Line size={44} delay={14}>
        Someone pays <span style={{ fontFamily: M, fontWeight: 800, color: COLORS.pop }}>$200</span> to take an answer:
      </Line>
      <div
        style={{
          display: "flex",
          border: `5px solid ${COLORS.ink}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: hardShadow(10),
        }}
      >
        <div style={seg(95, COLORS.cool)} />
        <div style={seg(3, COLORS.pop)} />
        <div style={seg(2, COLORS.ink)} />
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Pill delay={40} bg={COLORS.cool} size={30}>
          <span style={{ fontFamily: M }}>$190</span> → You · 95%
        </Pill>
        <Pill delay={46} bg={COLORS.pop} color={COLORS.paper} size={30}>
          <span style={{ fontFamily: M }}>$6</span> → Creator · 3%
        </Pill>
        <Pill delay={52} bg={COLORS.ink} color={COLORS.canvas} size={30}>
          <span style={{ fontFamily: M }}>$4</span> → Platform · 2%
        </Pill>
      </div>
      <Pill delay={60} bg={COLORS.cool} size={36}>
        ★ <span style={{ fontFamily: M }}>$196</span> of every $200 stays in the community · 98%
      </Pill>
    </div>
  );
};

// 04 — Get paid when outbid
export const VisOutbid: React.FC = () => {
  const frame = useCurrentFrame();
  const amt = interpolate(frame, [30, 64], [0, 285], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: "center" }}>
      <Line size={42} delay={14}>
        You hold the answer. Someone disagrees and pays to replace you →
      </Line>
      <div
        style={{
          fontFamily: M,
          fontWeight: 800,
          fontSize: 150,
          color: COLORS.ink,
          background: COLORS.cool,
          border: `8px solid ${COLORS.ink}`,
          borderRadius: 26,
          padding: "24px 60px",
          boxShadow: hardShadow(14),
          transform: `rotate(-2deg) scale(${usePopIn(28)})`,
        }}
      >
        +${amt.toFixed(2)}
      </div>
      <Pill delay={60} bg={COLORS.ink} color={COLORS.canvas} border={false} size={32}>
        95% of their bid → claim your fees
      </Pill>
    </div>
  );
};

// 05 — Royalties forever: 3% drops across a timeline
export const VisRoyalty: React.FC = () => {
  const points = ["This week", "Next month", "Next year", "A decade from now"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Line size={44} delay={14}>
        Mint the question <span style={{ fontWeight: 900 }}>once</span>. Then on <span style={{ fontWeight: 900 }}>every</span> future trade:
      </Line>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {points.map((p, i) => {
          const pop = usePopIn(26 + i * 12);
          return (
            <div
              key={p}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                opacity: pop,
                transform: `translateX(${interpolate(pop, [0, 1], [-40, 0])}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: M,
                  fontWeight: 800,
                  fontSize: 40,
                  color: COLORS.ink,
                  background: COLORS.cool,
                  border: `4px solid ${COLORS.ink}`,
                  borderRadius: 14,
                  padding: "8px 18px",
                }}
              >
                +3%
              </span>
              <span style={{ fontFamily: F, fontWeight: 700, fontSize: 38, color: COLORS.ink }}>{p}</span>
            </div>
          );
        })}
      </div>
      <Line size={34} delay={80}>
        The <span style={{ color: COLORS.pop, fontWeight: 900 }}>fastest, easiest</span> way to earn{" "}
        <span style={{ fontWeight: 900 }}>passive income on-chain.</span>
      </Line>
    </div>
  );
};

// 06 — Dynamic pricing regimes (price range on a shared −20% → +80% axis)
export const VisPriceRegimes: React.FC = () => {
  const AXIS_MIN = -20;
  const AXIS_MAX = 80;
  const SPAN = AXIS_MAX - AXIS_MIN; // 100
  const pct = (v: number) => ((v - AXIS_MIN) / SPAN) * 100;
  const zero = pct(0); // 20%
  const fmt = (v: number) => (v < 0 ? `−${Math.abs(v)}%` : `+${v}%`);
  const rows: [string, number, number, string][] = [
    ["Consolidation", -10, 15, "25%"],
    ["Bullish", 5, 40, "60%"],
    ["Correction", -20, 5, "15%"],
    ["Parabolic", 40, 80, "2%"],
  ];
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {rows.map(([name, min, max, prob], i) => {
        const grow = interpolate(frame, [18 + i * 8, 46 + i * 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const negW = min < 0 ? (zero - pct(min)) * grow : 0;
        const posStart = Math.max(pct(min), zero);
        const posW = max > 0 ? (pct(max) - posStart) * grow : 0;
        return (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 280, display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: F, fontWeight: 800, fontSize: 30, color: COLORS.ink }}>{name}</span>
              <span style={{ fontFamily: M, fontWeight: 700, fontSize: 22, color: "#7a756b" }}>
                {fmt(min)} → {fmt(max)}
              </span>
            </div>
            <div
              style={{
                flex: 1,
                position: "relative",
                height: 48,
                background: COLORS.paper,
                border: `4px solid ${COLORS.ink}`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* 0% line */}
              <div style={{ position: "absolute", left: `${zero}%`, top: 0, bottom: 0, width: 3, background: COLORS.ink, opacity: 0.55 }} />
              {/* downside (pink), grows left from 0 */}
              {negW > 0 && (
                <div style={{ position: "absolute", right: `${100 - zero}%`, width: `${negW}%`, top: 0, bottom: 0, background: COLORS.pop }} />
              )}
              {/* upside (cyan), grows right from its start */}
              {posW > 0 && (
                <div style={{ position: "absolute", left: `${posStart}%`, width: `${posW}%`, top: 0, bottom: 0, background: COLORS.cool }} />
              )}
            </div>
            <span
              style={{
                width: 96,
                textAlign: "center",
                fontFamily: M,
                fontWeight: 800,
                fontSize: 28,
                color: COLORS.ink,
                background: COLORS.canvas,
                border: `3px solid ${COLORS.ink}`,
                borderRadius: 10,
                padding: "6px 0",
              }}
            >
              {prob}
            </span>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: F, fontWeight: 700, fontSize: 24, color: "#7a756b" }}>chance →</span>
        <Pill delay={60} size={24} bg={COLORS.paper}>COLD &lt;5</Pill>
        <Pill delay={66} size={24} bg={COLORS.paper}>WARM 5–15</Pill>
        <Pill delay={72} size={24} bg={COLORS.pop} color={COLORS.paper}>HOT 15+</Pill>
        <Pill delay={78} size={24} bg={COLORS.ink} color={COLORS.canvas} border={false}>Not a fixed bump</Pill>
      </div>
    </div>
  );
};

// 07 — Self-exit (factual breakdown)
const Stat: React.FC<{ label: string; value: string; bg: string; delay: number; big?: boolean }> = ({
  label,
  value,
  bg,
  delay,
  big = false,
}) => {
  const pop = usePopIn(delay);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        background: bg,
        border: `5px solid ${COLORS.ink}`,
        borderRadius: 18,
        padding: "16px 30px",
        boxShadow: hardShadow(8),
        transform: `scale(${pop})`,
        opacity: pop,
      }}
    >
      <span style={{ fontFamily: F, fontWeight: 800, fontSize: 20, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5c574e" }}>
        {label}
      </span>
      <span style={{ fontFamily: M, fontWeight: 800, fontSize: big ? 84 : 56, color: COLORS.ink }}>{value}</span>
    </div>
  );
};

export const VisSelfExit: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
    <Line size={40} delay={14}>
      Changed your mind? Pull your stake out —{" "}
      <span style={{ color: COLORS.pop, fontWeight: 900 }}>anytime, no waiting.</span>
    </Line>
    {/* worked example: stake → −20% → reclaim */}
    <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
      <Stat label="Your stake" value="$20" bg={COLORS.paper} delay={24} />
      <span style={{ fontFamily: F, fontWeight: 900, fontSize: 40, color: COLORS.pop }}>−20% →</span>
      <Stat label="You reclaim" value="$16" bg={COLORS.cool} delay={32} big />
    </div>
    {/* the $4 penalty splits 50/50 */}
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <span style={{ fontFamily: F, fontWeight: 800, fontSize: 30, color: COLORS.ink }}>
        The <span style={{ fontFamily: M }}>$4</span> penalty splits 50/50:
      </span>
      <Pill delay={46} bg={COLORS.cool} size={28}>
        <span style={{ fontFamily: M }}>$2</span> → creator
      </Pill>
      <Pill delay={52} bg={COLORS.ink} color={COLORS.canvas} size={28}>
        <span style={{ fontFamily: M }}>$2</span> → platform
      </Pill>
    </div>
    <Line size={30} delay={62} color="#5c574e">
      No cooldown — leave whenever. The 20% just stops pump-and-dump.
    </Line>
  </div>
);

// 08 — Reclaim vacant slot
export const VisReclaim: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 28, alignItems: "flex-start" }}>
    <Line size={44} delay={14}>
      A slot went vacant? Anyone can grab it at a discount.
    </Line>
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <span style={{ fontFamily: M, fontWeight: 800, fontSize: 70, color: "#bdb8ab", textDecoration: "line-through" }}>
        $40
      </span>
      <span style={{ fontSize: 50 }}>→</span>
      <span
        style={{
          fontFamily: M,
          fontWeight: 800,
          fontSize: 96,
          color: COLORS.ink,
          background: COLORS.cool,
          border: `7px solid ${COLORS.ink}`,
          borderRadius: 20,
          padding: "14px 36px",
          boxShadow: hardShadow(12),
          transform: `scale(${usePopIn(30)})`,
        }}
      >
        $20
      </span>
    </div>
    <div style={{ display: "flex", gap: 14 }}>
      <Pill delay={44} bg={COLORS.pop} color={COLORS.paper} size={30}>−50% discount</Pill>
      <Pill delay={50} bg={COLORS.paper} size={30}>min $2</Pill>
    </div>
  </div>
);

// 09 — Pools: fill bar to $100
export const VisPools: React.FC = () => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [24, 64], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <Line size={40} delay={14}>
        <span style={{ fontWeight: 900 }}>Not just for whales.</span> Rally a crew, fund the answer you
        believe in, and move the market <span style={{ color: COLORS.pop }}>together.</span>
      </Line>
      <div style={{ position: "relative", height: 84, background: COLORS.paper, border: `5px solid ${COLORS.ink}`, borderRadius: 16, overflow: "hidden", boxShadow: hardShadow(10) }}>
        <div style={{ width: `${fill}%`, height: "100%", background: COLORS.cool }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: M, fontWeight: 800, fontSize: 40, color: COLORS.ink }}>
          ${fill.toFixed(0)} / $100 target
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Pill delay={40} bg={COLORS.paper} size={28}>Create: $5</Pill>
        <Pill delay={46} bg={COLORS.cool} size={28}>Join: free</Pill>
        <Pill delay={52} bg={COLORS.paper} size={28}>Hit target → split rewards</Pill>
        <Pill delay={58} bg={COLORS.ink} color={COLORS.canvas} border={false} size={28}>Miss → full refund</Pill>
      </div>
      <Line size={30} delay={70} color="#5c574e">
        Coordinate, back your side, build a community around the answers you care about.
      </Line>
    </div>
  );
};

// 10 — vs Polymarket table
export const VisVsPolymarket: React.FC = () => {
  const rows = [
    ["Markets", "~500, curated", "100M+, anyone"],
    ["Outcomes", "Binary yes / no", "Any opinion"],
    ["Lifecycle", "Resolves once → dead", "Never resolves"],
    ["Needs oracle", "Yes", "No — price is the answer"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ width: 230 }} />
        <Pill delay={16} bg={COLORS.paper} color="#7a756b" size={28}>Prediction mkts</Pill>
        <div style={{ flex: 1 }} />
        <Pill delay={20} bg={COLORS.ink} color={COLORS.canvas} border={false} size={28}>OMC</Pill>
      </div>
      {rows.map(([label, poly, omc], i) => {
        const pop = usePopIn(26 + i * 9);
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 16, opacity: pop, transform: `translateY(${interpolate(pop, [0, 1], [20, 0])}px)` }}>
            <span style={{ width: 230, fontFamily: F, fontWeight: 800, fontSize: 28, color: COLORS.ink }}>{label}</span>
            <span style={{ flex: 1, fontFamily: F, fontWeight: 700, fontSize: 28, color: "#9a9488" }}>
              ✗ {poly}
            </span>
            <span style={{ flex: 1, fontFamily: F, fontWeight: 800, fontSize: 28, color: COLORS.ink, background: COLORS.cool, border: `3px solid ${COLORS.ink}`, borderRadius: 12, padding: "8px 14px" }}>
              ✓ {omc}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// What you need to trade
const ReqRow: React.FC<{
  tag: string;
  tagBg: string;
  tagColor?: string;
  title: React.ReactNode;
  delay: number;
}> = ({ tag, tagBg, tagColor = COLORS.ink, title, delay }) => {
  const pop = usePopIn(delay);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        opacity: pop,
        transform: `translateX(${interpolate(pop, [0, 1], [-40, 0])}px)`,
      }}
    >
      <span
        style={{
          fontFamily: M,
          fontWeight: 800,
          fontSize: 34,
          color: tagColor,
          background: tagBg,
          border: `4px solid ${COLORS.ink}`,
          borderRadius: 14,
          padding: "12px 0",
          width: 200,
          textAlign: "center",
          boxShadow: hardShadow(6),
        }}
      >
        {tag}
      </span>
      <span style={{ fontFamily: F, fontWeight: 700, fontSize: 34, color: COLORS.ink }}>{title}</span>
    </div>
  );
};

export const VisWhatYouNeed: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
    <Line size={40} delay={14}>
      Two tokens, one network — <span style={{ fontWeight: 900 }}>that's all.</span>
    </Line>
    <ReqRow tag="USDC" tagBg={COLORS.cool} title={<>to mint &amp; trade</>} delay={24} />
    <ReqRow tag="ETH" tagBg={COLORS.ink} tagColor={COLORS.canvas} title={<>for gas — <span style={{ color: COLORS.pop }}>pennies on Base</span></>} delay={32} />
    <ReqRow tag="WALLET" tagBg={COLORS.pop} tagColor={COLORS.paper} title={<>Coinbase Wallet · MetaMask · Rainbow</>} delay={40} />
    <Line size={30} delay={56} color="#5c574e">
      New to Base? Bridge USDC + ETH over in minutes.
    </Line>
  </div>
);

// 11 — CTA recap
export const VisCTA: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "center" }}>
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
      <Pill delay={14} bg={COLORS.paper} size={30}>Anyone mints</Pill>
      <Pill delay={20} bg={COLORS.cool} size={30}>95% when outbid</Pill>
      <Pill delay={26} bg={COLORS.pop} color={COLORS.paper} size={30}>3% forever</Pill>
      <Pill delay={32} bg={COLORS.paper} size={30}>Never resolves</Pill>
    </div>
    <div
      style={{
        fontFamily: F,
        fontWeight: 900,
        fontSize: 60,
        textTransform: "uppercase",
        textAlign: "center",
        color: COLORS.canvas,
        background: COLORS.ink,
        borderRadius: 999,
        padding: "22px 50px",
        transform: `scale(${usePopIn(40)})`,
      }}
    >
      app.opinionmarketcap.xyz
    </div>
    <Line size={34} delay={56} color="#5c574e">
      Live on Base. Take a stand — get paid for it.
    </Line>
  </div>
);
