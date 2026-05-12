'use client';

import { cn } from '@/lib/utils';
import { type ChangeEvent } from 'react';

export type SortOption<T extends string = string> = {
  value: T;
  label: string;
};

type SortDropdownProps<T extends string = string> = {
  /** Prefix label shown before the selected value. */
  prefix?: string;
  options: SortOption<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
};

/**
 * Pill-styled native select. Native dropdown stays accessible; Poster Arcade
 * skin wraps it. Use as a controlled component.
 */
export function SortDropdown<T extends string = string>({
  prefix = 'SORT',
  options,
  value,
  onChange,
  className,
}: SortDropdownProps<T>) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as T);
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center',
        'rounded-pill border-2 border-ink bg-paper text-ink',
        'shadow-[2px_2px_0_var(--ink)]',
        'font-display font-extrabold text-[11px] tracking-[0.06em] uppercase',
        className,
      )}
    >
      <span className="pl-3 pr-1 select-none text-ink/60">{prefix}:</span>
      <select
        value={value}
        onChange={handleChange}
        className="appearance-none bg-transparent pr-8 pl-1 py-1.5 font-extrabold focus:outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 text-[10px]"
      >
        ▼
      </span>
    </div>
  );
}
