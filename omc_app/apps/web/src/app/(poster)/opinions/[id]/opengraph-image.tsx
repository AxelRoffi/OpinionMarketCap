/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { getOpinionForMeta } from '@/lib/opinion-server';
import { categoryDisplay, type CategoryColor } from '@/lib/categories';

export const runtime = 'nodejs';
// Revalidate every 5 minutes — opinions move fast, but rendering on every
// share unfurl would hammer the RPC. Bumping this comment also bumps the
// route's build hash so Vercel CDN drops any stale image that was rendered
// during a prior RPC-failure window (rev: 2026-06-02 v3 — categories fix).
export const revalidate = 300;

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'OpinionMarketCap — trade the take';

// Poster-Arcade palette (mirrors globals.css CSS variables — ImageResponse
// can't read CSS vars, so we hardcode the canonical hex values).
const INK = '#15120D';
const PAPER = '#FFFFFF';
const CANVAS = '#FFE94D';
const POP = '#FF4D6B';
const COOL = '#4DFFE0';

const COLOR_HEX: Record<CategoryColor, string> = {
  canvas: CANVAS,
  cool: COOL,
  pop: POP,
  paper: PAPER,
};

// Hero background per category group. Tuned so the chip color (from
// categories.ts) NEVER matches the hero color — every category gets a
// high-contrast chip-on-card pairing, mirroring the live page hero look
// (yellow card + pink chip for Sports, etc).
//
//   Chip color (from categories.ts) → Hero bg picked here to contrast:
//     tech   chip=cool   →  CANVAS bg
//     power  chip=canvas →  COOL   bg
//     entt   chip=pop    →  CANVAS bg  (matches the live Sports hero)
//     life   chip=paper  →  COOL   bg
const HERO_BG_FOR_GROUP: Record<string, string> = {
  tech: CANVAS,
  power: COOL,
  entertainment: CANVAS,
  lifestyle: COOL,
};
// Chip background uses the category's primary color (from categories.ts),
// keeping the chip identity consistent with the chips on the live grid.
function pickChipBg(color: CategoryColor, heroBg: string): string {
  const chip = COLOR_HEX[color];
  // If the chip color collides with the hero background, flip to ink fill
  // so the chip stays visible (e.g. pop entertainment chip would vanish on
  // a pop hero — we don't have one today, but guard for it).
  return chip === heroBg ? INK : chip;
}

function truncate(input: string, max: number): string {
  if (!input) return '';
  if (input.length <= max) return input;
  return input.slice(0, max - 1).trimEnd() + '…';
}

function fmtUsdc(raw: bigint): string {
  const usd = Number(raw) / 1_000_000;
  return `$${usd.toFixed(2)}`;
}

