'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { useChainId, useAccount } from 'wagmi';
import { ANSWER_SHARES_CORE_ABI, getContracts, type UserPosition, type Answer } from '@/lib/contracts';

export interface PositionWithAnswer extends UserPosition {
  answerId: bigint;
  answer?: Answer;
}

/**
 * Hook to fetch user's position for a specific answer
 */
export function useUserPosition(answerId: bigint | number | undefined, userAddress?: `0x${string}`) {
  const chainId = useChainId();
  const { address: connectedAddress } = useAccount();
  const contracts = getContracts(chainId);

  const address = userAddress ?? connectedAddress;
  const id = answerId !== undefined ? BigInt(answerId) : undefined;

  const { data, isLoading, refetch, error } = useReadContract({
    address: contracts.ANSWER_SHARES_CORE,
    abi: ANSWER_SHARES_CORE_ABI,
    functionName: 'getUserPosition',
    args: id !== undefined && address ? [id, address] : undefined,
    query: {
      enabled: id !== undefined && !!address,
    },
  });

  let position: UserPosition | undefined;

  if (data) {
    const [shares, currentValue, costBasis, profitLoss] = data as [bigint, bigint, bigint, bigint];

    if (shares > 0n) {
      position = {
        shares,
        currentValue,
        costBasis,
        profitLoss,
      };
    }
  }

  return {
    position,
    hasPosition: position !== undefined && position.shares > 0n,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch all user positions across multiple answers
 */
export function useUserPositions(answerIds: bigint[], userAddress?: `0x${string}`) {
  const chainId = useChainId();
  const { address: connectedAddress } = useAccount();
  const contracts = getContracts(chainId);

  const address = userAddress ?? connectedAddress;

  // Fetch positions for all answers
  const { data: positionsData, isLoading: isLoadingPositions, refetch } = useReadContracts({
    contracts: answerIds.map((id) => ({
      address: contracts.ANSWER_SHARES_CORE,
      abi: ANSWER_SHARES_CORE_ABI,
      functionName: 'getUserPosition',
      args: [id, address!],
    })),
    query: {
      enabled: answerIds.length > 0 && !!address,
    },
  });

  // Fetch answer details for positions
  const { data: answersData, isLoading: isLoadingAnswers } = useReadContracts({
    contracts: answerIds.map((id) => ({
      address: contracts.ANSWER_SHARES_CORE,
      abi: ANSWER_SHARES_CORE_ABI,
      functionName: 'getAnswer',
      args: [id],
    })),
    query: {
      enabled: answerIds.length > 0,
    },
  });

  // Parse and filter positions with shares > 0
  const positions: PositionWithAnswer[] = [];

  if (positionsData) {
    positionsData.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        const [shares, currentValue, costBasis, profitLoss] = result.result as unknown as [bigint, bigint, bigint, bigint];

        if (shares > 0n) {
          let answer: Answer | undefined;

          if (answersData?.[index]?.status === 'success' && answersData[index].result) {
            // Answer struct now includes description and link
            const [id, questionId, text, description, link, proposer, totalShares, poolValue, pricePerShare, createdAt, isActive, isFlagged] =
              answersData[index].result as unknown as [bigint, bigint, string, string, string, `0x${string}`, bigint, bigint, bigint, number, boolean, boolean];

            answer = {
              id,
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
            };
          }

          positions.push({
            answerId: answerIds[index],
            shares,
            currentValue,
            costBasis,
            profitLoss,
            answer,
          });
        }
      }
    });
  }

  // Sort by current value descending
  positions.sort((a, b) => (b.currentValue > a.currentValue ? 1 : -1));

  // Calculate totals
  const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0n);
  const totalCostBasis = positions.reduce((sum, p) => sum + p.costBasis, 0n);
  const totalProfitLoss = positions.reduce((sum, p) => sum + p.profitLoss, 0n);

  return {
    positions,
    totalValue,
    totalCostBasis,
    totalProfitLoss,
    positionCount: positions.length,
    isLoading: isLoadingPositions || isLoadingAnswers,
    refetch,
  };
}
