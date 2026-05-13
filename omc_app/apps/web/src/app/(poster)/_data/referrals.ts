/**
 * Mock /referrals data — invite loop dashboard.
 * Replaced by useReferral wagmi hook in a later phase.
 */

import { MOCK_TAKES } from './mock-takes';

export type ReferralActivity = {
  /** What they did. */
  kind: 'mint' | 'flip';
  /** When (ISO date). */
  date: string;
  /** Take id this activity references. */
  takeId: number;
  /** Royalty earned by you on this activity. */
  earnedByYou: number;
};

export type ReferralFriend = {
  handle: string;
  avatar: string;
  joinedISO: string;
  activity: ReferralActivity[];
  totalEarnedByYou: number;
};

export type ReferralData = {
  link: string;
  shortCode: string;
  /** People you've invited (link clicks). */
  invited: number;
  /** People who joined (signed up via the link). */
  joined: number;
  /** Lifetime earnings from the program (USDC). */
  earnings: number;
  /** Friends list with their activity. */
  friends: ReferralFriend[];
};

const t = (n: number) => MOCK_TAKES[(n - 1) % MOCK_TAKES.length].id;
const day = 24 * 60 * 60 * 1000;
const now = Date.now();
const iso = (d: number) => new Date(now - d * day).toISOString();

export function getReferralData(): ReferralData {
  const friends: ReferralFriend[] = [
    {
      handle: 'jesse.base',
      avatar: '🔵',
      joinedISO: iso(28),
      totalEarnedByYou: 41.20,
      activity: [
        { kind: 'mint', date: iso(28), takeId: t(1),  earnedByYou: 12.40 },
        { kind: 'flip', date: iso(18), takeId: t(1),  earnedByYou: 9.80  },
        { kind: 'flip', date: iso(4),  takeId: t(10), earnedByYou: 19.00 },
      ],
    },
    {
      handle: 'prag.base',
      avatar: '⚡',
      joinedISO: iso(14),
      totalEarnedByYou: 27.10,
      activity: [
        { kind: 'mint', date: iso(14), takeId: t(10), earnedByYou: 8.20  },
        { kind: 'flip', date: iso(7),  takeId: t(11), earnedByYou: 18.90 },
      ],
    },
    {
      handle: 'tacos.degen',
      avatar: '🌮',
      joinedISO: iso(9),
      totalEarnedByYou: 6.80,
      activity: [
        { kind: 'mint', date: iso(9), takeId: t(17), earnedByYou: 6.80 },
      ],
    },
    {
      handle: 'omc.degen',
      avatar: '🦊',
      joinedISO: iso(2),
      totalEarnedByYou: 0,
      activity: [],
    },
  ];

  return {
    link: 'https://opinionmarketcap.xyz/r/0xA1F4',
    shortCode: '0xA1F4',
    invited: 12,
    joined: friends.length,
    earnings: friends.reduce((a, f) => a + f.totalEarnedByYou, 0),
    friends,
  };
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
