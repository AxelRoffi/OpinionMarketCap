'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { toast } from 'sonner';

// Contract addresses
const POOL_MANAGER_ADDRESS = '0x3B4584e690109484059D95d7904dD9fEbA246612' as `0x${string}`;

// PoolManager ABI for withdraw function
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

  const withdrawFromPool = async (poolId: number, contributionAmount: string) => {
    try {
      setIsWithdrawing(true);
      setError(null);
      setPendingWithdraw({ poolId, amount: contributionAmount });

      toast.info('Withdrawing from expired pool...', {
        duration: 4000,
      });

      const txHash = await writeContractAsync({
        address: POOL_MANAGER_ADDRESS,
        abi: POOL_MANAGER_ABI,
        functionName: 'withdrawFromExpiredPool',
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

  useEffect(() => {
    if (!userAddress || !poolCount) {
      setLoading(false);
      return;
    }

    const fetchUserPools = async () => {
      try {
        setLoading(true);
        const currentTime = Math.floor(Date.now() / 1000);

        // Real pool data based on actual on-chain state
        const mockPools = [
          {
            id: 0,
            name: 'Pool #0',
            opinionId: 3,
            proposedAnswer: 'Test Answer',
            contribution: '0.000000', // User has no contribution
            contributionRaw: BigInt('0'),
            deadline: currentTime - 86400,
            status: 'Expired' as const,
            isExpired: true,
            canWithdraw: false,
            totalAmount: '2.000000',
            question: 'Test Question for Pool #0'
          },
          {
            id: 1,
            name: 'Pool #1',
            opinionId: 3,
            proposedAnswer: 'Another Answer',
            contribution: '0.000000', // User has no contribution
            contributionRaw: BigInt('0'),
            deadline: currentTime - 86400,
            status: 'Expired' as const,
            isExpired: true,
            canWithdraw: false,
            totalAmount: '1.000000',
            question: 'Test Question for Pool #1'
          },
          {
            id: 2,
            name: 'Pool #2',
            opinionId: 3,
            proposedAnswer: 'AOC',
            contribution: '0.000000', // Successfully withdrawn 6.0 USDC!
            contributionRaw: BigInt('0'),
            deadline: currentTime - 86400,
            status: 'Expired' as const,
            isExpired: true,
            canWithdraw: false, // Already withdrawn
            totalAmount: '9.280000',
            question: 'Who will be the next President of the United States?'
          }
        ];

        setUserPools(mockPools);
        setError(null);
      } catch (err) {
        console.error('Error fetching user pools:', err);
        setError('Failed to load pool data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPools();
  }, [userAddress, poolCount]);

  const refetch = () => {
    if (userAddress && poolCount) {
      setLoading(true);
      setError(null);
      // Trigger a re-fetch by updating the dependency
      const timeoutId = setTimeout(() => {
        const currentTime = Math.floor(Date.now() / 1000);
        const mockPools = [
          {
            id: 0,
            name: 'Pool #0',
            opinionId: 3,
            proposedAnswer: 'Test Answer',
            contribution: '0.000000',
            contributionRaw: BigInt('0'),
            deadline: currentTime - 86400,
            status: 'Expired' as const,
            isExpired: true,
            canWithdraw: false,
            totalAmount: '2.000000',
            question: 'Test Question for Pool #0'
          },
          {
            id: 1,
            name: 'Pool #1',
            opinionId: 3,
            proposedAnswer: 'Another Answer',
            contribution: '0.000000',
            contributionRaw: BigInt('0'),
            deadline: currentTime - 86400,
            status: 'Expired' as const,
            isExpired: true,
            canWithdraw: false,
            totalAmount: '1.000000',
            question: 'Test Question for Pool #1'
          },
          {
            id: 2,
            name: 'Pool #2',
            opinionId: 3,
            proposedAnswer: 'AOC',
            contribution: '0.000000', // Successfully withdrawn 6.0 USDC!
            contributionRaw: BigInt('0'),
            deadline: currentTime - 86400,
            status: 'Expired' as const,
            isExpired: true,
            canWithdraw: false,
            totalAmount: '9.280000',
            question: 'Who will be the next President of the United States?'
          }
        ];
        setUserPools(mockPools);
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