'use client';

import { useReadContracts } from 'wagmi';
import { useChainId } from 'wagmi';
import { ANSWER_SHARES_CORE_ABI, getContracts, type Answer } from '@/lib/contracts';

/**
 * Hook to fetch all answers for a question
 */
export function useAnswers(questionId: bigint | number | undefined, answerIds?: bigint[]) {
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  // Fetch answers data
  const { data: answersData, isLoading, refetch, error } = useReadContracts({
    contracts: (answerIds ?? []).map((id) => ({
      address: contracts.ANSWER_SHARES_CORE,
      abi: ANSWER_SHARES_CORE_ABI,
      functionName: 'getAnswer',
      args: [id],
    })),
    query: {
      enabled: answerIds !== undefined && answerIds.length > 0,
    },
  });

  // Also fetch holder counts for each answer
  const { data: holderCountsData } = useReadContracts({
    contracts: (answerIds ?? []).map((id) => ({
      address: contracts.ANSWER_SHARES_CORE,
      abi: ANSWER_SHARES_CORE_ABI,
      functionName: 'getHolderCount',
      args: [id],
    })),
    query: {
      enabled: answerIds !== undefined && answerIds.length > 0,
    },
  });

  // Parse results
  const answers: (Answer & { holderCount?: bigint })[] = [];

  if (answersData) {
    answersData.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        const [id, qId, text, description, link, proposer, totalShares, poolValue, pricePerShare, createdAt, isActive, isFlagged] =
          result.result as unknown as [bigint, bigint, string, string, string, `0x${string}`, bigint, bigint, bigint, number, boolean, boolean];

        // Skip invalid answers
        if (id === 0n) return;

        const holderCount = holderCountsData?.[index]?.status === 'success'
          ? holderCountsData[index].result as bigint
          : undefined;

        answers.push({
          id,
          questionId: qId,
          text,
          description,
          link,
          proposer,
          totalShares,
          poolValue,
          pricePerShare,
          createdAt,
          isActive,
          isFlagged,
          holderCount,
        });
      }
    });
  }

  // Sort by pool value (market cap) descending
  answers.sort((a, b) => (b.poolValue > a.poolValue ? 1 : -1));

  return {
    answers,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch a single answer by ID
 */
export function useAnswer(answerId: bigint | number | undefined) {
  const chainId = useChainId();
  const contracts = getContracts(chainId);
  const id = answerId !== undefined ? BigInt(answerId) : undefined;

  const { data, isLoading, refetch, error } = useReadContracts({
    contracts: [
      {
        address: contracts.ANSWER_SHARES_CORE,
        abi: ANSWER_SHARES_CORE_ABI,
        functionName: 'getAnswer',
        args: id !== undefined ? [id] : undefined,
      },
      {
        address: contracts.ANSWER_SHARES_CORE,
        abi: ANSWER_SHARES_CORE_ABI,
        functionName: 'getHolderCount',
        args: id !== undefined ? [id] : undefined,
      },
    ],
    query: {
      enabled: id !== undefined,
    },
  });

  let answer: (Answer & { holderCount?: bigint }) | undefined;

  if (data && data[0].status === 'success' && data[0].result) {
    const [aId, questionId, text, description, link, proposer, totalShares, poolValue, pricePerShare, createdAt, isActive, isFlagged] =
      data[0].result as [bigint, bigint, string, string, string, `0x${string}`, bigint, bigint, bigint, number, boolean, boolean];

    if (aId > 0n) {
      const holderCount = data[1]?.status === 'success' ? data[1].result as bigint : undefined;

      answer = {
        id: aId,
        questionId,
        text,
        description,
        link,
        proposer,
        totalShares,
        poolValue,
        pricePerShare,
        createdAt,
        isActive,
        isFlagged,
        holderCount,
      };
    }
  }

  return {
    answer,
    isLoading,
    error,
    refetch,
  };
}
