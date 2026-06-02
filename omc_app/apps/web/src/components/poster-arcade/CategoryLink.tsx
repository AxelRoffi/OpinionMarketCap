'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { categoryDisplay } from '@/lib/categories';

const BG = {
  paper:  'bg-paper text-ink',
  pop:    'bg-pop text-paper',
  cool:   'bg-cool text-ink',
  canvas: 'bg-canvas text-ink',
  ink:    'bg-ink text-canvas',
} as const;

type CategoryLinkProps = {
  /** Canonical chain category name. */
  name: string;
  /** Smaller variant for nested contexts (e.g. inside a card). */
  sm?: boolean;
  /** Stop click bubbling — needed inside parent <Link> contexts like TakeCard. */
  stopPropagation?: boolean;
  /** Hide the emoji prefix (useful in cramped contexts). */
  hideEmoji?: boolean;
  /** Force a chip color override (rare — use only for tone matching, e.g. ink on yellow hero). */
  bgOverride?: keyof typeof BG;
  className?: string;
};

/**
 * Clickable category chip. Visual style mirrors <Chip> exactly so it slots
 * into existing layouts as a drop-in replacement, but the element is an
 * anchor that navigates to /category/[slug].
 *
 * Color, emoji, and slug all come from lib/categories.ts (chain-anchored).
 * If the chain ever adds a category we don't know about, the helper falls
 * back to a neutral chip + slugified URL — the link still works.
 */
export function CategoryLink({
  name,
  sm = false,
  stopPropagation = false,
  hideEmoji = false,
  bgOverride,
  className,
}: CategoryLinkProps) {
  const meta = categoryDisplay(name);
  if (!meta) return null;
  const bgClass = BG[bgOverride ?? meta.color];

  return (
    <Link
      href={`/category/${meta.slug}`}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
      }}
      className={cn(
        'inline-block border-2 border-ink rounded-pill font-extrabold font-display',
        sm ? 'px-2 py-[1px] text-[10px]' : 'px-2.5 py-0.5 text-[11px]',
        'transition-transform duration-100',
        'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[2px_2px_0_var(--ink)]',
        'active:translate-x-[1px] active:translate-y-[1px] active:shadow-none',
        bgClass,
        className,
      )}
      aria-label={`Browse opinions in ${meta.name}`}
    >
      {!hideEmoji && <span className="mr-1">{meta.emoji}</span>}
      <span className="uppercase tracking-[0.02em]">{meta.name}</span>
    </Link>
  );
}
