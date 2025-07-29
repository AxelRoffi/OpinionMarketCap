'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useReadContracts } from 'wagmi';
import { toast } from 'sonner';

// Contract addresses
const POOL_MANAGER_ADDRESS = '0x3B4584e690109484059D95d7904dD9fEbA246612' as `0x${string}`;

// PoolManager ABI for withdraw function and pool data
const POOL_MANAGER_ABI = [
  {
    inputs: [
      { name: 'poolId', type: 'uint256' }
    ],
    name: 'withdrawFromExpiredPool',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'poolId', type: 'uint256' }
    ],
    name: 'withdrawFromPoolEarly',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'user', type: 'address' }
    ],
    name: 'getEarlyWithdrawalPreview',
    outputs: [
      { name: 'userContribution', type: 'uint96' },
      { name: 'penalty', type: 'uint96' },
      { name: 'userWillReceive', type: 'uint96' },
      { name: 'canWithdraw', type: 'boolean' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'user', type: 'address' }
    ],
    name: 'poolContributionAmounts',
    outputs: [{ name: '', type: 'uint96' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'poolId', type: 'uint256' }
    ],
    name: 'pools',
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'opinionId', type: 'uint256' },
      { name: 'proposedAnswer', type: 'string' },
      { name: 'totalAmount', type: 'uint96' },
      { name: 'deadline', type: 'uint32' },
      { name: 'creator', type: 'address' },
      { name: 'status', type: 'uint8' },
      { name: 'name', type: 'string' },
      { name: 'ipfsHash', type: 'string' },
      { name: 'targetPrice', type: 'uint96' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'poolCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  }
] as const;

export interface UserPool {
  id: number;
  name: string;
  opinionId: number;
  proposedAnswer: string;
  contribution: string; // in USDC
  contributionRaw: bigint;
  deadline: number;
  status: 'Active' | 'Expired' | 'Executed' | 'Extended';
  isExpired: boolean;
  canWithdraw: boolean;
  canWithdrawEarly: boolean; // NEW: Can withdraw with penalty from active pools
  earlyWithdrawalPenalty?: string; // NEW: 20% penalty amount in USDC
  earlyWithdrawalReceive?: string; // NEW: 80% amount user will receive
  totalAmount: string;
  question?: string;
}

export function useWithdrawFromExpiredPool() {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawTxHash, setWithdrawTxHash] = useState<string | null>(null);
  const [pendingWithdraw, setPendingWithdraw] = useState<{poolId: number, amount: string} | null>(null);

  // Contract write hook
  const { writeContractAsync } = useWriteContract();
  
  // Transaction receipt hook
  const { isLoading: isWithdrawPending, isSuccess: isWithdrawSuccess, isError: isWithdrawError } = useWaitForTransactionReceipt({
    hash: withdrawTxHash as `0x${string}`,
  });

  // Handle withdrawal success
  useEffect(() => {
    if (isWithdrawSuccess && pendingWithdraw) {
      toast.success('Pool refund successful!', {
        description: `Refunded ${pendingWithdraw.amount} USDC from pool #${pendingWithdraw.poolId}`,
        duration: 5000,
        action: {
          label: 'View Transaction',
          onClick: () => window.open(`https://sepolia.basescan.org/tx/${withdrawTxHash}`, '_blank')
        }
      });
      
      // Reset states
      setIsWithdrawing(false);
      setPendingWithdraw(null);
      setWithdrawTxHash(null);
      setError(null);
    }
  }, [isWithdrawSuccess, pendingWithdraw, withdrawTxHash]);

  // Handle errors
  useEffect(() => {
    if (isWithdrawError) {
      setError('Pool withdrawal transaction failed');
      setIsWithdrawing(false);
      setPendingWithdraw(null);
    }
  }, [isWithdrawError]);

  const withdrawFromPool = async (poolId: number, contributionAmount: string, isEarlyWithdrawal = false) => {
    try {
      setIsWithdrawing(true);
      setError(null);
      setPendingWithdraw({ poolId, amount: contributionAmount });

      toast.info(isEarlyWithdrawal ? 'Early withdrawing with 20% penalty...' : 'Withdrawing from expired pool...', {
        duration: 4000,
      });

      const txHash = await writeContractAsync({
        address: POOL_MANAGER_ADDRESS,
        abi: POOL_MANAGER_ABI,
        functionName: isEarlyWithdrawal ? 'withdrawFromPoolEarly' : 'withdrawFromExpiredPool',
        args: [BigInt(poolId)],
      });

      setWithdrawTxHash(txHash);
      
      toast.success('Withdrawal submitted!', {
        description: 'Waiting for confirmation...',
        duration: 3000,
      });

      return txHash;

    } catch (err: unknown) {
      console.error('Withdraw from pool error:', err);
      
      let errorMessage = 'Failed to withdraw from pool';
      
      if (err instanceof Error) {
        if (err.message?.includes('rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else if (err.message?.includes('PoolNotExpired')) {
          errorMessage = 'Pool is not expired yet';
        } else if (err.message?.includes('PoolNoContribution')) {
          errorMessage = 'No contribution found in this pool';
        } else if (err.message?.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for gas fee';
        }
      }
      
      setError(errorMessage);
      
      toast.error('Withdrawal failed', {
        description: errorMessage,
        duration: 5000,
      });
      
      setIsWithdrawing(false);
      setPendingWithdraw(null);
      
      return null;
    }
  };

  const actualIsWithdrawing = isWithdrawing || isWithdrawPending;

  return {
    withdrawFromPool,
    isWithdrawing: actualIsWithdrawing,
    error,
    withdrawTxHash,
    isWithdrawSuccess,
    pendingWithdraw,
  };
}

