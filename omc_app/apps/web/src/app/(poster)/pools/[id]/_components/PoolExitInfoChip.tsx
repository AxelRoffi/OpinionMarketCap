'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import {
  OPINION_CORE_V4_ABI,
  POOL_MANAGER_V2_ABI,
} from '@/lib/contracts-v4';

/**
 * Read-only visibility chip explaining the stale-pool dissolution rules,
 * placed on every pool detail page so contributors (and prospective
 * contributors) see the exit terms before committing.
 *
 * Every value streams from chain — if an admin re-tunes poolCooldown,
 * poolExtendedCooldown, exitPenaltyBps, or largeHolderThresholdBps via
 * /admin, the chip updates with no code change.
 */
export function PoolExitInfoChip() {
  const { data: featureFlag } = useReadContract({
    address: CONTRACTS.POOL_MANAGER,
    abi: POOL_MANAGER_V2_ABI,
    functionName: 'stalePoolExitEnabled',
  });
  const { data: poolCooldown } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'poolCooldown',
  });
  const { data: poolExtCooldown } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'poolExtendedCooldown',
  });
  const { data: thresholdBps } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'largeHolderThresholdBps',
  });
  const { data: penaltyBps } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: 'exitPenaltyBps',
  });

  // Wait for the reads to land so we don't flash defaults.
  if (
    poolCooldown === undefined ||
    poolExtCooldown === undefined ||
    thresholdBps === undefined ||
    penaltyBps === undefined
  ) {
    return null;
  }

  const enabled = Boolean(featureFlag);
  const largeLabel = formatSeconds(Number(poolCooldown));
  const publicLabel = formatSeconds(Number(poolExtCooldown));
  const thresholdPct = Number(thresholdBps) / 100;
  const refundPct = (10000 - Number(penaltyBps)) / 100;
  const penaltyPct = Number(penaltyBps) / 100;

  if (!enabled) {
    return (
      <Wrap tone="muted">
        <span className="font-extrabold">🚪 STALE-POOL EXIT</span>
        <Dot />
        <span>currently disabled by admin</span>
      </Wrap>
    );
  }

  return (
    <Wrap tone="live">
      <span className="font-extrabold">🚪 STALE-POOL EXIT</span>
      <Dot />
      <span>
        large holder (≥
        <span className="font-mono font-extrabold">{thresholdPct}%</span>) after{' '}
        <span className="font-mono font-extrabold">{largeLabel}</span>
      </span>
      <Dot />
      <span>
        any contributor after{' '}
        <span className="font-mono font-extrabold">{publicLabel}</span>
      </span>
      <Dot />
      <span>
        contributors recover{' '}
        <span className="font-mono font-extrabold">{refundPct}%</span> ·
        penalty <span className="font-mono font-extrabold">{penaltyPct}%</span>{' '}
        → creator + platform
      </span>
    </Wrap>
  );
}

function Wrap({
  tone,
  children,
}: {
  tone: 'live' | 'muted';
  children: React.ReactNode;
}) {
  const toneClass = tone === 'muted' ? 'bg-paper/60 opacity-75' : 'bg-paper';
  return (
    <div
      role="status"
      aria-label="Pool stale-exit terms"
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
