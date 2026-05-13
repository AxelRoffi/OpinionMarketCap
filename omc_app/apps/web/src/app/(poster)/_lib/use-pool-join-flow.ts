'use client';

/**
 * Linear state machine for /pools/[id] join flow.
 *
 * V2 PoolManager has a flat contribution path:
 *   contributeToPool(poolId, amount)  — pulls `amount` USDC from caller
 * USDC allowance target is the POOL_MANAGER (not OPINION_CORE).
 *
 * NOTE: the /pools UI currently lists mock pools whose ids may not match
 * any real on-chain pool. The hook is best-effort: it attempts the write
 * with the supplied id. If the pool doesn't exist on chain the wagmi
 * simulation will revert with PoolInvalidPoolId and the caller's onError
 * surface will show the toast. Read-side wiring (mock → chain pool list)
 * lands in 9C; this commit only wires the WRITE.
 */

import { useEffect, useState } from 'react';
import { maxUint256, parseUnits } from 'viem';
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { CONTRACTS, POOL_MANAGER_ABI, USDC_ABI } from '@/lib/contracts';

export type PoolJoinPhase =
  | 'idle'
  | 'disconnected'
  | 'wrong-chain'
  | 'insufficient'
  | 'needs-approval'
  | 'approving'
  | 'ready'
  | 'submitting'
  | 'success';

export type PoolJoinFlow = {
  phase: PoolJoinPhase;
  balance: bigint;
  allowance: bigint;
  costWei: bigint;
  approve: () => void;
  submit: () => void;
  reset: () => void;
  error: Error | null;
};

const ZERO = 0n;

export function usePoolJoinFlow(poolId: number, amountUSDC: number): PoolJoinFlow {
  const { address, isConnected, chain } = useAccount();
  const costWei = parseUnits(amountUSDC.toFixed(6), 6);
  const enabled = !!address;

  const { data: balanceData } = useReadContract({
    address: CONTRACTS.USDC_TOKEN,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled, refetchInterval: 8_000 },
  });

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.USDC_TOKEN,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.POOL_MANAGER] : undefined,
    query: { enabled },
  });

  const {
    writeContract: writeApprove,
    data: approveHash,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();

  const {
    writeContract: writeJoin,
    data: joinHash,
    error: joinError,
    reset: resetJoin,
  } = useWriteContract();

  const { isLoading: isApproving, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isJoining, isSuccess: isJoinSuccess } =
    useWaitForTransactionReceipt({ hash: joinHash });

  const [phase, setPhase] = useState<PoolJoinPhase>('idle');

  useEffect(() => {
    if (!isConnected) {
      setPhase('disconnected');
      return;
    }
    if (chain && chain.id !== 8453) {
      setPhase('wrong-chain');
      return;
    }
    if (isJoinSuccess) {
      setPhase('success');
      return;
    }
    if (isJoining || (joinHash && !isJoinSuccess)) {
      setPhase('submitting');
      return;
    }
    if (isApproving || (approveHash && !isApproveSuccess)) {
      setPhase('approving');
      return;
    }
    if (balanceData == null || allowanceData == null) {
      setPhase('idle');
      return;
    }
    if ((balanceData as bigint) < costWei) {
      setPhase('insufficient');
      return;
    }
    if ((allowanceData as bigint) < costWei) {
      setPhase('needs-approval');
      return;
    }
    setPhase('ready');
  }, [
    isConnected,
    chain,
    balanceData,
    allowanceData,
    costWei,
    approveHash,
    isApproving,
    isApproveSuccess,
    joinHash,
    isJoining,
    isJoinSuccess,
  ]);

  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  const approve = () => {
    writeApprove({
      address: CONTRACTS.USDC_TOKEN,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CONTRACTS.POOL_MANAGER, maxUint256],
    });
  };

  const submit = () => {
    writeJoin({
      address: CONTRACTS.POOL_MANAGER,
      abi: POOL_MANAGER_ABI,
      functionName: 'contributeToPool',
      args: [BigInt(poolId), costWei],
    });
  };

  const reset = () => {
    resetApprove();
    resetJoin();
    setPhase('idle');
  };

  return {
    phase,
    balance: (balanceData as bigint | undefined) ?? ZERO,
    allowance: (allowanceData as bigint | undefined) ?? ZERO,
    costWei,
    approve,
    submit,
    reset,
    error: (joinError ?? approveError) as Error | null,
  };
}
