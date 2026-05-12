'use client';

import Link from 'next/link';
import { Sticker, Chip, MonoNum } from '@/components/poster-arcade';
import { CAT_MAP, fmtUSD, fmtDelta, type MockTake } from '../_data/mock-takes';

const BG_CYCLE = ['pop', 'canvas', 'cool', 'paper'] as const;
const TILT_CYCLE = [-2, 1.5, -1.5, 2] as const;

type TakeCardProps = {
  take: MockTake;
  /** Position index in a list — used to pick background + tilt deterministically. */
  index: number;
  /** Override the auto-picked background. */
  bg?: typeof BG_CYCLE[number];
  /** Override the auto-picked tilt. */
  tilt?: number;
  /** Wrap in a link to the detail page. Default true. */
  asLink?: boolean;
};

export function TakeCard({ take, index, bg, tilt, asLink = true }: TakeCardProps) {
  const cardBg = bg ?? BG_CYCLE[index % BG_CYCLE.length];
  const cardTilt = tilt ?? TILT_CYCLE[index % TILT_CYCLE.length];
  const chipBg = cardBg === 'paper' || cardBg === 'canvas' ? 'ink' : 'paper';
  const cat = CAT_MAP[take.category];
  const isLoss = take.delta < 0;

  const inner = (
    <Sticker bg={cardBg} tilt={cardTilt} tappable>
      <div className="flex items-center justify-between">
        <Chip bg={chipBg} sm>
          {cat.emoji} {cat.label}
        </Chip>
        <span className="font-mono text-[10px] font-extrabold opacity-60">#{take.id}</span>
      </div>
      <div className="font-display text-[11px] font-bold mt-2 opacity-85 italic">
        &ldquo;{take.question}&rdquo;
      </div>
      <div className="font-display font-black text-[28px] leading-none tracking-tighter mt-1">
        {take.answer}.
      </div>
      <div className="flex justify-between items-end mt-3">
        <div>
          <div className="font-display text-[9px] font-extrabold uppercase tracking-[0.12em] opacity-60">
            held
          </div>
          <div className="font-display text-[11px] font-bold truncate max-w-[110px]">
            @{take.heldBy}
          </div>
        </div>
        <div className="text-right">
          <MonoNum className="text-[15px] block">{fmtUSD(take.price)}</MonoNum>
          <MonoNum className={isLoss ? 'text-pop text-[11px]' : 'text-[11px]'}>
            {fmtDelta(take.delta)}
          </MonoNum>
        </div>
      </div>
    </Sticker>
  );

  if (!asLink) return inner;

  return (
    <Link href={`/v2/opinions/${take.id}`} className="block">
      {inner}
    </Link>
  );
}
