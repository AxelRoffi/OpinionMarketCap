'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount, useChainId } from 'wagmi';
import { ANSWER_SHARES_CORE_ABI, USDC_ABI, getContracts } from '@/lib/contracts';
import { parseUnits } from 'viem';

export type BuySharesStatus = 'idle' | 'approving' | 'buying' | 'success' | 'error';

interface UseBuySharesOptions {
  onSuccess?: (sharesBought: bigint) => void;
  onError?: (error: Error) => void;
}

export function useBuyShares(options?: UseBuySharesOptions) {
  const chainId = useChainId();
  const { address } = useAccount();
  const contracts = getContracts(chainId);

  const [status, setStatus] = useState<BuySharesStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Check USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contracts.USDC,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, contracts.ANSWER_SHARES_CORE] : undefined,
    query: { enabled: !!address },
  });

  // Check USDC balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: contracts.USDC,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Approve contract
  const { writeContractAsync: approve, data: approveHash } = useWriteContract();

  // Buy shares contract
  const { writeContractAsync: buyShares, data: buyHash } = useWriteContract();

  // Wait for approval transaction
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for buy transaction
  const { isLoading: isBuying } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  const buy = useCallback(
    async (
      answerId: bigint,
      usdcAmount: string, // Human-readable amount (e.g., "10.50")
      minSharesOut: bigint = 0n, // Slippage protection
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
        const amountInUnits = parseUnits(usdcAmount, 6); // USDC has 6 decimals
        const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineMinutes * 60);

        // Check balance
        if (balance !== undefined && (balance as bigint) < amountInUnits) {
          throw new Error('Insufficient USDC balance');
        }

        // Check if approval is needed
        const currentAllowance = (allowance as bigint) ?? 0n;
        if (currentAllowance < amountInUnits) {
          setStatus('approving');

          await approve({
            address: contracts.USDC,
            abi: USDC_ABI,
            functionName: 'approve',
            args: [contracts.ANSWER_SHARES_CORE, amountInUnits],
          });

          // Wait a bit and refetch allowance
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await refetchAllowance();
        }

        // Buy shares
        setStatus('buying');

        const result = await buyShares({
          address: contracts.ANSWER_SHARES_CORE,
          abi: ANSWER_SHARES_CORE_ABI,
          functionName: 'buyShares',
          args: [answerId, amountInUnits, minSharesOut, deadline],
        });

        setStatus('success');
        await refetchBalance();

        // Note: The actual shares bought would come from transaction receipt/events
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
    [address, allowance, balance, approve, buyShares, contracts, refetchAllowance, refetchBalance, options]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    buy,
    reset,
    status,
    error,
    isApproving: status === 'approving' || isApproving,
    isBuying: status === 'buying' || isBuying,
    isPending: status === 'approving' || status === 'buying' || isApproving || isBuying,
    isSuccess: status === 'success',
    isError: status === 'error',
    balance: balance as bigint | undefined,
    allowance: allowance as bigint | undefined,
  };
}
