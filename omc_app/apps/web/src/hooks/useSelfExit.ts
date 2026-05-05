'use client'

import { useCallback, useEffect, useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'

import { CONTRACTS } from '@/lib/contracts'
import { OPINION_CORE_V4_ABI } from '@/lib/contracts-v4'
import { parseTransactionError, type ParsedError } from '@/lib/errors'

export type SelfExitStep = 'idle' | 'confirming' | 'success' | 'error'

export interface UseSelfExitReturn {
  step: SelfExitStep
  error: ParsedError | null
  txHash: `0x${string}` | undefined
  selfExit: () => Promise<void>
  reset: () => void
}

/**
 * Wraps OpinionCoreV4.selfExit(opinionId). Handles the txn lifecycle and
 * invalidates the relevant read queries on success so the UI re-fetches
 * the now-vacant slot state.
 *
 * Caller is responsible for gating the UI on `useOpinionLockStatus.canSelfExitNow`
 * — this hook fires the tx unconditionally if invoked.
 */
export function useSelfExit(opinionId: number | bigint | undefined): UseSelfExitReturn {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<SelfExitStep>('idle')
  const [error, setError] = useState<ParsedError | null>(null)

  const {
    writeContract,
    data: txHash,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract()

  const { isSuccess, isError: receiptError, error: receiptErr } =
    useWaitForTransactionReceipt({ hash: txHash })

  const selfExit = useCallback(async () => {
    if (opinionId === undefined || opinionId === null) {
      setError({
        type: 'validation_error',
        title: 'Invalid Opinion',
        message: 'Cannot self-exit without an opinion id.',
        retryable: false,
      })
      setStep('error')
      return
    }
    setStep('confirming')
    setError(null)
    try {
      await writeContract({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_V4_ABI,
        functionName: 'selfExit',
        args: [BigInt(opinionId as number)],
      })
    } catch (e) {
      setError(parseTransactionError(e))
      setStep('error')
    }
  }, [opinionId, writeContract])

  // Wallet-level error (rejection, gas issue) before tx is broadcast
  useEffect(() => {
    if (writeError) {
      setError(parseTransactionError(writeError))
      setStep('error')
    }
  }, [writeError])

  // On-chain success: invalidate queries so UI reflects the vacant slot
  useEffect(() => {
    if (isSuccess && step === 'confirming') {
      const id = opinionId !== undefined ? BigInt(opinionId as number) : undefined
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey as unknown[]
          if (key[0] !== 'readContract') return false
          const cfg = key[1] as { functionName?: string; args?: unknown[] } | undefined
          if (!cfg) return false
          const v4Reads = ['lockedStake', 'lastTradeTimestamp', 'getOpinionDetails', 'getNextPrice']
          if (!cfg.functionName || !v4Reads.includes(cfg.functionName)) return false
          if (id === undefined) return true
          const args = cfg.args as [bigint] | undefined
          return args?.[0] === id
        },
      })
      setStep('success')
    }
  }, [isSuccess, step, opinionId, queryClient])

  // Receipt error (mined but reverted)
  useEffect(() => {
    if (receiptError && step === 'confirming') {
      setError(parseTransactionError(receiptErr))
      setStep('error')
    }
  }, [receiptError, receiptErr, step])

  const reset = useCallback(() => {
    setStep('idle')
    setError(null)
    resetWrite()
  }, [resetWrite])

  return { step, error, txHash, selfExit, reset }
}
