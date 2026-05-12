'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import {
  Sticker,
  Chip,
  Btn,
  MonoNum,
  ProgressBar,
  Countdown,
  AvatarStack,
} from '@/components/poster-arcade';
import { SectionTitle } from '../_components/SectionTitle';
import { CAT_MAP, fmtUSD } from '../_data/mock-takes';
import { MOCK_POOLS, fundingPct, type Pool } from '../_data/pools';

/* Background rotation for the pool grid. Stable by index. */
const BG_CYCLE = ['canvas', 'paper', 'cool', 'pop'] as const;
const TILT_CYCLE = [-2, 1.5, -1.5, 2] as const;

export default function PoolsIndexPage() {
  const active = MOCK_POOLS.filter((p) => p.status === 'active');
  const filled = MOCK_POOLS.filter((p) => p.status === 'filled');
  const totalRaised = MOCK_POOLS.reduce((a, p) => a + p.raised, 0);

  const openPool = () => {
    toast.message('opening pools soon', {
      description: 'a take + an answer + a target — wired in a later phase',
    });
  };

  return (
    <>
      {/* ────────────────  HEADER  ──────────────── */}
      <section className="px-4 md:px-10 pt-8 md:pt-12 pb-4">
        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/70">
          ★ co-own a take
        </p>
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[44px] md:text-[64px] text-ink mt-1">
          POOLS.
        </h1>
        <p className="font-display font-semibold text-[14px] md:text-[16px] text-ink/75 mt-2 max-w-xl">
          Stack USDC with strangers. Take a take together. Share the royalties forever.
        </p>
      </section>

      {/* ────────────────  ACTIONS  ──────────────── */}
      <section className="px-4 md:px-10 flex flex-wrap items-center justify-between gap-3 pb-6">
        <div className="font-mono font-extrabold text-[12px] text-ink/70">
          <MonoNum>{active.length}</MonoNum> open · <MonoNum>{fmtUSD(totalRaised)}</MonoNum> pooled all-time
        </div>
        <Btn variant="pop" size="md" onClick={openPool} star>
          OPEN A POOL
        </Btn>
      </section>

      {/* ────────────────  ACTIVE  ──────────────── */}
      <section className="px-4 md:px-10 pb-10">
        <SectionTitle meta={<><MonoNum>{active.length}</MonoNum> open</>}>
          🌊 ACTIVE POOLS
        </SectionTitle>

        {active.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {active.map((pool, i) => (
              <PoolCard key={pool.id} pool={pool} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ────────────────  FILLED  ──────────────── */}
      {filled.length > 0 && (
        <section className="px-4 md:px-10 pb-16">
          <SectionTitle meta={<><MonoNum>{filled.length}</MonoNum> filled</>}>
            ✅ FILLED · WAITING TO EXECUTE
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filled.map((pool, i) => (
              <PoolCard key={pool.id} pool={pool} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/* ─────────────────────────── POOL CARD ─────────────────────────── */

function PoolCard({ pool, index }: { pool: Pool; index: number }) {
  const bg = BG_CYCLE[index % BG_CYCLE.length];
  const tilt = TILT_CYCLE[index % TILT_CYCLE.length];
  const chipBg = bg === 'paper' || bg === 'canvas' ? 'ink' : 'paper';
  const cat = CAT_MAP[pool.category];
  const pct = fundingPct(pool);
  const isFilled = pool.status === 'filled';

  return (
    <Link href={`/v2/pools/${pool.id}`} className="block">
      <Sticker bg={bg} tilt={tilt} shadow={5} tappable className="p-5">
        <div className="flex items-center justify-between">
          <Chip bg={chipBg} sm>{cat.emoji} {cat.label}</Chip>
          {isFilled ? (
            <Chip bg="cool" sm>✓ FILLED</Chip>
          ) : (
            <Chip bg="ink" sm>#{pool.id}</Chip>
          )}
        </div>

        <div className="font-display text-[11px] font-bold italic opacity-85 mt-3">
          &ldquo;{pool.question}&rdquo;
        </div>
        <div className="font-display font-black text-[24px] md:text-[28px] leading-none tracking-tighter mt-1">
          {pool.proposedAnswer}.
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <MonoNum className="text-[15px]">
              {fmtUSD(pool.raised)} / {fmtUSD(pool.target)}
            </MonoNum>
            <MonoNum className="text-[11px] opacity-70">{pct}%</MonoNum>
          </div>
          <ProgressBar
            value={pct}
            fill={isFilled ? 'cool' : 'pop'}
            size="md"
            striped={!isFilled}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <AvatarStack
            avatars={pool.contributors.map((c) => c.avatar)}
            size="sm"
            max={4}
          />
          <div className="text-right">
            <div className="font-display text-[9px] font-extrabold tracking-[0.12em] uppercase opacity-60">
              closes in
            </div>
            <Countdown deadlineMs={pool.deadlineMs} compact />
          </div>
        </div>
      </Sticker>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex justify-center py-10">
      <Sticker bg="paper" tilt={-1.5} className="max-w-md text-center">
        <div className="font-display font-black text-[22px] tracking-tight">
          NO POOLS YET.
        </div>
        <div className="font-display text-[12px] font-semibold text-ink/65 mt-1">
          Start one. The first contributor is always you.
        </div>
      </Sticker>
    </div>
  );
}
