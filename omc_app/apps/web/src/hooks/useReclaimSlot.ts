'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'

import { CONTRACTS, USDC_ABI, USDC_ADDRESS } from '@/lib/contracts'
import { OPINION_CORE_V4_ABI } from '@/lib/contracts-v4'
import { parseTransactionError, type ParsedError } from '@/lib/errors'

export type ReclaimStep = 'idle' | 'approve' | 'submit' | 'success' | 'error'

export interface UseReclaimSlotReturn {
  step: ReclaimStep
  error: ParsedError | null
  needsApproval: boolean
  hasBalance: boolean
  reclaimPrice: bigint        // = opinion.nextPrice (set by V4 to discounted price after exit)
  feature: { enabled: boolean; loading: boolean }
  reclaim: (answer: string, description: string, link: string) => Promise<void>
  reset: () => void
}

const INFINITE_APPROVAL = BigInt('1000000000000') // 1M USDC

/**
 * Wraps OpinionCoreV4.reclaimVacantSlot. Mirrors useTradingFlow's two-step
 * (approve → submit) lifecycle but sized for the vacant-slot path.
 *
 * The reclaim price comes from `opinion.nextPrice` (V4 sets it to the
 * discounted reclaim price during selfExit/processPoolStaleExit). Caller
 * supplies it because the page already has the opinion struct in state.
 */
export function useReclaimSlot(
  opinionId: number | bigint | undefined,
  reclaimPrice: bigint
): UseReclaimSlotReturn {
  const { address } = useAccount()
  const queryClient = useQueryClient()

  const [step, setStep] = useState<ReclaimStep>('idle')
  const [error, setError] = useState<ParsedError | null>(null)
  const [pendingArgs, setPendingArgs] = useState<{
    answer: string
    description: string
    link: string
  } | null>(null)

  // ─── Reads ──────────────────────────────────────────────────────────
  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.OPINION_CORE] : undefined,
    query: { enabled: !!address },
  })

  const { data: featureFlag, isLoading: featureLoading } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'reclaimVacantSlotEnabled',
  })

  // ─── Writes ─────────────────────────────────────────────────────────
  const {
    writeContract: writeApprove,
    data: approveHash,
    error: approveErr,
    reset: resetApprove,
  } = useWriteContract()

  const {
    writeContract: writeReclaim,
    data: reclaimHash,
    error: reclaimErr,
    reset: resetReclaim,
  } = useWriteContract()

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isSuccess: reclaimSuccess, isError: reclaimReceiptErr, error: reclaimReceiptErrObj } =
    useWaitForTransactionReceipt({ hash: reclaimHash })

  // ─── Helpers ────────────────────────────────────────────────────────
  const fail = useCallback((e: unknown) => {
    setError(parseTransactionError(e))
    setStep('error')
  }, [])

  const submitReclaim = useCallback(
    (answer: string, description: string, link: string) => {
      if (opinionId === undefined || opinionId === null) {
        fail({ message: 'Missing opinion id' })
        return
      }
      setStep('submit')
      try {
        writeReclaim({
          address: CONTRACTS.OPINION_CORE,
          abi: OPINION_CORE_V4_ABI,
          functionName: 'reclaimVacantSlot',
          args: [BigInt(opinionId as number), answer.trim(), description.trim(), link.trim()],
        })
      } catch (e) {
        fail(e)
      }
    },
    [opinionId, writeReclaim, fail]
  )

  const reclaim = useCallback(
    async (answer: string, description: string, link: string) => {
      if (!address) {
        fail({ message: 'Wallet not connected' })
        return
      }
      if (opinionId === undefined || opinionId === null) {
        fail({ message: 'Missing opinion id' })
        return
      }
      setError(null)

      const allowanceN = (allowance as bigint | undefined) ?? BigInt(0)
      if (allowanceN < reclaimPrice) {
        // Cache args so we can finish reclaim when approval lands
        setPendingArgs({ answer, description, link })
        setStep('approve')
        try {
          await writeApprove({
            address: USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: 'approve',
            args: [CONTRACTS.OPINION_CORE, INFINITE_APPROVAL],
          })
        } catch (e) {
          fail(e)
        }
        return
      }

      submitReclaim(answer, description, link)
    },
    [address, opinionId, allowance, reclaimPrice, writeApprove, submitReclaim, fail]
  )

  // ─── Effects ────────────────────────────────────────────────────────
  // Approve landed → submit reclaim
  useEffect(() => {
    if (approveSuccess && step === 'approve' && pendingArgs) {
      submitReclaim(pendingArgs.answer, pendingArgs.description, pendingArgs.link)
      setPendingArgs(null)
    }
  }, [approveSuccess, step, pendingArgs, submitReclaim])

  // Wallet-level errors
  useEffect(() => {
    if (approveErr) fail(approveErr)
  }, [approveErr, fail])
  useEffect(() => {
    if (reclaimErr) fail(reclaimErr)
  }, [reclaimErr, fail])

  // On-chain success: invalidate caches that show this opinion
  useEffect(() => {
    if (reclaimSuccess && step === 'submit') {
      const id = opinionId !== undefined ? BigInt(opinionId as number) : undefined
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey as unknown[]
          if (key[0] !== 'readContract') return false
          const cfg = key[1] as { functionName?: string; args?: unknown[] } | undefined
          if (!cfg?.functionName) return false
          const refetch = [
            'lockedStake',
            'lastTradeTimestamp',
            'getOpinionDetails',
            'getNextPrice',
            'getAnswerHistory',
          ]
          if (!refetch.includes(cfg.functionName)) return false
          if (id === undefined) return true
          const args = cfg.args as [bigint] | undefined
          return args?.[0] === id
        },
      })
      setStep('success')
    }
  }, [reclaimSuccess, step, opinionId, queryClient])

  useEffect(() => {
    if (reclaimReceiptErr && step === 'submit') {
      fail(reclaimReceiptErrObj)
    }
  }, [reclaimReceiptErr, reclaimReceiptErrObj, step, fail])

  const reset = useCallback(() => {
    setStep('idle')
    setError(null)
    setPendingArgs(null)
    resetApprove()
    resetReclaim()
  }, [resetApprove, resetReclaim])

  // ─── Computed ───────────────────────────────────────────────────────
  const allowanceN = (allowance as bigint | undefined) ?? BigInt(0)
  const balanceN = (balance as bigint | undefined) ?? BigInt(0)

  return {
    step,
    error,
    needsApproval: allowanceN < reclaimPrice,
    hasBalance: balanceN >= reclaimPrice,
    reclaimPrice,
    feature: { enabled: Boolean(featureFlag), loading: featureLoading },
    reclaim,
    reset,
  }
}
