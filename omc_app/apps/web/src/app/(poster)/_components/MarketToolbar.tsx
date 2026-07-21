'use client';

import { cn } from '@/lib/utils';

export type SortMode = 'hot' | 'new' | 'price-desc' | 'price-asc';

const SORTS: { key: SortMode; label: string }[] = [
  { key: 'hot',        label: '🔥 Hot' },
  { key: 'new',        label: '🆕 New' },
  { key: 'price-desc', label: '💰 Price ↓' },
  { key: 'price-asc',  label: '💲 Price ↑' },
];

export type CategoryOption = { key: string; label: string; emoji: string };

type MarketToolbarProps = {
  sort: SortMode;
  onSort: (s: SortMode) => void;
  categories: CategoryOption[];
  /** 'all' or a category key. */
  activeCategory: string;
  onCategory: (key: string) => void;
  /** Live keyword search across question / answer / category / holder. */
  query: string;
  onQuery: (q: string) => void;
  /** How many takes match the current query (shown while searching). */
  resultCount: number;
};

/**
 * Sticky discovery bar above the market grid: keyword search + sort segmented
 * control + single-select category chips (only categories present show).
 */
export function MarketToolbar({
  sort,
  onSort,
  categories,
  activeCategory,
  onCategory,
  query,
  onQuery,
  resultCount,
}: MarketToolbarProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 md:-mx-10 mb-5 px-4 md:px-10 py-3 bg-canvas/95 backdrop-blur-sm border-b-2 border-dashed border-ink/30">
      {/* Search */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px]">
            🔎
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="SEARCH TAKES — “goat”, “pizza”, “L2”…"
            aria-label="Search takes by keyword"
            className="w-full font-display text-[12px] font-extrabold uppercase tracking-tight text-ink placeholder:text-ink/40 bg-paper border-2 border-ink rounded-pill pl-9 pr-9 py-2 shadow-[3px_3px_0_var(--ink)] focus:outline-none focus:shadow-[1px_1px_0_var(--ink)] focus:translate-x-[2px] focus:translate-y-[2px] transition-all [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 font-display text-[13px] font-black text-ink hover:text-pop"
            >
              ✕
            </button>
          )}
        </div>
        {query && (
          <span className="shrink-0 font-display text-[11px] font-extrabold uppercase text-ink bg-cool border-2 border-ink rounded-pill px-2.5 py-1">
            {resultCount} hit{resultCount === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Sort */}
        <div className="flex items-center gap-1.5 shrink-0">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => onSort(s.key)}
              aria-pressed={sort === s.key}
              className={cn(
                'font-display text-[11px] md:text-[12px] font-extrabold uppercase tracking-tight border-2 border-ink rounded-pill px-2.5 py-1 transition-all whitespace-nowrap',
                sort === s.key
                  ? 'bg-ink text-canvas shadow-[2px_2px_0_var(--ink)]'
                  : 'bg-canvas text-ink hover:bg-paper',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 lg:justify-end">
          <CatChip active={activeCategory === 'all'} onClick={() => onCategory('all')}>
            All
          </CatChip>
          {categories.map((c) => (
            <CatChip
              key={c.key}
              active={activeCategory === c.key}
              onClick={() => onCategory(c.key)}
            >
              <span aria-hidden>{c.emoji}</span> {c.label}
            </CatChip>
          ))}
        </div>
      </div>
    </div>
  );
}

function CatChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 font-display text-[11px] font-extrabold uppercase tracking-tight border-2 border-ink rounded-pill px-2.5 py-1 transition-all whitespace-nowrap',
        active
          ? 'bg-pop text-paper shadow-[2px_2px_0_var(--ink)]'
          : 'bg-canvas text-ink hover:bg-paper',
      )}
    >
      {children}
    </button>
  );
}
