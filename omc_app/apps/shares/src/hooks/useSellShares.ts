'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { ANSWER_SHARES_CORE_ABI, getContracts } from '@/lib/contracts';
import { parseUnits } from 'viem';

export type SellSharesStatus = 'idle' | 'selling' | 'success' | 'error';

interface UseSellSharesOptions {
  onSuccess?: (usdcReturned: bigint) => void;
  onError?: (error: Error) => void;
}

export function useSellShares(options?: UseSellSharesOptions) {
  const chainId = useChainId();
  const { address } = useAccount();
  const contracts = getContracts(chainId);

  const [status, setStatus] = useState<SellSharesStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Sell shares contract
  const { writeContractAsync: sellShares, data: sellHash } = useWriteContract();

  // Wait for sell transaction
  const { isLoading: isSelling } = useWaitForTransactionReceipt({
    hash: sellHash,
  });

  const sell = useCallback(
    async (
      answerId: bigint,
      shareAmount: bigint, // Number of shares to sell
      minUsdcOut: bigint = 0n, // Slippage protection
      deadlineMinutes: number = 10
    ) => {
      if (!address) {
        const err = new Error('Wallet not connected');
        setError(err);
        options?.onError?.(err);
        return;
      }

      try {
        setError(null);
        setStatus('selling');

        const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineMinutes * 60);

        const result = await sellShares({
          address: contracts.ANSWER_SHARES_CORE,
          abi: ANSWER_SHARES_CORE_ABI,
          functionName: 'sellShares',
          args: [answerId, shareAmount, minUsdcOut, deadline],
        });

        setStatus('success');

        // Note: The actual USDC returned would come from transaction receipt/events
        options?.onSuccess?.(0n);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Transaction failed');
        setError(error);
        setStatus('error');
        options?.onError?.(error);
        throw error;
      }
    },
    [address, sellShares, contracts, options]
  );

  /**
   * Helper to sell a percentage of shares
   */
  const sellPercent = useCallback(
    async (answerId: bigint, totalShares: bigint, percent: number, minUsdcOut: bigint = 0n) => {
      if (percent <= 0 || percent > 100) {
        throw new Error('Percent must be between 0 and 100');
      }

      const shareAmount = (totalShares * BigInt(percent)) / 100n;
      return sell(answerId, shareAmount, minUsdcOut);
    },
    [sell]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    sell,
    sellPercent,
    reset,
    status,
    error,
    isSelling: status === 'selling' || isSelling,
    isPending: status === 'selling' || isSelling,
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
