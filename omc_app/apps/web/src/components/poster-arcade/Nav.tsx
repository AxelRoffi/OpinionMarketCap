'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Btn } from './Btn';

type NavTab = { label: string; href: string };

const TABS: NavTab[] = [
  { label: 'Hot',         href: '/v2' },
  { label: 'Marketplace', href: '/v2/marketplace' },
  { label: 'Leaderboard', href: '/v2/leaderboard' },
  { label: 'Pools',       href: '/v2/pools' },
];

type NavProps = {
  /** Right-side CTA target. Defaults to /v2/create (mint flow). */
  ctaHref?: string;
  ctaLabel?: string;
  /** Optional slot rendered between tabs and CTA (e.g. wallet connect). */
  rightSlot?: React.ReactNode;
};

export function Nav({ ctaHref = '/v2/create', ctaLabel = 'NEW TAKE', rightSlot }: NavProps) {
  const pathname = usePathname() ?? '';

  return (
    <nav className="relative z-20 flex items-center justify-between border-b-[2.5px] border-dashed border-ink bg-canvas px-4 py-3 md:px-6 md:py-4">
      {/* Logo */}
      <Link href="/v2" className="flex items-center gap-2.5">
        <span
          className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-full border-[2.5px] border-ink bg-pop text-[13px] font-black text-paper shadow-[2px_2px_0_var(--ink)]"
          aria-hidden
        >
          ★
        </span>
        <span className="font-display text-[20px] font-black tracking-[-0.03em] text-ink">OMC</span>
      </Link>

      {/* Tabs — desktop */}
      <ul className="hidden md:flex items-center gap-5">
        {TABS.map((t) => {
          const active = pathname === t.href || (t.href !== '/v2' && pathname.startsWith(t.href));
          return (
            <li key={t.label}>
              <Link
                href={t.href}
                className={cn(
                  'font-display text-[13px] font-bold text-ink transition-opacity hover:opacity-80',
                  active && 'border-b-2 border-ink pb-px',
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Right slot + CTA */}
      <div className="flex items-center gap-3">
        {rightSlot}
        <Btn href={ctaHref} variant="primary" size="sm" star>
          {ctaLabel}
        </Btn>
      </div>
    </nav>
  );
}
