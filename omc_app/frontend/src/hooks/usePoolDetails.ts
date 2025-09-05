import { useState, useEffect } from 'react';

export interface PoolContributor {
  address: string;
  amount: string;
  timestamp?: number;
}

export interface DetailedPoolInfo {
  id: number;
  name: string;
  description: string;
  opinionId: number;
  proposedAnswer: string;
  creator: string;
  status: 'active' | 'executed' | 'expired';
  statusNumber: number; // 0=active, 1=executed, 2=expired
  
  // Financial data
  currentAmount: string; // in USDC (formatted)
  targetAmount: string; // in USDC (formatted)
  remainingAmount: string; // in USDC (formatted)
  progressPercentage: number;
  
  // Time data
  deadline: number; // timestamp
  timeRemaining: number; // seconds
  createdAt?: number; // timestamp
  
  // Community data
  contributors: PoolContributor[];
  contributorCount: number;
  
  // Opinion context
  opinionQuestion: string;
  opinionCurrentAnswer: string;
  opinionCategory: string;
  
  // Additional metadata
  ipfsHash?: string;
  canJoin: boolean;
  canWithdraw: boolean;
  userContribution?: string; // User's contribution amount if any
}

interface UsePoolDetailsReturn {
  poolDetails: DetailedPoolInfo | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const CACHE_DURATION = 30000; // 30 seconds
const poolCache = new Map<number, { data: DetailedPoolInfo; timestamp: number }>();

/**
 * Hook to fetch detailed information about a specific pool
 * Includes pool data, contributors, opinion context, and user-specific data
 */
export function usePoolDetails(poolId: number, userAddress?: string): UsePoolDetailsReturn {
  const [poolDetails, setPoolDetails] = useState<DetailedPoolInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoolDetails = async () => {
    if (!poolId && poolId !== 0) {
      setError('Invalid pool ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cached = poolCache.get(poolId);
      const now = Date.now();
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setPoolDetails(cached.data);
        setIsLoading(false);
        return;
      }

      // Fetch pool data from existing API
      const poolResponse = await fetch(`/api/pools-working/${poolId}`);
      if (!poolResponse.ok) {
        if (poolResponse.status === 404) {
          throw new Error('Pool not found');
        }
        throw new Error(`Failed to fetch pool: ${poolResponse.statusText}`);
      }

      const poolData = await poolResponse.json();
      if (!poolData.success || !poolData.pool) {
        throw new Error('Invalid pool data received');
      }

      const pool = poolData.pool;

      // Get opinion context data (for question, current answer, category)
      let opinionData = null;
      try {
        const opinionResponse = await fetch(`/api/opinion/${pool.info.opinionId}`);
        if (opinionResponse.ok) {
          const opinionResult = await opinionResponse.json();
          if (opinionResult.success) {
            opinionData = opinionResult.opinion;
          }
        }
      } catch (opinionError) {
        console.warn('Could not fetch opinion context:', opinionError);
        // Continue without opinion data - not critical
      }

      // Calculate time remaining
      const currentTime = Math.floor(Date.now() / 1000);
      const timeRemaining = Math.max(0, pool.info.deadline - currentTime);

      // Determine status
      const statusNumber = pool.info.status;
      let status: 'active' | 'executed' | 'expired' = 'active';
      if (statusNumber === 1) status = 'executed';
      else if (statusNumber === 2 || timeRemaining === 0) status = 'expired';

      // Calculate progress
      const currentAmountNum = parseFloat(pool.info.totalAmount) / 1_000_000; // Convert from wei
      const targetAmountNum = parseFloat(pool.info.targetPrice) / 1_000_000; // Convert from wei
      const remainingAmountNum = Math.max(0, targetAmountNum - currentAmountNum);
      const progressPercentage = targetAmountNum > 0 
        ? Math.min((currentAmountNum / targetAmountNum) * 100, 100) 
        : 0;

      // Format contributor data (mock for now - will be enhanced)
      const contributors: PoolContributor[] = [];
      // TODO: Fetch real contributor data from smart contract

      // Determine user's ability to join/withdraw
      const canJoin = status === 'active' && timeRemaining > 0 && progressPercentage < 100;
      const canWithdraw = status === 'expired' && userAddress; // Can withdraw from expired pools

      // Build detailed pool info
      const detailedPool: DetailedPoolInfo = {
        id: poolId,
        name: pool.info.name || `Pool #${poolId}`,
        description: `Pool targeting "${pool.info.proposedAnswer}" for ${opinionData?.question || 'Unknown Opinion'}`,
        opinionId: parseInt(pool.info.opinionId),
        proposedAnswer: pool.info.proposedAnswer,
        creator: pool.info.creator,
        status,
        statusNumber,

        // Financial data
        currentAmount: currentAmountNum.toFixed(6),
        targetAmount: targetAmountNum.toFixed(6),
        remainingAmount: remainingAmountNum.toFixed(6),
        progressPercentage,

        // Time data
        deadline: pool.info.deadline,
        timeRemaining,
        createdAt: pool.createdAt,

        // Community data
        contributors,
        contributorCount: pool.contributorCount || 0,

        // Opinion context
        opinionQuestion: opinionData?.question || 'Loading...',
        opinionCurrentAnswer: opinionData?.currentAnswer || 'Loading...',
        opinionCategory: opinionData?.categories?.[0] || 'Other',

        // Additional metadata
        ipfsHash: pool.info.ipfsHash,
        canJoin,
        canWithdraw,
        userContribution: undefined // TODO: Fetch user's contribution amount
      };

      // Cache the result
      poolCache.set(poolId, { data: detailedPool, timestamp: now });
      
      setPoolDetails(detailedPool);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching pool details:', err);
      setError(errorMessage);
      setPoolDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPoolDetails();
  }, [poolId, userAddress]);

  const refresh = async () => {
    // Clear cache for this pool
    poolCache.delete(poolId);
    await fetchPoolDetails();
  };

  return {
    poolDetails,
    isLoading,
    error,
    refresh
  };
}

/**
 * Utility function to format time remaining in human-readable format
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';

  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Utility function to get status color class
 */
export function getStatusColor(status: DetailedPoolInfo['status']): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-500 hover:bg-emerald-600';
    case 'executed':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'expired':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
}

/**
 * Utility function to get status text
 */
export function getStatusText(status: DetailedPoolInfo['status']): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'executed':
      return 'Executed';
    case 'expired':
      return 'Expired';
    default:
      return 'Unknown';
  }
}