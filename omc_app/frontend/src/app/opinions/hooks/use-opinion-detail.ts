import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { OpinionDetail, AnswerHistory, OpinionStats, TradingActivity } from '../types/opinion-types';

// Contract configuration
const CONTRACTS = {
  OPINION_CORE: '0xB2D35055550e2D49E5b2C21298528579A8bF7D2f' as `0x${string}`,
};

// ABI for the functions we need - CORRECTED TO MATCH ACTUAL CONTRACT
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
    inputs: [{ name: 'opinionId', type: 'uint256' }],
    name: 'getAnswerHistory',
    outputs: [
      {
        components: [
          { name: 'answer', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'owner', type: 'address' },
          { name: 'price', type: 'uint96' },
          { name: 'timestamp', type: 'uint32' },
        ],
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function useOpinionDetail(opinionId: number) {
  const [stats, setStats] = useState<OpinionStats | null>(null);
  const [activity, setActivity] = useState<TradingActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate opinionId
  const isValidOpinionId = !isNaN(opinionId) && opinionId > 0 && Number.isInteger(opinionId);

  // Fetch opinion details
  const {
    data: opinionData,
    isLoading: opinionLoading,
    error: opinionError,
  } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getOpinionDetails',
    args: [BigInt(opinionId)],
    query: {
      enabled: isValidOpinionId,
    },
  });

  // Fetch answer history
  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
  } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'getAnswerHistory',
    args: [BigInt(opinionId)],
    query: {
      enabled: isValidOpinionId,
    },
  });

  // Transform contract data to our interface
  const opinion: OpinionDetail | null = opinionData ? {
    id: opinionId,
    creator: opinionData.creator,
    questionOwner: opinionData.questionOwner,
    currentAnswerOwner: opinionData.currentAnswerOwner,
    currentAnswer: opinionData.currentAnswer,
    currentAnswerDescription: opinionData.currentAnswerDescription,
    lastPrice: opinionData.lastPrice,
    nextPrice: opinionData.nextPrice,
    salePrice: opinionData.salePrice,
    isActive: opinionData.isActive,
    totalVolume: opinionData.totalVolume,
    question: opinionData.question,
    categories: [...opinionData.categories],
    createdAt: Date.now(), // Would be better to get from contract events
  } : null;

  // Transform history data
  const history: AnswerHistory[] = historyData ? historyData.map((item: {
    answer: string;
    description: string;
    owner: string;
    price: bigint;
    timestamp: number;
  }) => ({
    answer: item.answer,
    description: item.description,
    owner: item.owner,
    price: item.price,
    timestamp: Number(item.timestamp),
  })) : [];

  // Calculate stats and activity
  useEffect(() => {
    if (!opinionData || !historyData) return;

    setLoading(true);
    setError(null);

    try {
      // Calculate stats
      const uniqueHolders = new Set([
        opinionData.creator,
        ...historyData.map((h: { owner: string }) => h.owner),
      ]).size;

      const prices = historyData.map((h: { price: bigint }) => Number(h.price) / 1_000_000);
      const priceRange = {
        min: Math.min(...prices, Number(opinionData.lastPrice) / 1_000_000),
        max: Math.max(...prices, Number(opinionData.nextPrice) / 1_000_000),
      };

      // Generate price/volume history (would be better from contract events)
      const volumeHistory = historyData.map((h: { timestamp: number; price: bigint }) => ({
        timestamp: h.timestamp * 1000,
        price: Number(h.price) / 1_000_000,
        volume: Number(h.price) / 1_000_000, // Simplified volume calculation
      }));

      const calculatedStats: OpinionStats = {
        totalTrades: historyData.length,
        uniqueHolders,
        priceRange,
        volumeHistory,
      };

      // Transform history to activity
      const tradingActivity: TradingActivity[] = historyData.map((h: { answer: string; owner: string; price: bigint; timestamp: number }, index: number) => ({
        id: `${opinionId}-${index}`,
        type: 'answer_change' as const,
        user: h.owner,
        answer: h.answer,
        price: h.price,
        timestamp: h.timestamp * 1000,
      }));

      setStats(calculatedStats);
      setActivity(tradingActivity);
    } catch (err) {
      setError('Failed to process opinion data');
      console.error('Error processing opinion data:', err);
    } finally {
      setLoading(false);
    }
  }, [opinionData, historyData, opinionId]);

  // Handle invalid opinion ID
  if (!isValidOpinionId) {
    return {
      opinion: null,
      history: [],
      stats: null,
      activity: [],
      loading: false,
      error: 'Invalid opinion ID',
    };
  }

  return {
    opinion,
    history,
    stats,
    activity,
    loading: loading || opinionLoading || historyLoading,
    error: error || opinionError?.message || historyError?.message || null,
  };
}

// Utility functions
export function formatUSDC(wei: bigint): string {
  const usdc = Number(wei) / 1_000_000;
  return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function calculateChange(current: bigint, previous: bigint): { percentage: number; isPositive: boolean; absolute: number } {
  if (previous === BigInt(0)) return { percentage: 0, isPositive: true, absolute: 0 };
  
  const diff = Number(current - previous);
  const percentage = (diff / Number(previous)) * 100;
  
  return {
    percentage: Math.abs(percentage),
    isPositive: diff >= 0,
    absolute: Math.abs(diff / 1_000_000),
  };
}