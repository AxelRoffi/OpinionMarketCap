'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import {
  Sticker,
  Chip,
  MonoNum,
  Btn,
  WalletBtn,
  Wobble,
} from '@/components/poster-arcade';
import { TakeCard } from '../../_components/TakeCard';
import { takeHref } from '../../_lib/slug';
import { SectionTitle } from '../../_components/SectionTitle';
import { StatStrip, type StatItem } from '../../_components/StatStrip';
import { EarningRow } from '../../_components/EarningRow';
import { fmtUSD, fmtDelta, CAT_MAP, MOCK_TAKES, type DisplayTake } from '../../_data/mock-takes';
import { getProfileRoom, getBestTakeId } from '../../_data/room';
import { useUserRoom } from '../../_lib/use-user-room';
import { shortAddress } from '../../_lib/chain-adapters';

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
  const decoded = decodeURIComponent(address);
  const isMe = decoded === 'me';

  // Chain attempt first; fall back to deterministic mock for ENS-style handles.
  const { room: chainRoom, isLoading, resolvedAddress, isHandleOnly } =
    useUserRoom(decoded);
  const fallbackRoom = useMemo(() => getProfileRoom(decoded), [decoded]);
  const room = chainRoom ?? (isHandleOnly ? fallbackRoom : null);

  // "me" sentinel + not connected → connect prompt.
  if (isMe && !resolvedAddress && !isLoading) {
    return (
      <>
        <Header handle="you" memberSince="—" isMe avatar="★" />
        <section className="px-4 md:px-10 pb-16">
          <div className="flex justify-center py-12">
            <Sticker bg="paper" tilt={-1.5} className="max-w-md text-center">
              <div className="font-display font-black text-[22px] tracking-tight">
                CONNECT TO SEE YOURSELF.
              </div>
              <div className="font-display text-[12px] font-semibold text-ink/65 mt-1">
                Connect a wallet on Base to see your public profile.
              </div>
              <div className="mt-5 flex justify-center">
                <WalletBtn size="md" />
              </div>
            </Sticker>
          </div>
        </section>
      </>
    );
  }

  if (isLoading && !room) {
    return (
      <div className="flex justify-center py-24">
        <Wobble>loading profile…</Wobble>
      </div>
    );
  }

  if (!room) {
    // Address-shaped but no chain data yet AND no fallback (looksLikeAddress
    // skipped the mock path). Bring up the empty room sticker instead of 404.
    return (
      <>
        <Header
          handle={shortAddress(decoded)}
          memberSince="—"
          isMe={false}
          avatar="★"
        />
        <section className="px-4 md:px-10 pb-16">
          <div className="flex justify-center py-12">
            <Sticker bg="paper" tilt={-1.5} className="max-w-md text-center">
              <div className="font-display font-black text-[22px] tracking-tight">
                EMPTY ROOM.
              </div>
              <div className="font-display text-[12px] font-semibold text-ink/65 mt-1">
                This wallet hasn&apos;t held any takes yet.
              </div>
            </Sticker>
          </div>
        </section>
      </>
    );
  }

  const bestId = getBestTakeId(room);
  const best = bestId ? room.holding.find((t) => t.id === bestId) ?? null : null;
  const otherHoldings = best ? room.holding.filter((t) => t.id !== best.id) : room.holding;

  const displayHandle = isMe
    ? 'you'
    : resolvedAddress
      ? shortAddress(resolvedAddress)
      : room.handle;

  const stats: StatItem[] = [
    { label: 'bag',       value: fmtUSD(room.bag),                tone: 'default', hidden: !room.publicBag && !isMe },
    { label: '7d',        value: fmtDelta(room.delta7d),          tone: room.delta7d >= 0 ? 'gain' : 'loss' },
    { label: 'royalties', value: `+${fmtUSD(room.royalties)}`,    tone: 'gain' },
    { label: 'streak',    value: room.streak ? String(room.streak) : '—', glyph: room.streak ? '🔥' : undefined },
  ];

  return (
    <>
      <div className="px-4 md:px-10 pt-4 pb-1">
        <Link
          href="/marketplace"
          className="font-display text-[11px] font-extrabold tracking-[0.12em] uppercase text-ink/60 hover:text-ink"
        >
          ← back to the floor
        </Link>
      </div>

      <Header
        handle={displayHandle}
        memberSince={room.memberSince}
        isMe={isMe}
        avatar={room.avatar}
      />

      <section className="px-4 md:px-10">
        <StatStrip items={stats} />
      </section>

      {best && (
        <section className="px-4 md:px-10 pt-10">
          <SectionTitle meta={<MonoNum>{fmtDelta(best.delta)}</MonoNum>}>
            🏆 BEST TAKE.
          </SectionTitle>
          <BestTakeCard take={best} />
        </section>
      )}

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

      <section className="px-4 md:px-10 py-12 flex flex-wrap items-center justify-center gap-3">
        {isMe ? (
          <Btn href="/portfolio" variant="pop" size="lg" star>
            go to your room
          </Btn>
        ) : (
          <Btn href="/marketplace" variant="ghost" size="lg">
            browse the floor →
          </Btn>
        )}
      </section>
    </>
  );
}

