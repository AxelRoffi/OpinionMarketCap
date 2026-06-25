'use client';

import Link from 'next/link';
import { MonoNum } from '@/components/poster-arcade';
import { fmtUSD } from '../_data/mock-takes';
import { takeHref } from '../_lib/slug';
import type { MarketStats } from '@/hooks/useMarketStats';

type MarketStatsBandProps = {
  stats: MarketStats;
  takesCount: number;
  vacantSlots: number;
};

/**
 * Horizontal "market dashboard" of headline stats, shown under the hero.
 * Most tiles come straight from useMarketStats (one multicall over all
 * answer histories); vacantSlots is derived from the already-loaded takes.
 */
export function MarketStatsBand({ stats, takesCount, vacantSlots }: MarketStatsBandProps) {
  const tiles: { label: string; value: React.ReactNode; href?: string }[] = [
    { label: 'takes', value: <MonoNum>{takesCount}</MonoNum> },
    { label: 'volume', value: <MonoNum>{fmtUSD(stats.totalVolume)}</MonoNum> },
    { label: '24h vol', value: <MonoNum>{fmtUSD(stats.volume24h)}</MonoNum> },
    { label: 'royalties paid', value: <MonoNum>{fmtUSD(stats.royaltiesPaid)}</MonoNum> },
    { label: 'traders', value: <MonoNum>{stats.uniqueUsers}</MonoNum> },
    {
      label: 'hottest',
      value: stats.hottest ? <MonoNum>#{stats.hottest.id} · {stats.hottest.flips}🔥</MonoNum> : '—',
      href: stats.hottest ? takeHref(stats.hottest.id) : undefined,
    },
    { label: 'vacant slots', value: <MonoNum>{vacantSlots}</MonoNum> },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
      {tiles.map((t) => {
        const inner = (
          <>
            <div className="font-display text-[9px] font-extrabold uppercase tracking-[0.1em] text-ink/55">
              {t.label}
            </div>
            <div className="font-display font-black text-[15px] md:text-[16px] text-ink mt-0.5 truncate">
              {t.value}
            </div>
          </>
        );
        const cls =
          'block border-2 border-ink rounded-lg bg-paper px-3 py-2 shadow-[2px_2px_0_var(--ink)] transition-transform';
        return t.href ? (
          <Link key={t.label} href={t.href} className={cls + ' hover:-translate-x-[1px] hover:-translate-y-[1px]'}>
            {inner}
          </Link>
        ) : (
          <div key={t.label} className={cls}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
