import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS, POOL_MANAGER_ABI, USDC_ABI } from '@/lib/contracts';
import { formatUSDC } from '@/lib/utils';

interface PoolCompletionState {
  isCompletable: boolean;
  remainingAmount: bigint;
  targetAmount: bigint;
  currentAmount: bigint;
  userUSDCBalance: bigint;
  canUserComplete: boolean;
  completionCost: string;
  precisionStrategy: 'exact';
  poolInfo: PoolDetails['info'] | null;
  timeRemaining: number;
  isExpired: boolean;
}

interface PoolDetails {
  info: {
    id: bigint;
    opinionId: bigint;
    proposedAnswer: string;
    totalAmount: bigint;
    targetPrice: bigint;
    deadline: number;
    creator: string;
    status: number; // 0=Active, 1=Executed, 2=Expired, 3=Extended
    name: string;
    ipfsHash: string;
  };
  currentPrice: bigint;
  remainingAmount: bigint;
  timeRemaining: bigint;
}

export const usePoolCompletion = (poolId: number) => {
  const { address: userAddress } = useAccount();
  
  const [completionState, setCompletionState] = useState<PoolCompletionState>({
    isCompletable: false,
    remainingAmount: 0n,
    targetAmount: 0n,
    currentAmount: 0n,
    userUSDCBalance: 0n,
    canUserComplete: false,
    completionCost: "0.00",
    precisionStrategy: 'exact',
    poolInfo: null,
    timeRemaining: 0,
    isExpired: false,
  });

  console.log('🔧 usePoolCompletion called with:', { poolId, userAddress });

  // Get pool details from PoolManager contract
  const { data: poolDetails, refetch: refetchPoolDetails, error: poolError, isLoading: poolLoading } = useReadContract({
    address: CONTRACTS.POOL_MANAGER,
    abi: POOL_MANAGER_ABI,
    functionName: 'getPoolDetails',
    args: [BigInt(poolId)],
    query: {
      enabled: poolId >= 0,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  }) as { data: PoolDetails | undefined, refetch: () => void, error: any, isLoading: boolean };

  console.log('🔧 Pool details contract call:', {
    poolId,
    address: CONTRACTS.POOL_MANAGER,
    enabled: poolId >= 0,
    isLoading: poolLoading,
    hasData: !!poolDetails,
    error: poolError?.message,
    fullError: poolError,
    poolDetails,
    rawPoolDetails: poolDetails
  });

  // Check if pool exists by trying a different approach
  if (!poolLoading && !poolDetails && !poolError) {
    console.warn('🚨 CRITICAL: Pool details returned nothing - Pool might not exist!', {
      poolId,
      contractAddress: CONTRACTS.POOL_MANAGER,
      tryingPoolId: BigInt(poolId).toString()
    });
  }

  // Get user USDC balance
  const { data: userBalance, refetch: refetchBalance, error: balanceError, isLoading: balanceLoading } = useReadContract({
    address: CONTRACTS.USDC_TOKEN,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 15000, // Refresh every 15 seconds
    },
  }) as { data: bigint | undefined, refetch: () => void, error: any, isLoading: boolean };

  console.log('🔧 USDC balance contract call:', {
    userAddress,
    address: CONTRACTS.USDC_TOKEN,
    enabled: !!userAddress,
    isLoading: balanceLoading,
    hasData: !!userBalance,
    balance: userBalance?.toString(),
    error: balanceError?.message
  });

  // Update completion state when data changes
  useEffect(() => {
    // Log errors if any
    if (poolError) {
      console.error('Pool details error:', poolError);
    }
    
    if (!poolDetails || !userAddress) {
      setCompletionState(prev => ({
        ...prev,
        isCompletable: false,
        canUserComplete: false,
        completionCost: "0.00",
      }));
      return;
    }

    console.log('Pool details received:', poolDetails);
    const { info, remainingAmount, timeRemaining } = poolDetails;
    const userBalanceAmount = userBalance || 0n;
    
    // Safety check: ensure info exists
    if (!info) {
      console.warn('Pool info is undefined, skipping completion state update', {
        poolDetails,
        poolId,
        hasInfo: !!info,
        infoKeys: info ? Object.keys(info) : 'N/A'
      });
      return;
    }
    
    // Pool is expired if deadline passed or status is expired
    const isExpired = info.status === 2 || timeRemaining === 0n;
    
    // Pool is completable if active, not expired, and has remaining amount
    const isCompletable = info.status === 0 && !isExpired && remainingAmount > 0n;
    
    // User can complete if they have enough USDC (including 1 USDC contribution fee)
    const contributionFee = 1_000_000n; // 1 USDC in 6 decimals
    const totalRequired = remainingAmount + contributionFee;
    const canUserComplete = isCompletable && userBalanceAmount >= totalRequired;

    setCompletionState({
      isCompletable,
      remainingAmount,
      targetAmount: info.targetPrice,
      currentAmount: info.totalAmount,
      userUSDCBalance: userBalanceAmount,
      canUserComplete,
      completionCost: formatUSDC(remainingAmount),
      precisionStrategy: 'exact',
      poolInfo: info,
      timeRemaining: Number(timeRemaining),
      isExpired,
    });
  }, [poolDetails, userBalance, userAddress, poolError, poolId]);

  // Manual refresh function
  const refreshCompletion = async () => {
    await Promise.all([
      refetchPoolDetails(),
      refetchBalance(),
    ]);
  };

  return { 
    completionState, 
    refreshCompletion,
    isLoading: !poolDetails && poolId >= 0,
  };
};

export default usePoolCompletion;