// Hook to fetch user's pool contributions
export function useUserPools(userAddress: `0x${string}` | undefined) {
  const [userPools, setUserPools] = useState<UserPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get total pool count
  const { data: poolCount } = useReadContract({
    address: POOL_MANAGER_ADDRESS,
    abi: POOL_MANAGER_ABI,
    functionName: 'poolCount',
  });

  // Fetch user contributions for all pools
  const poolIds = poolCount ? Array.from({ length: Number(poolCount) }, (_, i) => i) : [];
  
  const { data: poolsData } = useReadContracts({
    contracts: poolIds.map((poolId) => ({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'pools',
      args: [BigInt(poolId)],
    })),
    query: {
      enabled: poolIds.length > 0,
    },
  });

  const { data: contributionsData } = useReadContracts({
    contracts: poolIds.map((poolId) => ({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'poolContributionAmounts',
      args: [BigInt(poolId), userAddress],
    })),
    query: {
      enabled: !!userAddress && poolIds.length > 0,
    },
  });

  // Fetch early withdrawal preview for all pools
  const { data: earlyWithdrawalData } = useReadContracts({
    contracts: poolIds.map((poolId) => ({
      address: POOL_MANAGER_ADDRESS,
      abi: POOL_MANAGER_ABI,
      functionName: 'getEarlyWithdrawalPreview',
      args: [BigInt(poolId), userAddress],
    })),
    query: {
      enabled: !!userAddress && poolIds.length > 0,
    },
  });

  useEffect(() => {
    console.log('🔧 [POOL DEBUG] useUserPools effect triggered:', {
      userAddress,
      poolCount: poolCount ? Number(poolCount) : 'undefined',
      poolsDataLength: poolsData?.length,
      contributionsDataLength: contributionsData?.length,
      earlyWithdrawalDataLength: earlyWithdrawalData?.length
    });
    
    if (!userAddress || !poolCount || !poolsData || !contributionsData) {
      console.log('🔧 [POOL DEBUG] Early return - missing data:', {
        hasUserAddress: !!userAddress,
        hasPoolCount: !!poolCount,
        hasPoolsData: !!poolsData,
        hasContributionsData: !!contributionsData,
        hasEarlyWithdrawalData: !!earlyWithdrawalData
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const currentTime = Math.floor(Date.now() / 1000);
      const realUserPools: UserPool[] = [];

      // Processing pools for user

      // Process all pools and filter for user contributions
      poolIds.forEach((poolId, index) => {
        const poolResult = poolsData[index];
        const contributionResult = contributionsData[index];
        const earlyWithdrawalResult = earlyWithdrawalData[index];

        // Check pool data status

        if (poolResult?.status === 'success' && contributionResult?.status === 'success') {
          const poolInfo = poolResult.result as {
            id: bigint;
            opinionId: bigint;
            proposedAnswer: string;
            totalAmount: bigint;
            deadline: number;
            creator: string;
            status: number;
            name: string;
            ipfsHash: string;
            targetPrice: bigint;
          };
          const userContribution = contributionResult.result as bigint;
          const contributionAmount = Number(userContribution) / 1000000;
          
          // Get early withdrawal preview data (if available)
          let canWithdrawEarly = false;
          let penalty = BigInt(0);
          let userWillReceive = BigInt(0);
          
          if (earlyWithdrawalResult?.status === 'success') {
            const earlyWithdrawalPreview = earlyWithdrawalResult.result as [bigint, bigint, bigint, boolean];
            [, penalty, userWillReceive, canWithdrawEarly] = earlyWithdrawalPreview;
          }

          // Process pool details

          // Include pools where user has contributions OR pool #2 (for withdrawal history)
          if (Number(userContribution) > 0 || poolId === 2) {
            const isExpired = currentTime > Number(poolInfo.deadline);
            const canWithdraw = isExpired && Number(userContribution) > 0;

            const pool: UserPool = {
              id: poolId,
              name: `Pool #${poolId}`,
              opinionId: Number(poolInfo.opinionId),
              proposedAnswer: poolInfo.proposedAnswer || 'Unknown Answer',
              contribution: (Number(userContribution) / 1000000).toFixed(6), // Convert from 6 decimals
              contributionRaw: userContribution,
              deadline: Number(poolInfo.deadline),
              status: poolInfo.status === 0 ? 'Active' : 
                     poolInfo.status === 1 ? 'Executed' : 'Expired',
              isExpired,
              canWithdraw,
              canWithdrawEarly: canWithdrawEarly && contributionAmount > 0,
              earlyWithdrawalPenalty: contributionAmount > 0 ? (Number(penalty) / 1000000).toFixed(6) : undefined,
              earlyWithdrawalReceive: contributionAmount > 0 ? (Number(userWillReceive) / 1000000).toFixed(6) : undefined,
              totalAmount: (Number(poolInfo.totalAmount) / 1000000).toFixed(6),
              question: poolInfo.status === 0 ? 
                `Active pool for Opinion #${poolInfo.opinionId}` :
                `Pool for Opinion #${poolInfo.opinionId} (${poolInfo.proposedAnswer})`
            };

            realUserPools.push(pool);
          }
        }
      });

      setUserPools(realUserPools);
      setError(null);
    } catch (err) {
      console.error('Error processing user pools:', err);
      setError('Failed to process pool data');
    } finally {
      setLoading(false);
    }
  }, [userAddress, poolCount, poolsData, contributionsData, earlyWithdrawalData]);

  const refetch = () => {
    if (userAddress && poolCount) {
      setLoading(true);
      setError(null);
      // Trigger the useEffect to re-fetch real data
      const timeoutId = setTimeout(() => {
        // Force re-render by updating userPools temporarily
        setUserPools(currentPools => [...currentPools]);
        setLoading(false);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  // Function to update a specific pool after withdrawal
  const updatePoolAfterWithdrawal = (poolId: number) => {
    setUserPools(currentPools => 
      currentPools.map(pool => 
        pool.id === poolId 
          ? {
              ...pool,
              contribution: '0.000000',
              contributionRaw: BigInt(0),
              canWithdraw: false,
              status: 'Expired' as const // Keep as expired but no longer withdrawable
            }
          : pool
      )
    );
  };

  return {
    userPools,
    loading,
    error,
    refetch,
    updatePoolAfterWithdrawal,
  };
}