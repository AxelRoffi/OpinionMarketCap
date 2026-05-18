'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { Btn, MonoNum, Sticker } from '@/components/poster-arcade';
import { useSelfExit } from '@/hooks/useSelfExit';
import { useOpinionLockStatus } from '@/hooks/useOpinionLockStatus';
import { fmtUSD, type DisplayTake } from '../../../_data/mock-takes';

interface KingPanelProps {
  take: DisplayTake;
}

/**
 * V4 self-exit UI for the current answer owner ("king"). Renders only when
 * the connected wallet matches the opinion's currentAnswerOwner AND the
 * opinion has a V4 lockedStake (legacy V3 takes are excluded).
 *
 * The contract returns 80% of the locked stake to the king; the remaining
 * 20% becomes the discounted reclaim price for the next holder (set on
 * opinion.nextPrice).
 */
export function KingPanel({ take }: KingPanelProps) {
  const { address } = useAccount();
  const status = useOpinionLockStatus(take.id, take.ownerAddress);
  const { step, error, selfExit, reset } = useSelfExit(take.id);

  useEffect(() => {
    if (step === 'success') {
      toast.success(`you exited take #${take.id}`, {
        description: 'slot is now vacant; the discounted reclaim price is on chain',
      });
    }
  }, [step, take.id]);

  useEffect(() => {
    if (error) {
      const msg = (error.message || 'self-exit failed').split('\n')[0];
      toast.error('self-exit failed', { description: msg.slice(0, 180) });
    }
  }, [error]);

  // Gate: caller must be the king, slot must be V4-locked, chain reads done.
  const callerIsKing =
    !!address &&
    !!take.ownerAddress &&
    take.heldBy !== 'vacant' &&
    address.toLowerCase() === take.ownerAddress.toLowerCase();
  if (!callerIsKing) return null;
  if (status.isLoading) return null;
  if (status.isLegacy) return null;

  const cooldownLabel = formatCountdown(status.secondsUntilExit);
  const lockedUsdc = Number(status.lockedStake) / 1_000_000;

  return (
    <Sticker bg="canvas" tilt={1} shadow={5} className="w-full mb-4">
      <div className="flex items-center justify-between">
        <div className="font-display font-black text-[14px] tracking-tight uppercase">
          👑 you hold the floor
        </div>
        <span className="font-mono font-extrabold text-[10px] text-ink/55">
          locked: <MonoNum>{fmtUSD(lockedUsdc)}</MonoNum>
        </span>
      </div>

      <p className="font-display text-[11px] font-semibold text-ink/70 mt-1.5 max-w-[300px]">
        Exit recovers <span className="font-mono font-extrabold">80%</span> of your locked
        stake. The remaining 20% becomes the discounted reclaim price for the next holder.
      </p>

      {!status.selfExitFeatureEnabled && (
        <div className="mt-3 font-display text-[11px] font-bold text-pop">
          self-exit is disabled by admin · cannot exit right now
        </div>
      )}

      {status.selfExitFeatureEnabled && status.secondsUntilExit > 0 && (
        <div className="mt-3 flex items-baseline justify-between border-t-2 border-dashed border-ink/40 pt-3">
          <span className="font-display text-[10px] font-extrabold tracking-[0.12em] uppercase text-ink/65">
            cooldown unlocks in
          </span>
          <MonoNum className="text-[14px]">{cooldownLabel}</MonoNum>
        </div>
      )}

      {status.canSelfExitNow && step !== 'success' && (
        <div className="mt-4">
          <Btn
            variant="pop"
            size="lg"
            star
            className="w-full"
            onClick={() => selfExit()}
            disabled={step === 'confirming'}
          >
            {step === 'confirming' ? 'EXITING…' : 'EXIT MY SLOT · RECOVER 80%'}
          </Btn>
        </div>
      )}

      {step === 'success' && (
        <div className="mt-4 text-center">
          <div className="font-display font-black text-[14px] tracking-tight">
            ★ EXITED.
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-2 font-display text-[10px] font-extrabold tracking-[0.12em] uppercase text-ink/55 hover:text-ink underline"
          >
            close panel
          </button>
        </div>
      )}
    </Sticker>
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
