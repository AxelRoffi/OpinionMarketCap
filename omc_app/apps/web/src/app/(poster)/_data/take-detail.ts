/**
 * Deterministic synthesizer for the /opinions/[id] detail page.
 * Generates a stable price history and holder timeline from a take's id.
 * Replaced by usePriceHistory / useAnswerHistory wagmi hooks in a later phase.
 */

import { MOCK_TAKES, type MockTake } from './mock-takes';

export type HolderRecord = {
  /** Short address or ENS-style handle for display. */
  addr: string;
  /** Full 0x address — used for /profile/[address] links. Absent for mock data. */
  ownerAddress?: string;
  /** The answer this holder set when they took the slot. */
  answer?: string;
  price: number;
  /** ISO date. */
  date: string;
};

export type RangeKey = '24h' | '7d' | '30d';

const ADDRS = [
  '0xA1F4',
  'jesse.base',
  'vitalik.eth',
  'prag.base',
  '0xC0FFEE',
  'omc.degen',
  'cmacis.eth',
  'farcaster.eth',
];

/** Pseudo-random in [0,1) — seeded from x. */
function rand01(x: number) {
  const s = Math.sin(x) * 10000;
  return s - Math.floor(s);
}

function generateSeries(take: MockTake, points: number): number[] {
  // Synthesise a stable, drift-with-noise series that lands at the current price.
  const target = take.price;
  // Trace backwards from current price using delta to compute a plausible "before" price.
  const start = target / (1 + take.delta / 100);
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const trend = start + (target - start) * t;
    const noise = (rand01(take.id * 100 + i) - 0.5) * Math.max(start, target) * 0.08;
    out.push(Math.max(1, Math.round((trend + noise) * 100) / 100));
  }
  // Force last point to match current price exactly.
  out[out.length - 1] = target;
  return out;
}

const POINTS: Record<RangeKey, number> = {
  '24h': 24,
  '7d':  28,
  '30d': 30,
};

export function getPriceHistory(take: MockTake, range: RangeKey): number[] {
  return generateSeries(take, POINTS[range]);
}

function generateHolders(take: MockTake): HolderRecord[] {
  const count = 2 + (take.id % 4); // 2–5 past holders
  const out: HolderRecord[] = [];
  const target = take.price;
  const start = target / (1 + take.delta / 100);
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1);
    const price = Math.max(1, Math.round((start + (target - start) * t) * 0.85 * 100) / 100);
    const daysAgo = (count - i) * (3 + (take.id % 4));
    out.push({
      addr: ADDRS[(take.id + i) % ADDRS.length],
      answer: take.answer,
      price,
      date: new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  // Final holder = current owner (take.heldBy).
  out.push({
    addr: take.heldBy,
    answer: take.answer,
    price: take.price,
    date: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
  });
  return out;
}

export function getHolderHistory(take: MockTake): HolderRecord[] {
  return generateHolders(take);
}

export function getRelatedTakes(take: MockTake, max = 6): MockTake[] {
  // Prefer same category; pad with random others. Exclude the take itself.
  const same = MOCK_TAKES.filter((t) => t.category === take.category && t.id !== take.id);
  const others = MOCK_TAKES.filter((t) => t.category !== take.category && t.id !== take.id);
  return [...same, ...others].slice(0, max);
}

/** Bundle the things /opinions/[id] needs into one helper. */
export function getTakeDetail(id: number) {
  const take = MOCK_TAKES.find((t) => t.id === id) ?? null;
  if (!take) return null;
  return {
    take,
    holders: generateHolders(take),
    related: getRelatedTakes(take),
  };
}

export function getNextBidPrice(currentPrice: number, multiplier = 1.15) {
  return Math.ceil(currentPrice * multiplier * 100) / 100;
}

/**
 * Day-since formatter — "2d ago", "3w ago", etc.
 */
export function fmtSinceISO(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (d < 1) return 'today';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}
