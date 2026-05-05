'use client'

import { useEffect, useState } from 'react'
import { useReadContract, useAccount } from 'wagmi'

import { CONTRACTS } from '@/lib/contracts'
import { OPINION_CORE_V4_ABI } from '@/lib/contracts-v4'

/**
 * Reads V4 lock state for a single opinion and computes the UI-relevant
 * derived flags. Returns null-y values gracefully so callers can render
 * before chain reads complete.
 *
 * Legacy opinions (created pre-V4 upgrade) have lockedStake = 0 and are
 * not eligible for self-exit. Vacant slots have currentAnswerOwner = 0x0
 * and are reclaim-eligible.
 */
export interface OpinionLockStatus {
  // Raw chain reads
  lockedStake: bigint            // 0 for legacy
  lastTradeTimestamp: number     // unix seconds; 0 if never traded under V4
  soloCooldown: number           // seconds, configurable on V4 (default 14d)

  // Derived flags
  isLegacy: boolean              // lockedStake == 0 (no rescue available)
  isRescueEnabled: boolean       // lockedStake > 0
  selfExitFeatureEnabled: boolean

  // Cooldown timing (only meaningful when lockedStake > 0)
  cooldownEnd: number            // unix seconds when self-exit unlocks
  secondsUntilExit: number       // negative if already eligible
  canSelfExitNow: boolean        // true iff caller is king AND cooldown elapsed

  // Loading state
  isLoading: boolean
}

const ZERO = BigInt(0)

export function useOpinionLockStatus(
  opinionId: number | bigint | undefined,
  currentAnswerOwner: string | undefined
): OpinionLockStatus {
  const { address } = useAccount()
  const enabled = opinionId !== undefined && opinionId !== null
  const idArg = enabled ? [BigInt(opinionId as number)] as const : undefined

  const { data: lockedStake, isLoading: stakeLoading } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'lockedStake',
    args: idArg,
    query: { enabled }
  })

  const { data: lastTradeTimestamp, isLoading: tsLoading } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'lastTradeTimestamp',
    args: idArg,
    query: { enabled }
  })

  const { data: soloCooldown, isLoading: cdLoading } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'soloCooldown',
    query: { enabled }
  })

  const { data: selfExitFlag, isLoading: flagLoading } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'selfExitEnabled',
    query: { enabled }
  })

  // Tick once per second so countdowns advance without refetching chain state.
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  const stake = (lockedStake as bigint | undefined) ?? ZERO
  const ts = Number((lastTradeTimestamp as bigint | undefined) ?? 0)
  const cd = Number((soloCooldown as bigint | undefined) ?? 0)
  const featureOn = Boolean(selfExitFlag)

  const cooldownEnd = ts + cd
  const secondsUntilExit = cooldownEnd - now

  const isCallerKing = !!address &&
    !!currentAnswerOwner &&
    address.toLowerCase() === currentAnswerOwner.toLowerCase()

  return {
    lockedStake: stake,
    lastTradeTimestamp: ts,
    soloCooldown: cd,
    isLegacy: stake === ZERO,
    isRescueEnabled: stake > ZERO,
    selfExitFeatureEnabled: featureOn,
    cooldownEnd,
    secondsUntilExit,
    canSelfExitNow:
      featureOn && stake > ZERO && isCallerKing && secondsUntilExit <= 0,
    isLoading: stakeLoading || tsLoading || cdLoading || flagLoading,
  }
}
