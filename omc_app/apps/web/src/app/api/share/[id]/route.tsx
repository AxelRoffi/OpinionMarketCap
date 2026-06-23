/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getOpinionForMeta } from '@/lib/opinion-server';
import { categoryDisplay, type CategoryColor } from '@/lib/categories';

export const runtime = 'nodejs';

const SIZE = { width: 1200, height: 630 };

// Poster-Arcade palette.
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
 * GET /api/share/[id]
 *
 * Brand-card Open Graph image for `/opinions/[id]`. Pink/pop background,
 * white text, contextual category chip, three-stat row (FLOOR / HELD BY /
 * MINTED BY). Stable URL — never changes across deploys, so X / Farcaster
 * / etc. can cache indefinitely.
 *
 * Returns 1200×630 PNG mirroring the TakeCard visual identity.
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

  if (!opinion) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: POP,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 80,
            color: PAPER,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, opacity: 0.8 }}>
            OPINIONMARKETCAP
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 900,
              letterSpacing: -3,
              marginTop: 24,
              color: PAPER,
            }}
          >
            TRADE THE TAKE.
          </div>
        </div>
      ),
      {
        ...SIZE,
        headers: { 'Cache-Control': 'public, max-age=60, must-revalidate' },
      },
    );
  }

  // Pink card — consistent OMC brand identity across every opinion share.
  // Chip color comes from categories.ts; flip to canvas (yellow) when the
  // category's primary color is itself pop, to keep the chip visible.
  const catMeta = categoryDisplay(opinion.categories[0]);
  const catColor = catMeta?.color ?? 'canvas';
  const chipBg = catColor === 'pop' ? CANVAS : COLOR_HEX[catColor];
  const chipFg = chipBg === PAPER ? INK : INK;

  // Delta = (nextPrice - lastPrice) / lastPrice — the "take premium".
  const nextUsd = Number(opinion.nextPrice) / 1_000_000;
  const lastUsd = Number(opinion.lastPrice) / 1_000_000;
  const delta = lastUsd > 0 ? ((nextUsd - lastUsd) / lastUsd) * 100 : 0;
  const deltaStr = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;

  const question = truncate(opinion.question, 76);
  const rawAnswer = opinion.currentAnswer?.trim();
  const answer = rawAnswer ? truncate(rawAnswer.toUpperCase(), 32) : 'NO KING YET';
  const price = fmtUsdc(opinion.nextPrice);
  const catLabel = catMeta ? catMeta.name.toUpperCase() : 'OPINION';
  const catEmoji = catMeta ? catMeta.emoji : '⭐';
  const heldBy = shortAddress(opinion.currentAnswerOwner);
  const mintedBy = shortAddress(opinion.creator);

  // Three-step font-size ladder for the answer hero.
  const answerFontSize =
    answer.length > 22 ? 88 :
    answer.length > 14 ? 120 :
    160;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: POP,
          display: 'flex',
          flexDirection: 'column',
          padding: '54px 70px',
          color: PAPER,
          fontFamily: 'system-ui, sans-serif',
          boxSizing: 'border-box',
          border: `6px solid ${INK}`,
          borderRadius: 24,
        }}
      >
        {/* TOP ROW — chip left + #N badge right */}
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

        {/* Question — italic, white, slightly translucent */}
        <div
          style={{
            fontSize: 30,
            fontStyle: 'italic',
            fontWeight: 700,
            marginTop: 28,
            opacity: 0.92,
            maxWidth: 1040,
            lineHeight: 1.18,
            display: 'flex',
            color: PAPER,
          }}
        >
          &ldquo;{question}&rdquo;
        </div>

        {/* ANSWER + FLOOR row — answer on the left, floor + delta on the right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginTop: 14,
            gap: 32,
          }}
        >
          <div
            style={{
              fontSize: answerFontSize,
              fontWeight: 900,
              letterSpacing: -4,
              lineHeight: 0.92,
              color: PAPER,
              display: 'flex',
              flex: 1,
              wordBreak: 'break-word',
            }}
          >
            {answer}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              minWidth: 220,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: 3,
                opacity: 0.7,
                color: PAPER,
              }}
            >
              FLOOR
            </span>
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: 64,
                fontWeight: 900,
                marginTop: 4,
                color: PAPER,
                lineHeight: 1,
              }}
            >
              {price}
            </span>
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: 24,
                fontWeight: 800,
                marginTop: 6,
                color: PAPER,
                opacity: 0.92,
              }}
            >
              {deltaStr}
            </span>
          </div>
        </div>

        {/* Spacer pushes the bottom row to the bottom */}
        <div style={{ flexGrow: 1, display: 'flex' }} />

        {/* Dashed separator + bottom HELD BY / MINTED BY row */}
        <div
          style={{
            borderTop: `3px dashed ${PAPER}`,
            opacity: 0.5,
            marginTop: 16,
            display: 'flex',
            width: '100%',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: 20,
            width: '100%',
          }}
        >
          <Stat label="HELD BY" value={`@${heldBy}`} />
          <Stat label="MINTED BY" value={`@${mintedBy}`} alignRight />
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        // Stable URL + long cache. Code changes to the renderer are picked
        // up via stale-while-revalidate without rotating the URL.
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
      },
    },
  );
}

function Stat({
  label,
  value,
  alignRight,
}: {
  label: string;
  value: string;
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
          opacity: 0.7,
          color: PAPER,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          fontSize: 26,
          fontWeight: 800,
          marginTop: 4,
          color: PAPER,
        }}
      >
        {value}
      </span>
    </div>
  );
}
