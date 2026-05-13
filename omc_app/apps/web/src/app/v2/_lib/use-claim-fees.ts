'use client';

/**
 * Pull accumulated creator royalties from the FeeManager.
 * FeeManager.claimAccumulatedFees() walks the caller's accumulated balance
 * and transfers it in a single tx.
 */

import { useEffect, useState } from 'react';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';

const FEE_MANAGER_ABI = [
  {
    inputs: [],
    name: 'claimAccumulatedFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export type ClaimPhase = 'idle' | 'disconnected' | 'wrong-chain' | 'claiming' | 'success';

export function useClaimFees() {
  const { isConnected, chain } = useAccount();
  const [phase, setPhase] = useState<ClaimPhase>('idle');

  const { writeContract, data: hash, error, reset: resetWrite } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!isConnected) {
      setPhase('disconnected');
      return;
    }
    if (chain && chain.id !== 8453) {
      setPhase('wrong-chain');
      return;
    }
    if (isSuccess) {
      setPhase('success');
      return;
    }
    if (isLoading || (hash && !isSuccess)) {
      setPhase('claiming');
      return;
    }
    setPhase('idle');
  }, [isConnected, chain, hash, isLoading, isSuccess]);

  const claim = () => {
    writeContract({
      address: CONTRACTS.FEE_MANAGER,
      abi: FEE_MANAGER_ABI,
      functionName: 'claimAccumulatedFees',
    });
  };

  const reset = () => {
    resetWrite();
    setPhase('idle');
  };

  return { phase, claim, reset, error: (error as Error | null) ?? null };
}
