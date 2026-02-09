'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount, useChainId } from 'wagmi';
import { ANSWER_SHARES_CORE_ABI, USDC_ABI, getContracts } from '@/lib/contracts';

export type CreateQuestionStatus = 'idle' | 'approving' | 'creating' | 'success' | 'error';

interface UseCreateQuestionOptions {
  onSuccess?: (questionId: bigint) => void;
  onError?: (error: Error) => void;
}

export function useCreateQuestion(options?: UseCreateQuestionOptions) {
  const chainId = useChainId();
  const { address } = useAccount();
  const contracts = getContracts(chainId);

  const [status, setStatus] = useState<CreateQuestionStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Get creation fee
  const { data: creationFee } = useReadContract({
    address: contracts.ANSWER_SHARES_CORE,
    abi: ANSWER_SHARES_CORE_ABI,
    functionName: 'questionCreationFee',
  });

  // Check USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contracts.USDC,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, contracts.ANSWER_SHARES_CORE] : undefined,
    query: { enabled: !!address },
  });

  // Check USDC balance
  const { data: balance } = useReadContract({
    address: contracts.USDC,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Approve contract
  const { writeContractAsync: approve, data: approveHash } = useWriteContract();

  // Create question contract
  const { writeContractAsync: createQuestion, data: createHash } = useWriteContract();

  // Wait for approval transaction
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for create transaction
  const { isLoading: isCreating } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  const create = useCallback(
    async (text: string, category: string = 'Other') => {
      if (!address) {
        const err = new Error('Wallet not connected');
        setError(err);
        options?.onError?.(err);
        return;
      }

      if (!creationFee) {
        const err = new Error('Could not fetch creation fee');
        setError(err);
        options?.onError?.(err);
        return;
      }

      try {
        setError(null);
        const fee = creationFee as bigint;

        // Validate inputs
        if (!text.trim()) {
          throw new Error('Question text is required');
        }
        if (text.length > 200) {
          throw new Error('Question text must be 200 characters or less');
        }

        // Check balance
        if (balance !== undefined && (balance as bigint) < fee) {
          throw new Error('Insufficient USDC balance');
        }

        // Check if approval is needed
        const currentAllowance = (allowance as bigint) ?? 0n;
        if (currentAllowance < fee) {
          setStatus('approving');

          await approve({
            address: contracts.USDC,
            abi: USDC_ABI,
            functionName: 'approve',
            args: [contracts.ANSWER_SHARES_CORE, fee],
          });

          // Wait a bit and refetch allowance
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await refetchAllowance();
        }

        // Create question (just text + category, no description/link)
        setStatus('creating');

        const result = await createQuestion({
          address: contracts.ANSWER_SHARES_CORE,
          abi: ANSWER_SHARES_CORE_ABI,
          functionName: 'createQuestion',
          args: [text, category],
        });

        setStatus('success');

        // Note: The actual question ID would come from transaction receipt/events
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
    [address, allowance, balance, creationFee, approve, createQuestion, contracts, refetchAllowance, options]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    create,
    reset,
    status,
    error,
    creationFee: creationFee as bigint | undefined,
    isApproving: status === 'approving' || isApproving,
    isCreating: status === 'creating' || isCreating,
    isPending: status === 'approving' || status === 'creating' || isApproving || isCreating,
    isSuccess: status === 'success',
    isError: status === 'error',
    balance: balance as bigint | undefined,
    hasEnoughBalance: balance !== undefined && creationFee !== undefined && (balance as bigint) >= (creationFee as bigint),
  };
}
