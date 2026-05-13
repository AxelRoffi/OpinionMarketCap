'use client';

import { useMemo, useState } from 'react';
import {
  CategoryFilter,
  SortDropdown,
  SearchPill,
  Sticker,
  Btn,
  Wobble,
  type CategoryOption,
  type SortOption,
} from '@/components/poster-arcade';
import { TakeCard } from '../_components/TakeCard';
import { MOCK_TAKES, CATEGORIES, type CatKey } from '../_data/mock-takes';
import { useTakes } from '../_lib/chain-adapters';

type SortKey = 'hot' | 'new' | 'gainers' | 'losers' | 'cheap' | 'spicy';

const SORT_OPTS: SortOption<SortKey>[] = [
  { value: 'hot',     label: 'HOT' },
  { value: 'new',     label: 'NEW' },
  { value: 'gainers', label: 'TOP GAINERS' },
  { value: 'losers',  label: 'TOP LOSERS' },
  { value: 'cheap',   label: 'CHEAPEST' },
  { value: 'spicy',   label: 'SPICIEST' },
];

const CAT_OPTS: CategoryOption[] = [
  { key: 'all', label: 'ALL' },
  ...CATEGORIES.map((c) => ({ key: c.key, emoji: c.emoji, label: c.label })),
];

export default function MarketplacePage() {
  const { takes, isLoading, isEmpty } = useTakes();
  const [cat, setCat] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('hot');
  const [query, setQuery] = useState('');

  // Live chain data when present; mock fallback when chain is empty/unreachable
  // so the page is never devoid of content.
  const source = isEmpty ? MOCK_TAKES : takes;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const inCategory = (key: CatKey) => cat === 'all' || cat === key;
    const inSearch = (s: string) =>
      !q ||
      s.toLowerCase().includes(q);

    let list = source.filter(
      (t) =>
        inCategory(t.category) &&
        (inSearch(t.question) || inSearch(t.answer) || inSearch(t.heldBy)),
    );

    list = [...list];
    switch (sort) {
      case 'hot':     list.sort((a, b) => b.trades - a.trades); break;
      case 'new':     list.sort((a, b) => b.createdAt - a.createdAt); break;
      case 'gainers': list.sort((a, b) => b.delta - a.delta); break;
      case 'losers':  list.sort((a, b) => a.delta - b.delta); break;
      case 'cheap':   list.sort((a, b) => a.price - b.price); break;
      case 'spicy':   list.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)); break;
    }
    return list;
  }, [source, cat, sort, query]);

  const resetFilters = () => {
    setCat('all');
    setQuery('');
  };

  return (
    <>
      {/* ────────────────  HEADER  ──────────────── */}
      <section className="px-4 md:px-10 pt-8 md:pt-12 pb-6">
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[48px] md:text-[64px] text-ink">
          THE FLOOR.
        </h1>
        <p className="font-display font-semibold text-[13px] md:text-[14px] text-ink/70 mt-1">
          every take, every price
        </p>
      </section>

      {/* ────────────────  CONTROLS  ──────────────── */}
      <section className="px-4 md:px-10 sticky top-[60px] z-10 bg-canvas/95 backdrop-blur-sm pb-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 min-w-0 overflow-x-auto -mx-1 px-1">
            <CategoryFilter
              options={CAT_OPTS}
              value={cat}
              onChange={setCat}
              className="flex-nowrap whitespace-nowrap"
            />
          </div>
          <div className="flex items-center gap-2">
            <SearchPill
              placeholder="find a take"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <SortDropdown
              options={SORT_OPTS}
              value={sort}
              onChange={setSort}
            />
          </div>
        </div>
      </section>

      {/* ────────────────  RESULTS  ──────────────── */}
      <section className="px-4 md:px-10 pb-16">
        <div className="font-mono text-[11px] font-extrabold text-ink/60 mb-4 flex items-center gap-3">
          <span>
            {filtered.length} {filtered.length === 1 ? 'take' : 'takes'}
          </span>
          {isEmpty && (
            <span className="font-display text-[10px] font-extrabold tracking-[0.14em] uppercase text-ink/40">
              · sample wall — chain has no opinions yet
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Wobble>loading the floor…</Wobble>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex justify-center py-16">
            <Sticker bg="paper" tilt={-1.5} className="max-w-md text-center">
              <div className="font-display font-black text-[22px] tracking-tight">
                NO TAKES MATCH.
              </div>
              <div className="font-display text-[12px] font-semibold text-ink/70 mt-1">
                Try another category or clear your search.
              </div>
              <div className="mt-4 flex justify-center">
                <Btn variant="pop" size="sm" onClick={resetFilters}>
                  CLEAR FILTERS
                </Btn>
              </div>
            </Sticker>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((take, i) => (
              <TakeCard key={take.id} take={take} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
