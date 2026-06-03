/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getOpinionForMeta } from '@/lib/opinion-server';
import { categoryDisplay, type CategoryColor } from '@/lib/categories';

export const runtime = 'nodejs';

const SIZE = { width: 1200, height: 630 };

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

// Hero background per category group. Chip color (from categories.ts) NEVER
// matches the hero color — every category gets a high-contrast chip-on-card
// pairing, mirroring the live page hero (yellow card + pink chip for Sports).
const HERO_BG_FOR_GROUP: Record<string, string> = {
  tech: CANVAS,
  power: COOL,
  entertainment: CANVAS,
  lifestyle: COOL,
};

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

function pickChipBg(color: CategoryColor, heroBg: string): string {
  const chip = COLOR_HEX[color];
  return chip === heroBg ? INK : chip;
}

function truncate(input: string, max: number): string {
  if (!input) return '';
  if (input.length <= max) return input;
  return input.slice(0, max - 1).trimEnd() + '…';
}

function fmtUsdc(raw: bigint): string {
  return `$${(Number(raw) / 1_000_000).toFixed(2)}`;
}

function shortAddress(addr: string | undefined): string {
  if (!addr) return '—';
  if (addr === '0x0000000000000000000000000000000000000000') return 'vacant';
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * GET /api/og/opinion/[id]
 *
 * Stable URL for the opinion's Open Graph image. Stable across deploys so
 * X/Twitter/Farcaster/etc. can cache it without invalidation when we ship
 * code changes that touch the colocated `opengraph-image.tsx` route — that
 * legacy auto-discovered file regenerates a build-hashed URL on every deploy,
 * which broke X unfurls whenever we iterated the design.
 *
 * Returns a 1200×630 PNG that mirrors the live `/opinions/[id]` page hero:
 * category-driven background, branded chip with emoji, italic question,
 * huge bold answer, and a HELD BY / MINTED BY / FLOOR three-up row.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const opinionId = Number.parseInt(id, 10);
  const opinion = Number.isFinite(opinionId)
    ? await getOpinionForMeta(opinionId)
    : null;

  // Fallback splash for invalid / non-existent ids OR transient RPC failures.
  // Short cache so a single failed render doesn't poison the CDN for a year.
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
        ...SIZE,
        headers: { 'Cache-Control': 'public, max-age=60, must-revalidate' },
      },
    );
  }

  const primaryCat = opinion.categories[0];
  const catMeta = categoryDisplay(primaryCat);
  const group = primaryCat ? GROUP_BY_NAME[primaryCat] : undefined;
  const heroBg = group ? HERO_BG_FOR_GROUP[group] : CANVAS;
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
          border: `6px solid ${INK}`,
          borderRadius: 24,
        }}
      >
        {/* Top row — category chip + #N badge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
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

        {/* Question (italic) */}
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

        {/* Answer — hero element with three-step auto-sizing */}
        <div
          style={{
            fontSize:
              answer.length > 22 ? 84 :
              answer.length > 14 ? 116 :
              156,
            fontWeight: 900,
            letterSpacing: -4,
            marginTop: 10,
            lineHeight: 0.92,
            maxWidth: 1060,
            display: 'flex',
            color: INK,
            wordBreak: 'break-word',
          }}
        >
          {answer}.
        </div>

        <div style={{ flexGrow: 1, display: 'flex' }} />

        {/* HELD BY / MINTED BY / FLOOR */}
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
    {
      ...SIZE,
      // Long-lived cache on success: the URL is stable across deploys, so
      // X / FB / LinkedIn etc. can cache aggressively. revalidate every 5 min
      // via stale-while-revalidate so price changes propagate within minutes
      // for cold scrapers, without ever serving a stale-failure to anyone.
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
      },
    },
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
      <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: 3, opacity: 0.65 }}>
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
