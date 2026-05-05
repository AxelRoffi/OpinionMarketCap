'use client'

import { useEffect, useState } from 'react'
import { Shield, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useOpinionLockStatus } from '@/hooks/useOpinionLockStatus'
import { useSelfExit } from '@/hooks/useSelfExit'

interface SelfExitPanelProps {
  opinionId: number
  currentAnswerOwner: string
  /** ABI returns uint16, ethers turns it into a number/bigint depending on context */
  exitPenaltyBps?: number
}

const BPS_DENOM = 10000

function formatUSDC(wei: bigint): string {
  const usdc = Number(wei) / 1_000_000
  return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Available now'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

/**
 * V4 Self-Exit panel.
 *
 * Behaviour by state:
 *   - Loading              → minimal skeleton
 *   - Legacy (lock = 0)    → "Legacy position" badge, no rescue
 *   - Rescue-enabled, not king → small info card showing the amount backing the slot
 *   - Rescue-enabled, king, cooldown still running → countdown widget
 *   - Rescue-enabled, king, cooldown elapsed       → confirm + Self Exit button
 *   - Self-exit feature disabled on contract → hidden entirely
 *
 * Caller is responsible for placing this in the page; recommend below the
 * trade panel on desktop and as a collapsible section on mobile.
 */
export function SelfExitPanel({
  opinionId,
  currentAnswerOwner,
  exitPenaltyBps,
}: SelfExitPanelProps) {
  const status = useOpinionLockStatus(opinionId, currentAnswerOwner)
  const { step, error, selfExit, reset } = useSelfExit(opinionId)
  const [confirming, setConfirming] = useState(false)

  // Reset confirmation UI on success
  useEffect(() => {
    if (step === 'success') setConfirming(false)
  }, [step])

  if (status.isLoading) {
    return (
      <div className="bg-card rounded-lg p-4 border border-border animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-2" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    )
  }

  // Hide entirely if the feature is disabled on-chain — keeps the UI quiet
  // until admin flips the flag.
  if (!status.selfExitFeatureEnabled) return null

  // Legacy position — show a small disclosure but no rescue UI
  if (status.isLegacy) {
    return (
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <div className="text-sm font-medium text-foreground">Legacy position</div>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          This opinion was created before the self-exit feature shipped. No rescue
          is available — kings here can only recover capital by being flipped.
        </p>
      </div>
    )
  }

  const stake = status.lockedStake
  const penaltyBps = BigInt(exitPenaltyBps ?? 2000) // default 20%
  const penalty = (stake * penaltyBps) / BigInt(BPS_DENOM)
  const refund = stake - penalty

  // Spectator view — just disclose the backing amount
  const isCallerKing = status.canSelfExitNow || status.secondsUntilExit > 0
  if (!isCallerKing) {
    return (
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-emerald-500" />
          <div className="text-sm font-medium text-foreground">
            Backed by {formatUSDC(stake)}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          The current king has {formatUSDC(stake)} locked behind this slot.
          They can self-exit for {formatUSDC(refund)} (80%) after the cooldown.
        </p>
      </div>
    )
  }

  // King view — countdown or action button
  const eligible = status.canSelfExitNow

  return (
    <div className="bg-card rounded-lg p-5 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-foreground">Self-Exit</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          You are the current king
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted/40 rounded-md p-3">
          <div className="text-xs text-muted-foreground">Locked stake</div>
          <div className="text-base font-semibold text-foreground">
            {formatUSDC(stake)}
          </div>
        </div>
        <div className="bg-muted/40 rounded-md p-3">
          <div className="text-xs text-muted-foreground">
            Refund (80%) after 20% penalty
          </div>
          <div className="text-base font-semibold text-emerald-500">
            {formatUSDC(refund)}
          </div>
        </div>
      </div>

      {!eligible && (
        <div className="flex items-center gap-2 text-xs bg-muted/30 rounded-md p-3 mb-3">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">
            Self-exit available in{' '}
            <span className="text-foreground font-medium">
              {formatCountdown(status.secondsUntilExit)}
            </span>
          </span>
        </div>
      )}

      {eligible && !confirming && step === 'idle' && (
        <Button
          onClick={() => setConfirming(true)}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
        >
          Self-Exit Position
        </Button>
      )}

      {eligible && confirming && step === 'idle' && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            You will receive <span className="text-foreground font-medium">{formatUSDC(refund)}</span>.
            The 20% penalty ({formatUSDC(penalty)}) is split 50/50 between the question
            creator and the platform. The slot becomes vacant.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => selfExit()}
            >
              Confirm Self-Exit
            </Button>
          </div>
        </div>
      )}

      {step === 'confirming' && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          Waiting for confirmation…
        </div>
      )}

      {step === 'success' && (
        <div className="flex items-center gap-2 text-sm text-emerald-500">
          <CheckCircle2 className="w-4 h-4" />
          Position exited. Refund sent to your wallet.
        </div>
      )}

      {step === 'error' && error && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs text-red-500">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{error.message}</span>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}
