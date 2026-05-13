/**
 * Mock takes for /v2 visual smoke tests.
 * Replaced by on-chain data (useAllOpinions / usePaginatedOpinions) in a later phase.
 */

export type CatKey =
  | 'sport' | 'crypto' | 'cinema' | 'ai' | 'food' | 'life' | 'music' | 'founder';

export type CatMeta = { key: CatKey; emoji: string; label: string };

export const CATEGORIES: CatMeta[] = [
  { key: 'sport',   emoji: '🏀', label: 'SPORTS' },
  { key: 'crypto',  emoji: '⚡', label: 'CRYPTO' },
  { key: 'cinema',  emoji: '🎬', label: 'CINEMA' },
  { key: 'ai',      emoji: '🤖', label: 'AI' },
  { key: 'food',    emoji: '🍕', label: 'FOOD' },
  { key: 'life',    emoji: '🌍', label: 'LIFE' },
  { key: 'music',   emoji: '🎵', label: 'MUSIC' },
  { key: 'founder', emoji: '🚀', label: 'FOUNDERS' },
];

export const CAT_MAP: Record<CatKey, CatMeta> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c]),
) as Record<CatKey, CatMeta>;

/**
 * DisplayTake — what every /v2 component renders. The chain adapter
 * (apps/web/src/app/v2/_lib/chain-adapters.ts) maps OpinionData → DisplayTake
 * so the visual layer is chain-agnostic. The mock data below also produces
 * this shape, used as fallback when the chain has no opinions yet (or in dev
 * when wallet isn't connected to Base).
 */
export type DisplayTake = {
  id: number;
  category: CatKey;
  /** Optional raw chain category label, preserved for full-fidelity display. */
  categoryLabel?: string;
  question: string;
  answer: string;
  heldBy: string;
  /** Optional full 0x address backing `heldBy` (the chain-adapter sets this). */
  ownerAddress?: string;
  /** Optional full 0x address of the original creator (the chain-adapter sets this). */
  creatorAddress?: string;
  /** USDC price as plain number for sorting. Display via formatter. */
  price: number;
  /** Percent change. Signed (negative = loss). */
  delta: number;
  /** Trade count — used by 'Hot' sort. */
  trades: number;
  /** Created timestamp (ms) — used by 'New' sort. */
  createdAt: number;
};

/** @deprecated — use DisplayTake. Kept for one phase to avoid a breaking rename. */
export type MockTake = DisplayTake;

const day = 24 * 60 * 60 * 1000;
const now = Date.now();

