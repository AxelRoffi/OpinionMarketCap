'use client';

import { useReadContract, useAccount } from 'wagmi';
import { formatUnits } from 'viem';

// USDC Contract address on Base Sepolia
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`;

// ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function useUSDCBalance() {
  const { address, isConnected } = useAccount();

  const { data: balanceData, isLoading, error, refetch } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isConnected),
      refetchInterval: 10000, // Refetch every 10 seconds
      staleTime: 5000, // Consider data stale after 5 seconds
    },
  });

  // Convert balance from wei to USDC (6 decimals)
  const balance = balanceData ? parseFloat(formatUnits(balanceData, 6)) : 0;

  return {
    balance,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    raw: balanceData,
  };
}