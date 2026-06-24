'use client';

import { useMemo, useState } from 'react';
import { Sticker, Btn, MonoNum, Wobble } from '@/components/poster-arcade';
import { TakeCard } from './_components/TakeCard';
import { MarketToolbar, type SortMode, type CategoryOption } from './_components/MarketToolbar';
import { CAT_MAP, fmtUSD } from './_data/mock-takes';
import { useTakes } from './_lib/chain-adapters';
import { useInfiniteRender } from './_lib/use-infinite-render';
import { useMarketStats } from '@/hooks/useMarketStats';

export default function V2HotWallPage() {
  const { takes, isLoading, isEmpty, totalOnChain } = useTakes();

  const [sort, setSort] = useState<SortMode>('hot');
  const [activeCat, setActiveCat] = useState<string>('all');

  // Category chips — only categories actually present in the data.
  const categories = useMemo<CategoryOption[]>(() => {
    const seen = new Map<string, CategoryOption>();
    for (const t of takes) {
      if (!seen.has(t.category)) {
        const meta = CAT_MAP[t.category];
        seen.set(t.category, {
          key: t.category,
          label: meta?.label ?? t.category,
          emoji: meta?.emoji ?? '•',
        });
      }
    }
    return [...seen.values()];
  }, [takes]);

  // filter → sort pipeline.
  const sortedTakes = useMemo(() => {
    const filtered = activeCat === 'all' ? takes : takes.filter((t) => t.category === activeCat);
    const out = [...filtered];
    switch (sort) {
      case 'hot':        out.sort((a, b) => b.trades - a.trades); break;
      case 'new':        out.sort((a, b) => b.createdAt - a.createdAt); break;
      case 'price-desc': out.sort((a, b) => b.price - a.price); break;
      case 'price-asc':  out.sort((a, b) => a.price - b.price); break;
    }
    return out;
  }, [takes, activeCat, sort]);

  const { visibleItems, total, sentinelRef, hasMore } = useInfiniteRender(
    sortedTakes,
    12,
    `${sort}|${activeCat}`,
  );

  const stats = useMarketStats();
  const freshCount = takes.filter((t) => Date.now() - t.createdAt < 7 * 24 * 60 * 60 * 1000).length;

  return (
    <>
      {/* ──────────  COMPACT HERO  ────────── */}
      <section className="px-4 md:px-10 pt-6 pb-4 md:pt-8 md:pb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-[10px] font-extrabold tracking-[0.18em] uppercase text-ink/70">
              ★ Take a stand
            </p>
            <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[30px] md:text-[42px] mt-1 text-ink">
              Take a stand. <span className="text-pop">Get paid</span> for it.
            </h1>
            <p className="font-display font-semibold text-[12px] md:text-[13px] text-ink/70 mt-1 max-w-xl">
              Pick the answer. Pay the price. Keep <span className="font-mono font-extrabold">3%</span> of every flip — forever.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Btn href="/create" variant="pop" size="md" star>
              Mint a take
            </Btn>
            <Btn href="/marketplace" variant="ghost" size="md">
              Browse →
            </Btn>
          </div>
        </div>
      </section>

      {/* ──────────  MARKET  ────────── */}
      <section className="px-4 md:px-10 pb-16">
        {!isEmpty && !isLoading && (
          <MarketToolbar
            sort={sort}
            onSort={setSort}
            categories={categories}
            activeCategory={activeCat}
            onCategory={setActiveCat}
          />
        )}

        <header className="flex items-end justify-between flex-wrap gap-2 mb-5">
          <h2 className="font-display font-black text-[22px] md:text-[28px] tracking-[-0.03em] text-ink">
            🔥 THE FLOOR
          </h2>
          <div className="font-mono font-extrabold text-[12px] md:text-[13px] text-ink/70">
            <MonoNum>{totalOnChain}</MonoNum> takes · <MonoNum>{fmtUSD(stats.totalVolume)}</MonoNum> vol · <MonoNum>{stats.uniqueUsers}</MonoNum> traders · <MonoNum>{freshCount}</MonoNum> fresh
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Wobble>loading the wall…</Wobble>
          </div>
        ) : isEmpty ? (
          <div className="flex justify-center py-16">
            <Sticker bg="paper" tilt={-1.5} className="max-w-md text-center">
              <div className="font-display font-black text-[22px] tracking-tight">
                NOTHING ON THE WALL YET.
              </div>
              <div className="font-display text-[12px] font-semibold text-ink/70 mt-1">
                Be the first to mint a take.
              </div>
              <div className="mt-4 flex justify-center">
                <Btn href="/create" variant="pop" size="sm" star>
                  MINT THE FIRST
                </Btn>
              </div>
            </Sticker>
          </div>
        ) : sortedTakes.length === 0 ? (
          <div className="flex justify-center py-12">
            <Sticker bg="paper" tilt={-1} className="max-w-sm text-center">
              <div className="font-display font-black text-[16px] tracking-tight">
                NO TAKES IN THIS CATEGORY.
              </div>
            </Sticker>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleItems.map((take, i) => (
                <TakeCard key={take.id} take={take} index={i} />
              ))}
            </div>

            {/* Infinite-scroll sentinel + end marker */}
            {hasMore ? (
              <div ref={sentinelRef} className="flex justify-center py-8">
                <Wobble>loading more…</Wobble>
              </div>
            ) : (
              total > 12 && (
                <div className="text-center py-8 font-display text-[11px] font-extrabold tracking-[0.12em] uppercase text-ink/45">
                  · all {total} takes shown ·
                </div>
              )
            )}
          </>
        )}
      </section>
    </>
  );
}
