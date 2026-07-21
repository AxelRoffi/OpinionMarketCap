/**
 * OpinionMarketCap brand tokens — "Sticker Confidence" / "Poster Arcade".
 * Mirrors apps/landing/src/lib/design-tokens.ts and globals.css so videos
 * match the live product 1:1.
 */
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

export const interTight = loadInterTight("normal", {
  weights: ["700", "800", "900"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
export const jetBrainsMono = loadJetBrainsMono("normal", {
  weights: ["700", "800"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

export const FONT_DISPLAY = interTight.fontFamily;
export const FONT_MONO = jetBrainsMono.fontFamily;

export const COLORS = {
  canvas: "#FFE94D", // yellow page background
  ink: "#15120D", // type, borders, hard shadows
  pop: "#FF4D6B", // primary CTA / hot / loss
  cool: "#4DFFE0", // gains / accents / secondary CTA
  paper: "#FFFFFF", // cards
  // dark web-app surface, for variety
  dark: "#111827",
} as const;

/** Hard offset shadow used everywhere in the brand (no blur). */
export const hardShadow = (
  size = 12,
  color: string = COLORS.ink,
): string => `${size}px ${size}px 0 ${color}`;

/** Standard thick ink border. */
export const INK_BORDER = `6px solid ${COLORS.ink}`;

export const RADIUS = 28;
