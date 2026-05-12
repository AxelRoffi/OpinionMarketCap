'use client';

import { cn } from '@/lib/utils';

export type Tab<T extends string = string> = {
  value: T;
  label: string;
  /** Optional emoji or icon prefix. */
  icon?: string;
};

type TabsProps<T extends string = string> = {
  tabs: Tab<T>[];
  value: T;
  onChange: (next: T) => void;
  /** Visual size variant. */
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Segmented tab control — ink border, active tab inverts to ink/canvas with pop shadow.
 * Used for trade slip tabs, range toggles, anywhere we need a 2–4-way switch.
 */
export function Tabs<T extends string = string>({
  tabs,
  value,
  onChange,
  size = 'md',
  className,
}: TabsProps<T>) {
  const sizing =
    size === 'sm'
      ? 'text-[10px] px-2.5 py-1'
      : 'text-[12px] px-3.5 py-1.5';

  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 p-1',
        'rounded-pill border-2 border-ink bg-paper',
        className,
      )}
    >
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              'inline-flex items-center gap-1',
              'rounded-pill font-display font-extrabold tracking-[0.04em] uppercase',
              'transition-transform duration-100',
              sizing,
              active
                ? 'bg-ink text-canvas shadow-[2px_2px_0_var(--pop)]'
                : 'bg-transparent text-ink/70 hover:text-ink',
            )}
          >
            {t.icon && <span aria-hidden>{t.icon}</span>}
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
