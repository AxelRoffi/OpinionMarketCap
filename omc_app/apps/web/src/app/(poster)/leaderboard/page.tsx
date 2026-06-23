'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import {
  Sticker,
  Chip,
  MonoNum,
  Tabs,
  type Tab,
} from '@/components/poster-arcade';
import { SectionTitle } from '../_components/SectionTitle';
import { takeHref } from '../_lib/slug';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { useTakes, shortAddress } from '../_lib/chain-adapters';
import type { DisplayTake } from '../_data/mock-takes';
import { fmtUSD } from '../_data/mock-takes';

/**
 * UI row shape — independent of the chain hook so the page rendering stays
 * stable while the data source evolves.
 */
type LeaderboardRow = {
  rank: number;
  handle: string;        // shortened address (ENS support later)
  fullAddress: string;   // for profile links
  avatar: string;        // deterministic emoji from address
  bag: number;           // TVL (current portfolio value)
  royalty: number;       // total earnings (creator + trading fees)
  flips: number;         // tradesCount
  streak: number | null; // null = no on-chain source yet
  bestTakeId: number | null;
  isYou: boolean;
};

type Period = '24h' | 'week' | 'month' | 'all';

const PERIODS: Tab<Period>[] = [
  { value: '24h',   label: '24H' },
  { value: 'week',  label: 'WEEK' },
  { value: 'month', label: 'MONTH' },
  { value: 'all',   label: 'ALL' },
];

const PODIUM_BG = ['pop', 'cool', 'canvas'] as const;
const PODIUM_TILT = [-2.5, 1.5, -1.5] as const;
const PODIUM_MEDAL = ['🥇', '🥈', '🥉'];

