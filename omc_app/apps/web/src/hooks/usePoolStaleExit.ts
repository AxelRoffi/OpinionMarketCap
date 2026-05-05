'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'

import { CONTRACTS } from '@/lib/contracts'
import { OPINION_CORE_V4_ABI, POOL_MANAGER_V2_ABI } from '@/lib/contracts-v4'
import { parseTransactionError, type ParsedError } from '@/lib/errors'

const ZERO = BigInt(0)

export type PoolExitAction =
  | { kind: 'idle' }
  | { kind: 'triggering' }
  | { kind: 'claiming' }
  | { kind: 'success'; what: 'trigger' | 'claim' }
  | { kind: 'error'; error: ParsedError }

export interface UsePoolStaleExitReturn {
  // Read state
  isLoading: boolean
  featureEnabled: boolean
  /** Pool dissolved? */
  dissolved: boolean
  /** True iff the pool is Executed (status==1) and currently king of the opinion */
  poolIsKing: boolean
  /** Pool's locked stake on V4 */
  lockedStake: bigint
  /** Pool's contribution from caller */
  callerContribution: bigint
  /** Has caller already claimed their refund? */
  hasClaimed: boolean
  /** Pending refund for caller (post-dissolution) */
  pendingRefund: bigint
  /** True iff caller meets the >threshold rule for triggerLargePoolExit */
  callerIsLargeHolder: boolean
  /** Seconds until 21-day window opens (negative = open) */
  secondsUntilLargeWindow: number
  /** Seconds until 35-day window opens for any contributor (negative = open) */
  secondsUntilAnyoneWindow: number

  // Actions
  action: PoolExitAction
  triggerLargeExit: () => Promise<void>
  triggerAnyoneExit: () => Promise<void>
  claimRefund: () => Promise<void>
  reset: () => void
}

interface PoolStaleExitInputs {
  poolId: number | bigint | undefined
  opinionId: number | bigint | undefined
  poolStatus: number | undefined           // 0 active, 1 executed, 2 expired, 3 extended
  poolTotalAmount: bigint | undefined      // pool.totalAmount, used as denom for threshold check
  poolContractAddress?: `0x${string}`
}

/**
 * Tracks the stale-exit state for a pool and exposes the three V2 writes
 * (triggerLargePoolExit, triggerPoolStaleExit, claimStaleRefund). Cooldown
 * windows are read from V4 (single source of truth).
 */
