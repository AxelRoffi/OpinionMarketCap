'use client';

import { useMemo } from 'react';
import { Btn, Sticker, MonoNum, Wobble } from '@/components/poster-arcade';
import { TakeCard } from '../_components/TakeCard';
import { SectionTitle } from '../_components/SectionTitle';
import { MOCK_TAKES, fmtUSD, type DisplayTake } from '../_data/mock-takes';
import { useWatchlist } from '../_lib/watchlist';
import { useTakes } from '../_lib/chain-adapters';

export default function WatchlistPage() {
  const { ids, hydrated, clear } = useWatchlist();
  const { takes: chainTakes, isLoading: chainLoading } = useTakes();

  // Resolve saved ids against chain takes first; fall back to the mock set
  // for any id that has no chain match (mock-only ids minted during dev).
  const takes = useMemo<DisplayTake[]>(() => {
    if (!hydrated) return [];
    const chainById = new Map(chainTakes.map((t) => [t.id, t]));
    return ids
      .map(
        (id) =>
          chainById.get(id) ?? MOCK_TAKES.find((t) => t.id === id) ?? null,
      )
      .filter((t): t is DisplayTake => Boolean(t));
  }, [ids, hydrated, chainTakes]);

  const totalValue = takes.reduce((a, t) => a + t.price, 0);
  const showLoader = !hydrated || (chainLoading && takes.length === 0 && ids.length > 0);

  return (
    <>
      {/* ────────────────  HEADER  ──────────────── */}
      <section className="px-4 md:px-10 pt-8 md:pt-12 pb-4">
        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/70">
          ★ saved & spicy
        </p>
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[48px] md:text-[64px] text-ink mt-1">
          WATCHLIST.
        </h1>
        <p className="font-display font-semibold text-[13px] md:text-[14px] text-ink/70 mt-1">
          takes you starred. saved in your browser.
        </p>
      </section>

      {/* ────────────────  CONTENT  ──────────────── */}
      <section className="px-4 md:px-10 pb-16">
        {showLoader ? (
          <div className="flex justify-center py-16">
            <Wobble>loading watchlist…</Wobble>
          </div>
        ) : takes.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <SectionTitle
              meta={
                <>
                  <MonoNum>{takes.length}</MonoNum> saved · <MonoNum>{fmtUSD(totalValue)}</MonoNum> total floor
                </>
              }
            >
              👀 SAVED TAKES
            </SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {takes.map((take, i) => (
                <TakeCard key={take.id} take={take} index={i} />
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 mt-10">
              <Btn href="/v2/marketplace" variant="ghost" size="md">
                find more takes →
              </Btn>
              <Btn variant="pop" size="md" onClick={clear}>
                clear watchlist
              </Btn>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex justify-center py-12">
      <Sticker bg="paper" tilt={-1.5} className="max-w-md text-center">
        <div className="font-display font-black text-[24px] tracking-tight">
          NOTHING SAVED YET.
        </div>
        <div className="font-display text-[12px] font-semibold text-ink/65 mt-2 max-w-[300px] mx-auto">
          Star a take to watch it. We&apos;ll keep it here while you scout the floor.
        </div>
        <div className="mt-5 flex justify-center gap-2 flex-wrap">
          <Btn href="/v2/marketplace" variant="pop" size="sm" star>
            browse the floor
          </Btn>
          <Btn href="/v2" variant="ghost" size="sm">
            back home →
          </Btn>
        </div>
      </Sticker>
    </div>
  );
}
