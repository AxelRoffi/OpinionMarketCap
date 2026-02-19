'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { ANSWER_SHARES_CORE_ABI, getContracts } from '@/lib/contracts';
import { useAccumulatedFees } from './useAccumulatedFees';

export type ClaimFeesStatus = 'idle' | 'claiming' | 'success' | 'error';

interface UseClaimFeesOptions {
  onSuccess?: (amount: bigint) => void;
  onError?: (error: Error) => void;
}

export function useClaimFees(options?: UseClaimFeesOptions) {
  const chainId = useChainId();
  const { address } = useAccount();
  const contracts = getContracts(chainId);

  const [status, setStatus] = useState<ClaimFeesStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Get accumulated fees
  const { accumulatedFees, hasClaimableFees, refetch: refetchFees } = useAccumulatedFees();

  // Claim fees contract
  const { writeContractAsync: claimFees, data: claimHash } = useWriteContract();

  // Wait for claim transaction
  const { isLoading: isClaiming } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  const claim = useCallback(async () => {
    if (!address) {
      const err = new Error('Wallet not connected');
      setError(err);
      options?.onError?.(err);
      return;
    }

    if (!hasClaimableFees) {
      const err = new Error('No fees to claim');
      setError(err);
      options?.onError?.(err);
      return;
    }

    try {
      setError(null);
      setStatus('claiming');

      const amountToClaim = accumulatedFees;

      const result = await claimFees({
        address: contracts.ANSWER_SHARES_CORE,
        abi: ANSWER_SHARES_CORE_ABI,
        functionName: 'claimAccumulatedFees',
      });

      setStatus('success');
      await refetchFees();

      options?.onSuccess?.(amountToClaim);

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Transaction failed');
      setError(error);
      setStatus('error');
      options?.onError?.(error);
      throw error;
    }
  }, [address, hasClaimableFees, accumulatedFees, claimFees, contracts, refetchFees, options]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    claim,
    reset,
    status,
    error,
    accumulatedFees,
    hasClaimableFees,
    isClaiming: status === 'claiming' || isClaiming,
    isPending: status === 'claiming' || isClaiming,
    isSuccess: status === 'success',
    isError: status === 'error',
    refetchFees,
    txHash: claimHash,
  };
}
