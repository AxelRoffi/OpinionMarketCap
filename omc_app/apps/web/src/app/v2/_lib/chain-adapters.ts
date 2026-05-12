'use client';

/**
 * Chain → display adapter for the /v2 redesign.
 *
 * Bridges the existing wagmi hooks (which return raw bigint USDC, full 0x
 * addresses, and free-text category strings) to the DisplayTake shape that
 * TakeCard et al. consume. Keeps the visual layer entirely chain-agnostic.
 */

import { useMemo } from 'react';
import { useAllOpinions } from '@/hooks/useAllOpinions';
import type { CatKey } from '../_data/mock-takes';
import type { DisplayTake } from '../_data/mock-takes';

/* ─────────────────────────── Format helpers ─────────────────────────── */

/** USDC has 6 decimals on Base. */
const USDC_DECIMALS = 6n;
const USDC_FACTOR = 10n ** USDC_DECIMALS;

export function usdcToNumber(value: bigint | undefined | null): number {
  if (!value) return 0;
  // 6 decimals — we lose precision past cents, fine for display.
  const whole = value / USDC_FACTOR;
  const frac = value % USDC_FACTOR;
  return Number(whole) + Number(frac) / Number(USDC_FACTOR);
}

export function shortAddress(addr: string | undefined | null): string {
  if (!addr || addr.length < 10) return addr || '—';
  if (addr === '0x0000000000000000000000000000000000000000') return 'vacant';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Chain-category string → Poster Arcade CatKey. Keyword heuristic so any of
 * the 40 on-chain category names maps to one of the 8 visual buckets.
 * Falls back to 'life' for anything unmapped.
 */
export function mapChainCategoryToCat(category: string | undefined): CatKey {
  if (!category) return 'life';
  const c = category.toLowerCase();
  if (/crypto|defi|nft|bitcoin|ethereum|blockchain|chain|web3/.test(c)) return 'crypto';
  if (/\bai\b|artificial|llm|machine learn|ml\b|robot/.test(c)) return 'ai';
  if (/sport|basket|football|soccer|nba|nfl|tennis|golf|olympic|baseball|hockey|fight/.test(c))
    return 'sport';
  if (/cinema|film|movie|tv|series|netflix|hbo|hollywood/.test(c)) return 'cinema';
  if (/music|rap|pop|rock|metal|jazz|album|song|track|artist/.test(c)) return 'music';
  if (/food|pizza|taco|cuisine|restaurant|cook|chef|dish/.test(c)) return 'food';
  if (/founder|startup|vc\b|ceo|founder|entrepreneur|business|company/.test(c)) return 'founder';
  // life / culture / politics / science / generic → 'life'
  return 'life';
}

/* ─────────────────────────── Take adapter ─────────────────────────── */

/** Shape returned by useAllOpinions(). Mirror locally to avoid coupling. */
type ChainOpinion = {
  id: number;
  question: string;
  currentAnswer: string;
  nextPrice: bigint;
  lastPrice: bigint;
  totalVolume: bigint;
  currentAnswerOwner: string;
  questionOwner: string;
  salePrice: bigint;
  isActive: boolean;
  creator: string;
  categories: string[];
  currentAnswerDescription?: string;
  link?: string;
  tradesCount?: number;
};

/**
 * Map a single ChainOpinion → DisplayTake.
 * - price = nextPrice (what a taker pays next)
 * - delta = (nextPrice - lastPrice) / lastPrice — the "take premium",
 *   how much MORE the next holder pays vs current holder. Always
 *   non-negative under V3+ dynamic pricing.
 * - trades = tradesCount (synthesized in useAllOpinions from volume/price)
 * - heldBy = ENS-style display when available, else short address
 * - createdAt unknown without events — placeholder = "ages ago", which
 *   doesn't matter for the current visuals (only used for "New" sort).
 *   Using id as a proxy: lower id = older.
 */
export function toDisplayTake(op: ChainOpinion): DisplayTake {
  const price = usdcToNumber(op.nextPrice);
  const last = usdcToNumber(op.lastPrice);
  const delta = last > 0
    ? ((price - last) / last) * 100
    : 0;
  const chainCat = op.categories[0] ?? '';
  const cat = mapChainCategoryToCat(chainCat);

  return {
    id: op.id,
    category: cat,
    categoryLabel: chainCat || undefined,
    question: op.question,
    answer: (op.currentAnswer || '').toUpperCase() || 'UNANSWERED',
    heldBy: shortAddress(op.currentAnswerOwner),
    ownerAddress: op.currentAnswerOwner,
    price: Math.round(price * 100) / 100,
    delta: Math.round(delta * 10) / 10,
    trades: op.tradesCount ?? 0,
    // Use ID as inverse age proxy — lower id = older. Multiply by a day
    // so /v2/marketplace "New" sort works.
    createdAt: Date.now() - (1000 - op.id) * 24 * 60 * 60 * 1000,
  };
}

/* ─────────────────────────── Hooks ─────────────────────────── */

export type TakesQuery = {
  takes: DisplayTake[];
  /** True while initial chain reads are in flight. */
  isLoading: boolean;
  /** True iff the chain returned no opinions yet. */
  isEmpty: boolean;
  error: Error | null;
  totalOnChain: number;
};

/**
 * Live read of every opinion on chain, mapped to DisplayTake. Filters to
 * active opinions so deactivated ones don't surface on /v2.
 */
export function useTakes(): TakesQuery {
  const { opinions, isLoading, error, totalOpinions } = useAllOpinions();

  const takes = useMemo<DisplayTake[]>(() => {
    if (!opinions || opinions.length === 0) return [];
    return opinions
      .filter((o) => o.isActive)
      .map((o) => toDisplayTake(o as ChainOpinion));
  }, [opinions]);

  return {
    takes,
    isLoading,
    isEmpty: !isLoading && takes.length === 0,
    error: (error as Error | null) ?? null,
    totalOnChain: totalOpinions ?? 0,
  };
}

/**
 * Live read of a single take by id. Returns null until chain data lands
 * (callers should branch on isLoading first).
 */
export function useTake(id: number | null | undefined): {
  take: DisplayTake | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { takes, isLoading, error } = useTakes();
  const take = useMemo(() => {
    if (id == null) return null;
    return takes.find((t) => t.id === id) ?? null;
  }, [takes, id]);
  return { take, isLoading, error };
}
