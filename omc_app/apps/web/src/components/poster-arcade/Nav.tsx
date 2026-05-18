'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Btn } from './Btn';
import { WalletBtn } from './WalletBtn';

type NavTab = { label: string; href: string };

const TABS: NavTab[] = [
  { label: 'Hot',         href: '/' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Listings',    href: '/listings' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Pools',       href: '/pools' },
];

type NavProps = {
  /** Right-side CTA target. Defaults to /create (mint flow). */
  ctaHref?: string;
  ctaLabel?: string;
  /**
   * Replace the default right-side cluster. Defaults to <WalletBtn /> + NEW TAKE.
   * Pass a node to override completely (e.g. on a page where the user is in a
   * specific flow and shouldn't be tempted by global CTAs).
   */
  rightSlot?: React.ReactNode;
  /** Suppress the NEW TAKE CTA. Used inside the mint flow itself. */
  hideCta?: boolean;
};

export function Nav({ ctaHref = '/create', ctaLabel = 'NEW TAKE', rightSlot, hideCta }: NavProps) {
  const pathname = usePathname() ?? '';

  return (
    <nav className="relative z-20 flex items-center justify-between border-b-[2.5px] border-dashed border-ink bg-canvas px-4 py-3 md:px-6 md:py-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
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
          const active = pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href));
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

      {/* Right cluster — wallet button + (optional) NEW TAKE CTA */}
      <div className="flex items-center gap-2 md:gap-3">
        {rightSlot ?? <WalletBtn size="sm" />}
        {!hideCta && (
          <Btn href={ctaHref} variant="primary" size="sm" star className="hidden sm:inline-flex">
            {ctaLabel}
          </Btn>
        )}
      </div>
    </nav>
  );
}
