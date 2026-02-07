'use client';

import { useReadContract } from 'wagmi';
import { useChainId, useAccount } from 'wagmi';
import { ANSWER_SHARES_CORE_ABI, getContracts } from '@/lib/contracts';

/**
 * Hook to fetch user's accumulated claimable fees
 */
export function useAccumulatedFees(userAddress?: `0x${string}`) {
  const chainId = useChainId();
  const { address: connectedAddress } = useAccount();
  const contracts = getContracts(chainId);

  const address = userAddress ?? connectedAddress;

  const { data, isLoading, refetch, error } = useReadContract({
    address: contracts.ANSWER_SHARES_CORE,
    abi: ANSWER_SHARES_CORE_ABI,
    functionName: 'getAccumulatedFees',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const accumulatedFees = data as bigint | undefined;
  const hasClaimableFees = accumulatedFees !== undefined && accumulatedFees > 0n;

  return {
    accumulatedFees: accumulatedFees ?? 0n,
    hasClaimableFees,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch total accumulated fees in the contract
 */
export function useTotalAccumulatedFees() {
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  const { data, isLoading, refetch, error } = useReadContract({
    address: contracts.ANSWER_SHARES_CORE,
    abi: ANSWER_SHARES_CORE_ABI,
    functionName: 'getTotalAccumulatedFees',
  });

  return {
    totalFees: (data as bigint) ?? 0n,
    isLoading,
    error,
    refetch,
  };
}
