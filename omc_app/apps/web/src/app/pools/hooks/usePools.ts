'use client';

import { useState, useEffect, useCallback } from 'react';
import { useReadContract } from 'wagmi';
import { Pool, UsePoolsReturn, PlatformStats } from '../types/pool-types';
import { useAllOpinions } from '@/hooks/useAllOpinions';

// Contract addresses and ABI
import { CONTRACTS } from '@/lib/contracts';

const POOL_MANAGER_ADDRESS = CONTRACTS.POOL_MANAGER;

// PoolManager ABI - key functions for reading pools
// Correct struct order based on PoolStructs.sol:
const POOL_MANAGER_ABI = [
  {
    inputs: [{ name: 'poolId', type: 'uint256' }],
    name: 'pools',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },           // [0]
          { name: 'opinionId', type: 'uint256' },    // [1]
          { name: 'proposedAnswer', type: 'string' }, // [2]
          { name: 'totalAmount', type: 'uint96' },   // [3]
          { name: 'deadline', type: 'uint32' },      // [4]
          { name: 'creator', type: 'address' },      // [5]
          { name: 'status', type: 'uint8' },         // [6]
          { name: 'name', type: 'string' },          // [7]
          { name: 'ipfsHash', type: 'string' },      // [8]
          { name: 'targetPrice', type: 'uint96' }    // [9] - FIXED: Added missing targetPrice
        ],
        type: 'tuple',
      }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'opinionId', type: 'uint256' }],
    name: 'opinionPools',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'poolId', type: 'uint256' }],
    name: 'getPoolContributors',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'poolCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'poolId', type: 'uint256' }],
    name: 'getPoolDetails',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'uint256', name: 'opinionId', type: 'uint256' },
          { internalType: 'string', name: 'proposedAnswer', type: 'string' },
          { internalType: 'uint96', name: 'totalAmount', type: 'uint96' },
          { internalType: 'uint32', name: 'deadline', type: 'uint32' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'uint8', name: 'status', type: 'uint8' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'ipfsHash', type: 'string' },
          { internalType: 'uint96', name: 'targetPrice', type: 'uint96' },
        ],
        internalType: 'struct PoolStructs.PoolInfo',
        name: 'info',
        type: 'tuple',
      },
      { internalType: 'uint256', name: 'currentPrice', type: 'uint256' },
      { internalType: 'uint256', name: 'remainingAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'timeRemaining', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  }
] as const;

// Helper function to convert contract status to our type
const getPoolStatus = (statusNum: number): Pool['status'] => {
  switch (statusNum) {
    case 0: return 'active';
    case 1: return 'executed';
    case 2: return 'expired';
    default: return 'active';
  }
};

// Mock data for bootstrap phase
const createMockPlatformStats = (): PlatformStats => ({
  totalActivePools: 0,
  totalPooledAmount: '$0.00',
  avgSuccessRate: 0,
  poolsExecutedToday: 0,
  avgTimeToExecution: 0,
  topPoolByValue: null
});

interface UsePlatformStats extends UsePoolsReturn {
  platformStats: PlatformStats;
}

