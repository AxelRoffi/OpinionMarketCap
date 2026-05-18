'use client';

/**
 * Reads the V4 chain's category whitelist (40 entries managed by
 * OpinionExtensions / OpinionAdmin). The /create flow needs the exact
 * chain spellings — submitting anything outside the whitelist reverts.
 */

import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACTS, OPINION_EXTENSIONS_ABI } from '@/lib/contracts';
import { CAT_MAP, type CatKey } from '../_data/mock-takes';
import { mapChainCategoryToCat } from './chain-adapters';

export interface ChainCategoryOption {
  /** Raw chain category string — what we submit on createOpinion. */
  key: string;
  /** Display label (uppercased chain string). */
  label: string;
  /** Emoji from the visual bucket the chain string maps into. */
  emoji: string;
  /** Visual bucket key — used by the preview sticker for colors / background. */
  bucket: CatKey;
}

export function useChainCategories(): {
  categories: ChainCategoryOption[];
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACTS.OPINION_EXTENSIONS,
    abi: OPINION_EXTENSIONS_ABI,
    functionName: 'getAvailableCategories',
    query: { staleTime: 5 * 60_000 }, // 5 min — chain whitelist changes rarely
  });

  const categories = useMemo<ChainCategoryOption[]>(() => {
    const list = (data as readonly string[] | undefined) ?? [];
    return list.map((chainStr) => {
      const bucket = mapChainCategoryToCat(chainStr);
      const meta = CAT_MAP[bucket];
      return {
        key: chainStr,
        label: chainStr.toUpperCase(),
        emoji: meta.emoji,
        bucket,
      };
    });
  }, [data]);

  return {
    categories,
    isLoading,
    error: (error as Error | null) ?? null,
  };
}
