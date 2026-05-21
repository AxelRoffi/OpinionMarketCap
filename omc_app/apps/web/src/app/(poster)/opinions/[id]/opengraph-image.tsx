/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { getOpinionForMeta } from '@/lib/opinion-server';

export const runtime = 'nodejs';
// Revalidate every 5 minutes — opinions move fast, but rendering on every
// share unfurl would hammer the RPC.
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

// Cycle through accent backgrounds based on opinion id so adjacent opinions
// don't all look identical when shared in a row.
const BG_CYCLE = [CANVAS, COOL, POP, PAPER];

function pickBg(id: number): string {
  return BG_CYCLE[id % BG_CYCLE.length] ?? CANVAS;
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

type ImageProps = { params: Promise<{ id: string }> };

export default async function OpenGraphImage({ params }: ImageProps) {
  const { id } = await params;
  const opinionId = Number.parseInt(id, 10);
  const opinion = Number.isFinite(opinionId)
    ? await getOpinionForMeta(opinionId)
    : null;

  // Fallback card — brand splash with the OMC framing line.
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
      size,
    );
  }

  const question = truncate(opinion.question, 90);
  const rawAnswer = opinion.currentAnswer?.trim();
  const answer = rawAnswer ? truncate(rawAnswer.toUpperCase(), 40) : 'NO KING YET';
  const price = fmtUsdc(opinion.nextPrice);
  const category = (opinion.categories[0] || 'OPINION').toUpperCase();
  const bg = pickBg(opinionId);
  // On the yellow canvas + white paper backgrounds, the chip is dark; on the
  // pop/cool accents we flip to a light chip for legibility.
  const chipBg = bg === CANVAS || bg === PAPER ? INK : PAPER;
  const chipFg = chipBg === INK ? PAPER : INK;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: bg,
          display: 'flex',
          flexDirection: 'column',
          padding: 70,
          color: INK,
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Brand strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 4,
            opacity: 0.75,
          }}
        >
          <span>OPINIONMARKETCAP</span>
          <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
            #{opinionId}
          </span>
        </div>

        {/* Category chip */}
        <div style={{ display: 'flex', marginTop: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: chipBg,
              color: chipFg,
              padding: '10px 22px',
              borderRadius: 999,
              border: `3px solid ${INK}`,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            {category}
          </div>
        </div>

        {/* Question */}
        <div
          style={{
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 700,
            marginTop: 30,
            opacity: 0.85,
            maxWidth: 1060,
            lineHeight: 1.18,
            display: 'flex',
          }}
        >
          &ldquo;{question}&rdquo;
        </div>

        {/* Answer — the hero element */}
        <div
          style={{
            fontSize: answer.length > 22 ? 110 : 150,
            fontWeight: 900,
            letterSpacing: -4,
            marginTop: 18,
            lineHeight: 0.95,
            maxWidth: 1060,
            display: 'flex',
            color: INK,
          }}
        >
          {answer}.
        </div>

        {/* Spacer pushes the floor row to the bottom */}
        <div style={{ flexGrow: 1, display: 'flex' }} />

        {/* Floor row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: `4px solid ${INK}`,
            paddingTop: 22,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: 3, opacity: 0.65 }}>
              FLOOR
            </span>
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: 72,
                fontWeight: 900,
                marginTop: 4,
              }}
            >
              {price}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              textAlign: 'right',
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2 }}>
              TRADE THE TAKE →
            </span>
            <span style={{ fontSize: 18, fontWeight: 600, marginTop: 4, opacity: 0.7 }}>
              app.opinionmarketcap.xyz
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
