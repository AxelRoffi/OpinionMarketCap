'use client';

import { use } from 'react';
import Link from 'next/link';
import { Sticker, Chip, MonoNum, Btn } from '@/components/poster-arcade';
import { TakeCard } from '../../_components/TakeCard';
import { SectionTitle } from '../../_components/SectionTitle';
import { StatStrip, type StatItem } from '../../_components/StatStrip';
import { EarningRow } from '../../_components/EarningRow';
import { fmtUSD, fmtDelta, CAT_MAP, MOCK_TAKES } from '../../_data/mock-takes';
import { getProfileRoom, getBestTakeId } from '../../_data/room';

const CAT_BG = {
  sport:   'canvas',
  crypto:  'cool',
  cinema:  'paper',
  ai:      'pop',
  food:    'paper',
  life:    'canvas',
  music:   'pop',
  founder: 'cool',
} as const;

export default function ProfilePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const room = getProfileRoom(decodeURIComponent(address));
  const bestId = getBestTakeId(room);
  const best = bestId ? room.holding.find((t) => t.id === bestId) ?? null : null;
  const otherHoldings = best ? room.holding.filter((t) => t.id !== best.id) : room.holding;
  const isMe = address === 'me';

  const stats: StatItem[] = [
    { label: 'bag',       value: fmtUSD(room.bag),                tone: 'default', hidden: !room.publicBag && !isMe },
    { label: '7d',        value: fmtDelta(room.delta7d),          tone: room.delta7d >= 0 ? 'gain' : 'loss' },
    { label: 'royalties', value: `+${fmtUSD(room.royalties)}`,    tone: 'gain' },
    { label: 'streak',    value: String(room.streak), glyph: '🔥' },
  ];

  return (
    <>
      {/* ────────────────  BREADCRUMB  ──────────────── */}
      <div className="px-4 md:px-10 pt-4 pb-1">
        <Link
          href="/v2/marketplace"
          className="font-display text-[11px] font-extrabold tracking-[0.12em] uppercase text-ink/60 hover:text-ink"
        >
          ← back to the floor
        </Link>
      </div>

      {/* ────────────────  HEADER  ──────────────── */}
      <section className="px-4 md:px-10 pt-6 pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div
            aria-hidden
            className="inline-flex items-center justify-center h-11 w-11 rounded-pill border-[2.5px] border-ink bg-pop text-paper font-display font-black text-[20px] shadow-[3px_3px_0_var(--ink)]"
          >
            {room.avatar}
          </div>
          <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[36px] md:text-[56px] text-ink truncate">
            @{isMe ? 'you' : room.handle}.
          </h1>
          {isMe && (
            <Chip bg="cool" sm>YOU</Chip>
          )}
        </div>
        <p className="font-display text-[12px] font-semibold text-ink/65 mt-1">
          collector since {room.memberSince}
        </p>
      </section>

      {/* ────────────────  STATS  ──────────────── */}
      <section className="px-4 md:px-10">
        <StatStrip items={stats} />
      </section>

      {/* ────────────────  BEST TAKE  ──────────────── */}
      {best && (
        <section className="px-4 md:px-10 pt-10">
          <SectionTitle meta={<MonoNum>{fmtDelta(best.delta)}</MonoNum>}>
            🏆 BEST TAKE.
          </SectionTitle>
          <BestTakeCard takeId={best.id} />
        </section>
      )}

      {/* ────────────────  STILL HOLDING  ──────────────── */}
      <section className="px-4 md:px-10 pt-10">
        <SectionTitle meta={<><MonoNum>{room.holding.length}</MonoNum> takes</>}>
          🏠 STILL HOLDING
        </SectionTitle>
        {otherHoldings.length === 0 ? (
          <Sticker bg="paper" tilt={-1.5} className="text-center max-w-md mx-auto">
            <div className="font-display font-black text-[18px] tracking-tight">EMPTY ROOM.</div>
            <div className="font-display text-[12px] font-semibold text-ink/65 mt-1">
              No active holdings.
            </div>
          </Sticker>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {otherHoldings.map((take, i) => (
              <TakeCard key={take.id} take={take} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ────────────────  STILL EARNING  ──────────────── */}
      <section className="px-4 md:px-10 pt-12">
        <SectionTitle meta={<MonoNum>{room.earning.length} takes</MonoNum>}>
          💰 STILL EARNING
        </SectionTitle>
        {room.earning.length === 0 ? (
          <Sticker bg="paper" tilt={-1} className="text-center max-w-md mx-auto py-5">
            <div className="font-display font-black text-[16px] tracking-tight">
              NO ROYALTY STREAMS.
            </div>
          </Sticker>
        ) : (
          <div className="space-y-2.5">
            {room.earning.map((rec) => (
              <EarningRow key={rec.takeId} rec={rec} showRoyalty={isMe} />
            ))}
          </div>
        )}
      </section>

      {/* ────────────────  FOOTER (public only — no cash out)  ──────────────── */}
      <section className="px-4 md:px-10 py-12 flex flex-wrap items-center justify-center gap-3">
        {isMe ? (
          <Btn href="/v2/portfolio" variant="pop" size="lg" star>
            go to your room
          </Btn>
        ) : (
          <Btn href="/v2/marketplace" variant="ghost" size="lg">
            browse the floor →
          </Btn>
        )}
      </section>
    </>
  );
}

/**
 * BestTakeCard — larger version of TakeCard used to highlight the profile's
 * most-active holding. Reuses the same data shape as TakeCard but rendered
 * with bigger typography and a deeper shadow.
 */
function BestTakeCard({ takeId }: { takeId: number }) {
  const take = MOCK_TAKES.find((t) => t.id === takeId);
  if (!take) return null;
  const cat = CAT_MAP[take.category];
  const bg = CAT_BG[take.category];
  const chipBg = bg === 'paper' || bg === 'canvas' ? 'ink' : 'paper';
  const isLoss = take.delta < 0;

  return (
    <Link href={`/v2/opinions/${take.id}`} className="block">
      <Sticker bg={bg} tilt={-2} shadow={6} tappable className="p-6 md:p-8 max-w-2xl">
        <div className="flex items-center justify-between">
          <Chip bg={chipBg}>{cat.emoji} {cat.label}</Chip>
          <Chip bg="ink" sm>BEST TAKE</Chip>
        </div>
        <div className="font-display text-[12px] md:text-[13px] font-bold italic opacity-85 mt-3">
          &ldquo;{take.question}&rdquo;
        </div>
        <div className="font-display font-black text-[48px] md:text-[72px] leading-[0.9] tracking-[-0.04em] mt-1">
          {take.answer}.
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <MonoNum className="text-[20px] md:text-[24px]">{fmtUSD(take.price)}</MonoNum>
          <MonoNum className={(isLoss ? 'text-pop' : '') + ' text-[16px]'}>
            {fmtDelta(take.delta)}
          </MonoNum>
        </div>
      </Sticker>
    </Link>
  );
}
