'use client';

import { useState } from 'react';
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CONTRACTS } from '@/lib/contracts';
import { OPINION_CORE_V4_ABI, POOL_MANAGER_V2_ABI } from '@/lib/contracts-v4';
import { Power, Settings2, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

type ParamKey =
  | 'soloCooldown'
  | 'poolCooldown'
  | 'poolExtendedCooldown'
  | 'exitPenaltyBps'
  | 'penaltyCreatorShareBps'
  | 'reclaimDiscountBps'
  | 'largeHolderThresholdBps'
  | 'minReclaimPrice'
  | 'spamFee';

const PARAM_DEFS: ReadonlyArray<{
  key: ParamKey;
  paramType: number;
  label: string;
  unit: 'seconds' | 'bps' | 'usdc';
  hint: string;
  bounds: string;
}> = [
  { key: 'soloCooldown', paramType: 0, label: 'Solo Cooldown', unit: 'seconds', hint: 'Min wait after creation/last trade before solo king can self-exit', bounds: '60s – 90 days' },
  { key: 'poolCooldown', paramType: 1, label: 'Pool Cooldown', unit: 'seconds', hint: 'Min wait before any pool contributor can dissolve a stale pool', bounds: '60s – 90 days' },
  { key: 'poolExtendedCooldown', paramType: 2, label: 'Pool Extended Cooldown', unit: 'seconds', hint: 'Larger wait before non-large-holders can dissolve', bounds: '≥ poolCooldown, ≤ 90 days' },
  { key: 'exitPenaltyBps', paramType: 3, label: 'Exit Penalty', unit: 'bps', hint: 'Self-exit penalty as bps of locked stake (2000 = 20%)', bounds: '500 – 5000 bps (5–50%)' },
  { key: 'penaltyCreatorShareBps', paramType: 4, label: 'Penalty Creator Share', unit: 'bps', hint: 'Share of the penalty that goes to the question creator (5000 = 50/50 split)', bounds: '0 – 10000 bps' },
  { key: 'reclaimDiscountBps', paramType: 5, label: 'Reclaim Discount', unit: 'bps', hint: 'Reclaim price = lastPrice × this (5000 = 50% of last price)', bounds: '1000 – 9000 bps (10–90%)' },
  { key: 'largeHolderThresholdBps', paramType: 6, label: 'Large Holder Threshold', unit: 'bps', hint: 'Pool contributor at or above this share can trigger short-window dissolution', bounds: '1 – 5000 bps (≤ 50%)' },
  { key: 'minReclaimPrice', paramType: 7, label: 'Min Reclaim Price', unit: 'usdc', hint: 'Floor for reclaim price (USDC)', bounds: '> 0' },
  { key: 'spamFee', paramType: 8, label: 'Spam Fee', unit: 'usdc', hint: 'Flat fee charged on opinion creation (sent to treasury)', bounds: '≤ 100 USDC' },
];

const FLAG_DEFS: ReadonlyArray<{
  flagType: number;
  storage: 'selfExitEnabled' | 'reclaimVacantSlotEnabled';
  label: string;
  hint: string;
}> = [
  { flagType: 0, storage: 'selfExitEnabled', label: 'Solo Self-Exit', hint: 'Allows the current king to call selfExit() once cooldown elapses' },
  { flagType: 1, storage: 'reclaimVacantSlotEnabled', label: 'Vacant Slot Reclaim', hint: 'Allows anyone to take over a vacant slot at the discounted price' },
];

function formatRaw(value: bigint | undefined, unit: 'seconds' | 'bps' | 'usdc'): string {
  if (value === undefined) return '—';
  if (unit === 'usdc') return (Number(value) / 1_000_000).toFixed(2);
  return value.toString();
}

function formatHuman(value: bigint | undefined, unit: 'seconds' | 'bps' | 'usdc'): string {
  if (value === undefined) return '';
  if (unit === 'seconds') {
    const s = Number(value);
    if (s >= 86400) return `${(s / 86400).toFixed(1)}d`;
    if (s >= 3600) return `${(s / 3600).toFixed(1)}h`;
    if (s >= 60) return `${(s / 60).toFixed(0)}m`;
    return `${s}s`;
  }
  if (unit === 'bps') return `${(Number(value) / 100).toFixed(2)}%`;
  return `${(Number(value) / 1_000_000).toFixed(2)} USDC`;
}

function parseInput(raw: string, unit: 'seconds' | 'bps' | 'usdc'): bigint {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('empty value');
  if (unit === 'usdc') {
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n < 0) throw new Error('invalid USDC amount');
    return BigInt(Math.round(n * 1_000_000));
  }
  const n = BigInt(trimmed);
  if (n < 0n) throw new Error('value must be ≥ 0');
  return n;
}

