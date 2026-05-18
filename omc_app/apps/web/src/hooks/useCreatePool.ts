'use client';

/**
 * V2 PoolManager.createPool wrapper. Mirrors the approve → submit two-step
 * lifecycle of useTakeFlow / useReclaimSlot but sized for pool creation.
 *
 * Cost breakdown the user must approve:
 *   poolCreationFee  (chain-read; default 5 USDC)
 *   initialContribution (user-supplied; min 1 USDC)
 *
 * Both are pulled by the PoolManager when createPool is called.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';

import {
  CONTRACTS,
  POOL_MANAGER_ABI,
  USDC_ABI,
  USDC_ADDRESS,
} from '@/lib/contracts';
import { parseTransactionError, type ParsedError } from '@/lib/errors';

const INFINITE_APPROVAL = BigInt('1000000000000'); // 1M USDC

export type CreatePoolStep =
  | 'idle'
  | 'approve'
  | 'submit'
  | 'success'
  | 'error';

export interface CreatePoolArgs {
  opinionId: number | bigint;
  proposedAnswer: string;
  /** Deadline as a unix-seconds timestamp. */
  deadline: number;
  /** Initial contribution in plain USDC (e.g. 5 for $5 — converted to wei here). */
  initialContributionUSDC: number;
  poolName: string;
  /** Optional IPFS hash for extended metadata. Pass '' to skip. */
  ipfsHash?: string;
}

export interface UseCreatePoolReturn {
  step: CreatePoolStep;
  error: ParsedError | null;
  hasBalance: boolean;
  needsApproval: boolean;
  /** Total approval / spend needed = poolCreationFee + initialContribution (USDC). */
  totalCostUSDC: number;
  /** Chain-read creation fee in USDC. */
  poolCreationFeeUSDC: number;
  isReady: boolean;
  /** Latest poolId created — populated from poolCount after success (best-effort). */
  newPoolId: number | null;
  submit: (args: CreatePoolArgs) => Promise<void>;
  reset: () => void;
}

