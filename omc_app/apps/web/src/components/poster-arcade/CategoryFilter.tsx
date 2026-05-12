'use client';

import { cn } from '@/lib/utils';

export type CategoryOption = {
  /** Unique key. Use 'all' for the universal-selector chip. */
  key: string;
  /** Emoji prefix — optional. */
  emoji?: string;
  /** Display label (already uppercase). */
  label: string;
};

type CategoryFilterProps = {
  options: CategoryOption[];
  /** Currently active key (matches an `options[i].key`). */
  value: string;
  onChange: (key: string) => void;
  className?: string;
};

/**
 * Horizontal scrollable chip row. Active chip = inverted (ink bg / canvas text)
 * with a pop hard-shadow tag. Inactive = paper bg.
 */
export function CategoryFilter({ options, value, onChange, className }: CategoryFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Categories"
      className={cn(
        'flex items-center gap-2 flex-wrap',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <button
            key={opt.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.key)}
            className={cn(
              'inline-flex items-center gap-1.5',
              'rounded-pill border-2 border-ink',
              'font-display font-extrabold text-[11px] tracking-[0.04em]',
              'px-3 py-1.5',
              'transition-transform duration-100 active:translate-x-[1px] active:translate-y-[1px]',
              active
                ? 'bg-ink text-canvas shadow-[2px_2px_0_var(--pop)]'
                : 'bg-paper text-ink hover:shadow-[2px_2px_0_var(--ink)] hover:-translate-x-[1px] hover:-translate-y-[1px]',
            )}
          >
            {opt.emoji && <span aria-hidden>{opt.emoji}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
