'use client';

import { useOpinionLockStatus } from '@/hooks/useOpinionLockStatus';

/**
 * Read-only visibility chip for the self-exit mechanism. Visible to ALL
 * visitors on an opinion detail page (not just the king), so anyone
 * weighing whether to buy a slot can see the exit terms up front.
 *
 * Every value is read live from chain via useOpinionLockStatus — so if
 * an admin changes soloCooldown or exitPenaltyBps via /admin, the chip
 * updates with no code change.
 *
 * Renders one of four states:
 *  - Legacy: pre-V4 opinion, self-exit not eligible
 *  - Disabled: admin has toggled selfExitEnabled off
 *  - Locked: king bought / traded recently; cooldown still running
 *  - Armed: king can self-exit right now
 */
export function SelfExitInfoChip({
  opinionId,
  currentAnswerOwner,
}: {
  opinionId: number;
  currentAnswerOwner: string | undefined;
}) {
  const status = useOpinionLockStatus(opinionId, currentAnswerOwner);

  // Wait for the first read so we don't flash the "disabled" state on
  // every page load. Three of the four reads have to land before this
  // chip means anything; keep it invisible until they do.
  if (status.isLoading) return null;

  // Pre-V4 opinion: no lockedStake, no rescue path. Skip the chip entirely
  // rather than render a confusing "self-exit unavailable" badge.
  if (status.isLegacy) return null;

  const refundPct = (10000 - status.exitPenaltyBps) / 100;
  const penaltyPct = status.exitPenaltyBps / 100;
  const cooldownLabel = formatSeconds(status.soloCooldown);
  const armed = status.secondsUntilExit <= 0;
  const remaining = formatSeconds(Math.max(0, status.secondsUntilExit));

  if (!status.selfExitFeatureEnabled) {
    return (
      <Wrap tone="muted">
        <span className="font-extrabold">🚪 SELF-EXIT</span>
        <Dot />
        <span>currently disabled by admin</span>
      </Wrap>
    );
  }

  return (
    <Wrap tone={armed ? 'armed' : 'live'}>
      <span className="font-extrabold">🚪 SELF-EXIT</span>
      <Dot />
      <span>
        king recovers{' '}
        <span className="font-mono font-extrabold">{refundPct}%</span> of locked
        stake
      </span>
      <Dot />
      <span>
        cooldown{' '}
        <span className="font-mono font-extrabold">{cooldownLabel}</span> after
        each trade
      </span>
      <Dot />
      <span>
        penalty <span className="font-mono font-extrabold">{penaltyPct}%</span>{' '}
        → creator + platform
      </span>
      {!armed && status.secondsUntilExit > 0 && (
        <>
          <Dot />
          <span className="font-mono font-extrabold">
            unlocks in {remaining}
          </span>
        </>
      )}
    </Wrap>
  );
}

function Wrap({
  tone,
  children,
}: {
  tone: 'live' | 'armed' | 'muted';
  children: React.ReactNode;
}) {
  const toneClass =
    tone === 'armed'
      ? 'bg-cool/30'
      : tone === 'muted'
        ? 'bg-paper/60 opacity-75'
        : 'bg-paper';
  return (
    <div
      role="status"
      aria-label="Self-exit terms for this opinion"
      className={
        'flex flex-wrap items-center gap-x-2 gap-y-1 ' +
        'border-2 border-ink rounded-lg shadow-[3px_3px_0_var(--ink)] ' +
        'px-3 py-2 ' +
        'font-display text-[11px] font-semibold tracking-[0.02em] uppercase text-ink ' +
        toneClass
      }
    >
      {children}
    </div>
  );
}

function Dot() {
  return <span className="opacity-40">·</span>;
}

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}d`;
}
