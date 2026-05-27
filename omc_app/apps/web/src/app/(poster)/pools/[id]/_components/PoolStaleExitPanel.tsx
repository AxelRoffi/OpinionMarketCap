'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { Btn, MonoNum, Sticker } from '@/components/poster-arcade';
import { usePoolStaleExit } from '@/hooks/usePoolStaleExit';

/**
 * V4/V2 stale-pool dissolution panel. Renders only when:
 *   - the pool has executed and is currently king of an opinion
 *   - OR the pool has already been dissolved (so contributors can claim)
 *
 * Drives every contract write related to dissolution + refund claiming:
 *   - triggerLargePoolExit  (≥10% holder, after poolCooldown)
 *   - triggerPoolStaleExit  (any contributor, after poolExtendedCooldown)
 *   - claimStaleRefund      (after dissolution)
 *
 * Cooldowns + threshold + feature flag are all read from chain in
 * usePoolStaleExit — no copy can drift if admin re-tunes parameters.
 */
export function PoolStaleExitPanel({
  poolId,
  opinionId,
  poolStatusString,
  poolTotalAmountUsdc,
}: {
  poolId: number;
  opinionId: number | undefined;
  /** From useChainPool: 'active' | 'filled' | 'expired'. We need the raw uint8 internally. */
  poolStatusString: 'active' | 'filled' | 'expired';
  /** Pool total in human USDC (e.g. 100 = $100); converted to micro-USDC for the threshold check. */
  poolTotalAmountUsdc: number;
}) {
  const { address } = useAccount();
  // chain status mapping: 0 active, 1 executed (= 'filled'), 2 expired
  const poolStatus =
    poolStatusString === 'filled'
      ? 1
      : poolStatusString === 'expired'
        ? 2
        : 0;
  const totalBig = BigInt(Math.max(0, Math.floor(poolTotalAmountUsdc * 1_000_000)));

  const state = usePoolStaleExit({
    poolId,
    opinionId,
    poolStatus,
    poolTotalAmount: totalBig,
  });

  useEffect(() => {
    if (state.action.kind === 'success' && state.action.what === 'trigger') {
      toast.success('pool dissolved', {
        description: 'contributors can now claim their refund',
      });
    }
    if (state.action.kind === 'success' && state.action.what === 'claim') {
      toast.success('refund claimed', {
        description: 'check your USDC balance',
      });
    }
    if (state.action.kind === 'error') {
      const msg = state.action.error.message.split('\n')[0];
      toast.error('transaction failed', { description: msg.slice(0, 180) });
    }
  }, [state.action]);

  // Only show the action panel once the pool has executed (became king).
  // Until then, the V1 early-withdraw mechanism is the relevant exit path
  // and is surfaced in the join sticker copy ("early-exit penalty 20%").
  if (state.isLoading) return null;
  if (poolStatus !== 1 && !state.dissolved) return null;

  const isContributor = state.callerContribution > BigInt(0);
  const busy =
    state.action.kind === 'triggering' || state.action.kind === 'claiming';

  // ── DISSOLVED ────────────────────────────────────────────────────────
  if (state.dissolved) {
    const refundUsdc = Number(state.pendingRefund) / 1_000_000;
    return (
      <Sticker bg="canvas" tilt={1} shadow={5} className="w-full mb-4">
        <div className="font-display font-black text-[14px] tracking-tight uppercase">
          🚪 pool dissolved
        </div>
        <p className="font-display text-[11px] font-semibold text-ink/70 mt-1.5 max-w-[300px]">
          Stake unlocked. Each contributor can claim their proportional refund
          (less the 20% penalty).
        </p>

        {!isContributor ? (
          <div className="mt-3 font-display text-[11px] font-bold text-ink/55">
            you didn&apos;t contribute to this pool — nothing to claim
          </div>
        ) : state.hasClaimed ? (
          <div className="mt-3 flex items-baseline justify-between border-t-2 border-dashed border-ink/40 pt-3">
            <span className="font-display text-[10px] font-extrabold tracking-[0.12em] uppercase text-ink/65">
              ★ already claimed
            </span>
          </div>
        ) : (
          <>
            <div className="mt-3 flex items-baseline justify-between border-t-2 border-dashed border-ink/40 pt-3">
              <span className="font-display text-[10px] font-extrabold tracking-[0.12em] uppercase text-ink/65">
                your refund
              </span>
              <MonoNum className="text-[14px]">${refundUsdc.toFixed(2)}</MonoNum>
            </div>
            <div className="mt-4">
              <Btn
                variant="pop"
                size="lg"
                star
                className="w-full"
                onClick={() => state.claimRefund()}
                disabled={busy || refundUsdc <= 0}
              >
                {state.action.kind === 'claiming'
                  ? 'CLAIMING…'
                  : `CLAIM REFUND · $${refundUsdc.toFixed(2)}`}
              </Btn>
            </div>
          </>
        )}
      </Sticker>
    );
  }

  // ── EXECUTED, NOT YET DISSOLVED ─────────────────────────────────────
  if (!state.featureEnabled) {
    return (
      <Sticker bg="paper" tilt={1} shadow={4} className="w-full mb-4">
        <div className="font-display font-black text-[13px] tracking-tight uppercase">
          🚪 stale-pool exit
        </div>
        <p className="font-display text-[11px] font-semibold text-pop mt-1.5">
          currently disabled by admin · pool cannot be dissolved right now
        </p>
      </Sticker>
    );
  }

  const largeArmed = state.secondsUntilLargeWindow <= 0;
  const anyoneArmed = state.secondsUntilAnyoneWindow <= 0;
  const lockedStakeUsdc = Number(state.lockedStake) / 1_000_000;

  return (
    <Sticker bg="canvas" tilt={1} shadow={5} className="w-full mb-4">
      <div className="flex items-center justify-between">
        <div className="font-display font-black text-[14px] tracking-tight uppercase">
          🚪 stale-pool exit
        </div>
        <span className="font-mono font-extrabold text-[10px] text-ink/55">
          locked: <MonoNum>${lockedStakeUsdc.toFixed(2)}</MonoNum>
        </span>
      </div>

      <p className="font-display text-[11px] font-semibold text-ink/70 mt-1.5 max-w-[300px]">
        Once the king-pool sits stale, any contributor can pull the plug. Refund
        splits 80/20 to contributors / (creator+platform).
      </p>

      {/* Window 1 — large-holder */}
      <Row
        label="large-holder window"
        value={
          largeArmed
            ? state.callerIsLargeHolder
              ? 'open · you qualify'
              : 'open · need ≥ threshold'
            : `opens in ${formatCountdown(state.secondsUntilLargeWindow)}`
        }
        tone={largeArmed ? (state.callerIsLargeHolder ? 'live' : 'muted') : 'muted'}
      />

      {/* Window 2 — public */}
      <Row
        label="public window"
        value={
          anyoneArmed
            ? isContributor
              ? 'open · any contributor'
              : 'open · contributors only'
            : `opens in ${formatCountdown(state.secondsUntilAnyoneWindow)}`
        }
        tone={anyoneArmed ? (isContributor ? 'live' : 'muted') : 'muted'}
      />

      {/* Actions */}
      {!isContributor && (
        <div className="mt-3 font-display text-[10px] font-extrabold tracking-[0.1em] uppercase text-ink/55">
          you didn&apos;t contribute — cannot trigger the exit
        </div>
      )}

      {isContributor && largeArmed && state.callerIsLargeHolder && (
        <div className="mt-4">
          <Btn
            variant="pop"
            size="lg"
            star
            className="w-full"
            onClick={() => state.triggerLargeExit()}
            disabled={busy}
          >
            {state.action.kind === 'triggering'
              ? 'DISSOLVING…'
              : 'DISSOLVE POOL · LARGE HOLDER'}
          </Btn>
        </div>
      )}

      {isContributor && anyoneArmed && (
        <div className="mt-3">
          <Btn
            variant={state.callerIsLargeHolder ? 'ghost' : 'pop'}
            size="lg"
            star
            className="w-full"
            onClick={() => state.triggerAnyoneExit()}
            disabled={busy}
          >
            {state.action.kind === 'triggering'
              ? 'DISSOLVING…'
              : 'DISSOLVE POOL · ANY CONTRIBUTOR'}
          </Btn>
        </div>
      )}
    </Sticker>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'live' | 'muted';
}) {
  return (
    <div className="mt-2.5 flex items-baseline justify-between border-t-2 border-dashed border-ink/40 pt-2.5 gap-3">
      <span className="font-display text-[10px] font-extrabold tracking-[0.1em] uppercase text-ink/65">
        {label}
      </span>
      <span
        className={
          'font-mono text-[11px] font-extrabold ' +
          (tone === 'live' ? 'text-ink' : 'text-ink/55')
        }
      >
        {value}
      </span>
    </div>
  );
}

function formatCountdown(secs: number): string {
  if (secs <= 0) return 'now';
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
