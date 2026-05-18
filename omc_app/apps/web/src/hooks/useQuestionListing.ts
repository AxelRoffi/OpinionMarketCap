'use client';

/**
 * V4 question marketplace wrapper.
 *
 * Three actions on opinion.questionOwner (the royalty recipient slot):
 *   list   — only the current questionOwner; sets salePrice
 *   cancel — only the current questionOwner; clears salePrice
 *   buy    — anyone; pays salePrice in USDC, becomes new questionOwner
 *
 * Buyer flow includes the standard approve-then-submit two-step.
 * List / cancel never move tokens, so no approval is needed for those.
 *
 * Caller passes `salePriceUSDC` (read from take.salePriceUSDC) so the hook
 * can compute approval / balance gating without re-reading getOpinionDetails.
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
  OPINION_CORE_ABI,
  USDC_ABI,
  USDC_ADDRESS,
} from '@/lib/contracts';
import { parseTransactionError, type ParsedError } from '@/lib/errors';

const INFINITE_APPROVAL = BigInt('1000000000000'); // 1M USDC

export type QuestionListingStep =
  | 'idle'
  | 'listing'      // listQuestionForSale tx in flight
  | 'cancelling'   // cancelQuestionSale tx in flight
  | 'approving'    // USDC approve (buyer flow) in flight
  | 'buying'       // buyQuestion tx in flight
  | 'success'
  | 'error';

export interface UseQuestionListingReturn {
  step: QuestionListingStep;
  error: ParsedError | null;
  /** True iff the connected wallet is the current questionOwner. */
  isOwner: boolean;
  /** True iff the question is currently listed (salePriceUSDC > 0). */
  isListed: boolean;
  /** Buyer needs an approve tx because allowance < salePrice. */
  buyerNeedsApproval: boolean;
  /** Buyer has enough USDC. */
  buyerHasBalance: boolean;
  /** Actions */
  list: (priceUSDC: number) => Promise<void>;
  cancel: () => Promise<void>;
  buy: () => Promise<void>;
  reset: () => void;
}