// Deterministic avatar emoji from address — same address always yields same emoji.
const AVATAR_POOL = ['🧙', '🔵', '⚡', '🟢', '🟣', '🏈', '🌮', '🎧', '🚀', '🦄', '👑', '🦊', '🐺', '🐻', '🦁', '🐯'];
function avatarFor(address: string): string {
  let hash = 0;
  for (let i = 2; i < Math.min(address.length, 10); i++) {
    hash = (hash * 31 + address.charCodeAt(i)) >>> 0;
  }
  return AVATAR_POOL[hash % AVATAR_POOL.length];
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('all');
  const { address: connectedAddress } = useAccount();

  // Chain leaderboard — all-time data. Period tabs are decorative for now;
  // 24h/week/month filtering requires event-log scanning which we don't have.
  const { users, stats, isLoading } = useLeaderboardData();
  const { takes } = useTakes();

  // Map each user to their best take (highest current price among opinions they own).
  const bestTakeByOwner = useMemo(() => {
    const map = new Map<string, DisplayTake>();
    for (const t of takes) {
      const owner = (t.ownerAddress || '').toLowerCase();
      if (!owner || owner === '0x0000000000000000000000000000000000000000') continue;
      const existing = map.get(owner);
      if (!existing || t.price > existing.price) {
        map.set(owner, t);
      }
    }
    return map;
  }, [takes]);

  const rows = useMemo<LeaderboardRow[]>(() => {
    const me = connectedAddress?.toLowerCase();
    return users.map((u) => {
      const lower = u.address.toLowerCase();
      const best = bestTakeByOwner.get(lower) ?? null;
      return {
        rank: u.rank,
        handle: shortAddress(u.address),
        fullAddress: u.address,
        avatar: avatarFor(u.address),
        bag: u.tvl,
        royalty: u.totalEarnings,
        flips: u.tradesCount,
        streak: null,            // not on-chain yet
        bestTakeId: best?.id ?? null,
        isYou: lower === me,
      };
    });
  }, [users, bestTakeByOwner, connectedAddress]);

  const takesById = useMemo(() => {
    const m = new Map<number, DisplayTake>();
    takes.forEach((t) => m.set(t.id, t));
    return m;
  }, [takes]);

  const summary = useMemo(
    () => ({
      traders: stats.totalUsers,
      totalVol: stats.totalVolume,
      totalFlips: stats.totalTrades,
    }),
    [stats],
  );

  const podium = rows.slice(0, 3);
  const table = rows.slice(3);
  const youRow = rows.find((r) => r.isYou);
  const youInPodium = podium.some((r) => r.isYou);
  const youAtBottom = youRow && !youInPodium && !table.some((r) => r.isYou);

  return (
    <>
      {/* ────────────────  HEADER  ──────────────── */}
      <section className="px-4 md:px-10 pt-8 md:pt-12 pb-4">
        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/70">
          ★ loudest minds
        </p>
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[48px] md:text-[64px] text-ink mt-1">
          HALL OF TAKES.
        </h1>
        <p className="font-display font-semibold text-[13px] md:text-[14px] text-ink/70 mt-1">
          who&apos;s holding the floor.
        </p>
      </section>

      {/* ────────────────  PERIOD + SUMMARY  ──────────────── */}
      <section className="px-4 md:px-10 flex flex-wrap items-center justify-between gap-3 pb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Tabs<Period> tabs={PERIODS} value={period} onChange={setPeriod} />
          <span className="font-display text-[9px] font-extrabold tracking-[0.14em] uppercase text-ink/50">
            · showing all-time
          </span>
        </div>
        <div className="font-mono font-extrabold text-[11px] md:text-[12px] text-ink/70">
          <MonoNum>{summary.traders}</MonoNum> traders · <MonoNum>{fmtUSD(summary.totalVol)}</MonoNum> vol · <MonoNum>{summary.totalFlips}</MonoNum> flips
        </div>
      </section>

      {/* ────────────────  EMPTY / LOADING  ──────────────── */}
      {(isLoading || rows.length === 0) && (
        <section className="px-4 md:px-10 pb-16">
          <div className="bg-paper border-[2.5px] border-ink rounded-sticker shadow-[5px_5px_0_var(--ink)] p-6 text-center">
            <div className="font-display font-black text-[16px] tracking-tight">
              {isLoading ? 'LOADING THE HALL…' : 'NO TAKES TO RANK YET.'}
            </div>
            <p className="font-display text-[12px] font-semibold text-ink/65 mt-1">
              {isLoading
                ? 'pulling chain data…'
                : 'be first — mint a take and your address shows up here.'}
            </p>
          </div>
        </section>
      )}

      {/* ────────────────  PODIUM  ──────────────── */}
      {!isLoading && podium.length > 0 && (
        <section className="px-4 md:px-10">
          <SectionTitle>🏆 PODIUM.</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {podium.map((row, i) => (
              <PodiumCard key={row.fullAddress} row={row} place={i} takesById={takesById} />
            ))}
          </div>
        </section>
      )}

      {/* ────────────────  TABLE  ──────────────── */}
      {!isLoading && rows.length > 0 && (
        <section className="px-4 md:px-10 pt-10 pb-16">
          <SectionTitle meta={<><MonoNum>{table.length + (youAtBottom ? 1 : 0)}</MonoNum> ranked</>}>
            🪜 RANKED.
          </SectionTitle>

          <div className="bg-paper border-[2.5px] border-ink rounded-sticker shadow-[5px_5px_0_var(--ink)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-ink text-canvas">
                    <Th className="w-[60px] text-left">#</Th>
                    <Th className="text-left">trader</Th>
                    <Th>best take</Th>
                    <Th>bag</Th>
                    <Th>royalty</Th>
                    <Th>flips</Th>
                    <Th>streak</Th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((row, i) => (
                    <Row key={row.fullAddress} row={row} striped={i % 2 === 1} takesById={takesById} />
                  ))}
                  {youAtBottom && youRow && (
                    <Row row={youRow} striped={false} takesById={takesById} />
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/* ─────────────────────────── PODIUM ─────────────────────────── */

function PodiumCard({
  row,
  place,
  takesById,
}: {
  row: LeaderboardRow;
  place: number;
  takesById: Map<number, DisplayTake>;
}) {
  const take = row.bestTakeId != null ? takesById.get(row.bestTakeId) : undefined;
  return (
    <Sticker
      bg={PODIUM_BG[place]}
      tilt={PODIUM_TILT[place]}
      shadow={6}
      className="p-5 md:p-6"
    >
      <div className="flex items-center justify-between">
        <Chip bg={PODIUM_BG[place] === 'pop' || PODIUM_BG[place] === 'cool' ? 'paper' : 'ink'} sm>
          #{row.rank}
        </Chip>
        <span className="text-[28px] md:text-[36px] leading-none">{PODIUM_MEDAL[place]}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span aria-hidden className="text-[24px]">{row.avatar}</span>
        <Link
          href={`/profile/${row.fullAddress}`}
          className="font-display font-black text-[20px] md:text-[24px] tracking-tight truncate hover:underline"
        >
          @{row.handle}
        </Link>
        {row.isYou && <Chip bg="ink" sm>YOU</Chip>}
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <div className="font-display text-[9px] font-extrabold tracking-[0.14em] uppercase opacity-70">
          bag
        </div>
        <MonoNum className="text-[28px] md:text-[32px]">{fmtUSD(row.bag)}</MonoNum>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Mini label="royalty" value={`+${fmtUSD(row.royalty)}`} />
        <Mini label="flips"   value={String(row.flips)} />
        <Mini label="streak"  value={row.streak == null ? '—' : `${row.streak}🔥`} />
      </div>
      {take && (
        <Link
          href={takeHref(take.id, take.question)}
          className="block mt-4 border-t-2 border-dashed border-ink/40 pt-3 hover:opacity-80"
        >
          <div className="font-display text-[9px] font-extrabold tracking-[0.14em] uppercase opacity-70">
            best take
          </div>
          <div className="font-display font-black text-[15px] tracking-tight mt-0.5 truncate">
            {take.answer}
          </div>
        </Link>
      )}
    </Sticker>
  );
}

/* ─────────────────────────── TABLE ROW ─────────────────────────── */

function Row({
  row,
  striped,
  takesById,
}: {
  row: LeaderboardRow;
  striped: boolean;
  takesById: Map<number, DisplayTake>;
}) {
  const take = row.bestTakeId != null ? takesById.get(row.bestTakeId) : undefined;
  return (
    <tr
      className={
        (row.isYou ? 'bg-canvas' : striped ? 'bg-paper' : 'bg-paper/70') +
        ' border-t-2 border-ink/15'
      }
    >
      <Td className="text-left">
        <MonoNum className="text-[14px]">#{row.rank}</MonoNum>
      </Td>
      <Td className="text-left">
        <Link
          href={`/profile/${row.fullAddress}`}
          className="inline-flex items-center gap-2 hover:underline"
        >
          <span aria-hidden className="text-[18px]">{row.avatar}</span>
          <span className="font-display font-extrabold text-[13px] truncate">
            @{row.handle}
          </span>
          {row.isYou && (
            <span className="inline-block bg-pop text-paper border-2 border-ink rounded-pill px-1.5 py-[1px] font-display text-[9px] tracking-[0.08em]">
              YOU
            </span>
          )}
        </Link>
      </Td>
      <Td>
        {take ? (
          <Link
            href={takeHref(take.id, take.question)}
            className="font-display font-extrabold text-[12px] hover:underline tracking-tight"
          >
            {take.answer}
          </Link>
        ) : (
          <span className="text-ink/40">—</span>
        )}
      </Td>
      <Td><MonoNum className="text-[13px]">{fmtUSD(row.bag)}</MonoNum></Td>
      <Td><MonoNum className="text-[13px] text-gain">+{fmtUSD(row.royalty)}</MonoNum></Td>
      <Td><MonoNum className="text-[13px]">{row.flips}</MonoNum></Td>
      <Td><MonoNum className="text-[13px] text-ink/50">{row.streak == null ? '—' : `${row.streak}🔥`}</MonoNum></Td>
    </tr>
  );
}

/* ─────────────────────────── primitives ─────────────────────────── */

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={
        'font-display text-[10px] font-extrabold tracking-[0.14em] uppercase px-3 py-2.5 text-right ' +
        (className ?? '')
      }
    >
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td
      className={
        'px-3 py-2.5 text-right ' + (className ?? '')
      }
    >
      {children}
    </td>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-[8px] font-extrabold tracking-[0.14em] uppercase opacity-65">
        {label}
      </div>
      <MonoNum className="text-[12px] block">{value}</MonoNum>
    </div>
  );
}
