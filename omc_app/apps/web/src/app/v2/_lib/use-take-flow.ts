'use client';

/**
 * Lightweight Take-it flow for the /v2 redesign. Linear state machine over
 * wagmi reads/writes for balance/allowance/approve/submitAnswer.
 *
 * Why not useTradingFlow?
 *   The legacy hook is tightly coupled to the existing TradingModal's form
 *   shape (bid amount, advanced fields, revival picker, etc.). The Poster
 *   Arcade TradeSlip needs a simpler surface, so we re-use the same wagmi
 *   primitives but expose a tighter API.
 */

import { useEffect, useState } from 'react';
import { maxUint256, parseUnits } from 'viem';
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { CONTRACTS, OPINION_CORE_ABI, USDC_ABI } from '@/lib/contracts';

export type TakeFlowPhase =
  | 'idle'           // initial / waiting for chain reads
  | 'disconnected'   // wallet not connected
  | 'wrong-chain'    // connected to non-Base chain (handled by WalletBtn UI; here we just gate)
  | 'insufficient'   // balance < cost
  | 'needs-approval' // allowance < cost
  | 'approving'      // approve tx pending
  | 'ready'          // ready to call submitAnswer
  | 'submitting'     // submitAnswer tx pending
  | 'success';       // submitAnswer mined

export type TakeFlow = {
  phase: TakeFlowPhase;
  balance: bigint;
  allowance: bigint;
  /** Cost in 6-decimal USDC, derived from the price passed in. */
  costWei: bigint;
  approve: () => void;
  /** Submit the take. Caller passes the new answer + description (+ optional link). */
  submit: (answer: string, description: string, link?: string) => void;
  /** Reset internal state after a successful flow or to retry after an error. */
  reset: () => void;
  /** Last error from approve or submit, if any. */
  error: Error | null;
};

const ZERO = 0n;

/**
 * @param opinionId  the take being taken
 * @param priceUSDC  cost in USDC as a plain number (already converted from bigint)
 */
export function useTakeFlow(opinionId: number, priceUSDC: number): TakeFlow {
  const { address, isConnected, chain } = useAccount();

  // Cost in 6-decimal USDC. parseUnits handles rounding cleanly.
  const costWei = parseUnits(priceUSDC.toFixed(6), 6);

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
    args: address ? [address, CONTRACTS.OPINION_CORE] : undefined,
    query: { enabled },
  });

  const {
    writeContract: writeApprove,
    data: approveHash,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();

  const {
    writeContract: writeSubmit,
    data: submitHash,
    error: submitError,
    reset: resetSubmit,
  } = useWriteContract();

  const { isLoading: isApproving, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isSubmitting, isSuccess: isSubmitSuccess } =
    useWaitForTransactionReceipt({ hash: submitHash });

  const [phase, setPhase] = useState<TakeFlowPhase>('idle');

  // Derive phase from chain state.
  useEffect(() => {
    if (!isConnected) {
      setPhase('disconnected');
      return;
    }
    // Base mainnet = 8453. If we're connected but on a different chain, gate.
    if (chain && chain.id !== 8453) {
      setPhase('wrong-chain');
      return;
    }
    if (isSubmitSuccess) {
      setPhase('success');
      return;
    }
    if (isSubmitting || (submitHash && !isSubmitSuccess)) {
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
    submitHash,
    isSubmitting,
    isSubmitSuccess,
  ]);

  // Once the approve tx mines, force a re-read of the allowance so the UI
  // moves to "ready" without waiting for the 8s refetch interval.
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
      args: [CONTRACTS.OPINION_CORE, maxUint256],
    });
  };

  const submit: TakeFlow['submit'] = (answer, description, link = '') => {
    writeSubmit({
      address: CONTRACTS.OPINION_CORE,
      abi: OPINION_CORE_ABI,
      functionName: 'submitAnswer',
      args: [BigInt(opinionId), answer, description, link],
    });
  };

  const reset = () => {
    resetApprove();
    resetSubmit();
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
    error: (submitError ?? approveError) as Error | null,
  };
}
