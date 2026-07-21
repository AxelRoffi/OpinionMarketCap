import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../brand";

/** Yellow arcade canvas with a slow-drifting dotted halftone. */
export const Background: React.FC<{
  color?: string;
  dotColor?: string;
  drift?: boolean;
}> = ({ color = COLORS.canvas, dotColor = "rgba(21,18,13,0.10)", drift = true }) => {
  const frame = useCurrentFrame();
  const offset = drift ? (frame * 0.4) % 48 : 0;
  return (
    <AbsoluteFill style={{ background: color }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${dotColor} 3px, transparent 3px)`,
          backgroundSize: "48px 48px",
          backgroundPosition: `${offset}px ${offset}px`,
        }}
      />
    </AbsoluteFill>
  );
};