export function SelfExitAdminPanel() {
  return (
    <div className="space-y-6">
      <FeatureFlagsCard />
      <ParametersCard />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FeatureFlagsCard() {
  return (
    <Card className="bg-paper border-ink/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ink">
          <Power className="w-5 h-5 text-purple-400" />
          Feature Flags
        </CardTitle>
        <p className="text-sm text-ink/60 mt-1">
          Master switches for V4 self-exit. Each flag is checked at call-time, so
          flipping it off instantly disables the feature for all opinions / pools.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {FLAG_DEFS.map((f) => (
          <FlagRow key={f.flagType} {...f} />
        ))}
        <StalePoolFlagRow />
      </CardContent>
    </Card>
  );
}

function FlagRow({
  flagType,
  storage,
  label,
  hint,
}: {
  flagType: number;
  storage: 'selfExitEnabled' | 'reclaimVacantSlotEnabled';
  label: string;
  hint: string;
}) {
  const { data: enabled, refetch } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: storage,
  });
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  if (isSuccess) refetch();

  const onToggle = () => {
    writeContract({
      address: CONTRACTS.OPINION_CORE,
      abi: OPINION_CORE_V4_ABI,
      functionName: 'setSelfExitFlag',
      args: [flagType, !enabled],
    });
  };

  const busy = isPending || isLoading;

  return (
    <div className="flex items-center justify-between rounded-lg border border-ink/30 bg-canvas/40 px-4 py-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-ink font-medium">{label}</span>
          <Badge className={enabled ? 'bg-emerald-600' : 'bg-ink/10'}>
            {enabled ? 'ON' : 'OFF'}
          </Badge>
        </div>
        <p className="text-xs text-ink/60 mt-0.5">{hint}</p>
      </div>
      <Button
        size="sm"
        variant={enabled ? 'destructive' : 'default'}
        disabled={busy}
        onClick={onToggle}
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : enabled ? (
          'Disable'
        ) : (
          'Enable'
        )}
      </Button>
    </div>
  );
}

function StalePoolFlagRow() {
  const { data: enabled, refetch } = useReadContract({
    address: CONTRACTS.POOL_MANAGER,
    abi: POOL_MANAGER_V2_ABI,
    functionName: 'stalePoolExitEnabled',
  });
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  if (isSuccess) refetch();

  const onToggle = () => {
    writeContract({
      address: CONTRACTS.POOL_MANAGER,
      abi: POOL_MANAGER_V2_ABI,
      functionName: 'setStalePoolExitEnabled',
      args: [!enabled],
    });
  };

  const busy = isPending || isLoading;

  return (
    <div className="flex items-center justify-between rounded-lg border border-ink/30 bg-canvas/40 px-4 py-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-ink font-medium">Stale Pool Exit</span>
          <Badge className={enabled ? 'bg-emerald-600' : 'bg-ink/10'}>
            {enabled ? 'ON' : 'OFF'}
          </Badge>
        </div>
        <p className="text-xs text-ink/60 mt-0.5">
          Allows large holders / contributors to dissolve a stale pool after the
          appropriate cooldown.
        </p>
      </div>
      <Button
        size="sm"
        variant={enabled ? 'destructive' : 'default'}
        disabled={busy}
        onClick={onToggle}
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : enabled ? (
          'Disable'
        ) : (
          'Enable'
        )}
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ParametersCard() {
  return (
    <Card className="bg-paper border-ink/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ink">
          <Settings2 className="w-5 h-5 text-amber-400" />
          Self-Exit Parameters
        </CardTitle>
        <p className="text-sm text-ink/60 mt-1">
          Tune the V4 economics. Each row reads the live on-chain value; submit
          to fire <code className="text-amber-300 text-xs">setSelfExitParameter()</code>.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {PARAM_DEFS.map((p) => (
          <ParamRow key={p.key} def={p} />
        ))}
      </CardContent>
    </Card>
  );
}

function ParamRow({ def }: { def: (typeof PARAM_DEFS)[number] }) {
  const { data, refetch } = useReadContract({
    address: CONTRACTS.OPINION_CORE,
    abi: OPINION_CORE_V4_ABI,
    functionName: def.key,
  });
  const current = data as bigint | undefined;

  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  if (isSuccess && draft) {
    setDraft('');
    refetch();
  }

  const onSubmit = () => {
    setError(null);
    try {
      const parsed = parseInput(draft, def.unit);
      writeContract({
        address: CONTRACTS.OPINION_CORE,
        abi: OPINION_CORE_V4_ABI,
        functionName: 'setSelfExitParameter',
        args: [def.paramType, parsed],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'invalid value');
    }
  };

  const busy = isPending || isLoading;

  return (
    <div className="rounded-lg border border-ink/30 bg-canvas/40 px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-ink font-medium">{def.label}</Label>
          <p className="text-xs text-ink/60 mt-0.5">{def.hint}</p>
          <p className="text-[10px] text-ink/60 mt-0.5 uppercase tracking-wide">
            Bounds: {def.bounds}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-ink/60">Current</div>
          <div className="text-ink font-mono text-sm">
            {formatRaw(current, def.unit)}
            <span className="text-ink/60 text-xs ml-1">{def.unit}</span>
          </div>
          <div className="text-[10px] text-emerald-400">{formatHuman(current, def.unit)}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          inputMode={def.unit === 'usdc' ? 'decimal' : 'numeric'}
          placeholder={`new value (${def.unit})`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="bg-paper border-ink/30 text-ink"
        />
        <Button
          size="sm"
          disabled={busy || !draft.trim()}
          onClick={onSubmit}
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            'Update'
          )}
        </Button>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
}
