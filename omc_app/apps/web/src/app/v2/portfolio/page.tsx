'use client';

import { toast } from 'sonner';
import { Btn, Sticker, MonoNum, popConfetti } from '@/components/poster-arcade';
import { TakeCard } from '../_components/TakeCard';
import { SectionTitle } from '../_components/SectionTitle';
import { StatStrip, type StatItem } from '../_components/StatStrip';
import { EarningRow } from '../_components/EarningRow';
import { fmtUSD, fmtDelta } from '../_data/mock-takes';
import { getMyRoom } from '../_data/room';

export default function PortfolioPage() {
  const room = getMyRoom();

  const stats: StatItem[] = [
    { label: 'bag',       value: fmtUSD(room.bag) },
    { label: '7d',        value: fmtDelta(room.delta7d), tone: room.delta7d >= 0 ? 'gain' : 'loss' },
    { label: 'royalties', value: `+${fmtUSD(room.royalties)}`, tone: 'gain' },
    { label: 'streak',    value: String(room.streak), glyph: '🔥' },
  ];

  const handleCashOut = () => {
    popConfetti({ count: 60, y: 0.5 });
    toast.success(`+${fmtUSD(room.royalties)} cashed out`, {
      description: 'wallet wiring lands in a later phase',
    });
  };

  return (
    <>
      {/* ────────────────  HEADER  ──────────────── */}
      <section className="px-4 md:px-10 pt-8 md:pt-12 pb-4">
        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/70">
          ★ your kingdom
        </p>
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[48px] md:text-[64px] text-ink mt-1">
          YOUR ROOM.
        </h1>
      </section>

      {/* ────────────────  STATS  ──────────────── */}
      <section className="px-4 md:px-10">
        <StatStrip items={stats} />
      </section>

      {/* ────────────────  STILL HOLDING  ──────────────── */}
      <section className="px-4 md:px-10 pt-10">
        <SectionTitle meta={<><MonoNum>{room.holding.length}</MonoNum> takes</>}>
          🏠 STILL HOLDING
        </SectionTitle>

        {room.holding.length === 0 ? (
          <EmptyHolding />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {room.holding.map((take, i) => (
              <TakeCard key={take.id} take={take} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ────────────────  STILL EARNING  ──────────────── */}
      <section className="px-4 md:px-10 pt-12">
        <SectionTitle meta={<><MonoNum>+{fmtUSD(room.royalties)}</MonoNum> claimable</>}>
          💰 TAKEN BUT STILL EARNING
        </SectionTitle>

        {room.earning.length === 0 ? (
          <Sticker bg="paper" tilt={-1} className="text-center py-6 max-w-md mx-auto">
            <div className="font-display font-black text-[16px] tracking-tight">
              NO ROYALTIES YET.
            </div>
            <div className="font-display text-[12px] font-semibold text-ink/65 mt-1">
              Mint a take. Every time it&apos;s flipped, you earn 3%. Forever.
            </div>
          </Sticker>
        ) : (
          <div className="space-y-2.5">
            {room.earning.map((rec) => (
              <EarningRow key={rec.takeId} rec={rec} />
            ))}
          </div>
        )}
      </section>

      {/* ────────────────  FOOTER CTAs  ──────────────── */}
      <section className="px-4 md:px-10 py-12 flex flex-wrap items-center justify-center gap-3">
        <Btn href="/v2/create" variant="pop" size="lg" star>
          MINT NEW TAKE
        </Btn>
        <Btn variant="cool" size="lg" onClick={handleCashOut}>
          CASH OUT <MonoNum>{fmtUSD(room.royalties)}</MonoNum>
        </Btn>
      </section>
    </>
  );
}

function EmptyHolding() {
  return (
    <div className="flex justify-center py-10">
      <Sticker bg="paper" tilt={-1.5} className="max-w-md text-center">
        <div className="font-display font-black text-[22px] tracking-tight">
          ROOM&apos;S EMPTY.
        </div>
        <div className="font-display text-[12px] font-semibold text-ink/65 mt-1">
          Mint your first take. Take someone else&apos;s. Either way, the wall awaits.
        </div>
        <div className="mt-4 flex justify-center gap-2 flex-wrap">
          <Btn href="/v2/create" variant="pop" size="sm" star>
            mint a take
          </Btn>
          <Btn href="/v2/marketplace" variant="ghost" size="sm">
            browse the floor →
          </Btn>
        </div>
      </Sticker>
    </div>
  );
}
