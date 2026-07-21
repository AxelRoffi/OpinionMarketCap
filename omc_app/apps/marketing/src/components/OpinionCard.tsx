import React from "react";
import { COLORS, FONT_DISPLAY, FONT_MONO, hardShadow, INK_BORDER } from "../brand";

/**
 * A live "opinion" card mirroring the product: a question, the current winning
 * answer, who holds it, and the live price. Designed to be composed inside
 * Sticker or animated directly.
 */
export const OpinionCard: React.FC<{
  category?: string;
  question: string;
  answer: string;
  owner?: string;
  priceLabel: React.ReactNode;
  changePct?: number; // positive => cool/green, negative => pop/red
  width?: number;
  rotate?: number;
  style?: React.CSSProperties;
}> = ({
  category = "CRYPTO",
  question,
  answer,
  owner = "0x9a…D8c",
  priceLabel,
  changePct = 0,
  width = 760,
  rotate = 0,
  style,
}) => {
  const up = changePct >= 0;
  const changeColor = up ? COLORS.cool : COLORS.pop;
  return (
    <div
      style={{
        width,
        background: COLORS.paper,
        border: INK_BORDER,
        borderRadius: 28,
        boxShadow: hardShadow(18),
        padding: 40,
        transform: `rotate(${rotate}deg)`,
        display: "flex",
        flexDirection: "column",
        gap: 22,
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: COLORS.ink,
            background: COLORS.canvas,
            border: `3px solid ${COLORS.ink}`,
            borderRadius: 999,
            padding: "6px 18px",
          }}
        >
          {category}
        </span>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, color: "#7a756b" }}>
          {owner}
        </span>
      </div>

      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 34,
          lineHeight: 1.05,
          color: COLORS.ink,
        }}
      >
        {question}
      </div>

      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 900,
          fontSize: 52,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          textTransform: "uppercase",
          color: COLORS.ink,
          background: COLORS.cool,
          border: INK_BORDER,
          borderRadius: 18,
          padding: "18px 24px",
        }}
      >
        {answer}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#7a756b",
            }}
          >
            Price to take it
          </span>
          <span style={{ fontFamily: FONT_MONO, fontWeight: 800, fontSize: 64, color: COLORS.ink }}>
            {priceLabel}
          </span>
        </div>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 800,
            fontSize: 30,
            color: COLORS.ink,
            background: changeColor,
            border: `4px solid ${COLORS.ink}`,
            borderRadius: 12,
            padding: "6px 14px",
          }}
        >
          {up ? "▲" : "▼"} {up ? "+" : ""}
          {changePct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
