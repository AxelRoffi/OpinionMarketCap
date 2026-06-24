import { useMemo } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';

const ZERO = '0x0000000000000000000000000000000000000000';

export type MarketStats = {
  /** USDC that flowed through the contract = sum of every answer-history price
   *  (each creation + each flip). */
  totalVolume: number;
  /** Distinct wallets that created or held a take (from answer history). NOT a
   *  full "any interaction" count — pure question-buyers / fee-claimers /
   *  pool-only wallets aren't in answer history. Good proxy, on-chain-cheap. */
  uniqueUsers: number;
  /** Total answer-history entries across all opinions (creations + flips). */
  totalTrades: number;
  isLoading: boolean;
};

/**
 * Accurate market-wide stats. Reads getAnswerHistory for every opinion via a
 * single multicall, then aggregates volume + unique participants. Replaces the
 * old `price × tradeCount` approximation on the homepage.
 */
export function useMarketStats(): MarketStats {
  const { data: nextOpinionId, isLoading: loadingCount } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
  });

  const total = nextOpinionId ? Number(nextOpinionId) - 1 : 0;

  const contracts = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= total; i++) {
      arr.push({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'getAnswerHistory',
        args: [BigInt(i)],
      } as const);
    }
    return arr;
  }, [total]);

  const { data, isLoading: loadingHistory } = useReadContracts({
    contracts,
    query: { enabled: contracts.length > 0, staleTime: 30_000, gcTime: 60_000 },
  });

  const isLoading = loadingCount || (contracts.length > 0 && loadingHistory);

  return useMemo<MarketStats>(() => {
    if (!data) return { totalVolume: 0, uniqueUsers: 0, totalTrades: 0, isLoading };

    const users = new Set<string>();
    let volumeMicro = 0n;
    let trades = 0;

    for (const res of data) {
      if (res.status !== 'success' || !res.result) continue;
      const hist = res.result as readonly { owner: string; price: bigint }[];
      for (const h of hist) {
        trades++;
        volumeMicro += BigInt(h.price);
        const owner = String(h.owner).toLowerCase();
        if (owner !== ZERO) users.add(owner);
      }
    }

    return {
      totalVolume: Number(volumeMicro) / 1_000_000,
      uniqueUsers: users.size,
      totalTrades: trades,
      isLoading,
    };
  }, [data, isLoading]);
}
