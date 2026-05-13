'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type Tab = { label: string; href: string; icon: string; primary?: boolean };

const TABS: Tab[] = [
  { label: 'HOT',  href: '/',             icon: '🔥' },
  { label: 'ROOM', href: '/portfolio',  icon: '🏠' },
  { label: 'MINT', href: '/create',     icon: '★',  primary: true },
  { label: 'HALL', href: '/leaderboard',icon: '🏆' },
  { label: 'ME',   href: '/profile',    icon: '👤' },
];

/**
 * Mobile bottom tab bar — ink bg, 5 items, ★+ mint button raised pop.
 */
export function BottomTabBar() {
  const pathname = usePathname() ?? '';

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-ink border-t-[2.5px] border-ink"
      aria-label="Primary"
    >
      <ul className="flex items-stretch justify-around relative">
        {TABS.map((t) => {
          const active = pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href));

          if (t.primary) {
            return (
              <li key={t.label} className="relative -mt-5">
                <Link
                  href={t.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5',
                    'w-14 h-14 rounded-full bg-pop text-paper',
                    'border-[2.5px] border-ink shadow-[3px_3px_0_var(--canvas)]',
                    'font-display text-[18px] font-black',
                    'active:translate-y-[2px] active:shadow-[1px_1px_0_var(--canvas)] transition-transform',
                  )}
                  aria-label="Mint a new take"
                >
                  <span aria-hidden>{t.icon}</span>
                </Link>
              </li>
            );
          }

          return (
            <li key={t.label} className="flex-1">
              <Link
                href={t.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2',
                  'font-display text-[10px] font-extrabold tracking-[0.08em]',
                  active ? 'text-canvas' : 'text-canvas/65',
                )}
              >
                <span aria-hidden className="text-[16px] leading-none">{t.icon}</span>
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
