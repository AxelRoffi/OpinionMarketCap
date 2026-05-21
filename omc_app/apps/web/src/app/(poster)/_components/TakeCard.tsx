'use client';

import Link from 'next/link';
import { Sticker, Chip, MonoNum } from '@/components/poster-arcade';
import { CAT_MAP, fmtUSD, fmtDelta, type MockTake } from '../_data/mock-takes';
import { takeHref } from '../_lib/slug';
import { AddressLink } from './AddressLink';
import { ShareTake } from '../opinions/[id]/_components/ShareTake';

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
  // Prefer the raw on-chain category string when available — falls back to
  // the visual bucket label for mock data (which has no chain string).
  const chipText = (take.categoryLabel ?? cat.label).toUpperCase();
  const detailHref = takeHref(take.id, take.question);

  // The "navigation" area covers chip / question / answer / price+delta.
  // Address strip is a SIBLING inside the same Sticker so address Links
  // can live outside the detail-page Link without nesting <a> tags.
  const navContent = (
    <>
      <div className="flex items-center justify-between gap-2">
        <Chip bg={chipBg} sm>
          {cat.emoji} {chipText}
        </Chip>
        {/* Right corner is occupied by the absolute ShareTake row — leave a
            spacer so the chip text never collides with the share buttons. */}
        <span aria-hidden className="w-[112px] shrink-0" />
      </div>
      <div className="font-display text-[11px] font-bold mt-2 opacity-85 italic">
        &ldquo;{take.question}&rdquo;
      </div>
      <div className="font-display font-black text-[28px] leading-none tracking-tighter mt-1">
        {take.answer}.
      </div>
      <div className="flex justify-between items-end mt-3">
        <span className="font-display text-[9px] font-extrabold uppercase tracking-[0.12em] opacity-60">
          floor
        </span>
        <div className="text-right">
          <MonoNum className="text-[15px] block">{fmtUSD(take.price)}</MonoNum>
          <MonoNum className={isLoss ? 'text-pop text-[11px]' : 'text-[11px]'}>
            {fmtDelta(take.delta)}
          </MonoNum>
        </div>
      </div>
    </>
  );

  const nav = asLink ? (
    <Link href={detailHref} className="block">
      {navContent}
    </Link>
  ) : (
    navContent
  );

  // Address strip — held by + minted by, both clickable to /profile/[address].
  // Falls back to the legacy "@heldBy" string for mock takes that don't carry
  // a full 0x address.
  const addressStrip = (
    <div className="mt-3 pt-2 border-t-2 border-dashed border-ink/20 flex justify-between gap-2 text-[10px] font-display font-extrabold tracking-[0.08em] uppercase">
      <div className="min-w-0">
        <div className="text-ink/55">held by</div>
        {take.ownerAddress ? (
          <AddressLink
            address={take.ownerAddress}
            className="block truncate font-mono normal-case text-[11px] text-ink"
          />
        ) : (
          <span className="block truncate font-mono normal-case text-[11px] text-ink">
            @{take.heldBy}
          </span>
        )}
      </div>
      <div className="min-w-0 text-right">
        <div className="text-ink/55">minted by</div>
        {take.creatorAddress ? (
          <AddressLink
            address={take.creatorAddress}
            className="block truncate font-mono normal-case text-[11px] text-ink"
          />
        ) : (
          <span className="block truncate font-mono normal-case text-[11px] text-ink/40">
            —
          </span>
        )}
      </div>
    </div>
  );

  // Share row floats in the top-right corner. It's a sibling of the Link
  // (not nested inside it), so clicking a share button never triggers
  // navigation. `stopPropagation` is belt-and-braces in case Sticker ever
  // grows a click handler.
  const shareRow = (
    <div className="absolute top-2 right-2 z-10">
      <ShareTake take={take} size="sm" stopPropagation />
    </div>
  );

  return (
    <Sticker bg={cardBg} tilt={cardTilt} tappable={asLink} className="relative">
      {shareRow}
      {nav}
      {addressStrip}
    </Sticker>
  );
}
