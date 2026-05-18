'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Sticker,
  Chip,
  MonoNum,
  Sparkline,
  RangeToggle,
  Wobble,
  Btn,
  type RangeKey,
} from '@/components/poster-arcade';
import { useAnswerHistory } from '@/hooks/useAnswerHistory';
import { fmtUSD, fmtDelta, CAT_MAP, type CatKey, type DisplayTake } from '../../../_data/mock-takes';
import type { HolderRecord } from '../../../_data/take-detail';
import { useTake, useTakes, usdcToNumber, shortAddress } from '../../../_lib/chain-adapters';
import { TradeSlip } from '../_components/TradeSlip';
import { HolderTimeline } from '../_components/HolderTimeline';
import { RelatedTakesRow } from '../_components/RelatedTakesRow';
import { KingPanel } from '../_components/KingPanel';
import { AddressLink } from '../../../_components/AddressLink';
import { useQuestionListing } from '@/hooks/useQuestionListing';

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
  // Optional catch-all route /opinions/[id]/[[...slug]] — slug is decorative
  // (helps shares + SEO), so we ignore it and only resolve by id.
  params: Promise<{ id: string; slug?: string[] }>;
}) {
  const { id: idStr } = use(params);
  const id = Number(idStr);

  // Chain-only — no mock fallback.
  const { take: chainTake, isLoading: chainLoading } = useTake(id);

  if (chainLoading && !chainTake) {
    return (
      <div className="flex justify-center py-24">
        <Wobble>loading take #{id}…</Wobble>
      </div>
    );
  }
  if (!chainTake) notFound();

  return <DetailBody id={id} take={chainTake} />;
}

