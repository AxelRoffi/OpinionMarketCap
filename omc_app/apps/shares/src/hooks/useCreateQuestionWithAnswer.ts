'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount, useChainId } from 'wagmi';
import { ANSWER_SHARES_CORE_ABI, USDC_ABI, getContracts } from '@/lib/contracts';

export type CreateQuestionWithAnswerStatus = 'idle' | 'approving' | 'creating' | 'success' | 'error';

interface UseCreateQuestionWithAnswerOptions {
  onSuccess?: (questionId: bigint, answerId: bigint) => void;
  onError?: (error: Error) => void;
}

export function useCreateQuestionWithAnswer(options?: UseCreateQuestionWithAnswerOptions) {
  const chainId = useChainId();
  const { address } = useAccount();
  const contracts = getContracts(chainId);

  const [status, setStatus] = useState<CreateQuestionWithAnswerStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Get creation fee
  const { data: creationFee } = useReadContract({
    address: contracts.ANSWER_SHARES_CORE,
    abi: ANSWER_SHARES_CORE_ABI,
    functionName: 'questionCreationFee',
  });

  // Get proposal stake
  const { data: proposalStake } = useReadContract({
    address: contracts.ANSWER_SHARES_CORE,
    abi: ANSWER_SHARES_CORE_ABI,
    functionName: 'answerProposalStake',
  });

  // Total cost = creation fee + proposal stake
  const totalCost = creationFee && proposalStake
    ? (creationFee as bigint) + (proposalStake as bigint)
    : undefined;

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

  // Create question with answer contract
  const { writeContractAsync: createQuestionWithAnswer, data: createHash } = useWriteContract();

  // Wait for approval transaction
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for create transaction
  const { isLoading: isCreating } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  const create = useCallback(
    async (
      questionText: string,
      description: string,
      link: string,
      category: string,
      answerText: string
    ) => {
      if (!address) {
        const err = new Error('Wallet not connected');
        setError(err);
        options?.onError?.(err);
        return;
      }

      if (!totalCost) {
        const err = new Error('Could not fetch fees');
        setError(err);
        options?.onError?.(err);
        return;
      }

      try {
        setError(null);

        // Validate inputs
        if (!questionText.trim()) {
          throw new Error('Question text is required');
        }
        if (questionText.length > 100) {
          throw new Error('Question must be 100 characters or less');
        }
        if (description.length > 280) {
          throw new Error('Description must be 280 characters or less');
        }
        if (!answerText.trim()) {
          throw new Error('Answer text is required');
        }
        if (answerText.length > 60) {
          throw new Error('Answer must be 60 characters or less');
        }

        // Check balance
        if (balance !== undefined && (balance as bigint) < totalCost) {
          throw new Error('Insufficient USDC balance');
        }

        // Check if approval is needed
        const currentAllowance = (allowance as bigint) ?? 0n;
        if (currentAllowance < totalCost) {
          setStatus('approving');

          await approve({
            address: contracts.USDC,
            abi: USDC_ABI,
            functionName: 'approve',
            args: [contracts.ANSWER_SHARES_CORE, totalCost],
          });

          // Wait and refetch allowance
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await refetchAllowance();
        }

        // Create question with answer
        setStatus('creating');

        const result = await createQuestionWithAnswer({
          address: contracts.ANSWER_SHARES_CORE,
          abi: ANSWER_SHARES_CORE_ABI,
          functionName: 'createQuestionWithAnswer',
          args: [questionText, description, link, category, answerText],
        });

        setStatus('success');

        // Note: The actual IDs would come from transaction receipt/events
        options?.onSuccess?.(0n, 0n);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Transaction failed');
        setError(error);
        setStatus('error');
        options?.onError?.(error);
        throw error;
      }
    },
    [address, allowance, balance, totalCost, approve, createQuestionWithAnswer, contracts, refetchAllowance, options]
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
    proposalStake: proposalStake as bigint | undefined,
    totalCost,
    isApproving: status === 'approving' || isApproving,
    isCreating: status === 'creating' || isCreating,
    isPending: status === 'approving' || status === 'creating' || isApproving || isCreating,
    isSuccess: status === 'success',
    isError: status === 'error',
    balance: balance as bigint | undefined,
    hasEnoughBalance: balance !== undefined && totalCost !== undefined && (balance as bigint) >= totalCost,
  };
}