function Header({
  handle,
  memberSince,
  isMe,
  avatar,
}: {
  handle: string;
  memberSince: string;
  isMe: boolean;
  avatar: string;
}) {
  return (
    <section className="px-4 md:px-10 pt-6 pb-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div
          aria-hidden
          className="inline-flex items-center justify-center h-11 w-11 rounded-pill border-[2.5px] border-ink bg-pop text-paper font-display font-black text-[20px] shadow-[3px_3px_0_var(--ink)]"
        >
          {avatar}
        </div>
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[36px] md:text-[56px] text-ink truncate font-mono">
          @{handle}.
        </h1>
        {isMe && <Chip bg="cool" sm>YOU</Chip>}
      </div>
      <p className="font-display text-[12px] font-semibold text-ink/65 mt-1">
        collector {memberSince === '—' ? '· on Base' : `since ${memberSince}`}
      </p>
    </section>
  );
}

/**
 * BestTakeCard — larger version of TakeCard used to highlight the profile's
 * most-active holding. Accepts a DisplayTake directly (chain or mock).
 */
function BestTakeCard({ take }: { take: DisplayTake }) {
  // Some takes may have been adapted from chain — they have categoryLabel set.
  // Mock takes use only category. Fall back to MOCK_TAKES lookup for any older
  // ref (defensive — both paths now pass full DisplayTake).
  const real = MOCK_TAKES.find((t) => t.id === take.id) ?? take;
  const cat = CAT_MAP[real.category];
  const bg = CAT_BG[real.category];
  const chipBg = bg === 'paper' || bg === 'canvas' ? 'ink' : 'paper';
  const isLoss = real.delta < 0;

  return (
    <Link href={takeHref(real.id, real.question)} className="block">
      <Sticker bg={bg} tilt={-2} shadow={6} tappable className="p-6 md:p-8 max-w-2xl">
        <div className="flex items-center justify-between">
          <Chip bg={chipBg}>{cat.emoji} {(real.categoryLabel ?? cat.label).toUpperCase()}</Chip>
          <Chip bg="ink" sm>BEST TAKE</Chip>
        </div>
        <div className="font-display text-[12px] md:text-[13px] font-bold italic opacity-85 mt-3">
          &ldquo;{real.question}&rdquo;
        </div>
        <div className="font-display font-black text-[48px] md:text-[72px] leading-[0.9] tracking-[-0.04em] mt-1">
          {real.answer}.
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <MonoNum className="text-[20px] md:text-[24px]">{fmtUSD(real.price)}</MonoNum>
          <MonoNum className={(isLoss ? 'text-pop' : '') + ' text-[16px]'}>
            {fmtDelta(real.delta)}
          </MonoNum>
        </div>
      </Sticker>
    </Link>
  );
}
