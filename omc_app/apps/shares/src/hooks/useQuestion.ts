'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { useChainId } from 'wagmi';
import { ANSWER_SHARES_CORE_ABI, getContracts, type Question, type LeadingAnswer } from '@/lib/contracts';

/**
 * Hook to fetch a single question by ID
 */
export function useQuestion(questionId: bigint | number | undefined) {
  const chainId = useChainId();
  const contracts = getContracts(chainId);
  const id = questionId !== undefined ? BigInt(questionId) : undefined;

  // Fetch question data and leading answer in parallel
  const { data, isLoading, refetch, error } = useReadContracts({
    contracts: [
      {
        address: contracts.ANSWER_SHARES_CORE,
        abi: ANSWER_SHARES_CORE_ABI,
        functionName: 'getQuestion',
        args: id !== undefined ? [id] : undefined,
      },
      {
        address: contracts.ANSWER_SHARES_CORE,
        abi: ANSWER_SHARES_CORE_ABI,
        functionName: 'getLeadingAnswer',
        args: id !== undefined ? [id] : undefined,
      },
      {
        address: contracts.ANSWER_SHARES_CORE,
        abi: ANSWER_SHARES_CORE_ABI,
        functionName: 'getQuestionAnswers',
        args: id !== undefined ? [id] : undefined,
      },
    ],
    query: {
      enabled: id !== undefined,
    },
  });

  let question: Question | undefined;
  let leadingAnswer: LeadingAnswer | undefined;
  let answerIds: bigint[] = [];

  if (data) {
    // Parse question: id, text, category, creator, owner, createdAt, isActive, totalVolume, answerCount, salePrice
    if (data[0].status === 'success' && data[0].result) {
      const [qId, text, category, creator, owner, createdAt, isActive, totalVolume, answerCount, salePrice] =
        data[0].result as unknown as [bigint, string, string, `0x${string}`, `0x${string}`, number, boolean, bigint, bigint, bigint];

      if (qId > 0n) {
        question = {
          id: qId,
          text,
          category,
          creator,
          owner,
          createdAt,
          isActive,
          totalVolume,
          answerCount,
          salePrice,
        };
      }
    }

    // Parse leading answer
    if (data[1].status === 'success' && data[1].result) {
      const [answerId, marketCap] = data[1].result as [bigint, bigint];
      if (answerId > 0n) {
        leadingAnswer = { answerId, marketCap };
      }
    }

    // Parse answer IDs
    if (data[2].status === 'success' && data[2].result) {
      answerIds = data[2].result as bigint[];
    }
  }

  return {
    question,
    leadingAnswer,
    answerIds,
    isLoading,
    error,
    refetch,
  };
}
