import { useReadContract } from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI } from '@/lib/contracts';

export function usePriceHistory(opinionId: number) {
  const { data, isLoading, error, isFetched } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getAnswerHistory',
    args: [BigInt(opinionId)],
    query: {
      enabled: opinionId > 0,
      staleTime: 60000, // Cache for 1 minute
    },
  });

  return {
    priceHistory: data,
    isLoading,
    error,
    isFetched,
  };
}
