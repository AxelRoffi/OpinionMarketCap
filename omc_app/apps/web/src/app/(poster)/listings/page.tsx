'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Sticker, Chip, MonoNum, Wobble, Btn } from '@/components/poster-arcade';
import { SectionTitle } from '../_components/SectionTitle';
import { useTakes } from '../_lib/chain-adapters';
import { fmtUSD, CAT_MAP, type DisplayTake } from '../_data/mock-takes';
import { takeHref } from '../_lib/slug';
import { AddressLink } from '../_components/AddressLink';

const BG_CYCLE = ['cool', 'pop', 'canvas', 'paper'] as const;
const TILT_CYCLE = [-2, 1.5, -1, 2] as const;

export default function ListingsPage() {
  const { takes, isLoading } = useTakes();

  // Listings = takes whose owner has set salePriceUSDC > 0. Sort cheapest
  // first so browsers spot affordable buys at the top.
  const listings = useMemo(
    () =>
      takes
        .filter((t) => (t.salePriceUSDC ?? 0) > 0)
        .sort((a, b) => (a.salePriceUSDC ?? 0) - (b.salePriceUSDC ?? 0)),
    [takes],
  );

  const totalListedUSDC = useMemo(
    () => listings.reduce((sum, t) => sum + (t.salePriceUSDC ?? 0), 0),
    [listings],
  );

  return (
    <>
      {/* ────────────────  HEADER  ──────────────── */}
      <section className="px-4 md:px-10 pt-8 md:pt-12 pb-4">
        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/70">
          ★ questions for sale
        </p>
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[44px] md:text-[64px] text-ink mt-1">
          LISTINGS.
        </h1>
        <p className="font-display font-semibold text-[14px] md:text-[16px] text-ink/75 mt-2 max-w-2xl">
          Buy a question outright. You become the new owner and bank the{' '}
          <span className="font-mono font-extrabold">3%</span> royalty on
          every flip — forever, even after the next king takes the answer.
        </p>
      </section>

      {/* ────────────────  SUMMARY  ──────────────── */}
      <section className="px-4 md:px-10 pb-6">
        <div className="font-mono font-extrabold text-[12px] text-ink/70 flex items-center gap-2 flex-wrap">
          <span>
            <MonoNum>{listings.length}</MonoNum> listed ·{' '}
            <MonoNum>{fmtUSD(totalListedUSDC)}</MonoNum> total ask
          </span>
        </div>
      </section>

      {/* ────────────────  GRID  ──────────────── */}
      <section className="px-4 md:px-10 pb-16">
        <SectionTitle meta={<><MonoNum>{listings.length}</MonoNum> for sale</>}>
          🏷️ ON THE BLOCK
        </SectionTitle>

        {isLoading && listings.length === 0 ? (
          <div className="flex justify-center py-12">
            <Wobble>loading listings…</Wobble>
          </div>
        ) : listings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {listings.map((take, i) => (
              <ListingCard key={take.id} take={take} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function ListingCard({ take, index }: { take: DisplayTake; index: number }) {
  const bg = BG_CYCLE[index % BG_CYCLE.length];
  const tilt = TILT_CYCLE[index % TILT_CYCLE.length];
  const chipBg = bg === 'paper' || bg === 'canvas' ? 'ink' : 'paper';
  const cat = CAT_MAP[take.category];
  const chipText = (take.categoryLabel ?? cat.label).toUpperCase();
  const ownerAddr = take.questionOwnerAddress ?? take.creatorAddress;

  return (
    <Sticker bg={bg} tilt={tilt} shadow={5} tappable>
      <Link href={takeHref(take.id, take.question)} className="block">
        <div className="flex items-center justify-between">
          <Chip bg={chipBg} sm>
            {cat.emoji} {chipText}
          </Chip>
          <span className="font-mono text-[10px] font-extrabold opacity-60">#{take.id}</span>
        </div>
        <div className="font-display text-[11px] font-bold mt-2 opacity-85 italic line-clamp-2">
          &ldquo;{take.question}&rdquo;
        </div>
        <div className="font-display font-black text-[24px] leading-none tracking-tighter mt-1 line-clamp-2 break-words">
          {take.answer}.
        </div>
      </Link>

      {/* Sale strip — outside the Link so the address link doesn't nest <a>. */}
      <div className="mt-4 pt-3 border-t-2 border-dashed border-ink/30 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-[9px] font-extrabold uppercase tracking-[0.14em] opacity-60">
            owned by
          </div>
          {ownerAddr ? (
            <AddressLink
              address={ownerAddr}
              className="block truncate font-mono text-[11px] text-ink"
            />
          ) : (
            <span className="block truncate font-mono text-[11px] text-ink/45">—</span>
          )}
        </div>
        <div className="text-right">
          <div className="font-display text-[9px] font-extrabold uppercase tracking-[0.14em] opacity-60">
            listed
          </div>
          <MonoNum className="text-[18px] block">{fmtUSD(take.salePriceUSDC ?? 0)}</MonoNum>
        </div>
      </div>

      <div className="mt-3">
        <Btn href={takeHref(take.id, take.question)} variant="pop" size="sm" star className="w-full">
          VIEW & BUY · {fmtUSD(take.salePriceUSDC ?? 0)}
        </Btn>
      </div>
    </Sticker>
  );
}

function EmptyState() {
  return (
    <div className="bg-paper border-[2.5px] border-ink rounded-sticker shadow-[5px_5px_0_var(--ink)] p-6 text-center">
      <div className="font-display font-black text-[16px] tracking-tight">
        NOTHING ON THE BLOCK.
      </div>
      <p className="font-display text-[12px] font-semibold text-ink/65 mt-1">
        No questions are currently listed for sale. Own a take? List it from
        your opinion detail page to surface it here.
      </p>
    </div>
  );
}