export const MOCK_TAKES: DisplayTake[] = [
  { id: 1,  category: 'crypto',  question: 'Best L2 in 2026?',        answer: 'BASE',       heldBy: 'jesse.base',    price: 312,  delta:  9.6,  trades: 184, createdAt: now - 2  * day },
  { id: 2,  category: 'ai',      question: 'AGI by 2030?',            answer: 'PARTIALLY',  heldBy: '0xA1',          price:  64,  delta: 34.2,  trades: 412, createdAt: now - 4  * day },
  { id: 3,  category: 'sport',   question: 'GOAT basketball?',        answer: 'JORDAN',     heldBy: 'vitalik.eth',   price: 142,  delta: 18.0,  trades: 96,  createdAt: now - 7  * day },
  { id: 4,  category: 'cinema',  question: 'Best Pixar movie?',       answer: 'WALL·E',     heldBy: 'prag.base',     price:  28,  delta: 22.4,  trades: 51,  createdAt: now - 1  * day },
  { id: 5,  category: 'food',    question: 'Best NYC pizza slice?',   answer: "JOE'S",      heldBy: '0xC0FFEE',      price:  10,  delta:  8.1,  trades: 22,  createdAt: now - 3  * day },
  { id: 6,  category: 'founder', question: 'Best modern founder?',    answer: 'JOBS',       heldBy: 'farcaster.eth', price:  78,  delta: -2.0,  trades: 18,  createdAt: now - 9  * day },
  { id: 7,  category: 'life',    question: 'Best city at 30?',        answer: 'LISBON',     heldBy: 'omc.degen',     price: 142,  delta: 18.4,  trades: 64,  createdAt: now - 5  * day },
  { id: 8,  category: 'music',   question: 'GOAT album?',             answer: 'OK COMP',    heldBy: 'radiohead.fan', price:  96,  delta:  6.2,  trades: 30,  createdAt: now - 6  * day },

  { id: 9,  category: 'crypto',  question: 'ETH ATH by EOY?',         answer: '$5K',        heldBy: 'cmacis.eth',    price:  44,  delta: 12.7,  trades: 76,  createdAt: now - 1  * day },
  { id: 10, category: 'crypto',  question: 'Best DEX on Base?',       answer: 'AERODROME',  heldBy: 'velo.base',     price:  88,  delta:  4.4,  trades: 41,  createdAt: now - 8  * day },
  { id: 11, category: 'ai',      question: 'Best coding LLM?',        answer: 'CLAUDE',     heldBy: 'anth.fan',      price: 220,  delta: 41.0,  trades: 290, createdAt: now - 0.5* day },
  { id: 12, category: 'ai',      question: 'Open source > closed?',   answer: 'EVENTUALLY', heldBy: 'gpu.poor',      price:  32,  delta: -7.2,  trades: 15,  createdAt: now - 11 * day },

  { id: 13, category: 'sport',   question: 'Champions League 26?',    answer: 'REAL',       heldBy: 'madrid.eth',    price:  56,  delta:  3.1,  trades: 38,  createdAt: now - 2.5* day },
  { id: 14, category: 'sport',   question: 'Super Bowl LX?',          answer: 'CHIEFS',     heldBy: 'kc.fan',        price:  72,  delta: -4.5,  trades: 47,  createdAt: now - 4.5* day },

  { id: 15, category: 'cinema',  question: 'Best Nolan movie?',       answer: 'INTERSTELLAR', heldBy: '0xCINEPHILE', price:  60,  delta: 15.3,  trades: 33,  createdAt: now - 3.5* day },
  { id: 16, category: 'cinema',  question: 'Oscar Best Picture 26?',  answer: 'ANORA II',   heldBy: 'cannes.eth',    price:  18,  delta: 28.0,  trades: 52,  createdAt: now - 0.7* day },

  { id: 17, category: 'food',    question: 'Best taco city?',         answer: 'CDMX',       heldBy: 'tacos.degen',   price:  22,  delta:  6.8,  trades: 19,  createdAt: now - 6  * day },
  { id: 18, category: 'food',    question: 'Sushi or omakase?',       answer: 'OMAKASE',    heldBy: 'nakajima.fan',  price:  41,  delta: -1.2,  trades: 11,  createdAt: now - 9.5* day },

  { id: 19, category: 'life',    question: 'Best decade to live?',    answer: 'NOW',        heldBy: 'futurist.eth',  price: 105,  delta:  5.5,  trades: 28,  createdAt: now - 7.5* day },
  { id: 20, category: 'life',    question: '4-day work week?',        answer: 'INEVITABLE', heldBy: 'wlb.dao',       price:  37,  delta: 11.9,  trades: 24,  createdAt: now - 1.2* day },

  { id: 21, category: 'music',   question: 'Best Daft Punk track?',   answer: 'AROUND',     heldBy: 'punk.eth',      price:  29,  delta:  2.3,  trades: 9,   createdAt: now - 10 * day },
  { id: 22, category: 'music',   question: 'Pop GOAT 2026?',          answer: 'CHARLI',     heldBy: 'brat.fan',      price:  84,  delta: 31.4,  trades: 67,  createdAt: now - 0.3* day },

  { id: 23, category: 'founder', question: 'Best B2B founder?',       answer: 'COLLISON',   heldBy: 'stripe.fan',    price:  55,  delta:  7.8,  trades: 14,  createdAt: now - 5.5* day },
  { id: 24, category: 'founder', question: 'Most underrated VC?',     answer: 'NAVAL',      heldBy: 'angellist.eth', price:  93,  delta: -3.6,  trades: 21,  createdAt: now - 8.5* day },
];

// Convenience helpers used by mocked pages.
export const fmtUSD = (n: number) => `$${n.toLocaleString('en-US')}`;
export const fmtDelta = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