export function usePoolStaleExit({
  poolId,
  opinionId,
  poolStatus,
  poolTotalAmount,
}: PoolStaleExitInputs): UsePoolStaleExitReturn {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const enabled = poolId !== undefined && poolId !== null

  // ─── Reads from V2 ──────────────────────────────────────────────────
  const idArg = enabled ? [BigInt(poolId as number)] as const : undefined

  const { data: featureFlag, isLoading: flagLoading } = useReadContract({
    address: CONTRACTS.POOL_MANAGER,
    abi: POOL_MANAGER_V2_ABI,
    functionName: 'stalePoolExitEnabled',
  })

  const { data: staleExitTuple, isLoading: stLoading } = useReadContract({
    address: CONTRACTS.POOL_MANAGER,
    abi: POOL_MANAGER_V2_ABI,
    functionName: 'staleExits',
    args: idArg,
    query: { enabled },
  })

  const { data: pendingRefundData } = useReadContract({
    address: CONTRACTS.POOL_MANAGER,
    abi: POOL_MANAGER_V2_ABI,
    functionName: 'pendingStaleRefund',
    args: enabled && address ? [BigInt(poolId as number), address] as const : undefined,
    query: { enabled: enabled && !!address },
  })

  const { data: callerContributionData, isLoading: ccLoading } = useReadContract({
    address: CONTRACTS.POOL_MANAGER,
    abi: POOL_MANAGER_V2_ABI,
    functionName: 'poolContributionAmounts',
    args: enabled && address ? [BigInt(poolId as number), address] as const : undefined,
    query: { enabled: enabled && !!address },
  })

  const { data: hasClaimedData } = useReadContract({
    address: CONTRACTS.POOL_MANAGER,
    abi: POOL_MANAGER_V2_ABI,
    functionName: 'hasClaimedStaleRefund',
    args: enabled && address ? [BigInt(poolId as number), address] as const : undefined,
    query: { enabled: enabled && !!address },
  })

  // ─── Reads from V4 (cooldowns + opinion state) ──────────────────────
  const oArg = opinionId !== undefined ? [BigInt(opinionId as number)] as const : undefined

  const { data: lockedStakeData } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'lockedStake',
    args: oArg,
    query: { enabled: opinionId !== undefined },
  })

  const { data: lastTradeTsData } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'lastTradeTimestamp',
    args: oArg,
    query: { enabled: opinionId !== undefined },
  })

  const { data: poolCooldownData } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'poolCooldown',
  })

  const { data: poolExtCooldownData } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'poolExtendedCooldown',
  })

  const { data: thresholdBpsData } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'largeHolderThresholdBps',
  })

  // 1Hz tick for live countdowns
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  // ─── Writes ─────────────────────────────────────────────────────────
  const {
    writeContract: writeTrigger,
    data: triggerHash,
    error: triggerErr,
    reset: resetTrigger,
  } = useWriteContract()

  const {
    writeContract: writeClaim,
    data: claimHash,
    error: claimErr,
    reset: resetClaim,
  } = useWriteContract()

  const { isSuccess: triggerSuccess } = useWaitForTransactionReceipt({ hash: triggerHash })
  const { isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimHash })

  const [action, setAction] = useState<PoolExitAction>({ kind: 'idle' })

  const triggerLargeExit = useCallback(async () => {
    if (poolId === undefined) return
    setAction({ kind: 'triggering' })
    try {
      writeTrigger({
        address: CONTRACTS.POOL_MANAGER,
        abi: POOL_MANAGER_V2_ABI,
        functionName: 'triggerLargePoolExit',
        args: [BigInt(poolId as number)],
      })
    } catch (e) {
      setAction({ kind: 'error', error: parseTransactionError(e) })
    }
  }, [poolId, writeTrigger])

  const triggerAnyoneExit = useCallback(async () => {
    if (poolId === undefined) return
    setAction({ kind: 'triggering' })
    try {
      writeTrigger({
        address: CONTRACTS.POOL_MANAGER,
        abi: POOL_MANAGER_V2_ABI,
        functionName: 'triggerPoolStaleExit',
        args: [BigInt(poolId as number)],
      })
    } catch (e) {
      setAction({ kind: 'error', error: parseTransactionError(e) })
    }
  }, [poolId, writeTrigger])

  const claimRefund = useCallback(async () => {
    if (poolId === undefined) return
    setAction({ kind: 'claiming' })
    try {
      writeClaim({
        address: CONTRACTS.POOL_MANAGER,
        abi: POOL_MANAGER_V2_ABI,
        functionName: 'claimStaleRefund',
        args: [BigInt(poolId as number)],
      })
    } catch (e) {
      setAction({ kind: 'error', error: parseTransactionError(e) })
    }
  }, [poolId, writeClaim])

  const reset = useCallback(() => {
    setAction({ kind: 'idle' })
    resetTrigger()
    resetClaim()
  }, [resetTrigger, resetClaim])

  // Wallet errors
  useEffect(() => {
    if (triggerErr) setAction({ kind: 'error', error: parseTransactionError(triggerErr) })
  }, [triggerErr])
  useEffect(() => {
    if (claimErr) setAction({ kind: 'error', error: parseTransactionError(claimErr) })
  }, [claimErr])

  // Trigger success → invalidate, set success
  useEffect(() => {
    if (triggerSuccess && action.kind === 'triggering') {
      const id = poolId !== undefined ? BigInt(poolId as number) : undefined
      queryClient.invalidateQueries({
        predicate: (q) => {
          const key = q.queryKey as unknown[]
          if (key[0] !== 'readContract') return false
          const cfg = key[1] as { functionName?: string; args?: unknown[] } | undefined
          if (!cfg?.functionName) return false
          const refetch = ['staleExits', 'pendingStaleRefund', 'lockedStake', 'getOpinionDetails']
          if (!refetch.includes(cfg.functionName)) return false
          if (id === undefined) return true
          // Pool-id-keyed queries: first arg is the pool id
          const args = cfg.args as [bigint, ...unknown[]] | undefined
          if (cfg.functionName === 'lockedStake' || cfg.functionName === 'getOpinionDetails') {
            // These are opinion-id keyed; refetch all
            return true
          }
          return args?.[0] === id
        },
      })
      setAction({ kind: 'success', what: 'trigger' })
    }
  }, [triggerSuccess, action.kind, poolId, queryClient])

  useEffect(() => {
    if (claimSuccess && action.kind === 'claiming') {
      const id = poolId !== undefined ? BigInt(poolId as number) : undefined
      queryClient.invalidateQueries({
        predicate: (q) => {
          const key = q.queryKey as unknown[]
          if (key[0] !== 'readContract') return false
          const cfg = key[1] as { functionName?: string; args?: unknown[] } | undefined
          if (!cfg?.functionName) return false
          const refetch = ['pendingStaleRefund', 'hasClaimedStaleRefund']
          if (!refetch.includes(cfg.functionName)) return false
          if (id === undefined) return true
          const args = cfg.args as [bigint, ...unknown[]] | undefined
          return args?.[0] === id
        },
      })
      setAction({ kind: 'success', what: 'claim' })
    }
  }, [claimSuccess, action.kind, poolId, queryClient])

  // ─── Compute derived ────────────────────────────────────────────────
  const tuple = staleExitTuple as readonly [boolean, bigint, bigint, number] | undefined
  const dissolved = !!tuple?.[0]
  const lockedStake = (lockedStakeData as bigint | undefined) ?? ZERO
  const lastTradeTs = Number((lastTradeTsData as bigint | undefined) ?? 0)
  const poolCooldown = Number((poolCooldownData as bigint | undefined) ?? 0)
  const poolExtCooldown = Number((poolExtCooldownData as bigint | undefined) ?? 0)
  const thresholdBps = Number((thresholdBpsData as bigint | undefined) ?? 1000)
  const callerContribution = (callerContributionData as bigint | undefined) ?? ZERO
  const pendingRefund = (pendingRefundData as bigint | undefined) ?? ZERO
  const hasClaimed = !!hasClaimedData
  const total = poolTotalAmount ?? ZERO
  const callerIsLargeHolder =
    total > ZERO && callerContribution * BigInt(10000) >= total * BigInt(thresholdBps)
  const poolIsKing = poolStatus === 1 // Executed

  return {
    isLoading: flagLoading || stLoading || ccLoading,
    featureEnabled: Boolean(featureFlag),
    dissolved,
    poolIsKing,
    lockedStake,
    callerContribution,
    hasClaimed,
    pendingRefund,
    callerIsLargeHolder,
    secondsUntilLargeWindow: lastTradeTs + poolCooldown - now,
    secondsUntilAnyoneWindow: lastTradeTs + poolExtCooldown - now,
    action,
    triggerLargeExit,
    triggerAnyoneExit,
    claimRefund,
    reset,
  }
}
