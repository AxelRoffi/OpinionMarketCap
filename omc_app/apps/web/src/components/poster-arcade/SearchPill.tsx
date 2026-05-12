'use client';

import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

type SearchPillProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** Prefix icon — defaults to 🔍. Set to empty string to disable. */
  icon?: string;
};

/**
 * Pill-shaped search input. Ink border, hover/focus lift with hard shadow.
 */
export const SearchPill = forwardRef<HTMLInputElement, SearchPillProps>(function SearchPill(
  { icon = '🔍', className, ...rest },
  ref,
) {
  return (
    <label
      className={cn(
        'group inline-flex items-center gap-1.5',
        'rounded-pill border-2 border-ink bg-paper',
        'pl-3 pr-3 py-1.5',
        'transition-all duration-100',
        'focus-within:-translate-x-[1px] focus-within:-translate-y-[1px] focus-within:shadow-[3px_3px_0_var(--ink)]',
        className,
      )}
    >
      {icon && <span aria-hidden className="text-[12px]">{icon}</span>}
      <input
        ref={ref}
        type="search"
        className={cn(
          'bg-transparent outline-none border-0',
          'font-display font-semibold text-[12px] text-ink placeholder:text-ink/50',
          'w-full min-w-[140px]',
        )}
        {...rest}
      />
    </label>
  );
});
