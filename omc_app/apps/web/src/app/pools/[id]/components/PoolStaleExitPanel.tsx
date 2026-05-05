'use client'

import { Clock, AlertTriangle, CheckCircle2, Coins } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { usePoolStaleExit } from '@/hooks/usePoolStaleExit'

interface PoolStaleExitPanelProps {
  poolId: number
  opinionId: number
  /** Pool status from PoolManager: 0=Active, 1=Executed, 2=Expired, 3=Extended */
  poolStatusNumber: number
  /** Pool's totalAmount, used to gauge if caller is a >threshold holder */
  poolTotalAmount: bigint
}

function formatUSDC(wei: bigint): string {
  const usdc = Number(wei) / 1_000_000
  return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Available now'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/**
 * Stale-exit panel for pool-owned slots. Shows on the pool detail page
 * when the pool has Executed (became king) and the V4 cooldown windows
 * apply. Behaviour by state:
 *
 *   - Pool not Executed         → hidden
 *   - Feature disabled on-chain → hidden
 *   - Already dissolved         → claim refund UI
 *   - Cooldown not yet open     → countdown widget
 *   - Large window open         → "Trigger" button (if caller is large holder)
 *   - Anyone window open        → "Trigger" button for any contributor
 */
export function PoolStaleExitPanel({
  poolId,
  opinionId,
  poolStatusNumber,
  poolTotalAmount,
}: PoolStaleExitPanelProps) {
  const state = usePoolStaleExit({
    poolId,
    opinionId,
    poolStatus: poolStatusNumber,
    poolTotalAmount,
  })

  if (state.isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6 animate-pulse">
        <div className="h-5 bg-slate-700 rounded w-1/3 mb-3" />
        <div className="h-4 bg-slate-700 rounded w-2/3" />
      </div>
    )
  }

  if (!state.featureEnabled || !state.poolIsKing) return null

  // ─── Already dissolved → claim UI ─────────────────────────────────
  if (state.dissolved) {
    if (state.callerContribution === BigInt(0)) {
      // Non-contributor — show informational state only
      return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Pool dissolved</h3>
          </div>
          <p className="text-sm text-gray-400">
            Contributors are pulling their refunds.
          </p>
        </div>
      )
    }
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-amber-500/30 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Coins className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-semibold text-white">Refund available</h3>
        </div>

        {state.hasClaimed ? (
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            You&apos;ve already claimed your refund.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-700/30 rounded-md p-3">
                <div className="text-xs text-gray-400">Your contribution</div>
                <div className="text-base font-semibold text-white">
                  {formatUSDC(state.callerContribution)}
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-md p-3">
                <div className="text-xs text-gray-400">Your refund</div>
                <div className="text-base font-semibold text-emerald-400">
                  {formatUSDC(state.pendingRefund)}
                </div>
              </div>
            </div>

            {state.action.kind === 'error' && (
              <div className="flex items-start gap-2 text-xs text-red-400 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{state.action.error.message}</span>
              </div>
            )}

            <Button
              onClick={() => state.claimRefund()}
              disabled={state.action.kind === 'claiming'}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {state.action.kind === 'claiming'
                ? 'Claiming…'
                : state.action.kind === 'success' && state.action.what === 'claim'
                ? 'Refund claimed ✓'
                : `Claim ${formatUSDC(state.pendingRefund)}`}
            </Button>
          </>
        )}
      </div>
    )
  }

  // ─── Active pool but no caller contribution → spectator mode ──────
  if (state.callerContribution === BigInt(0)) {
    // Useful disclosure that dissolution may be coming
    if (state.secondsUntilAnyoneWindow > 0) {
      return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-semibold text-white">Stale-exit eligibility</h3>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Large holders (≥10%)</span>
              <span className="text-white">
                {state.secondsUntilLargeWindow > 0
                  ? `in ${formatCountdown(state.secondsUntilLargeWindow)}`
                  : 'open'}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Any contributor</span>
              <span className="text-white">
                {state.secondsUntilAnyoneWindow > 0
                  ? `in ${formatCountdown(state.secondsUntilAnyoneWindow)}`
                  : 'open'}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // ─── Caller is a contributor; show trigger states ─────────────────
  const largeOpen = state.secondsUntilLargeWindow <= 0
  const anyoneOpen = state.secondsUntilAnyoneWindow <= 0

  if (!largeOpen && !anyoneOpen) {
    // Cooldown still running for everyone
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-blue-400" />
          <h3 className="text-base font-semibold text-white">Stale-exit window</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Large holders (≥10%)</span>
            <span className="text-white font-medium">
              {formatCountdown(state.secondsUntilLargeWindow)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Any contributor</span>
            <span className="text-white font-medium">
              {formatCountdown(state.secondsUntilAnyoneWindow)}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          The pool is currently active as king. If trading dies for the cooldown
          period, contributors can dissolve the pool and recover ~80% of the locked
          stake (20% penalty splits between creator and platform).
        </p>
      </div>
    )
  }

  // Trigger UI — at least one window is open
  const canTriggerLarge = largeOpen && state.callerIsLargeHolder
  const canTriggerAnyone = anyoneOpen

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-amber-500/30 p-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <h3 className="text-base font-semibold text-white">Pool dissolution available</h3>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        No trades have happened on this opinion for the cooldown window. You can
        trigger dissolution to refund all contributors pro-rata (minus 20% penalty
        kept in the protocol).
      </p>

      {state.action.kind === 'error' && (
        <div className="flex items-start gap-2 text-xs text-red-400 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{state.action.error.message}</span>
        </div>
      )}

      {canTriggerLarge && (
        <Button
          onClick={() => state.triggerLargeExit()}
          disabled={state.action.kind === 'triggering'}
          className="w-full mb-2 bg-amber-500 hover:bg-amber-600 text-white"
        >
          {state.action.kind === 'triggering'
            ? 'Dissolving…'
            : 'Trigger dissolution (large holder)'}
        </Button>
      )}

      {canTriggerAnyone && (
        <Button
          onClick={() => state.triggerAnyoneExit()}
          disabled={state.action.kind === 'triggering'}
          variant={canTriggerLarge ? 'outline' : 'default'}
          className={
            canTriggerLarge
              ? 'w-full text-amber-400 border-amber-500'
              : 'w-full bg-amber-500 hover:bg-amber-600 text-white'
          }
        >
          {state.action.kind === 'triggering'
            ? 'Dissolving…'
            : 'Trigger dissolution (any contributor)'}
        </Button>
      )}

      {!canTriggerLarge && !canTriggerAnyone && (
        <div className="text-xs text-gray-500">
          You don&apos;t hold enough of the pool to trigger the early window. Wait
          {' '}{formatCountdown(state.secondsUntilAnyoneWindow)}{' '}
          for the anyone-can-trigger window.
        </div>
      )}
    </div>
  )
}
