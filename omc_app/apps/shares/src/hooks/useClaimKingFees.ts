'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { ANSWER_SHARES_CORE_ABI, getContracts } from '@/lib/contracts';

export type ClaimKingFeesStatus = 'idle' | 'claiming' | 'success' | 'error';

interface UseClaimKingFeesOptions {
  onSuccess?: (answerId: bigint) => void;
  onError?: (error: Error) => void;
}

export function useClaimKingFees(options?: UseClaimKingFeesOptions) {
  const chainId = useChainId();
  const { address } = useAccount();
  const contracts = getContracts(chainId);

  const [status, setStatus] = useState<ClaimKingFeesStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const { writeContractAsync: claimKingFeesWrite, data: txHash } = useWriteContract();

  const { isLoading: isClaiming } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const claimKingFees = useCallback(async (answerId: bigint) => {
    if (!address) {
      const err = new Error('Wallet not connected');
      setError(err);
      options?.onError?.(err);
      return;
    }

    try {
      setError(null);
      setStatus('claiming');

      const result = await claimKingFeesWrite({
        address: contracts.ANSWER_SHARES_CORE,
        abi: ANSWER_SHARES_CORE_ABI,
        functionName: 'claimKingFees',
        args: [answerId],
      });

      setStatus('success');
      options?.onSuccess?.(answerId);

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Transaction failed');
      setError(error);
      setStatus('error');
      options?.onError?.(error);
      throw error;
    }
  }, [address, claimKingFeesWrite, contracts, options]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    claimKingFees,
    reset,
    status,
    error,
    isClaiming: status === 'claiming' || isClaiming,
    isPending: status === 'claiming' || isClaiming,
    isSuccess: status === 'success',
    isError: status === 'error',
    txHash,
  };
}
