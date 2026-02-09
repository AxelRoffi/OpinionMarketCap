'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { useChainId } from 'wagmi';
import { ANSWER_SHARES_CORE_ABI, getContracts, type Question } from '@/lib/contracts';

/**
 * Hook to fetch all questions with pagination
 */
export function useQuestions(options?: { limit?: number; offset?: number }) {
  const chainId = useChainId();
  const contracts = getContracts(chainId);
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  // First, get total question count
  const { data: nextQuestionId, isLoading: isLoadingCount } = useReadContract({
    address: contracts.ANSWER_SHARES_CORE,
    abi: ANSWER_SHARES_CORE_ABI,
    functionName: 'nextQuestionId',
  });

  const totalQuestions = nextQuestionId ? Number(nextQuestionId) - 1 : 0;

  // Calculate which questions to fetch (newest first)
  const endId = Math.max(1, totalQuestions - offset);
  const startId = Math.max(1, endId - limit + 1);
  const questionIds = Array.from(
    { length: Math.min(limit, endId - startId + 1) },
    (_, i) => BigInt(endId - i)
  );

  // Fetch all questions in the range
  const { data: questionsData, isLoading: isLoadingQuestions, refetch } = useReadContracts({
    contracts: questionIds.map((id) => ({
      address: contracts.ANSWER_SHARES_CORE,
      abi: ANSWER_SHARES_CORE_ABI,
      functionName: 'getQuestion',
      args: [id],
    })),
    query: {
      enabled: totalQuestions > 0 && questionIds.length > 0,
    },
  });

  // Also fetch leading answers for each question
  const { data: leadingAnswersData } = useReadContracts({
    contracts: questionIds.map((id) => ({
      address: contracts.ANSWER_SHARES_CORE,
      abi: ANSWER_SHARES_CORE_ABI,
      functionName: 'getLeadingAnswer',
      args: [id],
    })),
    query: {
      enabled: totalQuestions > 0 && questionIds.length > 0,
    },
  });

  // Parse results
  const questions: (Question & { leadingAnswerId?: bigint; leadingMarketCap?: bigint })[] = [];

  if (questionsData) {
    questionsData.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        // Question struct no longer has description/link - those are on answers now
        const [id, text, category, creator, createdAt, isActive, totalVolume, answerCount] = result.result as unknown as [bigint, string, string, `0x${string}`, number, boolean, bigint, bigint];

        // Skip invalid questions (id = 0 means doesn't exist)
        if (id === 0n) return;

        const leadingAnswer = leadingAnswersData?.[index];
        const leadingData = leadingAnswer?.status === 'success' ? leadingAnswer.result as unknown as [bigint, bigint] : undefined;

        questions.push({
          id,
          text,
          category,
          creator,
          createdAt,
          isActive,
          totalVolume,
          answerCount,
          leadingAnswerId: leadingData?.[0],
          leadingMarketCap: leadingData?.[1],
        });
      }
    });
  }

  return {
    questions,
    totalQuestions,
    isLoading: isLoadingCount || isLoadingQuestions,
    refetch,
    hasMore: startId > 1,
  };
}

/**
 * Hook to fetch questions created by a specific address
 */
export function useQuestionsByCreator(creator: `0x${string}` | undefined) {
  const { questions, isLoading, refetch, totalQuestions } = useQuestions({ limit: 100 });

  const creatorQuestions = creator
    ? questions.filter((q) => q.creator.toLowerCase() === creator.toLowerCase())
    : [];

  return {
    questions: creatorQuestions,
    isLoading,
    refetch,
    totalQuestions,
  };
}
