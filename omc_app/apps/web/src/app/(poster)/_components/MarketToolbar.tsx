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
};

/**
 * Sticky discovery bar above the market grid: sort segmented control +
 * single-select category chips (only categories present in the data show).
 */
export function MarketToolbar({
  sort,
  onSort,
  categories,
  activeCategory,
  onCategory,
}: MarketToolbarProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 md:-mx-10 mb-5 px-4 md:px-10 py-3 bg-canvas/95 backdrop-blur-sm border-b-2 border-dashed border-ink/30">
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
