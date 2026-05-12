/**
 * Mock /v2 room data — backing the portfolio + profile pages.
 * Replaced by wagmi hooks (useUserPositions, useAccumulatedFees) in a later phase.
 */

import { MOCK_TAKES, type MockTake, type CatKey } from './mock-takes';

export type EarningRecord = {
  takeId: number;
  question: string;
  answer: string;
  category: CatKey;
  takenBy: string;
  /** Royalty already paid out to the original creator (USDC). */
  royalty: number;
};

export type RoomData = {
  /** Display handle (e.g. "0xA1F4", "vitalik.eth", "you"). */
  handle: string;
  /** Optional ENS-like avatar emoji. */
  avatar: string;
  /** Total floor value of holdings (USDC). */
  bag: number;
  /** 7-day performance (signed percent). */
  delta7d: number;
  /** Royalties earned and claimable (USDC). */
  royalties: number;
  /** Daily activity streak. */
  streak: number;
  /** Member-since label. */
  memberSince: string;
  /** Current holdings — TakeCard renders these. */
  holding: MockTake[];
  /** Royalty-earning records — past takes minted, now held by others. */
  earning: EarningRecord[];
  /** Show bag publicly? (Portfolio always true; profile is opt-in.) */
  publicBag: boolean;
};

const pickTakes = (ids: number[]): MockTake[] =>
  ids
    .map((id) => MOCK_TAKES.find((t) => t.id === id))
    .filter((t): t is MockTake => Boolean(t));

/** Current user (mock). */
export function getMyRoom(): RoomData {
  return {
    handle: 'you',
    avatar: '★',
    bag: 1247,
    delta7d: 18.4,
    royalties: 214,
    streak: 4,
    memberSince: 'Mar 2026',
    publicBag: true,
    holding: pickTakes([1, 4, 7, 11, 20]),
    earning: [
      buildEarning(8, 'jesse.base', 31.2),
      buildEarning(14, '0xC0FFEE', 8.1),
      buildEarning(22, 'omc.degen', 174.7),
    ],
  };
}

/** Public profile (deterministic mock from address). */
export function getProfileRoom(address: string): RoomData {
  // Special sentinel "me" — same as portfolio but public-shaped.
  if (address === 'me') {
    const mine = getMyRoom();
    return { ...mine, handle: '0xA1F4', avatar: '★' };
  }

  const seed = address.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const ids = MOCK_TAKES
    .map((t) => t.id)
    .filter((id) => (id + seed) % 3 === 0)
    .slice(0, 4);
  const holding = pickTakes(ids.length ? ids : [3, 10]);
  const earning = [
    buildEarning(MOCK_TAKES[(seed + 2) % MOCK_TAKES.length].id, 'farcaster.eth', 12.4),
    buildEarning(MOCK_TAKES[(seed + 5) % MOCK_TAKES.length].id, 'cmacis.eth', 47.6),
  ];
  const bag = holding.reduce((a, t) => a + t.price, 0);

  return {
    handle: address,
    avatar: '★',
    bag,
    delta7d: ((seed % 30) - 10) + (Math.round((seed % 13) * 10) / 10),
    royalties: 50 + (seed % 200),
    streak: (seed % 18) + 1,
    memberSince: 'Jan 2026',
    publicBag: seed % 3 !== 0, // ~2/3 of profiles share their bag
    holding,
    earning,
  };
}

function buildEarning(takeId: number, takenBy: string, royalty: number): EarningRecord {
  const t = MOCK_TAKES.find((x) => x.id === takeId)!;
  return {
    takeId: t.id,
    question: t.question,
    answer: t.answer,
    category: t.category,
    takenBy,
    royalty,
  };
}

/** Identify the holding with the largest absolute delta — "best take". */
export function getBestTakeId(room: RoomData): number | null {
  if (!room.holding.length) return null;
  return room.holding.reduce((best, t) =>
    Math.abs(t.delta) > Math.abs(best.delta) ? t : best,
  ).id;
}
