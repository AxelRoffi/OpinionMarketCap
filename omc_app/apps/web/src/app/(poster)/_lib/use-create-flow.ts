'use client';

/**
 * Linear state machine for /create's MINT flow.
 *
 * The V4 contract's createOpinion(...) needs:
 *   question, answer, description (≤120 chars per the deployed validator),
 *   initialPrice (1–100 USDC), categories[] (1–3, must match chain whitelist)
 * and pulls `initialPrice + spamFee` (=2 USDC) from the caller via
 * pre-approved USDC allowance against OPINION_CORE.
 *
 * Mirrors the pattern in _lib/use-take-flow.ts. Kept as a sibling rather
 * than a generalized hook because the success state needs the new opinion
 * id (read pre-submit from nextOpinionId).
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

export type CreateFlowPhase =
  | 'idle'
  | 'disconnected'
  | 'wrong-chain'
  | 'insufficient'
  | 'needs-approval'
  | 'approving'
  | 'ready'
  | 'submitting'
  | 'success';

export type CreateArgs = {
  question: string;
  answer: string;
  description: string;
  /** Initial floor in USDC (1–100). */
  initialPriceUSDC: number;
  /** 1–3 chain category strings (must match whitelist). */
  categories: string[];
};

export type CreateFlow = {
  phase: CreateFlowPhase;
  balance: bigint;
  allowance: bigint;
  /** Total USDC the user will pay (initialPrice + spamFee). */
  totalCostWei: bigint;
  /** The id the newly-minted opinion will have on success — captured pre-submit. */
  newOpinionId: number | null;
  approve: (totalCost: bigint) => void;
  submit: (args: CreateArgs) => void;
  reset: () => void;
  error: Error | null;
};

const ZERO = 0n;
/** V4 spamFee in 6-decimal USDC. Source: OpinionCoreV4.sol:259 (= 2 USDC). */
const SPAM_FEE_WEI = 2_000_000n;

export function useCreateOpinionFlow(currentPriceUSDC: number): CreateFlow {
  const { address, isConnected, chain } = useAccount();

  const initialPriceWei = parseUnits(currentPriceUSDC.toFixed(6), 6);
  const totalCostWei = initialPriceWei + SPAM_FEE_WEI;

  const enabled = !!address;

  const { data: nextOpinionId } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_ABI,
    functionName: 'nextOpinionId',
    query: { enabled, staleTime: 5_000 },
  });

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
    writeContract: writeCreate,
    data: createHash,
    error: createError,
    reset: resetCreate,
  } = useWriteContract();

  const { isLoading: isApproving, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isCreating, isSuccess: isCreateSuccess } =
    useWaitForTransactionReceipt({ hash: createHash });

  const [phase, setPhase] = useState<CreateFlowPhase>('idle');
  const [newOpinionId, setNewOpinionId] = useState<number | null>(null);

  // Derive phase from chain state.
  useEffect(() => {
    if (!isConnected) {
      setPhase('disconnected');
      return;
    }
    if (chain && chain.id !== 8453) {
      setPhase('wrong-chain');
      return;
    }
    if (isCreateSuccess) {
      setPhase('success');
      return;
    }
    if (isCreating || (createHash && !isCreateSuccess)) {
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
    if ((balanceData as bigint) < totalCostWei) {
      setPhase('insufficient');
      return;
    }
    if ((allowanceData as bigint) < totalCostWei) {
      setPhase('needs-approval');
      return;
    }
    setPhase('ready');
  }, [
    isConnected,
    chain,
    balanceData,
    allowanceData,
    totalCostWei,
    approveHash,
    isApproving,
    isApproveSuccess,
    createHash,
    isCreating,
    isCreateSuccess,
  ]);

  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  const approve = (cost: bigint) => {
    // Approve the exact amount needed; can also pass maxUint256 if we want
    // a single approve to cover future mints. Caller chooses.
    writeApprove({
      address: CONTRACTS.USDC_TOKEN,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CONTRACTS.OPINION_CORE, cost > 0n ? cost : maxUint256],
    });
  };

  const submit: CreateFlow['submit'] = (args) => {
    // Capture the soon-to-be-new id so the success state can deep-link.
    if (nextOpinionId != null) {
      setNewOpinionId(Number(nextOpinionId));
    }
    const priceWei = parseUnits(args.initialPriceUSDC.toFixed(6), 6);
    writeCreate({
      address: CONTRACTS.OPINION_CORE,
      abi: OPINION_CORE_ABI,
      functionName: 'createOpinion',
      args: [args.question, args.answer, args.description, priceWei, args.categories],
    });
  };

  const reset = () => {
    resetApprove();
    resetCreate();
    setPhase('idle');
    setNewOpinionId(null);
  };

  return {
    phase,
    balance: (balanceData as bigint | undefined) ?? ZERO,
    allowance: (allowanceData as bigint | undefined) ?? ZERO,
    totalCostWei,
    newOpinionId,
    approve,
    submit,
    reset,
    error: (createError ?? approveError) as Error | null,
  };
}

/**
 * Reverse map from /v2's 8 visual CatKeys → an exact chain-whitelist category
 * string. The chain enforces categories must match the 40-entry whitelist
 * managed by OpinionExtensions / OpinionAdmin, so we need precise spellings.
 */
export const CHAIN_CATEGORY_FOR_CAT: Record<string, string> = {
  crypto:  'Crypto & Web3',
  ai:      'AI & Robotics',
  sport:   'Sports',
  cinema:  'Movies',
  food:    'Food & Drink',
  life:    'Career & Workplace',
  music:   'Music',
  founder: 'Business & Finance',
};