function shortAddress(addr: string | undefined): string {
  if (!addr) return '—';
  if (addr === '0x0000000000000000000000000000000000000000') return 'vacant';
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

type ImageProps = { params: Promise<{ id: string }> };

export default async function OpenGraphImage({ params }: ImageProps) {
  const { id } = await params;
  const opinionId = Number.parseInt(id, 10);
  const opinion = Number.isFinite(opinionId)
    ? await getOpinionForMeta(opinionId)
    : null;

  // Fallback splash for invalid / non-existent ids OR transient RPC failures.
  // Short cache (60s) so a single failed chain read doesn't poison Vercel's
  // CDN for a year — the next scrape gets a fresh attempt. Without this,
  // ImageResponse defaults to `immutable, max-age=31536000`, which would
  // lock the URL onto the splash even after the chain becomes reachable.
  if (!opinion) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: CANVAS,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 80,
            color: INK,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, opacity: 0.7 }}>
            OPINIONMARKETCAP
          </div>
          <div style={{ fontSize: 110, fontWeight: 900, letterSpacing: -3, marginTop: 24 }}>
            TRADE THE TAKE.
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, marginTop: 20, opacity: 0.75 }}>
            Live opinion market on Base.
          </div>
        </div>
      ),
      {
        ...size,
        headers: { 'Cache-Control': 'public, max-age=60, must-revalidate' },
      },
    );
  }

  // Resolve category metadata for the FIRST chain category. Falls back to
  // a neutral chip when the name isn't in our known list (rare — chain
  // admin could add new categories between releases).
  const primaryCat = opinion.categories[0];
  const catMeta = categoryDisplay(primaryCat);
  const heroBg = catMeta
    ? HERO_BG_FOR_GROUP[
        // Look the group up via categories.ts — fall back to CANVAS for
        // unknowns. The `group` field is on CATEGORIES but categoryDisplay
        // strips it; pull it via name lookup.
        primaryCat
          ? (lookupGroup(primaryCat) ?? 'power')
          : 'power'
      ] ?? CANVAS
    : CANVAS;
  const chipBg = catMeta ? pickChipBg(catMeta.color, heroBg) : POP;
  const chipFg = chipBg === PAPER || chipBg === CANVAS ? INK : PAPER;

  const question = truncate(opinion.question, 80);
  const rawAnswer = opinion.currentAnswer?.trim();
  const answer = rawAnswer ? truncate(rawAnswer.toUpperCase(), 30) : 'NO KING YET';
  const price = fmtUsdc(opinion.nextPrice);
  const catLabel = catMeta ? catMeta.name.toUpperCase() : 'OPINION';
  const catEmoji = catMeta ? catMeta.emoji : '⭐';
  const heldBy = shortAddress(opinion.currentAnswerOwner);
  const mintedBy = shortAddress(opinion.creator);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: heroBg,
          display: 'flex',
          flexDirection: 'column',
          padding: '54px 70px',
          color: INK,
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          boxSizing: 'border-box',
          // Heavy ink border, mirroring the page hero Sticker (2.5px on
          // screen, scaled up for the OG canvas).
          border: `6px solid ${INK}`,
          borderRadius: 24,
        }}
      >
        {/* Top row — category chip (left) + #N badge (right). */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Category pill with emoji */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: chipBg,
              color: chipFg,
              padding: '10px 24px',
              borderRadius: 999,
              border: `3px solid ${INK}`,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            <span style={{ marginRight: 8 }}>{catEmoji}</span> {catLabel}
          </div>
          {/* #N ink-fill pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: INK,
              color: CANVAS,
              padding: '8px 18px',
              borderRadius: 999,
              border: `3px solid ${INK}`,
              fontSize: 22,
              fontWeight: 800,
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            }}
          >
            #{opinionId}
          </div>
        </div>

        {/* Question (small italic) */}
        <div
          style={{
            fontSize: 30,
            fontStyle: 'italic',
            fontWeight: 700,
            marginTop: 28,
            opacity: 0.85,
            maxWidth: 1040,
            lineHeight: 1.18,
            display: 'flex',
          }}
        >
          &ldquo;{question}&rdquo;
        </div>

        {/* Answer — the hero element */}
        <div
          style={{
            fontSize: answer.length > 18 ? 116 : 156,
            fontWeight: 900,
            letterSpacing: -4,
            marginTop: 10,
            lineHeight: 0.92,
            maxWidth: 1060,
            display: 'flex',
            color: INK,
          }}
        >
          {answer}.
        </div>

        {/* Spacer pushes the address/floor row to the bottom */}
        <div style={{ flexGrow: 1, display: 'flex' }} />

        {/* HELD BY / MINTED BY / FLOOR — mirrors the page hero's three-up grid */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: `4px solid ${INK}`,
            paddingTop: 22,
            width: '100%',
          }}
        >
          <Stat label="HELD BY" value={`@${heldBy}`} mono />
          <Stat label="MINTED BY" value={`@${mintedBy}`} mono />
          <Stat label="FLOOR" value={price} mono large alignRight />
        </div>
      </div>
    ),
    size,
  );
}

function Stat({
  label,
  value,
  mono,
  large,
  alignRight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  large?: boolean;
  alignRight?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: alignRight ? 'flex-end' : 'flex-start',
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: 3,
          opacity: 0.65,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: mono
            ? 'ui-monospace, SFMono-Regular, monospace'
            : 'system-ui, sans-serif',
          fontSize: large ? 56 : 28,
          fontWeight: large ? 900 : 800,
          marginTop: 4,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// Local group lookup — avoid importing the full CATEGORIES array (already
// re-exported via categoryDisplay), keeps this server module slim.
const GROUP_BY_NAME: Record<string, 'tech' | 'power' | 'entertainment' | 'lifestyle'> = {
  'Technology': 'tech',
  'AI & Robotics': 'tech',
  'Crypto & Web3': 'tech',
  'DeFi (Decentralized Finance)': 'tech',
  'Science': 'tech',
  'Environment & Climate': 'tech',
  'Automotive': 'tech',
  'History': 'tech',
  'Business & Finance': 'power',
  'Real Estate': 'power',
  'Politics': 'power',
  'Law & Legal': 'power',
  'News': 'power',
  'Education': 'power',
  'Career & Workplace': 'power',
  'Sports': 'entertainment',
  'Gaming': 'entertainment',
  'Movies': 'entertainment',
  'TV Shows': 'entertainment',
  'Music': 'entertainment',
  'Podcasts': 'entertainment',
  'Literature': 'entertainment',
  'Art & Design': 'entertainment',
  'Photography': 'entertainment',
  'Celebrities & Pop Culture': 'entertainment',
  'Social Media': 'entertainment',
  'Humor & Memes': 'entertainment',
  'True Crime': 'entertainment',
  'Adult (NSFW)': 'entertainment',
  'Fashion': 'lifestyle',
  'Beauty & Skincare': 'lifestyle',
  'Health & Fitness': 'lifestyle',
  'Food & Drink': 'lifestyle',
  'Travel': 'lifestyle',
  'Philosophy': 'lifestyle',
  'Spirituality & Religion': 'lifestyle',
  'Relationships': 'lifestyle',
  'Parenting & Family': 'lifestyle',
  'Pets & Animals': 'lifestyle',
  'DIY & Home Improvement': 'lifestyle',
};

function lookupGroup(name: string): 'tech' | 'power' | 'entertainment' | 'lifestyle' | undefined {
  return GROUP_BY_NAME[name];
}
