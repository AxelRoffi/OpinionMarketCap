/**
 * Mock /pools data — group-funded takes.
 * Replaced by usePoolDetails / usePaginatedPools wagmi hooks in a later phase.
 */

import { MOCK_TAKES, type CatKey } from './mock-takes';

export type PoolContrib = {
  handle: string;
  avatar: string;
  pledged: number;
};

export type PoolStatus = 'active' | 'filled' | 'expired';

export type Pool = {
  id: number;
  /** Take id this pool targets. */
  targetTakeId: number;
  /** The question being targeted. */
  question: string;
  /** Answer the pool is proposing to swap in. */
  proposedAnswer: string;
  category: CatKey;
  /** Raw on-chain category string from the linked opinion (preferred for display). */
  categoryLabel?: string;
  /** USDC needed to flip the take. */
  target: number;
  /** USDC pledged so far. */
  raised: number;
  /** Pool creator handle (short address or ENS for display). */
  creator: string;
  /** Full 0x address of the pool creator — used for /profile/[address] links. */
  creatorAddress?: string;
  /** Pool deadline (ms). */
  deadlineMs: number;
  contributors: PoolContrib[];
  status: PoolStatus;
};

const day = 24 * 60 * 60 * 1000;
const hour = 60 * 60 * 1000;
const now = Date.now();

function contribs(...rows: [string, string, number][]): PoolContrib[] {
  return rows.map(([handle, avatar, pledged]) => ({ handle, avatar, pledged }));
}

function makePool(opts: {
  id: number;
  takeId: number;
  proposedAnswer: string;
  target: number;
  raised: number;
  creator: string;
  closesIn: number;
  contributors: PoolContrib[];
  status?: PoolStatus;
}): Pool {
  const take = MOCK_TAKES.find((t) => t.id === opts.takeId)!;
  return {
    id: opts.id,
    targetTakeId: opts.takeId,
    question: take.question,
    proposedAnswer: opts.proposedAnswer,
    category: take.category,
    target: opts.target,
    raised: opts.raised,
    creator: opts.creator,
    deadlineMs: now + opts.closesIn,
    contributors: opts.contributors,
    status: opts.status ?? 'active',
  };
}

export const MOCK_POOLS: Pool[] = [
  makePool({
    id: 1,
    takeId: 3,
    proposedAnswer: 'LEBRON',
    target: 280,
    raised: 184,
    creator: 'kc.fan',
    closesIn: 3 * day + 14 * hour,
    contributors: contribs(
      ['kc.fan',       '🏈', 64],
      ['vitalik.eth',  '🧙', 40],
      ['prag.base',    '⚡', 30],
      ['omc.degen',    '🦊', 28],
      ['punk.eth',     '🎧', 12],
      ['cmacis.eth',   '🟢', 10],
    ),
  }),
  makePool({
    id: 2,
    takeId: 11,
    proposedAnswer: 'GPT',
    target: 460,
    raised: 412,
    creator: 'gpu.poor',
    closesIn: 18 * hour,
    contributors: contribs(
      ['gpu.poor',     '🟠', 130],
      ['anth.fan',     '✶',  120],
      ['farcaster.eth','🟣', 80],
      ['velo.base',    '🌀', 50],
      ['you',          '★',  32],
    ),
  }),
  makePool({
    id: 3,
    takeId: 1,
    proposedAnswer: 'OPTIMISM',
    target: 600,
    raised: 88,
    creator: 'opt.degen',
    closesIn: 21 * day + 6 * hour,
    contributors: contribs(
      ['opt.degen',   '🟡', 50],
      ['cmacis.eth',  '🟢', 20],
      ['punk.eth',    '🎧', 18],
    ),
  }),
  makePool({
    id: 4,
    takeId: 16,
    proposedAnswer: 'BRADY DOC',
    target: 60,
    raised: 60,
    creator: 'cannes.eth',
    closesIn: 2 * day,
    contributors: contribs(
      ['cannes.eth', '🎬', 20],
      ['vitalik.eth','🧙', 18],
      ['prag.base',  '⚡', 12],
      ['omc.degen',  '🦊', 10],
    ),
    status: 'filled',
  }),
  makePool({
    id: 5,
    takeId: 22,
    proposedAnswer: 'CHARLI',
    target: 180,
    raised: 92,
    creator: 'brat.fan',
    closesIn: 5 * day + 3 * hour,
    contributors: contribs(
      ['brat.fan',    '💚', 40],
      ['vitalik.eth', '🧙', 28],
      ['punk.eth',    '🎧', 16],
      ['you',         '★',  8],
    ),
  }),
  makePool({
    id: 6,
    takeId: 19,
    proposedAnswer: 'THE 50s',
    target: 220,
    raised: 22,
    creator: 'futurist.eth',
    closesIn: 28 * day,
    contributors: contribs(
      ['futurist.eth', '🛸', 22],
    ),
  }),
];

export const getPool = (id: number) => MOCK_POOLS.find((p) => p.id === id) ?? null;

export const fundingPct = (p: Pool) =>
  Math.min(100, Math.round((p.raised / p.target) * 1000) / 10);
