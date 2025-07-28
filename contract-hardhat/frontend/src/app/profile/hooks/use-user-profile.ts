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
  isOwner: boolean;
  isCreator: boolean;
  categories: string[];
  timestamp: number;
  isActive: boolean;
  totalVolume: number;
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
  opinionsOwned: number;
  opinionsCreated: number;
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
      opinionsOwned: 0,
      opinionsCreated: 0,
      totalTrades: 0,
      winRate: 0,
      accumulatedFees: 0,
      rank: 1,
      totalUsers: 100,
      avgHoldTime: 0,
      bestTrade: 0,
      totalROI: 0,
      creatorFees: 0,
      tradingProfits: 0,
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
      const userTransactions: Transaction[] = [];
      let totalValue = 0;
      let totalPnL = 0;
      let opinionsOwned = 0;
      let opinionsCreated = 0;
      let wins = 0;
      let totalROI = 0;
      let bestTrade = 0;
      let creatorFees = 0;
      let tradingProfits = 0;

      // Process each opinion to find user's involvement
      allOpinions.forEach((opinion) => {
        const isOwner = opinion.currentAnswerOwner?.toLowerCase() === address.toLowerCase();
        const isCreator = opinion.creator?.toLowerCase() === address.toLowerCase();

        if (isOwner || isCreator) {
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
            isOwner,
            isCreator,
            categories: opinion.categories,
            timestamp: Date.now() - (opinion.id * 86400000), // Simulate timestamps
            isActive: opinion.isActive,
            totalVolume: Number(opinion.totalVolume) / 1_000_000,
          });

          totalValue += currentValue;
          totalPnL += pnl;

          if (isOwner) {
            opinionsOwned++;
            if (pnl > 0) {
              wins++;
              tradingProfits += pnl;
            }
            if (pnl > bestTrade) bestTrade = pnl;
          }
          
          if (isCreator) {
            opinionsCreated++;
            // Simulate creator fees (3% of total volume)
            creatorFees += (Number(opinion.totalVolume) / 1_000_000) * 0.03;
          }

          // Generate sample transactions
          if (isOwner) {
            userTransactions.push({
              id: `${opinion.id}-buy`,
              type: 'BUY',
              amount: 1,
              price: purchasePrice,
              timestamp: Date.now() - (opinion.id * 86400000),
              opinionId: opinion.id,
              opinionTitle: opinion.question,
              txHash: `0x${Math.random().toString(16).slice(2, 18)}`,
              status: 'success',
            });
          }
          
          if (isCreator) {
            userTransactions.push({
              id: `${opinion.id}-create`,
              type: 'CREATE',
              amount: 1,
              price: purchasePrice,
              timestamp: Date.now() - (opinion.id * 86400000),
              opinionId: opinion.id,
              opinionTitle: opinion.question,
              txHash: `0x${Math.random().toString(16).slice(2, 18)}`,
              status: 'success',
            });
          }
        }
      });

      const totalTrades = Number(tradeCount || 0);
      const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
      const totalPnLPercentage = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;
      totalROI = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;

      // Calculate rank (simulate based on portfolio performance)
      const rankScore = totalValue + totalPnL;
      const rank = Math.max(1, Math.floor(100 - (rankScore / 100)));

      setUserProfile({
        stats: {
          totalValue,
          totalPnL,
          totalPnLPercentage,
          opinionsOwned,
          opinionsCreated,
          totalTrades,
          winRate,
          accumulatedFees: accumulatedFees ? Number(accumulatedFees) / 1_000_000 : 0,
          rank,
          totalUsers: 1000,
          avgHoldTime: 5.2, // days
          bestTrade,
          totalROI,
          creatorFees,
          tradingProfits,
        },
        opinions: userOpinions.sort((a, b) => b.timestamp - a.timestamp),
        transactions: userTransactions.sort((a, b) => b.timestamp - a.timestamp),
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
export function formatUSDC(value: number): string {
  return `$${value.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}