export function usePools(): UsePlatformStats {
  const [pools, setPools] = useState<Pool[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats>(createMockPlatformStats());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get opinion data to get real target prices and questions/categories
  const { opinions, isLoading: opinionsLoading } = useAllOpinions();

  // Get the pool count to know how many pools exist
  const { data: poolCount, isError: poolCountError } = useReadContract({
    address: POOL_MANAGER_ADDRESS,
    abi: POOL_MANAGER_ABI,
    functionName: 'poolCount',
    query: {
      enabled: true,
      staleTime: 30000, // 30 seconds
    }
  });

  // Fetch all pool details  
  const fetchPoolDetails = useCallback(async () => {
    // Always fetch from API - bypasses wallet connection requirements

    try {
      setLoading(true);
      setError(null);
      // Use the working API endpoint to get all pools at once
      const response = await fetch('/api/pools-working');
      const apiResult = await response.json();
      
      if (apiResult.success && apiResult.pools) {
        const validPools: Pool[] = [];
        
        apiResult.pools.forEach((poolData: any, index: number) => {
          // Get the corresponding opinion data for real targetPrice and question/category
          const opinionId = Number(poolData.info.opinionId);
          const opinionData = opinions.find(op => op.id === opinionId);
          
          const pool: Pool = {
            id: Number(poolData.info.id),
            opinionId: opinionId,
            proposedAnswer: poolData.info.proposedAnswer,
            name: poolData.info.name,
            creator: poolData.info.creator,
            totalAmount: BigInt(poolData.info.totalAmount),
            targetPrice: getPoolStatus(poolData.info.status) === 'executed' 
              ? BigInt(poolData.info.targetPrice) // ✅ FIX: Use fixed targetPrice for completed pools
              : (opinionData?.nextPrice || BigInt(poolData.currentPrice)), // Use dynamic nextPrice only for active pools
            deadline: Number(poolData.info.deadline),
            status: getPoolStatus(poolData.info.status),
            contributorCount: poolData.contributorCount,
            createdAt: Date.now() - (index * 24 * 60 * 60 * 1000), // Mock creation time
            remainingAmount: BigInt(poolData.remainingAmount),
            progressPercentage: (() => {
              const poolStatus = getPoolStatus(poolData.info.status);
              const targetPriceForCalc = poolStatus === 'executed' 
                ? Number(poolData.info.targetPrice) // Use fixed price for executed pools
                : Number(opinionData?.nextPrice || poolData.currentPrice); // Dynamic for active
              return targetPriceForCalc > 0 
                ? Math.min((Number(poolData.info.totalAmount) / targetPriceForCalc) * 100, 100) 
                : 0;
            })(),
            // Add question and category from opinion data
            question: opinionData?.question || '',
            category: opinionData?.categories?.[0] || 'Other'
          };
          
          validPools.push(pool);
        });
        
        setPools(validPools);

        // Calculate platform stats from pool data
        const activePools = validPools.filter(p => p.status === 'active');
        const totalPooled = validPools.reduce((sum, pool) => 
          sum + (Number(pool.totalAmount) / 1000000), 0
        );
        const executedPools = validPools.filter(p => p.status === 'executed');
        const successRate = validPools.length > 0 ? 
          (executedPools.length / validPools.length) * 100 : 0;

        setPlatformStats({
          totalActivePools: activePools.length,
          totalPooledAmount: `$${totalPooled.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}`,
          avgSuccessRate: Math.round(successRate),
          poolsExecutedToday: executedPools.filter(p => 
            (Date.now() - p.createdAt) < 24 * 60 * 60 * 1000
          ).length,
          avgTimeToExecution: 24, // Mock average
          topPoolByValue: validPools.length > 0 ? 
            validPools.reduce((max, pool) => 
              Number(pool.totalAmount) > Number(max.totalAmount) ? pool : max
            ) : null
        });
      } else {
        setPools([]);
      }

    } catch (err) {
      console.error('Error fetching pools:', err);
      setError('Failed to load pools');
    } finally {
      setLoading(false);
    }
  }, [poolCount, opinions]);

  // Fetch pools when component loads or dependencies change
  useEffect(() => {
    if (poolCountError) {
      // Don't return early, still fetch from API in bypass mode
    }

    // Wait for opinions data before fetching pools (needed for targetPrice calculation)
    if (!opinionsLoading) {
      fetchPoolDetails();
    }
  }, [poolCount, poolCountError, fetchPoolDetails, opinionsLoading]);

  // Refetch function
  const refetch = useCallback(() => {
    fetchPoolDetails();
  }, [fetchPoolDetails]);

  return {
    pools,
    platformStats,
    loading,
    error,
    refetch
  };
}

// Hook to get pools for a specific opinion
export function useOpinionPools(opinionId: number) {
  const { data: poolIds, isLoading, error } = useReadContract({
    address: POOL_MANAGER_ADDRESS,
    abi: POOL_MANAGER_ABI,
    functionName: 'opinionPools',
    args: [BigInt(opinionId)],
    query: {
      enabled: opinionId > 0,
      staleTime: 30000, // 30 seconds
    }
  });

  return {
    poolIds: poolIds ? poolIds.map(id => Number(id)) : [],
    loading: isLoading,
    error: error?.message || null
  };
}

// Hook to get detailed information about a specific pool
export function usePoolDetails(poolId: number) {
  const [poolDetails, setPoolDetails] = useState<{
    id: bigint;
    opinionId: bigint;
    proposedAnswer: string;
    totalAmount: bigint;
    deadline: number;
    creator: string;
    status: number;
    name: string;
    ipfsHash: string;
    currentPrice: bigint;
    remainingAmount: bigint;
    timeRemaining: bigint;
    contributorCount: number;
    contributors: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: poolData, isError } = useReadContract({
    address: POOL_MANAGER_ADDRESS,
    abi: POOL_MANAGER_ABI,
    functionName: 'pools',
    args: [BigInt(poolId)],
    query: {
      enabled: poolId >= 0,
      staleTime: 10000, // 10 seconds for more real-time updates
    }
  });

  const { data: contributors } = useReadContract({
    address: POOL_MANAGER_ADDRESS,
    abi: POOL_MANAGER_ABI,
    functionName: 'getPoolContributors',
    args: [BigInt(poolId)],
    query: {
      enabled: poolId >= 0,
      staleTime: 30000,
    }
  });

  useEffect(() => {
    if (isError) {
      setError('Failed to load pool details');
      setLoading(false);
      return;
    }

    if (poolData) {
      // poolData is now the direct tuple from the pools mapping
      // Correct mapping: [0] id, [1] opinionId, [2] proposedAnswer, [3] totalAmount, 
      // [4] deadline, [5] creator, [6] status, [7] name, [8] ipfsHash
      const poolArray = poolData as unknown as any[];
      setPoolDetails({
        id: poolArray[0],
        opinionId: poolArray[1],
        creator: poolArray[5],        // [5] creator
        proposedAnswer: poolArray[2], // [2] proposedAnswer
        totalAmount: poolArray[3],    // [3] totalAmount
        deadline: Number(poolArray[4]), // [4] deadline
        status: Number(poolArray[6]), // [6] status
        name: poolArray[7],           // [7] name
        ipfsHash: poolArray[8],       // [8] ipfsHash
        currentPrice: poolArray[3],   // totalAmount as currentPrice
        remainingAmount: poolArray[3], // For now, assume no contributions tracked
        timeRemaining: BigInt(Math.max(0, Number(poolArray[4]) - Math.floor(Date.now() / 1000))),
        contributorCount: contributors?.length || 0,
        contributors: contributors ? Array.from(contributors) : []
      });
      setError(null);
    }
    
    setLoading(false);
  }, [poolData, contributors, isError]);

  return {
    poolDetails,
    loading,
    error,
    refetch: () => {
      // This will trigger a refetch by invalidating the query
      setLoading(true);
    }
  };
}