function DetailBody({
  id,
  take,
}: {
  id: number;
  take: DisplayTake;
}) {
  const cat = CAT_MAP[take.category];
  const heroBg = CAT_BG[take.category];
  const chipBg = heroBg === 'paper' || heroBg === 'canvas' ? 'ink' : 'paper';
  const isLoss = take.delta < 0;

  const [range, setRange] = useState<RangeKey>('7d');

  // Live answer history → series of prices + holder timeline.
  const { history } = useAnswerHistory(id);

  // Live chain takes — used to find related takes in the same category.
  // wagmi's per-key cache means this re-uses the same fetch as useTake() above.
  const { takes: chainTakes } = useTakes();

  // Build series + holders from chain answer-history events.
  const { series, holders, totalTrades } = useMemo(() => {
    if (history.length === 0) {
      // No trade history yet — fall back to a flat sparkline so the chart
      // panel doesn't collapse.
      return {
        series: [take.price * 0.95, take.price],
        holders: [] as HolderRecord[],
        totalTrades: 0,
      };
    }
    const cutoff = Math.floor(Date.now() / 1000) - RANGE_WINDOW[range];
    const inRange = history.filter((h) => Number(h.timestamp) >= cutoff);
    const points = (inRange.length >= 2 ? inRange : history).map((h) => usdcToNumber(h.price));
    const seriesData = points.length ? [...points, take.price] : [take.price * 0.95, take.price];
    const holdersData: HolderRecord[] = history.map((h) => ({
      addr: h.owner === '0x0000000000000000000000000000000000000000'
        ? 'vacant'
        : shortAddress(h.owner),
      ownerAddress: h.owner === '0x0000000000000000000000000000000000000000'
        ? undefined
        : h.owner,
      price: usdcToNumber(h.price),
      date: new Date(Number(h.timestamp) * 1000).toISOString(),
    }));
    return { series: seriesData, holders: holdersData, totalTrades: history.length };
  }, [history, range, take]);

  const minPrice = Math.min(...series);
  const maxPrice = Math.max(...series);
  const royaltiesPaid = Math.round(take.price * 0.07 * 100) / 100;

  // Related: pick others by mapped category from the live grid.
  const related = useMemo(() => {
    const same = chainTakes.filter((t) => t.category === take.category && t.id !== take.id);
    if (same.length >= 6) return same.slice(0, 6);
    const others = chainTakes.filter((t) => t.category !== take.category && t.id !== take.id);
    return [...same, ...others].slice(0, 6);
  }, [chainTakes, take]);

  const ownerDisplay = take.ownerAddress
    ? `@${shortAddress(take.ownerAddress)}`
    : `@${take.heldBy}`;
  const profileHref = take.ownerAddress
    ? `/profile/${take.ownerAddress}`
    : `/profile/${take.heldBy}`;

  return (
    <>
      {/* ────────────────  BREADCRUMB  ──────────────── */}
      <div className="px-4 md:px-10 pt-4 pb-1 flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/marketplace"
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
              <Chip bg={chipBg}>{cat.emoji} {(take.categoryLabel ?? cat.label).toUpperCase()}</Chip>
              <Chip bg="ink" sm>#{take.id}</Chip>
            </div>
            <div className="font-display text-[13px] md:text-[14px] font-bold italic opacity-85 mt-3">
              &ldquo;{take.question}&rdquo;
            </div>
            <div className="font-display font-black text-[64px] md:text-[88px] lg:text-[96px] leading-[0.88] tracking-[-0.04em] mt-2 break-words">
              {take.answer}.
            </div>
            <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="min-w-0">
                <div className="font-display text-[10px] font-extrabold tracking-[0.12em] uppercase opacity-70">
                  held by
                </div>
                <Link
                  href={profileHref}
                  className="font-mono font-extrabold text-[14px] md:text-[15px] truncate block hover:underline"
                  title={take.ownerAddress ?? take.heldBy}
                >
                  {ownerDisplay}
                </Link>
              </div>
              <div className="min-w-0">
                <div className="font-display text-[10px] font-extrabold tracking-[0.12em] uppercase opacity-70">
                  minted by
                </div>
                {take.creatorAddress ? (
                  <AddressLink
                    address={take.creatorAddress}
                    className="font-mono font-extrabold text-[14px] md:text-[15px] truncate block"
                  />
                ) : (
                  <span className="font-mono font-extrabold text-[14px] md:text-[15px] truncate block opacity-50">
                    —
                  </span>
                )}
              </div>
              <div className="text-right col-span-2 md:col-span-1">
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

          {/* Question Ownership */}
          <QuestionOwnership take={take} />
        </div>

        {/* RIGHT — king panel (only shown to current owner) + trade slip */}
        <div className="lg:col-span-2 lg:sticky lg:top-[80px]">
          <KingPanel take={take} />
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
          title={`OTHER TAKES IN ${cat.emoji} ${(take.categoryLabel ?? cat.label).toUpperCase()}`}
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

/**
 * Question Ownership card — surfaces V4's question-marketplace concept.
 *
 *   Owners earn 3% of every flip — forever. They can list the question for
 *   sale at a fixed price (V4 buyQuestion); anyone can buy at that price.
 *   Buyer offers (i.e. "I'll buy this question for $X if you'll accept")
 *   are NOT yet on chain — V4 has no offer-matching engine.
 */
function QuestionOwnership({ take }: { take: DisplayTake }) {
  const ownerAddr = take.questionOwnerAddress ?? take.creatorAddress;
  const listedPrice = take.salePriceUSDC ?? 0;

  const listing = useQuestionListing(take.id, ownerAddr, listedPrice);

  const [listInput, setListInput] = useState<number>(listedPrice > 0 ? listedPrice : 25);

  // Toast success / error.
  useEffect(() => {
    if (listing.step === 'success') {
      toast.success('done · refresh to see chain state', {
        description: listing.isOwner
          ? 'your question marketplace state updated'
          : 'you own this question now — royalties accrue to you',
      });
      // Auto-reset so the card can take a new action without a refresh.
      const t = setTimeout(() => listing.reset(), 2_000);
      return () => clearTimeout(t);
    }
  }, [listing.step, listing.isOwner, listing]);
  useEffect(() => {
    if (listing.error) {
      const msg = (listing.error.message || 'transaction failed').split('\n')[0];
      toast.error('tx failed', { description: msg.slice(0, 180) });
    }
  }, [listing.error]);

  const busy =
    listing.step === 'listing' ||
    listing.step === 'cancelling' ||
    listing.step === 'approving' ||
    listing.step === 'buying';

  return (
    <div className="bg-paper border-[2.5px] border-ink rounded-sticker shadow-[4px_4px_0_var(--ink)] p-4 md:p-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="font-display font-black text-[15px] tracking-tight">
          👑 QUESTION OWNERSHIP
        </div>
        <span className="font-display text-[10px] font-extrabold tracking-[0.1em] uppercase text-ink/55">
          royalty cut · 3% forever
        </span>
      </div>

      <p className="font-display text-[12px] font-semibold text-ink/75 mt-2 leading-snug">
        The <span className="font-extrabold text-ink">question owner</span> banks{' '}
        <span className="font-mono font-extrabold">3%</span> of every flip,
        forever — even if they sell the question itself.
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap text-[12px] font-display">
        <span className="font-semibold text-ink/60">held by</span>
        {ownerAddr ? (
          <AddressLink
            address={ownerAddr}
            className="font-mono font-extrabold text-ink"
          />
        ) : (
          <span className="font-mono font-extrabold text-ink/45">—</span>
        )}
      </div>

      {/* Listed / not-listed state */}
      <div className="mt-3 bg-canvas border-2 border-ink rounded-lg p-3">
        {listing.isListed ? (
          <>
            <div className="font-display text-[10px] font-extrabold tracking-[0.14em] uppercase text-ink/60">
              🏷️ listed for sale
            </div>
            <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
              <MonoNum className="text-[20px]">{fmtUSD(listedPrice)}</MonoNum>
              {listing.isOwner ? (
                <Btn
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => listing.cancel()}
                >
                  {listing.step === 'cancelling' ? 'CANCELLING…' : 'CANCEL LISTING'}
                </Btn>
              ) : !listing.buyerHasBalance ? (
                <Btn variant="cool" size="sm" disabled>
                  NEED {fmtUSD(listedPrice)} USDC
                </Btn>
              ) : (
                <Btn
                  variant="cool"
                  size="sm"
                  disabled={busy}
                  onClick={() => listing.buy()}
                >
                  {listing.step === 'approving'
                    ? 'APPROVING…'
                    : listing.step === 'buying'
                      ? 'BUYING…'
                      : listing.buyerNeedsApproval
                        ? `APPROVE + BUY · ${fmtUSD(listedPrice)}`
                        : `BUY QUESTION · ${fmtUSD(listedPrice)}`}
                </Btn>
              )}
            </div>
            <div className="font-display text-[10px] font-bold text-ink/60 mt-2">
              {listing.isOwner
                ? 'you can cancel anytime to take it off the market'
                : 'seller receives 90% (10% platform fee). royalty stream transfers to buyer.'}
            </div>
          </>
        ) : listing.isOwner ? (
          <>
            <div className="font-display text-[10px] font-extrabold tracking-[0.14em] uppercase text-ink/60">
              🏷️ list your question for sale
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3 inline-flex items-center font-mono font-extrabold text-ink/70 text-[16px]">
                  $
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0.01}
                  step="0.01"
                  value={listInput}
                  onChange={(e) => setListInput(Number(e.target.value) || 0)}
                  aria-label="Sale price in USDC"
                  className="w-full bg-paper border-2 border-ink rounded-lg pl-7 pr-3 py-2 font-mono font-extrabold text-[18px] text-ink focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all"
                />
              </div>
              <Btn
                variant="pop"
                size="sm"
                disabled={busy || listInput <= 0}
                onClick={() => listing.list(listInput)}
              >
                {listing.step === 'listing' ? 'LISTING…' : 'LIST FOR SALE'}
              </Btn>
            </div>
            <div className="font-display text-[10px] font-bold text-ink/60 mt-2">
              Buyers pay this price in USDC; you keep 90% (10% platform fee).
              Your royalty stream transfers with the question.
            </div>
          </>
        ) : (
          <div className="font-display text-[12px] font-semibold text-ink/65">
            Not listed for sale.
            <span className="block text-[10px] font-extrabold tracking-[0.1em] uppercase text-ink/45 mt-1">
              the owner hasn&apos;t set a price · only they can list it
            </span>
          </div>
        )}
      </div>

      {/* Make-an-offer (roadmap) */}
      <div className="mt-3 border-t-2 border-dashed border-ink/30 pt-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-display text-[11px] font-extrabold tracking-[0.1em] uppercase text-ink/70">
              want it but it&apos;s not listed?
            </div>
            <div className="font-display text-[10px] font-extrabold tracking-[0.1em] uppercase text-ink/45 mt-0.5">
              🚧 offers on questions ship in a future contract upgrade
            </div>
          </div>
          <Btn variant="ghost" size="sm" disabled>
            MAKE OFFER
          </Btn>
        </div>
      </div>
    </div>
  );
}
