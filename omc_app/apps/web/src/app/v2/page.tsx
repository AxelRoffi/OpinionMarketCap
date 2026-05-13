'use client';

import { useMemo } from 'react';
import { Sticker, Btn, Chip, MonoNum, Wobble } from '@/components/poster-arcade';
import { TakeCard } from './_components/TakeCard';
import { MOCK_TAKES, fmtUSD } from './_data/mock-takes';
import { useTakes } from './_lib/chain-adapters';

export default function V2HotWallPage() {
  const { takes, isLoading, isEmpty, totalOnChain } = useTakes();

  // Show top 8 by trades; fallback to mock when chain has nothing.
  const hot = useMemo(() => {
    if (isEmpty) return MOCK_TAKES.slice(0, 8);
    return [...takes].sort((a, b) => b.trades - a.trades).slice(0, 8);
  }, [takes, isEmpty]);

  const totalVolume = takes.reduce((a, t) => a + t.price * Math.max(1, t.trades), 0);
  const freshCount = takes.length > 0
    ? takes.filter((t) => Date.now() - t.createdAt < 7 * 24 * 60 * 60 * 1000).length
    : 12;

  return (
    <>
      {/* ────────────────  HERO  ──────────────── */}
      <section className="relative px-4 py-10 md:px-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero copy */}
          <div className="lg:col-span-7">
            <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/70">
              ★ Take a stand
            </p>
            <h1 className="font-display font-black tracking-[-0.04em] leading-[0.92] text-[44px] md:text-[64px] lg:text-[78px] mt-2 text-ink">
              Take a stand.
              <br />
              <span className="text-pop">Get paid</span> for it.
            </h1>
            <p className="font-display font-semibold text-[14px] md:text-[16px] text-ink/75 mt-4 max-w-xl">
              Pick the answer. Pay the price. Take the floor.
              You keep <span className="font-mono font-extrabold">3%</span> of every flip — forever. Even after they take it from you.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-7">
              <Btn href="/v2/create" variant="pop" size="lg" star>
                Mint your first take
              </Btn>
              <Btn href="/v2/marketplace" variant="ghost" size="lg">
                Browse the floor →
              </Btn>
            </div>
          </div>

          {/* Floating sticker stack — uses real top 3 takes when available */}
          <div className="lg:col-span-5 relative h-[280px] md:h-[340px]">
            <div className="absolute inset-0 flex items-center justify-center">
              {hot.slice(0, 3).map((t, i) => (
                <div
                  key={`hero-${t.id}`}
                  className={
                    i === 0
                      ? 'absolute left-[8%] top-[10%]'
                      : i === 1
                      ? 'absolute right-[6%] top-[2%]'
                      : 'absolute left-[26%] bottom-[2%]'
                  }
                >
                  <HeroSticker take={t} variant={i as 0 | 1 | 2} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────  HOT WALL  ──────────────── */}
      <section className="px-4 md:px-10 pb-16">
        <header className="flex items-end justify-between flex-wrap gap-2 mb-5">
          <h2 className="font-display font-black text-[24px] md:text-[32px] tracking-[-0.03em] text-ink">
            🔥 HOT WALL · TODAY
          </h2>
          <div className="font-mono font-extrabold text-[12px] md:text-[13px] text-ink/70">
            <MonoNum>{totalOnChain || 847}</MonoNum> takes · <MonoNum>{fmtUSD(Math.round(totalVolume) || 284_000)}</MonoNum> vol · <MonoNum>{freshCount}</MonoNum> fresh
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Wobble>loading the wall…</Wobble>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {hot.map((take, i) => (
              <TakeCard key={take.id} take={take} index={i} />
            ))}
          </div>
        )}

        {isEmpty && !isLoading && (
          <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/50 text-center mt-6">
            ★ no on-chain takes yet — showing sample wall ★
          </p>
        )}
      </section>
    </>
  );
}

/**
 * HeroSticker — top 3 takes rendered as the iconic floating stack.
 * Variant fixes the bg/tilt per slot so the visual hierarchy stays consistent
 * even as data changes.
 */
function HeroSticker({
  take,
  variant,
}: {
  take: { id: number; question: string; answer: string; price: number; delta: number; categoryLabel?: string; category: string };
  variant: 0 | 1 | 2;
}) {
  const config = [
    { bg: 'cool' as const,   tilt: -3,  shadow: 5 as const, chipBg: 'pop' as const   },
    { bg: 'pop' as const,    tilt: 2.5, shadow: 5 as const, chipBg: 'paper' as const },
    { bg: 'canvas' as const, tilt: -1,  shadow: 6 as const, chipBg: 'ink' as const   },
  ][variant];
  const cat = (take.categoryLabel ?? take.category ?? '').toUpperCase();
  const isLoss = take.delta < 0;

  // Bigger headline (28px) cuts at ~160px; smaller (22px) lets 12–14 chars per
  // line wrap cleanly into 2 lines (e.g. "DONALD J. TRUMP", "BEST L2 BASE").
  // line-clamp-2 keeps the sticker compact while showing the whole take.
  return (
    <Sticker bg={config.bg} tilt={config.tilt} shadow={config.shadow}>
      <Chip bg={config.chipBg}>{cat}</Chip>
      <div className="mt-2 font-display text-[11px] font-bold opacity-85 italic max-w-[180px] leading-tight line-clamp-2">
        &ldquo;{take.question}&rdquo;
      </div>
      <div className="mt-1 font-display font-black text-[22px] leading-[0.95] tracking-tight max-w-[180px] break-words line-clamp-2">
        {take.answer}.
      </div>
      <div className="mt-2 flex justify-between gap-3">
        <MonoNum>{fmtUSD(take.price)}</MonoNum>
        <MonoNum className={isLoss ? 'text-pop' : undefined}>
          {take.delta >= 0 ? '+' : ''}{take.delta.toFixed(1)}%
        </MonoNum>
      </div>
    </Sticker>
  );
}
