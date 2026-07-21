'use client';

import { useMemo, useState } from 'react';
import { Sticker, Btn, Wobble } from '@/components/poster-arcade';
import { TakeCard } from './_components/TakeCard';
import { MarketToolbar, type SortMode, type CategoryOption } from './_components/MarketToolbar';
import { MarketStatsBand } from './_components/MarketStatsBand';
import { CAT_MAP } from './_data/mock-takes';
import { useTakes } from './_lib/chain-adapters';
import { useInfiniteRender } from './_lib/use-infinite-render';
import { useMarketStats } from '@/hooks/useMarketStats';

export default function V2HotWallPage() {
  const { takes, isLoading, isEmpty } = useTakes();

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
  const [query, setQuery] = useState('');

  const sortedTakes = useMemo(() => {
    const catFiltered = activeCat === 'all' ? takes : takes.filter((t) => t.category === activeCat);

    // Keyword search: relevance-ranked across question > answer > category >
    // holder. While a query is active, relevance order replaces the sort mode
    // (trades break ties so "hot" matches still float up).
    const q = query.trim().toLowerCase();
    if (q) {
      const score = (t: (typeof takes)[number]) => {
        const question = t.question.toLowerCase();
        const answer = t.answer.toLowerCase();
        const cat = (t.categoryLabel ?? t.category).toLowerCase();
        const holder = t.heldBy.toLowerCase();
        if (question.startsWith(q)) return 100;
        if (question.includes(q)) return 60;
        if (answer.startsWith(q)) return 40;
        if (answer.includes(q)) return 30;
        if (cat.includes(q)) return 15;
        if (holder.includes(q)) return 5;
        return 0;
      };
      return catFiltered
        .map((t) => ({ t, s: score(t) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || b.t.trades - a.t.trades)
        .map((x) => x.t);
    }

    const out = [...catFiltered];
    switch (sort) {
      case 'hot':        out.sort((a, b) => b.trades - a.trades); break;
      case 'new':        out.sort((a, b) => b.createdAt - a.createdAt); break;
      case 'price-desc': out.sort((a, b) => b.price - a.price); break;
      case 'price-asc':  out.sort((a, b) => a.price - b.price); break;
    }
    return out;
  }, [takes, activeCat, sort, query]);

  const { visibleItems, total, visible, sentinelRef, loadMore, hasMore } = useInfiniteRender(
    sortedTakes,
    12,
    `${sort}|${activeCat}|${query.trim().toLowerCase()}`,
  );

  const stats = useMarketStats();
  const vacantSlots = useMemo(() => takes.filter((t) => t.isVacant).length, [takes]);

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
          <div className="mb-5">
            {/* takes.length = active, deduped list — deactivated/moderated ids stay out of the stats */}
            <MarketStatsBand stats={stats} takesCount={takes.length} vacantSlots={vacantSlots} />
          </div>
        )}

        {!isEmpty && !isLoading && (
          <MarketToolbar
            sort={sort}
            onSort={setSort}
            categories={categories}
            activeCategory={activeCat}
            onCategory={setActiveCat}
            query={query}
            onQuery={setQuery}
            resultCount={sortedTakes.length}
          />
        )}

        <header className="mb-5">
          <h2 className="font-display font-black text-[22px] md:text-[28px] tracking-[-0.03em] text-ink">
            🔥 THE FLOOR
          </h2>
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

            {/* Infinite-scroll sentinel — also a manual "load more" fallback. */}
            {hasMore ? (
              <div ref={sentinelRef} className="flex justify-center py-8">
                <button
                  type="button"
                  onClick={loadMore}
                  className="font-display text-[12px] font-extrabold tracking-[0.12em] uppercase border-2 border-ink rounded-pill px-4 py-2 bg-paper text-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
                >
                  ↓ load more · {visible}/{total}
                </button>
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
