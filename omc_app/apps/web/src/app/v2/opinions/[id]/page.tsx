'use client';

import { use, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Sticker,
  Chip,
  MonoNum,
  Sparkline,
  RangeToggle,
  Wobble,
  type RangeKey,
} from '@/components/poster-arcade';
import { useAnswerHistory } from '@/hooks/useAnswerHistory';
import { fmtUSD, fmtDelta, CAT_MAP, type CatKey, type DisplayTake } from '../../_data/mock-takes';
import { getTakeDetail, getPriceHistory, type HolderRecord } from '../../_data/take-detail';
import { useTake, useTakes, usdcToNumber, shortAddress } from '../../_lib/chain-adapters';
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

const RANGE_WINDOW: Record<RangeKey, number> = {
  '24h':  24 * 60 * 60,
  '7d':    7 * 24 * 60 * 60,
  '30d':  30 * 24 * 60 * 60,
  all:     Number.MAX_SAFE_INTEGER,
};

export default function OpinionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = use(params);
  const id = Number(idStr);

  // 1) Try chain first.
  const { take: chainTake, isLoading: chainLoading } = useTake(id);

  // 2) When chain hasn't returned a matching take and it's no longer loading,
  //    fall back to mock — covers dev (no wagmi) + unknown-id 404 routing.
  const mockDetail = useMemo(() => getTakeDetail(id), [id]);
  const isMockFallback = !chainLoading && !chainTake;

  // 3) If neither source yields a take, hand off to Next's notFound boundary.
  if (isMockFallback && !mockDetail) notFound();
  if (chainLoading && !chainTake) {
    return (
      <div className="flex justify-center py-24">
        <Wobble>loading take #{id}…</Wobble>
      </div>
    );
  }

  const take: DisplayTake = chainTake ?? mockDetail!.take;

  // Chain-derived price history (V4 stores answer history) — only when on chain.
  // Mock fallback uses the deterministic synthesizer.
  return (
    <DetailBody
      id={id}
      take={take}
      isMockFallback={isMockFallback}
      mockHolders={mockDetail?.holders ?? []}
      mockRelated={mockDetail?.related ?? []}
    />
  );
}

function DetailBody({
  id,
  take,
  isMockFallback,
  mockHolders,
  mockRelated,
}: {
  id: number;
  take: DisplayTake;
  isMockFallback: boolean;
  mockHolders: HolderRecord[];
  mockRelated: DisplayTake[];
}) {
  const cat = CAT_MAP[take.category];
  const heroBg = CAT_BG[take.category];
  const chipBg = heroBg === 'paper' || heroBg === 'canvas' ? 'ink' : 'paper';
  const isLoss = take.delta < 0;

  const [range, setRange] = useState<RangeKey>('7d');

  // Live answer history → series of prices + holder timeline (only when chain take).
  const { history } = useAnswerHistory(isMockFallback ? 0 : id);

  // Live chain takes — used to find related takes in the same category when on chain.
  // wagmi's per-key cache means this re-uses the same fetch as useTake() above.
  const { takes: chainTakes } = useTakes();

  // Build series + holders (chain or mock).
  const { series, holders, totalTrades } = useMemo(() => {
    if (!isMockFallback && history.length > 0) {
      const cutoff = Math.floor(Date.now() / 1000) - RANGE_WINDOW[range];
      // Filter by selected range, then map to display values.
      const inRange = history.filter((h) => Number(h.timestamp) >= cutoff);
      const points = (inRange.length >= 2 ? inRange : history).map((h) => usdcToNumber(h.price));
      // Append current floor so the latest tick matches the displayed price.
      const seriesData = points.length ? [...points, take.price] : [take.price * 0.95, take.price];

      const holdersData: HolderRecord[] = history.map((h) => ({
        addr: h.owner === '0x0000000000000000000000000000000000000000'
          ? 'vacant'
          : shortAddress(h.owner),
        price: usdcToNumber(h.price),
        date: new Date(Number(h.timestamp) * 1000).toISOString(),
      }));
      return { series: seriesData, holders: holdersData, totalTrades: history.length };
    }
    // Mock fallback
    return {
      series: getPriceHistory(take, range as '24h' | '7d' | '30d'),
      holders: mockHolders,
      totalTrades: 18 + id * 3,
    };
  }, [isMockFallback, history, range, take, mockHolders, id]);

  const minPrice = Math.min(...series);
  const maxPrice = Math.max(...series);
  const royaltiesPaid = Math.round(take.price * 0.07 * 100) / 100;

  // Related: when on chain, pick others by mapped category from the live grid.
  // Mock fallback uses the existing helper.
  const related = useMemo(() => {
    if (isMockFallback) return mockRelated;
    const same = chainTakes.filter((t) => t.category === take.category && t.id !== take.id);
    // Pad with other categories if not enough same-category takes.
    if (same.length >= 6) return same.slice(0, 6);
    const others = chainTakes.filter((t) => t.category !== take.category && t.id !== take.id);
    return [...same, ...others].slice(0, 6);
  }, [isMockFallback, mockRelated, chainTakes, take]);

  const ownerDisplay = take.ownerAddress
    ? `@${shortAddress(take.ownerAddress)}`
    : `@${take.heldBy}`;
  const profileHref = take.ownerAddress
    ? `/v2/profile/${encodeURIComponent(take.ownerAddress)}`
    : `/v2/profile/${encodeURIComponent(take.heldBy)}`;

  return (
    <>
      {/* ────────────────  BREADCRUMB  ──────────────── */}
      <div className="px-4 md:px-10 pt-4 pb-1 flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/v2/marketplace"
          className="font-display text-[11px] font-extrabold tracking-[0.12em] uppercase text-ink/60 hover:text-ink"
        >
          ← back to the floor
        </Link>
        {isMockFallback && (
          <span className="font-display text-[10px] font-extrabold tracking-[0.14em] uppercase text-ink/40">
            · sample take (no on-chain match)
          </span>
        )}
      </div>

      {/* ────────────────  TWO-COL LAYOUT  ──────────────── */}
      <section className="px-4 md:px-10 py-4 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-start">
        {/* LEFT — the take */}
        <div className="lg:col-span-3 space-y-5">
          {/* Hero sticker */}
          <Sticker bg={heroBg} tilt={-2} shadow={6} className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <Chip bg={chipBg}>{cat.emoji} {(take.categoryLabel ?? cat.label).toUpperCase()}</Chip>
              <Chip bg="ink" sm>#{take.id}</Chip>
            </div>
            <div className="font-display text-[13px] md:text-[14px] font-bold italic opacity-85 mt-3">
              &ldquo;{take.question}&rdquo;
            </div>
            <div className="font-display font-black text-[64px] md:text-[88px] lg:text-[96px] leading-[0.88] tracking-[-0.04em] mt-2 break-words">
              {take.answer}.
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <div className="font-display text-[10px] font-extrabold tracking-[0.12em] uppercase opacity-70">
                  held by
                </div>
                <Link
                  href={profileHref}
                  className="font-display font-extrabold text-[16px] md:text-[18px] truncate block hover:underline"
                >
                  {ownerDisplay}
                </Link>
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
            <StatTile label="floor"          value={fmtUSD(take.price)} />
            <StatTile label="next premium"   value={fmtDelta(take.delta)} />
            <StatTile label="total trades"   value={String(totalTrades)} />
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
