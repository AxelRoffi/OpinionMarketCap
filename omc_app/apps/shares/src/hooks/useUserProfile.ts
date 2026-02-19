'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { useChainId, useAccount } from 'wagmi';
import { useEffect, useState, useMemo } from 'react';
import { ANSWER_SHARES_CORE_ABI, getContracts, type Question, type Answer, type UserPosition } from '@/lib/contracts';

// ============ INTERFACES ============

export interface PositionWithDetails {
  answerId: bigint;
  answer: Answer;
  question: Question;
  position: UserPosition;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface UserStats {
  // Core portfolio metrics
  totalValue: number;        // Current value of all positions (USDC)
  totalCostBasis: number;    // Total amount invested (USDC)
  totalPnL: number;          // Unrealized P&L (USDC)
  totalPnLPercentage: number; // P&L as percentage

  // Position counts
  positionCount: number;     // Number of active positions
  questionsCreated: number;  // Questions user created
  questionsOwned: number;    // Questions user currently owns
  answersProposed: number;   // Answers user proposed

  // Performance metrics
  winRate: number;           // Percentage of profitable positions
  winningPositions: number;  // Count of positions with positive P&L
  losingPositions: number;   // Count of positions with negative P&L
  bestPosition: number;      // Highest P&L position (USDC)
  worstPosition: number;     // Lowest P&L position (USDC)

  // Fees
  accumulatedFees: number;   // Claimable creator fees (USDC)

  // Platform metrics
  totalPlatformVolume: number; // Total platform volume
  marketShare: number;       // User's share of total platform value

  // Activity
  totalVolume: number;       // Volume from user's questions
  memberSince: number;       // Earliest activity timestamp
  topCategories: CategoryCount[]; // Most active categories
}

export interface UserProfile {
  stats: UserStats;
  positions: PositionWithDetails[];
  createdQuestions: Question[];
  ownedQuestions: Question[];
  proposedAnswers: Answer[];
  loading: boolean;
  error: string | null;
}

// ============ HOOK ============

export function useUserProfile(userAddress?: `0x${string}`) {
  const chainId = useChainId();
  const { address: connectedAddress } = useAccount();
  const contracts = getContracts(chainId);

  const address = userAddress ?? connectedAddress;

  // Get total questions and answers count
  const { data: nextQuestionId } = useReadContract({
    address: contracts.ANSWER_SHARES_CORE,
    abi: ANSWER_SHARES_CORE_ABI,
    functionName: 'nextQuestionId',
  });

  const { data: nextAnswerId } = useReadContract({
    address: contracts.ANSWER_SHARES_CORE,
    abi: ANSWER_SHARES_CORE_ABI,
    functionName: 'nextAnswerId',
  });

  // Get accumulated fees for user
  const { data: accumulatedFees, refetch: refetchFees } = useReadContract({
    address: contracts.ANSWER_SHARES_CORE,
    abi: ANSWER_SHARES_CORE_ABI,
    functionName: 'getAccumulatedFees',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const totalQuestions = nextQuestionId ? Number(nextQuestionId) - 1 : 0;
  const totalAnswers = nextAnswerId ? Number(nextAnswerId) - 1 : 0;

  // Fetch all questions
  const questionIds = useMemo(() =>
    Array.from({ length: Math.min(totalQuestions, 100) }, (_, i) => BigInt(i + 1)),
    [totalQuestions]
  );

  const { data: questionsData, isLoading: isLoadingQuestions } = useReadContracts({
    contracts: questionIds.map((id) => ({
      address: contracts.ANSWER_SHARES_CORE,
      abi: ANSWER_SHARES_CORE_ABI,
      functionName: 'getQuestion',
      args: [id],
    })),
    query: { enabled: totalQuestions > 0 },
  });

  // Fetch all answers
  const answerIds = useMemo(() =>
    Array.from({ length: Math.min(totalAnswers, 200) }, (_, i) => BigInt(i + 1)),
    [totalAnswers]
  );

  const { data: answersData, isLoading: isLoadingAnswers } = useReadContracts({
    contracts: answerIds.map((id) => ({
      address: contracts.ANSWER_SHARES_CORE,
      abi: ANSWER_SHARES_CORE_ABI,
      functionName: 'getAnswer',
      args: [id],
    })),
    query: { enabled: totalAnswers > 0 },
  });

  // Fetch user positions for all answers
  const { data: positionsData, isLoading: isLoadingPositions } = useReadContracts({
    contracts: answerIds.map((id) => ({
      address: contracts.ANSWER_SHARES_CORE,
      abi: ANSWER_SHARES_CORE_ABI,
      functionName: 'getUserPosition',
      args: [id, address!],
    })),
    query: { enabled: totalAnswers > 0 && !!address },
  });

  // Process data
  const [profile, setProfile] = useState<UserProfile>({
    stats: {
      totalValue: 0,
      totalCostBasis: 0,
      totalPnL: 0,
      totalPnLPercentage: 0,
      positionCount: 0,
      questionsCreated: 0,
      questionsOwned: 0,
      answersProposed: 0,
      winRate: 0,
      winningPositions: 0,
      losingPositions: 0,
      bestPosition: 0,
      worstPosition: 0,
      accumulatedFees: 0,
      totalPlatformVolume: 0,
      marketShare: 0,
      totalVolume: 0,
      memberSince: 0,
      topCategories: [],
    },
    positions: [],
    createdQuestions: [],
    ownedQuestions: [],
    proposedAnswers: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!address || isLoadingQuestions || isLoadingAnswers || isLoadingPositions) {
      return;
    }

    try {
      // Parse questions
      const questions: Question[] = [];
      if (questionsData) {
        questionsData.forEach((result) => {
          if (result.status === 'success' && result.result) {
            const [id, text, category, creator, owner, createdAt, isActive, totalVolume, answerCount, salePrice] =
              result.result as unknown as [bigint, string, string, `0x${string}`, `0x${string}`, number, boolean, bigint, bigint, bigint];
            if (id > 0n) {
              questions.push({ id, text, category, creator, owner, createdAt, isActive, totalVolume, answerCount, salePrice });
            }
          }
        });
      }

      // Parse answers
      const answers: Answer[] = [];
      if (answersData) {
        answersData.forEach((result) => {
          if (result.status === 'success' && result.result) {
            const [id, questionId, text, description, link, proposer, totalShares, poolValue, pricePerShare, createdAt, isActive, isFlagged] =
              result.result as unknown as [bigint, bigint, string, string, string, `0x${string}`, bigint, bigint, bigint, number, boolean, boolean];
            if (id > 0n) {
              answers.push({ id, questionId, text, description, link, proposer, totalShares, poolValue, pricePerShare, createdAt, isActive, isFlagged });
            }
          }
        });
      }

      // Parse user positions
      const positions: PositionWithDetails[] = [];
      let totalValue = 0n;
      let totalCostBasis = 0n;
      let totalPnL = 0n;
      let winningPositions = 0;
      let losingPositions = 0;
      let bestPosition = 0n;
      let worstPosition = 0n;
      let earliestActivity = 0;

      if (positionsData) {
        positionsData.forEach((result, index) => {
          if (result.status === 'success' && result.result) {
            const [shares, currentValue, costBasis, profitLoss] = result.result as unknown as [bigint, bigint, bigint, bigint];

            if (shares > 0n) {
              const answerId = answerIds[index];
              const answer = answers.find(a => a.id === answerId);
              const question = answer ? questions.find(q => q.id === answer.questionId) : undefined;

              if (answer && question) {
                const position: UserPosition = { shares, currentValue, costBasis, profitLoss };
                positions.push({ answerId, answer, question, position });

                totalValue += currentValue;
                totalCostBasis += costBasis;
                totalPnL += profitLoss;

                if (profitLoss > 0n) {
                  winningPositions++;
                  if (profitLoss > bestPosition) bestPosition = profitLoss;
                } else if (profitLoss < 0n) {
                  losingPositions++;
                  if (profitLoss < worstPosition) worstPosition = profitLoss;
                }

                // Track earliest activity
                if (answer.createdAt > 0 && (earliestActivity === 0 || answer.createdAt < earliestActivity)) {
                  earliestActivity = answer.createdAt;
                }
              }
            }
          }
        });
      }

      // Filter user's questions and answers
      const createdQuestions = questions.filter(q => q.creator.toLowerCase() === address.toLowerCase());
      const ownedQuestions = questions.filter(q => q.owner.toLowerCase() === address.toLowerCase());
      const proposedAnswers = answers.filter(a => a.proposer.toLowerCase() === address.toLowerCase());

      // Calculate platform metrics
      const totalPlatformVolume = questions.reduce((sum, q) => sum + Number(q.totalVolume), 0) / 1_000_000;
      const totalPlatformValue = answers.reduce((sum, a) => sum + Number(a.poolValue), 0);
      const userTotalValue = Number(totalValue);
      const marketShare = totalPlatformValue > 0 ? (userTotalValue / totalPlatformValue) * 100 : 0;

      // Calculate user's volume (from questions they created)
      const userVolume = createdQuestions.reduce((sum, q) => sum + Number(q.totalVolume), 0) / 1_000_000;

      // Calculate category breakdown
      const categoryMap = new Map<string, number>();
      positions.forEach(p => {
        const cat = p.question.category;
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });
      createdQuestions.forEach(q => {
        categoryMap.set(q.category, (categoryMap.get(q.category) || 0) + 1);
      });
      const topCategories: CategoryCount[] = Array.from(categoryMap.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate earliest activity from created questions
      createdQuestions.forEach(q => {
        if (q.createdAt > 0 && (earliestActivity === 0 || q.createdAt < earliestActivity)) {
          earliestActivity = q.createdAt;
        }
      });

      // Stats
      const positionCount = positions.length;
      const totalPnLNum = Number(totalPnL) / 1_000_000;
      const totalCostBasisNum = Number(totalCostBasis) / 1_000_000;
      const winRate = positionCount > 0 ? (winningPositions / positionCount) * 100 : 0;
      const totalPnLPercentage = totalCostBasisNum > 0 ? (totalPnLNum / totalCostBasisNum) * 100 : 0;

      setProfile({
        stats: {
          totalValue: Number(totalValue) / 1_000_000,
          totalCostBasis: totalCostBasisNum,
          totalPnL: totalPnLNum,
          totalPnLPercentage,
          positionCount,
          questionsCreated: createdQuestions.length,
          questionsOwned: ownedQuestions.length,
          answersProposed: proposedAnswers.length,
          winRate,
          winningPositions,
          losingPositions,
          bestPosition: Number(bestPosition) / 1_000_000,
          worstPosition: Number(worstPosition) / 1_000_000,
          accumulatedFees: accumulatedFees ? Number(accumulatedFees) / 1_000_000 : 0,
          totalPlatformVolume,
          marketShare,
          totalVolume: userVolume,
          memberSince: earliestActivity * 1000, // Convert to ms
          topCategories,
        },
        positions: positions.sort((a, b) => Number(b.position.currentValue - a.position.currentValue)),
        createdQuestions,
        ownedQuestions,
        proposedAnswers,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error processing user profile:', error);
      setProfile(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load profile',
      }));
    }
  }, [address, questionsData, answersData, positionsData, accumulatedFees, isLoadingQuestions, isLoadingAnswers, isLoadingPositions, answerIds]);

  return { ...profile, refetchFees };
}

// ============ UTILITY FUNCTIONS ============

export function formatUSDC(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0.00';
  }
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '+0.00%';
  }
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatAddress(address: string | undefined | null): string {
  if (!address || typeof address !== 'string') {
    return '0x0000...0000';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimeAgo(timestamp: number | undefined | null): string {
  if (!timestamp || timestamp === 0) {
    return 'Unknown';
  }

  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 0) return 'In the future';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}
