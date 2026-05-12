'use client';

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Sticker,
  Chip,
  MonoNum,
  Sparkline,
  RangeToggle,
  type RangeKey,
} from '@/components/poster-arcade';
import { fmtUSD, fmtDelta, CAT_MAP, type CatKey } from '../../_data/mock-takes';
import { getTakeDetail, getPriceHistory } from '../../_data/take-detail';
import { TradeSlip } from './_components/TradeSlip';
import { HolderTimeline } from './_components/HolderTimeline';
import { RelatedTakesRow } from './_components/RelatedTakesRow';

/** Category → hero sticker background. Picked once per category for memorability. */
const CAT_BG: Record<CatKey, 'pop' | 'cool' | 'canvas' | 'paper'> = {
  sport:   'canvas',
  crypto:  'cool',
  cinema:  'paper',
  ai:      'pop',
  food:    'paper',
  life:    'canvas',
  music:   'pop',
  founder: 'cool',
};

export default function OpinionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const detail = getTakeDetail(Number(id));
  if (!detail) notFound();

  const { take, holders, related } = detail;
  const cat = CAT_MAP[take.category];
  const heroBg = CAT_BG[take.category];
  const chipBg = heroBg === 'paper' || heroBg === 'canvas' ? 'ink' : 'paper';
  const isLoss = take.delta < 0;

  const [range, setRange] = useState<RangeKey>('7d');
  const series = getPriceHistory(take, range as '24h' | '7d' | '30d');

  const minPrice = Math.min(...series);
  const maxPrice = Math.max(...series);

  // Synthesised stats — replaced by chain data later.
  const totalTrades = 18 + take.id * 3;
  const royaltiesPaid = Math.round(take.price * 0.07 * 100) / 100;

  return (
    <>
      {/* ────────────────  BREADCRUMB  ──────────────── */}
      <div className="px-4 md:px-10 pt-4 pb-1">
        <Link
          href="/v2/marketplace"
          className="font-display text-[11px] font-extrabold tracking-[0.12em] uppercase text-ink/60 hover:text-ink"
        >
          ← back to the floor
        </Link>
      </div>

      {/* ────────────────  TWO-COL LAYOUT  ──────────────── */}
      <section className="px-4 md:px-10 py-4 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-start">
        {/* LEFT — the take */}
        <div className="lg:col-span-3 space-y-5">
          {/* Hero sticker */}
          <Sticker bg={heroBg} tilt={-2} shadow={6} className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <Chip bg={chipBg}>{cat.emoji} {cat.label}</Chip>
              <Chip bg="ink" sm>#{take.id}</Chip>
            </div>
            <div className="font-display text-[13px] md:text-[14px] font-bold italic opacity-85 mt-3">
              &ldquo;{take.question}&rdquo;
            </div>
            <div className="font-display font-black text-[64px] md:text-[88px] lg:text-[96px] leading-[0.88] tracking-[-0.04em] mt-2">
              {take.answer}.
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <div className="font-display text-[10px] font-extrabold tracking-[0.12em] uppercase opacity-70">
                  held by
                </div>
                <div className="font-display font-extrabold text-[16px] md:text-[18px] truncate">
                  @{take.heldBy}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-[10px] font-extrabold tracking-[0.12em] uppercase opacity-70">
                  floor
                </div>
                <MonoNum className="text-[22px] md:text-[28px] block">{fmtUSD(take.price)}</MonoNum>
              </div>
            </div>
          </Sticker>

          {/* Sparkline panel */}
          <div className="bg-paper border-[2.5px] border-ink rounded-sticker shadow-[4px_4px_0_var(--ink)] p-4 md:p-5">
            <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
              <div>
                <div className="font-display font-black text-[14px] tracking-tight">
                  📈 PRICE HISTORY
                </div>
                <div className="font-mono text-[10px] font-extrabold text-ink/60 mt-1">
                  {fmtUSD(minPrice)} → {fmtUSD(maxPrice)} · {fmtDelta(take.delta)} {range}
                </div>
              </div>
              <RangeToggle value={range} onChange={setRange} />
            </div>
            <Sparkline
              data={series}
              height={170}
              fill={isLoss ? 'var(--pop)' : 'var(--cool)'}
              endDotColor={isLoss ? 'var(--pop)' : 'var(--cool)'}
              className="mt-2"
            />
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile label="floor"        value={fmtUSD(take.price)} />
            <StatTile label="24h trades"   value={String(take.trades)} />
            <StatTile label="total trades" value={String(totalTrades)} />
            <StatTile label="royalties paid" value={fmtUSD(royaltiesPaid)} />
          </div>
        </div>

        {/* RIGHT — trade slip */}
        <div className="lg:col-span-2 lg:sticky lg:top-[80px]">
          <TradeSlip take={take} />
        </div>
      </section>

      {/* ────────────────  HOLDER TIMELINE  ──────────────── */}
      <section className="px-4 md:px-10 mt-6">
        <HolderTimeline holders={holders} />
      </section>

      {/* ────────────────  RELATED  ──────────────── */}
      <section className="px-4 md:px-10 pb-16">
        <RelatedTakesRow
          title={`OTHER TAKES IN ${cat.emoji} ${cat.label}`}
          takes={related}
        />
      </section>
    </>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper border-2 border-ink rounded-lg p-3 shadow-[3px_3px_0_var(--ink)]">
      <div className="font-display text-[9px] font-extrabold tracking-[0.14em] uppercase text-ink/60">
        {label}
      </div>
      <MonoNum className="text-[18px] block mt-1">{value}</MonoNum>
    </div>
  );
}
