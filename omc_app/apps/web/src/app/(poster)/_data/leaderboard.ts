/**
 * Mock /leaderboard rankings — Hall of Takes.
 * Replaced by useLeaderboardData wagmi hook in a later phase.
 */

import { MOCK_TAKES } from './mock-takes';

export type Period = '24h' | 'week' | 'month' | 'all';

export type LeaderboardRow = {
  /** Rank in the current period. */
  rank: number;
  handle: string;
  avatar: string;
  /** Total floor value of all holdings (USDC). */
  bag: number;
  /** Royalty earned in the period (USDC). */
  royalty: number;
  /** Flips (trades) in the period. */
  flips: number;
  /** Daily activity streak. */
  streak: number;
  /** Their highest-mover take — link target for the "best take" column. */
  bestTakeId: number;
  /** Mark the current user. */
  isYou?: boolean;
};

const idOf = (n: number) => MOCK_TAKES[(n - 1) % MOCK_TAKES.length].id;

const BASE: Omit<LeaderboardRow, 'rank' | 'royalty' | 'flips'>[] = [
  { handle: 'vitalik.eth',   avatar: '🧙', bag: 48210, streak: 28, bestTakeId: idOf(3)  },
  { handle: 'jesse.base',    avatar: '🔵', bag: 31420, streak: 21, bestTakeId: idOf(1)  },
  { handle: 'prag.base',     avatar: '⚡', bag: 22860, streak: 15, bestTakeId: idOf(10) },
  { handle: 'cmacis.eth',    avatar: '🟢', bag: 18940, streak: 19, bestTakeId: idOf(9)  },
  { handle: 'farcaster.eth', avatar: '🟣', bag: 12180, streak: 8,  bestTakeId: idOf(6)  },
  { handle: 'kc.fan',        avatar: '🏈', bag: 9320,  streak: 5,  bestTakeId: idOf(14) },
  { handle: 'you',           avatar: '★',  bag: 1247,  streak: 4,  bestTakeId: idOf(11), isYou: true },
  { handle: 'tacos.degen',   avatar: '🌮', bag: 6810,  streak: 11, bestTakeId: idOf(17) },
  { handle: 'punk.eth',      avatar: '🎧', bag: 5240,  streak: 7,  bestTakeId: idOf(21) },
  { handle: 'velo.base',     avatar: '🌀', bag: 4980,  streak: 6,  bestTakeId: idOf(10) },
  { handle: 'cannes.eth',    avatar: '🎬', bag: 3720,  streak: 9,  bestTakeId: idOf(16) },
  { handle: 'brat.fan',      avatar: '💚', bag: 3540,  streak: 12, bestTakeId: idOf(22) },
  { handle: 'omc.degen',     avatar: '🦊', bag: 2880,  streak: 4,  bestTakeId: idOf(7)  },
  { handle: 'futurist.eth',  avatar: '🛸', bag: 2110,  streak: 3,  bestTakeId: idOf(19) },
  { handle: 'angellist.eth', avatar: '👼', bag: 1640,  streak: 2,  bestTakeId: idOf(24) },
];

const PERIOD_MULT: Record<Period, { royalty: number; flips: number }> = {
  '24h':   { royalty: 0.05, flips: 0.10 },
  'week':  { royalty: 0.30, flips: 0.55 },
  'month': { royalty: 1.00, flips: 2.00 },
  'all':   { royalty: 2.40, flips: 5.20 },
};

export function getLeaderboard(period: Period): LeaderboardRow[] {
  const m = PERIOD_MULT[period];
  return BASE
    .map((b) => ({
      ...b,
      royalty: Math.round(b.bag * 0.012 * m.royalty * 100) / 100,
      flips:   Math.max(1, Math.round(b.bag * 0.0085 * m.flips)),
    }))
    .sort((a, b) => (period === '24h' || period === 'week' ? b.flips - a.flips : b.bag - a.bag))
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

/** Convenient totals for the page header meta. */
export function getLeaderboardSummary(rows: LeaderboardRow[]) {
  return {
    traders: rows.length,
    totalVol: rows.reduce((a, r) => a + r.bag, 0),
    totalFlips: rows.reduce((a, r) => a + r.flips, 0),
  };
}