export function useCreatePool(initialContributionUSDC: number): UseCreatePoolReturn {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<CreatePoolStep>('idle');
  const [error, setError] = useState<ParsedError | null>(null);
  const [pendingArgs, setPendingArgs] = useState<CreatePoolArgs | null>(null);
  const [newPoolId, setNewPoolId] = useState<number | null>(null);

  // ─── Reads ──────────────────────────────────────────────────────────
  const { data: feeData } = useReadContract({
    address: CONTRACTS.POOL_MANAGER,
    abi: POOL_MANAGER_ABI,
    functionName: 'poolCreationFee',
    query: { staleTime: 60_000 },
  });

  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.POOL_MANAGER] : undefined,
    query: { enabled: !!address },
  });

  const { data: poolCountAfter } = useReadContract({
    address: CONTRACTS.POOL_MANAGER,
    abi: POOL_MANAGER_ABI,
    functionName: 'poolCount',
    query: { enabled: step === 'success', staleTime: 0 },
  });

  // ─── Writes ─────────────────────────────────────────────────────────
  const {
    writeContract: writeApprove,
    data: approveHash,
    error: approveErr,
    reset: resetApprove,
  } = useWriteContract();

  const {
    writeContract: writeCreate,
    data: createHash,
    error: createErr,
    reset: resetCreate,
  } = useWriteContract();

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const {
    isSuccess: createSuccess,
    isError: createReceiptErr,
    error: createReceiptErrObj,
  } = useWaitForTransactionReceipt({ hash: createHash });

  // ─── Derived ────────────────────────────────────────────────────────
  const poolCreationFeeWei = (feeData as bigint | undefined) ?? BigInt(2_000_000); // fall back to 2 USDC if read pending
  const initialWei = useMemo(
    () => BigInt(Math.round(initialContributionUSDC * 1_000_000)),
    [initialContributionUSDC],
  );
  const totalCostWei = poolCreationFeeWei + initialWei;
  const allowanceN = (allowance as bigint | undefined) ?? BigInt(0);
  const balanceN = (balance as bigint | undefined) ?? BigInt(0);

  const fail = useCallback((e: unknown) => {
    setError(parseTransactionError(e));
    setStep('error');
  }, []);

  const submitCreate = useCallback(
    (args: CreatePoolArgs) => {
      setStep('submit');
      try {
        const initWei = BigInt(Math.round(args.initialContributionUSDC * 1_000_000));
        writeCreate({
          address: CONTRACTS.POOL_MANAGER,
          abi: POOL_MANAGER_ABI,
          functionName: 'createPool',
          args: [
            BigInt(args.opinionId as number),
            args.proposedAnswer.trim(),
            BigInt(args.deadline),
            initWei,
            args.poolName.trim(),
            (args.ipfsHash ?? '').trim(),
          ],
        });
      } catch (e) {
        fail(e);
      }
    },
    [writeCreate, fail],
  );

  const submit = useCallback(
    async (args: CreatePoolArgs) => {
      if (!address) {
        fail({ message: 'Wallet not connected' });
        return;
      }
      setError(null);
      const argInitWei = BigInt(Math.round(args.initialContributionUSDC * 1_000_000));
      const needed = poolCreationFeeWei + argInitWei;
      if (allowanceN < needed) {
        setPendingArgs(args);
        setStep('approve');
        try {
          await writeApprove({
            address: USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: 'approve',
            args: [CONTRACTS.POOL_MANAGER, INFINITE_APPROVAL],
          });
        } catch (e) {
          fail(e);
        }
        return;
      }
      submitCreate(args);
    },
    [address, allowanceN, poolCreationFeeWei, writeApprove, submitCreate, fail],
  );

  // After approve mines → submit create
  useEffect(() => {
    if (approveSuccess && step === 'approve' && pendingArgs) {
      refetchAllowance();
      submitCreate(pendingArgs);
      setPendingArgs(null);
    }
  }, [approveSuccess, step, pendingArgs, submitCreate, refetchAllowance]);

  // Wallet-level errors
  useEffect(() => {
    if (approveErr) fail(approveErr);
  }, [approveErr, fail]);
  useEffect(() => {
    if (createErr) fail(createErr);
  }, [createErr, fail]);

  // On success → invalidate pool list caches + capture new pool id (best-effort)
  useEffect(() => {
    if (createSuccess && step === 'submit') {
      queryClient.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey as unknown[];
          if (k[0] !== 'readContract') return false;
          const cfg = k[1] as { functionName?: string } | undefined;
          if (!cfg?.functionName) return false;
          return ['poolCount', 'getPoolDetails'].includes(cfg.functionName);
        },
      });
      setStep('success');
    }
  }, [createSuccess, step, queryClient]);

  useEffect(() => {
    if (step === 'success' && typeof poolCountAfter === 'bigint') {
      // New pool's id is poolCount - 1 (zero-indexed).
      const id = Number(poolCountAfter) - 1;
      if (id >= 0) setNewPoolId(id);
    }
  }, [step, poolCountAfter]);

  useEffect(() => {
    if (createReceiptErr && step === 'submit') {
      fail(createReceiptErrObj);
    }
  }, [createReceiptErr, createReceiptErrObj, step, fail]);

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setPendingArgs(null);
    setNewPoolId(null);
    resetApprove();
    resetCreate();
  }, [resetApprove, resetCreate]);

  return {
    step,
    error,
    hasBalance: balanceN >= totalCostWei,
    needsApproval: allowanceN < totalCostWei,
    totalCostUSDC: Number(totalCostWei) / 1_000_000,
    poolCreationFeeUSDC: Number(poolCreationFeeWei) / 1_000_000,
    isReady: !!address,
    newPoolId,
    submit,
    reset,
  };
}
