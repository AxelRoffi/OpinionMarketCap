import { useMemo } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';

const ZERO = '0x0000000000000000000000000000000000000000';
const DAY = 86_400;
/** Creator royalty rate charged on every flip (3%). Source: FeeManager. */
const CREATOR_FEE_BPS = 300n;

export type MarketStats = {
  /** USDC that flowed through the contract = sum of every answer-history price. */
  totalVolume: number;
  /** Distinct wallets that created or held a take (from answer history). */
  uniqueUsers: number;
  /** Total answer-history entries across all opinions (creations + flips). */
  totalTrades: number;
  /** Volume in the last 24h (by answer-history timestamp). */
  volume24h: number;
  /** Creator royalties distributed = 3% of every flip (creations excluded). */
  royaltiesPaid: number;
  /** Most-flipped opinion (longest answer history). */
  hottest: { id: number; flips: number } | null;
  /** Largest single price ever paid in one flip. */
  biggestFlip: number;
  isLoading: boolean;
};

type HistEntry = { owner: string; price: bigint; timestamp: number | bigint };

/**
 * Accurate market-wide stats. Reads getAnswerHistory for every opinion via a
 * single multicall, then aggregates volume, participants, 24h activity,
 * royalties distributed, the hottest take, and the biggest single flip.
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
    const base: MarketStats = {
      totalVolume: 0, uniqueUsers: 0, totalTrades: 0, volume24h: 0,
      royaltiesPaid: 0, hottest: null, biggestFlip: 0, isLoading,
    };
    if (!data) return base;

    const users = new Set<string>();
    let volMicro = 0n, vol24Micro = 0n, royaltyMicro = 0n, biggest = 0n, trades = 0;
    let hottest: { id: number; flips: number } | null = null;
    const cutoff = BigInt(Math.floor(Date.now() / 1000) - DAY);

    data.forEach((res, index) => {
      if (res.status !== 'success' || !res.result) return;
      const hist = res.result as readonly HistEntry[];
      if (!hottest || hist.length > hottest.flips) hottest = { id: index + 1, flips: hist.length };

      hist.forEach((h, i) => {
        trades++;
        const price = BigInt(h.price);
        volMicro += price;
        if (price > biggest) biggest = price;
        if (BigInt(h.timestamp) >= cutoff) vol24Micro += price;
        if (i > 0) royaltyMicro += (price * CREATOR_FEE_BPS) / 10_000n; // flips only
        const owner = String(h.owner).toLowerCase();
        if (owner !== ZERO) users.add(owner);
      });
    });

    const usd = (m: bigint) => Number(m) / 1_000_000;
    return {
      totalVolume: usd(volMicro),
      uniqueUsers: users.size,
      totalTrades: trades,
      volume24h: usd(vol24Micro),
      royaltiesPaid: usd(royaltyMicro),
      hottest,
      biggestFlip: usd(biggest),
      isLoading,
    };
  }, [data, isLoading]);
}
