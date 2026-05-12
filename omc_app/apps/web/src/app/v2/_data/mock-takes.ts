/**
 * Mock takes for the /v2 visual smoke test.
 * Will be replaced by on-chain data from useAllOpinions / usePaginatedOpinions
 * once the new pages are wired to wagmi hooks in a later phase.
 */

export type CatKey =
  | 'sport' | 'crypto' | 'cinema' | 'ai' | 'food' | 'life' | 'music' | 'founder';

export type MockTake = {
  id: number;
  category: { key: CatKey; emoji: string; label: string };
  question: string;
  answer: string;
  heldBy: string;
  price: string;
  delta: string;
  /** Background — picked deterministically by index in the grid. */
  bg?: 'pop' | 'cool' | 'canvas' | 'paper';
  tilt?: number;
};

export const MOCK_TAKES: MockTake[] = [
  {
    id: 1,
    category: { key: 'crypto', emoji: '⚡', label: 'CRYPTO' },
    question: 'Best L2 in 2026?',
    answer: 'BASE',
    heldBy: 'jesse.base',
    price: '$312',
    delta: '+9.6%',
  },
  {
    id: 2,
    category: { key: 'ai', emoji: '🤖', label: 'AI' },
    question: 'AGI by 2030?',
    answer: 'PARTIALLY',
    heldBy: '0xA1',
    price: '$64',
    delta: '+34%',
  },
  {
    id: 3,
    category: { key: 'sport', emoji: '🏀', label: 'SPORTS' },
    question: 'GOAT basketball?',
    answer: 'JORDAN',
    heldBy: 'vitalik.eth',
    price: '$142',
    delta: '+18%',
  },
  {
    id: 4,
    category: { key: 'cinema', emoji: '🎬', label: 'CINEMA' },
    question: 'Best Pixar?',
    answer: 'WALL·E',
    heldBy: 'prag.base',
    price: '$28',
    delta: '+22%',
  },
  {
    id: 5,
    category: { key: 'food', emoji: '🍕', label: 'FOOD' },
    question: 'Best NYC slice?',
    answer: 'JOE\'S',
    heldBy: '0xC0FFEE',
    price: '$10',
    delta: '+8%',
  },
  {
    id: 6,
    category: { key: 'founder', emoji: '🚀', label: 'FOUNDERS' },
    question: 'Best modern founder?',
    answer: 'JOBS',
    heldBy: 'farcaster.eth',
    price: '$78',
    delta: '-2%',
  },
  {
    id: 7,
    category: { key: 'life', emoji: '🌍', label: 'LIFE' },
    question: 'Best city at 30?',
    answer: 'LISBON',
    heldBy: 'omc.degen',
    price: '$142',
    delta: '+18%',
  },
  {
    id: 8,
    category: { key: 'music', emoji: '🎵', label: 'MUSIC' },
    question: 'GOAT album?',
    answer: 'OK COMP',
    heldBy: 'radiohead.fan',
    price: '$96',
    delta: '+6%',
  },
];
