'use client'

import { useState } from 'react'
import { Sparkles, AlertTriangle, CheckCircle2, Wallet } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useReclaimSlot } from '@/hooks/useReclaimSlot'

interface VacantSlotReclaimPanelProps {
  opinionId: number
  /** Pre-set by V4 to the discounted reclaim price (50% of last price) */
  reclaimPrice: bigint
  /** Last answer that occupied the slot — shown as historical context */
  previousAnswer?: string
}

const ANSWER_LIMIT = 60
const DESCRIPTION_LIMIT = 120
const LINK_LIMIT = 260

function formatUSDC(wei: bigint): string {
  const usdc = Number(wei) / 1_000_000
  return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Replaces the trade panel when an answer slot is vacant (post-self-exit
 * or post-pool-dissolution). The user enters a new answer, approves USDC
 * if needed, and reclaims the slot at the discounted price.
 *
 * The previous answer is shown as dormant historical context, not as the
 * current state.
 */
export function VacantSlotReclaimPanel({
  opinionId,
  reclaimPrice,
  previousAnswer,
}: VacantSlotReclaimPanelProps) {
  const { step, error, needsApproval, hasBalance, feature, reclaim, reset } =
    useReclaimSlot(opinionId, reclaimPrice)

  const [answer, setAnswer] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [showContext, setShowContext] = useState(false)

  const isWorking = step === 'approve' || step === 'submit'
  const formValid = answer.trim().length >= 2 && answer.length <= ANSWER_LIMIT

  if (feature.loading) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border animate-pulse">
        <div className="h-5 bg-muted rounded w-1/3 mb-3" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    )
  }

  if (!feature.enabled) {
    // Reclaim is admin-disabled — degrade gracefully with a quiet notice.
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Slot is vacant</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          The previous king exited, leaving this slot open. Reclaim is currently
          disabled by the protocol — check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg p-6 border-2 border-emerald-500/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <h3 className="text-base font-semibold text-foreground">
            Vacant slot — claim it
          </h3>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
          {formatUSDC(reclaimPrice)}
        </div>
      </div>

      {previousAnswer && (
        <div className="text-xs text-muted-foreground mb-4">
          Previous answer:{' '}
          <span className="text-foreground italic">&ldquo;{previousAnswer}&rdquo;</span>{' '}
          <span className="opacity-60">(dormant — exited)</span>
        </div>
      )}

      {step === 'success' ? (
        <div className="flex items-center gap-2 text-emerald-500 py-4">
          <CheckCircle2 className="w-5 h-5" />
          <div>
            <div className="text-sm font-medium">Slot reclaimed.</div>
            <div className="text-xs text-muted-foreground">
              Your answer is now live and you&apos;re the new king.
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!formValid || isWorking) return
            reclaim(answer, description, link)
          }}
          className="space-y-3"
        >
          <div>
            <label className="text-xs text-muted-foreground">Your answer</label>
            <input
              type="text"
              value={answer}
              maxLength={ANSWER_LIMIT}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isWorking}
              className="w-full mt-1 px-3 py-2 bg-muted/40 border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="State your answer (min 2 chars)"
            />
            <div className="text-[10px] text-muted-foreground mt-1 text-right">
              {answer.length}/{ANSWER_LIMIT}
            </div>
          </div>

          {!showContext ? (
            <button
              type="button"
              onClick={() => setShowContext(true)}
              disabled={isWorking}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              + Add description / link (optional)
            </button>
          ) : (
            <>
              <div>
                <label className="text-xs text-muted-foreground">Description (optional)</label>
                <textarea
                  value={description}
                  maxLength={DESCRIPTION_LIMIT}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isWorking}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 bg-muted/40 border border-border rounded-md text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
                <div className="text-[10px] text-muted-foreground mt-1 text-right">
                  {description.length}/{DESCRIPTION_LIMIT}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Link (optional)</label>
                <input
                  type="url"
                  value={link}
                  maxLength={LINK_LIMIT}
                  onChange={(e) => setLink(e.target.value)}
                  disabled={isWorking}
                  className="w-full mt-1 px-3 py-2 bg-muted/40 border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  placeholder="https://…"
                />
              </div>
            </>
          )}

          {!hasBalance && (
            <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-md p-2.5">
              <Wallet className="w-3.5 h-3.5" />
              You need {formatUSDC(reclaimPrice)} USDC to claim this slot.
            </div>
          )}

          {step === 'error' && error && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-red-500">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{error.message}</span>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={reset}>
                Try again
              </Button>
            </div>
          )}

          <Button
            type="submit"
            disabled={!formValid || !hasBalance || isWorking}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
          >
            {step === 'approve'
              ? 'Approving USDC…'
              : step === 'submit'
              ? 'Claiming slot…'
              : needsApproval
              ? `Approve & claim for ${formatUSDC(reclaimPrice)}`
              : `Claim slot for ${formatUSDC(reclaimPrice)}`}
          </Button>
        </form>
      )}
    </div>
  )
}
