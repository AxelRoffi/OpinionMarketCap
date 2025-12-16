'use client';

import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useEffect, useState } from 'react';
import { useAllOpinions } from '@/hooks/useAllOpinions';

// Contract addresses
export const CONTRACTS = {
  OPINION_CORE: '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f' as `0x${string}`,
  FEE_MANAGER: '0xc8f879d86266C334eb9699963ca0703aa1189d8F' as `0x${string}`,
  USDC_TOKEN: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
};

// ABIs
const FEE_MANAGER_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getAccumulatedFees',
    outputs: [{ name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimAccumulatedFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const OPINION_CORE_ABI = [
  {
    inputs: [{ name: 'opinionId', type: 'uint256' }],
    name: 'getOpinionDetails',
    outputs: [
      {
        components: [
          { name: 'lastPrice', type: 'uint96' },
          { name: 'nextPrice', type: 'uint96' },
          { name: 'totalVolume', type: 'uint96' },
          { name: 'salePrice', type: 'uint96' },
          { name: 'creator', type: 'address' },
          { name: 'questionOwner', type: 'address' },
          { name: 'currentAnswerOwner', type: 'address' },
          { name: 'isActive', type: 'bool' },
          { name: 'question', type: 'string' },
          { name: 'currentAnswer', type: 'string' },
          { name: 'currentAnswerDescription', type: 'string' },
          { name: 'ipfsHash', type: 'string' },
          { name: 'link', type: 'string' },
          { name: 'categories', type: 'string[]' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getTradeCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface UserOpinion {
  id: number;
  question: string;
  currentAnswer: string;
  currentValue: number;
  purchasePrice: number;
  pnl: number;
  pnlPercentage: number;
  isOwner: boolean; // Owner of current answer
  isCreator: boolean; // Original creator
  isQuestionOwner: boolean; // Current question owner (for marketplace actions)
  categories: string[];
  timestamp: number;
  isActive: boolean;
  totalVolume: number;
  salePrice: number;
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'CREATE';
  amount: number;
  price: number;
  timestamp: number;
  opinionId: number;
  opinionTitle: string;
  txHash: string;
  status: 'success' | 'pending' | 'failed';
}

export interface UserStats {
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  totalInvested: number;
  opinionsOwned: number;
  opinionsCreated: number;
  questionsCreated: number;
  totalTrades: number;
  winRate: number;
  accumulatedFees: number;
  rank: number;
  totalUsers: number;
  avgHoldTime: number;
  bestTrade: number;
  totalROI: number;
  creatorFees: number;
  tradingProfits: number;
  marketShare: number;
  platformTVL: number;
}

export interface UserProfile {
  stats: UserStats;
  opinions: UserOpinion[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

export function useUserProfile(userAddress?: string) {
  const { address: connectedAddress } = useAccount();
  const address = userAddress || connectedAddress;
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    stats: {
      totalValue: 0,
      totalPnL: 0,
      totalPnLPercentage: 0,
      totalInvested: 0,
      opinionsOwned: 0,
      opinionsCreated: 0,
      questionsCreated: 0,
      totalTrades: 0,
      winRate: 0,
      accumulatedFees: 0,
      rank: 0, // Will be calculated from real user comparisons
      totalUsers: 0, // Will be calculated from actual unique users
      avgHoldTime: 0,
      bestTrade: 0,
      totalROI: 0,
      creatorFees: 0,
      tradingProfits: 0,
      marketShare: 0,
      platformTVL: 0,
    },
    opinions: [],
    transactions: [],
    loading: true,
    error: null,
  });

  // Get all opinions to analyze user's portfolio
  const { opinions: allOpinions, isLoading: opinionsLoading } = useAllOpinions();

  // Get user's accumulated fees
  const { data: accumulatedFees } = useReadContract({
    address: CONTRACTS.FEE_MANAGER,
    abi: FEE_MANAGER_ABI,
    functionName: 'getAccumulatedFees',
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  // Get user's trade count
  const { data: tradeCount } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getTradeCount',
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  // Process user data
  useEffect(() => {
    if (!address || opinionsLoading || !allOpinions) {
      setUserProfile(prev => ({ ...prev, loading: true }));
      return;
    }

    try {
      const userOpinions: UserOpinion[] = [];
      // Transaction history removed - needs real blockchain event parsing implementation
      let totalValue = 0;
      let totalPnL = 0;
      let opinionsOwned = 0;
      let opinionsCreated = 0;
      let wins = 0;
      let totalROI = 0;
      let bestTrade = 0;
      // Creator fees are fetched directly from FeeManager.accumulatedFees below
      let tradingProfits = 0;
      
      // Calculate platform-wide metrics for real comparisons
      const platformTotalValue = allOpinions.reduce((sum, opinion) => {
        return sum + (Number(opinion.nextPrice) / 1_000_000);
      }, 0);
      
      // Get all unique users for ranking calculation
      const allUsers = new Set<string>();
      allOpinions.forEach(opinion => {
        if (opinion.currentAnswerOwner) allUsers.add(opinion.currentAnswerOwner.toLowerCase());
        if (opinion.creator) allUsers.add(opinion.creator.toLowerCase());
      });

      // Process each opinion to find user's involvement
      allOpinions.forEach((opinion) => {
        const isAnswerOwner = opinion.currentAnswerOwner?.toLowerCase() === address.toLowerCase();
        const isOriginalCreator = opinion.creator?.toLowerCase() === address.toLowerCase();
        const isQuestionOwner = opinion.questionOwner?.toLowerCase() === address.toLowerCase();

        // Show opinion if user has any involvement
        if (isAnswerOwner || isOriginalCreator || isQuestionOwner) {
          const currentValue = Number(opinion.nextPrice) / 1_000_000;
          const purchasePrice = Number(opinion.lastPrice) / 1_000_000;
          const pnl = currentValue - purchasePrice;
          const pnlPercentage = purchasePrice > 0 ? (pnl / purchasePrice) * 100 : 0;

          userOpinions.push({
            id: opinion.id,
            question: opinion.question,
            currentAnswer: opinion.currentAnswer,
            currentValue,
            purchasePrice,
            pnl,
            pnlPercentage,
            isOwner: isAnswerOwner, // Owner of the current answer
            isCreator: isOriginalCreator, // Original creator
            isQuestionOwner, // Current question owner (for marketplace actions)
            categories: opinion.categories,
            timestamp: Date.now() - (opinion.id * 86400000), // Simulate timestamps
            isActive: opinion.isActive,
            totalVolume: Number(opinion.totalVolume) / 1_000_000,
            salePrice: Number(opinion.salePrice) / 1_000_000,
          });

          totalValue += currentValue;
          totalPnL += pnl;

          if (isAnswerOwner) {
            opinionsOwned++;
            if (pnl > 0) {
              wins++;
              tradingProfits += pnl;
            }
            if (pnl > bestTrade) bestTrade = pnl;
          }
          
          if (isOriginalCreator) {
            opinionsCreated++;
          }

          // Creator fees are tracked in FeeManager.accumulatedFees - no calculation needed here
          // The actual creator fees are fetched separately via getAccumulatedFees

          // TODO: Implement real transaction history from blockchain events
          // Current implementation uses simulated data - needs blockchain event parsing
          // Real implementation should query OpinionAction/FeesAction events from contract logs
        }
      });

      const totalTrades = Number(tradeCount || 0);
      
      // FIXED: Real total invested calculation using lastPrice (purchase prices)
      const totalInvested = userOpinions.reduce((sum, opinion) => {
        if (opinion.isOwner) {
          return sum + opinion.purchasePrice;
        }
        return sum;
      }, 0);
      
      // FIXED: Win rate based on positions only (consistent calculation)
      const totalPositions = opinionsOwned;
      const winRate = totalPositions > 0 ? (wins / totalPositions) * 100 : 0;
      
      const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
      totalROI = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

      // FIXED: Real market share using actual platform TVL
      const marketShare = platformTotalValue > 0 ? (totalValue / platformTotalValue) * 100 : 0;

      // FIXED: Real ranking calculation based on all users' portfolio values
      const userPortfolios = Array.from(allUsers).map(userAddress => {
        return allOpinions
          .filter(op => op.currentAnswerOwner?.toLowerCase() === userAddress)
          .reduce((sum, op) => sum + (Number(op.nextPrice) / 1_000_000), 0);
      }).filter(value => value > 0); // Only users with positions
      
      userPortfolios.sort((a, b) => b - a); // Sort descending
      const userRank = userPortfolios.findIndex(value => value <= totalValue) + 1;
      const rank = userRank > 0 ? userRank : userPortfolios.length + 1;
      const totalUsers = userPortfolios.length;

      setUserProfile({
        stats: {
          totalValue,
          totalPnL,
          totalPnLPercentage,
          totalInvested,
          opinionsOwned,
          opinionsCreated,
          questionsCreated: opinionsCreated, // Same as opinionsCreated for now
          totalTrades,
          winRate,
          accumulatedFees: accumulatedFees ? Number(accumulatedFees) / 1_000_000 : 0,
          rank,
          totalUsers, // FIXED: Real count of users with positions
          avgHoldTime: -1, // -1 indicates "coming soon" - will be replaced with real calculation
          bestTrade,
          totalROI,
          creatorFees: accumulatedFees ? Number(accumulatedFees) / 1_000_000 : 0, // FIXED: Use real accumulated fees
          tradingProfits,
          marketShare,
          platformTVL: platformTotalValue, // FIXED: Real platform TVL
        },
        opinions: userOpinions.sort((a, b) => b.timestamp - a.timestamp),
        transactions: [], // REMOVED: Fake transaction data - needs real blockchain event parsing
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error processing user profile:', error);
      setUserProfile(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load user profile',
      }));
    }
  }, [address, allOpinions, opinionsLoading, accumulatedFees, tradeCount]);

  return userProfile;
}

// Re-enabled fee claiming functionality
export function useClaimFees() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimFees = async () => {
    try {
      writeContract({
        address: CONTRACTS.FEE_MANAGER,
        abi: FEE_MANAGER_ABI,
        functionName: 'claimAccumulatedFees',
        args: [],
      });
    } catch (error) {
      console.error('Error claiming fees:', error);
      throw error;
    }
  };

  return {
    claimFees,
    isClaimingFees: isPending || isConfirming,
    claimSuccess: isSuccess,
    claimError: error,
    transactionHash: hash,
  };
}

// Utility functions
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
  const timestampMs = timestamp > 10000000000 ? timestamp : timestamp * 1000; // Handle both ms and seconds
  const diff = now - timestampMs;
  
  if (diff < 0) return 'In the future';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}