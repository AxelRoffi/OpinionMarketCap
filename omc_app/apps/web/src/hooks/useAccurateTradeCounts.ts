import { useReadContract } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';

export function useAccurateTradeCounts(opinionIds: number[]) {
  // Limit to first 5 opinions to avoid too many simultaneous calls
  const limitedIds = opinionIds.slice(0, 5);
  
  // Create individual hooks for each opinion (fixed number, no dynamic creation)
  const opinion1 = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getAnswerHistory',
    args: [BigInt(limitedIds[0] || 0)],
    query: {
      enabled: limitedIds[0] > 0,
      staleTime: 30000,
    },
  });

  const opinion2 = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getAnswerHistory',
    args: [BigInt(limitedIds[1] || 0)],
    query: {
      enabled: limitedIds[1] > 0,
      staleTime: 30000,
    },
  });

  const opinion3 = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getAnswerHistory',
    args: [BigInt(limitedIds[2] || 0)],
    query: {
      enabled: limitedIds[2] > 0,
      staleTime: 30000,
    },
  });

  const opinion4 = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getAnswerHistory',
    args: [BigInt(limitedIds[3] || 0)],
    query: {
      enabled: limitedIds[3] > 0,
      staleTime: 30000,
    },
  });

  const opinion5 = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getAnswerHistory',
    args: [BigInt(limitedIds[4] || 0)],
    query: {
      enabled: limitedIds[4] > 0,
      staleTime: 30000,
    },
  });

  // Build trade counts map
  const tradeCountsMap = new Map<number, number>();
  
  if (opinion1.data && limitedIds[0]) {
    tradeCountsMap.set(limitedIds[0], opinion1.data.length);
  }
  if (opinion2.data && limitedIds[1]) {
    tradeCountsMap.set(limitedIds[1], opinion2.data.length);
  }
  if (opinion3.data && limitedIds[2]) {
    tradeCountsMap.set(limitedIds[2], opinion3.data.length);
  }
  if (opinion4.data && limitedIds[3]) {
    tradeCountsMap.set(limitedIds[3], opinion4.data.length);
  }
  if (opinion5.data && limitedIds[4]) {
    tradeCountsMap.set(limitedIds[4], opinion5.data.length);
  }

  const getTradeCount = (opinionId: number): number | null => {
    return tradeCountsMap.get(opinionId) || null;
  };

  const isLoading = opinion1.isLoading || opinion2.isLoading || opinion3.isLoading || opinion4.isLoading || opinion5.isLoading;
  const hasError = !!opinion1.error || !!opinion2.error || !!opinion3.error || !!opinion4.error || !!opinion5.error;

  // Debug log for the first few opinions
  console.log('🎯 ACCURATE TRADE COUNTS FROM CONTRACT:', {
    limitedIds,
    counts: Object.fromEntries(tradeCountsMap),
    isLoading,
    hasError,
    opinion1Count: opinion1.data?.length,
    opinion2Count: opinion2.data?.length,
  });

  return {
    getTradeCount,
    isLoading,
    hasError,
    tradeCountsMap,
  };
}