export function useQuestionListing(
  opinionId: number | bigint | undefined,
  questionOwner: string | undefined,
  /** Current salePrice in USDC (0 = not listed). Caller pulls this from
   *  take.salePriceUSDC so we don't re-read getOpinionDetails. */
  salePriceUSDC: number,
): UseQuestionListingReturn {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<QuestionListingStep>('idle');
  const [error, setError] = useState<ParsedError | null>(null);
  const [pendingBuy, setPendingBuy] = useState(false);

  const salePriceWei = useMemo(
    () => BigInt(Math.round(salePriceUSDC * 1_000_000)),
    [salePriceUSDC],
  );

  // ─── Reads ──────────────────────────────────────────────────────────
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
    args: address ? [address, CONTRACTS.OPINION_CORE] : undefined,
    query: { enabled: !!address },
  });

  // ─── Writes ─────────────────────────────────────────────────────────
  const {
    writeContract: writeList,
    data: listHash,
    error: listErr,
    reset: resetList,
  } = useWriteContract();
  const {
    writeContract: writeCancel,
    data: cancelHash,
    error: cancelErr,
    reset: resetCancel,
  } = useWriteContract();
  const {
    writeContract: writeApprove,
    data: approveHash,
    error: approveErr,
    reset: resetApprove,
  } = useWriteContract();
  const {
    writeContract: writeBuy,
    data: buyHash,
    error: buyErr,
    reset: resetBuy,
  } = useWriteContract();

  const { isSuccess: listSuccess, isError: listReceiptErr, error: listReceiptErrObj } =
    useWaitForTransactionReceipt({ hash: listHash });
  const { isSuccess: cancelSuccess, isError: cancelReceiptErr, error: cancelReceiptErrObj } =
    useWaitForTransactionReceipt({ hash: cancelHash });
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isSuccess: buySuccess, isError: buyReceiptErr, error: buyReceiptErrObj } =
    useWaitForTransactionReceipt({ hash: buyHash });

  // ─── Derived ────────────────────────────────────────────────────────
  const allowanceN = (allowance as bigint | undefined) ?? BigInt(0);
  const balanceN = (balance as bigint | undefined) ?? BigInt(0);
  const isOwner = useMemo(() => {
    if (!address || !questionOwner) return false;
    return address.toLowerCase() === questionOwner.toLowerCase();
  }, [address, questionOwner]);

  const fail = useCallback((e: unknown) => {
    setError(parseTransactionError(e));
    setStep('error');
  }, []);

  // ─── Actions ────────────────────────────────────────────────────────
  const list = useCallback(
    async (priceUSDC: number) => {
      if (!address) return fail({ message: 'Wallet not connected' });
      if (opinionId === undefined || opinionId === null) return fail({ message: 'Missing opinion id' });
      if (priceUSDC <= 0) return fail({ message: 'Sale price must be greater than 0' });
      setError(null);
      setStep('listing');
      try {
        const priceWei = BigInt(Math.round(priceUSDC * 1_000_000));
        await writeList({
          address: CONTRACTS.OPINION_CORE,
          abi: OPINION_CORE_ABI,
          functionName: 'listQuestionForSale',
          args: [BigInt(opinionId as number), priceWei],
        });
      } catch (e) {
        fail(e);
      }
    },
    [address, opinionId, writeList, fail],
  );

  const cancel = useCallback(async () => {
    if (!address) return fail({ message: 'Wallet not connected' });
    if (opinionId === undefined || opinionId === null) return fail({ message: 'Missing opinion id' });
    setError(null);
    setStep('cancelling');
    try {
      await writeCancel({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'cancelQuestionSale',
        args: [BigInt(opinionId as number)],
      });
    } catch (e) {
      fail(e);
    }
  }, [address, opinionId, writeCancel, fail]);

  const submitBuy = useCallback(async () => {
    if (opinionId === undefined || opinionId === null) return fail({ message: 'Missing opinion id' });
    setStep('buying');
    try {
      await writeBuy({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_ABI,
        functionName: 'buyQuestion',
        args: [BigInt(opinionId as number)],
      });
    } catch (e) {
      fail(e);
    }
  }, [opinionId, writeBuy, fail]);

  const buy = useCallback(async () => {
    if (!address) return fail({ message: 'Wallet not connected' });
    if (salePriceWei === BigInt(0)) return fail({ message: 'Question is not listed for sale' });
    setError(null);

    if (allowanceN < salePriceWei) {
      setPendingBuy(true);
      setStep('approving');
      try {
        await writeApprove({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [CONTRACTS.OPINION_CORE, INFINITE_APPROVAL],
        });
      } catch (e) {
        fail(e);
      }
      return;
    }
    submitBuy();
  }, [address, allowanceN, salePriceWei, writeApprove, submitBuy, fail]);

  // ─── Effects: tx lifecycle wiring ───────────────────────────────────
  useEffect(() => {
    if (listSuccess && step === 'listing') {
      invalidateOpinion(queryClient, opinionId);
      setStep('success');
    }
  }, [listSuccess, step, opinionId, queryClient]);

  useEffect(() => {
    if (cancelSuccess && step === 'cancelling') {
      invalidateOpinion(queryClient, opinionId);
      setStep('success');
    }
  }, [cancelSuccess, step, opinionId, queryClient]);

  useEffect(() => {
    if (approveSuccess && step === 'approving' && pendingBuy) {
      refetchAllowance();
      submitBuy();
      setPendingBuy(false);
    }
  }, [approveSuccess, step, pendingBuy, submitBuy, refetchAllowance]);

  useEffect(() => {
    if (buySuccess && step === 'buying') {
      invalidateOpinion(queryClient, opinionId);
      setStep('success');
    }
  }, [buySuccess, step, opinionId, queryClient]);

  // Error funnels
  useEffect(() => { if (listErr) fail(listErr); }, [listErr, fail]);
  useEffect(() => { if (cancelErr) fail(cancelErr); }, [cancelErr, fail]);
  useEffect(() => { if (approveErr) fail(approveErr); }, [approveErr, fail]);
  useEffect(() => { if (buyErr) fail(buyErr); }, [buyErr, fail]);
  useEffect(() => { if (listReceiptErr && step === 'listing') fail(listReceiptErrObj); }, [listReceiptErr, listReceiptErrObj, step, fail]);
  useEffect(() => { if (cancelReceiptErr && step === 'cancelling') fail(cancelReceiptErrObj); }, [cancelReceiptErr, cancelReceiptErrObj, step, fail]);
  useEffect(() => { if (buyReceiptErr && step === 'buying') fail(buyReceiptErrObj); }, [buyReceiptErr, buyReceiptErrObj, step, fail]);

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setPendingBuy(false);
    resetList();
    resetCancel();
    resetApprove();
    resetBuy();
  }, [resetList, resetCancel, resetApprove, resetBuy]);

  return {
    step,
    error,
    isOwner,
    isListed: salePriceWei > BigInt(0),
    buyerNeedsApproval: allowanceN < salePriceWei,
    buyerHasBalance: salePriceWei === BigInt(0) ? true : balanceN >= salePriceWei,
    list,
    cancel,
    buy,
    reset,
  };
}

function invalidateOpinion(queryClient: ReturnType<typeof useQueryClient>, opinionId: number | bigint | undefined) {
  const id = opinionId !== undefined ? BigInt(opinionId as number) : undefined;
  queryClient.invalidateQueries({
    predicate: (q) => {
      const k = q.queryKey as unknown[];
      if (k[0] !== 'readContract') return false;
      const cfg = k[1] as { functionName?: string; args?: unknown[] } | undefined;
      if (!cfg?.functionName) return false;
      if (!['getOpinionDetails'].includes(cfg.functionName)) return false;
      if (id === undefined) return true;
      const args = cfg.args as [bigint] | undefined;
      return args?.[0] === id;
    },
  });
}
