'use client';

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount, useChainId } from 'wagmi';
import { ANSWER_SHARES_CORE_ABI, USDC_ABI, getContracts } from '@/lib/contracts';

export type ProposeAnswerStatus = 'idle' | 'approving' | 'proposing' | 'success' | 'error';

interface UseProposeAnswerOptions {
  onSuccess?: (answerId: bigint) => void;
  onError?: (error: Error) => void;
}

export function useProposeAnswer(options?: UseProposeAnswerOptions) {
  const chainId = useChainId();
  const { address } = useAccount();
  const contracts = getContracts(chainId);

  const [status, setStatus] = useState<ProposeAnswerStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Get proposal stake
  const { data: proposalStake } = useReadContract({
    address: contracts.ANSWER_SHARES_CORE,
    abi: ANSWER_SHARES_CORE_ABI,
    functionName: 'answerProposalStake',
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

  // Propose answer contract
  const { writeContractAsync: proposeAnswer, data: proposeHash } = useWriteContract();

  // Wait for approval transaction
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for propose transaction
  const { isLoading: isProposing } = useWaitForTransactionReceipt({
    hash: proposeHash,
  });

  const propose = useCallback(
    async (questionId: bigint, answerText: string, description: string = '', link: string = '') => {
      if (!address) {
        const err = new Error('Wallet not connected');
        setError(err);
        options?.onError?.(err);
        return;
      }

      if (!proposalStake) {
        const err = new Error('Could not fetch proposal stake');
        setError(err);
        options?.onError?.(err);
        return;
      }

      try {
        setError(null);
        const stake = proposalStake as bigint;

        // Validate inputs
        if (!answerText.trim()) {
          throw new Error('Answer text is required');
        }
        if (answerText.length > 60) {
          throw new Error('Answer text must be 60 characters or less');
        }
        if (description.length > 280) {
          throw new Error('Description must be 280 characters or less');
        }
        if (link.length > 200) {
          throw new Error('Link must be 200 characters or less');
        }

        // Check balance
        if (balance !== undefined && (balance as bigint) < stake) {
          throw new Error('Insufficient USDC balance');
        }

        // Check if approval is needed
        const currentAllowance = (allowance as bigint) ?? 0n;
        if (currentAllowance < stake) {
          setStatus('approving');

          await approve({
            address: contracts.USDC,
            abi: USDC_ABI,
            functionName: 'approve',
            args: [contracts.ANSWER_SHARES_CORE, stake],
          });

          // Wait a bit and refetch allowance
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await refetchAllowance();
        }

        // Propose answer
        setStatus('proposing');

        const result = await proposeAnswer({
          address: contracts.ANSWER_SHARES_CORE,
          abi: ANSWER_SHARES_CORE_ABI,
          functionName: 'proposeAnswer',
          args: [questionId, answerText, description, link],
        });

        setStatus('success');

        // Note: The actual answer ID would come from transaction receipt/events
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
    [address, allowance, balance, proposalStake, approve, proposeAnswer, contracts, refetchAllowance, options]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    propose,
    reset,
    status,
    error,
    proposalStake: proposalStake as bigint | undefined,
    isApproving: status === 'approving' || isApproving,
    isProposing: status === 'proposing' || isProposing,
    isPending: status === 'approving' || status === 'proposing' || isApproving || isProposing,
    isSuccess: status === 'success',
    isError: status === 'error',
    balance: balance as bigint | undefined,
    hasEnoughBalance: balance !== undefined && proposalStake !== undefined && (balance as bigint) >= (proposalStake as bigint),
  };
}
