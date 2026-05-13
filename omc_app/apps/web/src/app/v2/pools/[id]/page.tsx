'use client';

import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatUnits } from 'viem';
import { toast } from 'sonner';
import {
  Sticker,
  Chip,
  Btn,
  MonoNum,
  ProgressBar,
  Countdown,
  AvatarStack,
  WalletBtn,
  Wobble,
  popConfetti,
} from '@/components/poster-arcade';
import { CAT_MAP, MOCK_TAKES, fmtUSD } from '../../_data/mock-takes';
import { fundingPct, getPool } from '../../_data/pools';
import { usePoolJoinFlow, type PoolJoinPhase } from '../../_lib/use-pool-join-flow';
import { useChainPool } from '../../_lib/use-pools-data';

const CAT_BG = {
  sport:   'canvas',
  crypto:  'cool',
  cinema:  'paper',
  ai:      'pop',
  food:    'paper',
  life:    'canvas',
  music:   'pop',
  founder: 'cool',
} as const;

export default function PoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const numericId = Number(id);

  // Chain first; fall back to mock data when chain doesn't have a pool with
  // this id. This lets the existing /v2/pools/1..6 demo URLs render even
  // before any real pool has been created on chain.
  const { pool: chainPool, isLoading: chainLoading, notFound: chainMissing } =
    useChainPool(numericId);
  const mockPool = getPool(numericId);
  const isMockFallback = !chainLoading && !chainPool;
  if (isMockFallback && !mockPool) notFound();
  const pool = chainPool ?? mockPool!;

  const cat = CAT_MAP[pool.category];
  const heroBg = CAT_BG[pool.category];
  const chipBg = heroBg === 'paper' || heroBg === 'canvas' ? 'ink' : 'paper';
  const pct = fundingPct(pool);
  const isFilled = pool.status === 'filled';
  const remaining = Math.max(0, pool.target - pool.raised);

  const [amount, setAmount] = useState<number>(Math.max(5, Math.round(remaining * 0.1)));

  // Real V2 PoolManager.contributeToPool flow.
  const flow = usePoolJoinFlow(pool.id, amount);
  const balanceUsdc = Number(formatUnits(flow.balance, 6));

  useEffect(() => {
    if (flow.phase === 'success') {
      popConfetti({ count: 70 });
      toast.success(`+${fmtUSD(amount)} pledged`, {
        description: `pool #${pool.id} — share of any royalties locked in proportional`,
      });
    }
  }, [flow.phase, amount, pool.id]);

  useEffect(() => {
    if (flow.error) {
      const msg = (flow.error.message || 'transaction failed').split('\n')[0];
      toast.error('pool join failed', { description: msg.slice(0, 180) });
    }
  }, [flow.error]);

  const targetTake = MOCK_TAKES.find((t) => t.id === pool.targetTakeId);

  return (
    <>
      {/* ────────────────  BREADCRUMB  ──────────────── */}
      <div className="px-4 md:px-10 pt-4 pb-1 flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/v2/pools"
          className="font-display text-[11px] font-extrabold tracking-[0.12em] uppercase text-ink/60 hover:text-ink"
        >
          ← back to all pools
        </Link>
        {isMockFallback && (
          <span className="font-display text-[10px] font-extrabold tracking-[0.14em] uppercase text-ink/40">
            · sample pool (no on-chain match)
          </span>
        )}
      </div>

      {/* ────────────────  TWO-COL LAYOUT  ──────────────── */}
      <section className="px-4 md:px-10 py-4 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-start">
        {/* LEFT — pool hero */}
        <div className="lg:col-span-3 space-y-5">
          {/* Hero sticker */}
          <Sticker bg={heroBg} tilt={-2} shadow={6} className="p-6 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Chip bg={chipBg}>{cat.emoji} {cat.label}</Chip>
              <div className="flex items-center gap-1.5">
                <Chip bg="ink" sm>POOL #{pool.id}</Chip>
                {isFilled && <Chip bg="cool" sm>✓ FILLED</Chip>}
              </div>
            </div>
            <div className="font-display text-[13px] md:text-[14px] font-bold italic opacity-85 mt-3">
              &ldquo;{pool.question}&rdquo;
            </div>
            <div className="font-display font-black text-[56px] md:text-[80px] leading-[0.88] tracking-[-0.04em] mt-2">
              {pool.proposedAnswer}.
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-3 flex-wrap">
              <span className="font-display text-[12px] font-extrabold tracking-[0.06em] uppercase opacity-75">
                started by{' '}
                <Link
                  href={`/v2/profile/${encodeURIComponent(pool.creator)}`}
                  className="underline hover:opacity-100 opacity-90"
                >
                  @{pool.creator}
                </Link>
              </span>
              {targetTake && (
                <Link
                  href={`/v2/opinions/${targetTake.id}`}
                  className="font-display text-[11px] font-extrabold tracking-[0.08em] uppercase underline hover:opacity-100 opacity-80"
                >
                  current floor → {fmtUSD(targetTake.price)}
                </Link>
              )}
            </div>
          </Sticker>

          {/* Funding panel */}
          <div className="bg-paper border-[2.5px] border-ink rounded-sticker shadow-[4px_4px_0_var(--ink)] p-5 md:p-6">
            <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
              <div>
                <div className="font-display text-[10px] font-extrabold tracking-[0.14em] uppercase text-ink/60">
                  raised
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <MonoNum className="text-[28px] md:text-[36px]">{fmtUSD(pool.raised)}</MonoNum>
                  <MonoNum className="text-[13px] text-ink/55">/ {fmtUSD(pool.target)}</MonoNum>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-[10px] font-extrabold tracking-[0.14em] uppercase text-ink/60">
                  closes in
                </div>
                <Countdown deadlineMs={pool.deadlineMs} className="text-[20px] md:text-[24px]" />
              </div>
            </div>
            <ProgressBar
              value={pct}
              fill={isFilled ? 'cool' : 'pop'}
              size="lg"
              striped={!isFilled}
              label={`${pct}%`}
            />
            <div className="mt-3 flex items-center justify-between gap-3 text-ink/65">
              <span className="font-display text-[11px] font-bold">
                {isFilled
                  ? 'pool is full. waiting to execute.'
                  : remaining > 0
                  ? <>still need <span className="font-mono font-extrabold text-ink">{fmtUSD(remaining)}</span> to flip</>
                  : 'ready to execute.'}
              </span>
              <span className="font-mono font-extrabold text-[11px]">
                <MonoNum>{pool.contributors.length}</MonoNum> in
              </span>
            </div>
          </div>

          {/* Contributors */}
          <div className="bg-paper border-[2.5px] border-ink rounded-sticker shadow-[4px_4px_0_var(--ink)] p-5 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-black text-[16px] tracking-tight">
                👥 CONTRIBUTORS
              </div>
              <AvatarStack
                avatars={pool.contributors.map((c) => c.avatar)}
                max={5}
                size="sm"
              />
            </div>
            <ol className="space-y-2">
              {pool.contributors
                .slice()
                .sort((a, b) => b.pledged - a.pledged)
                .map((c, i) => {
                  const share = (c.pledged / pool.raised) * 100;
                  return (
                    <li
                      key={`${c.handle}-${i}`}
                      className="flex items-center justify-between gap-3 py-1.5 border-b-2 border-dashed border-ink/15 last:border-b-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          aria-hidden
                          className="inline-flex items-center justify-center h-7 w-7 rounded-full border-2 border-ink bg-canvas text-[14px]"
                        >
                          {c.avatar}
                        </span>
                        <Link
                          href={`/v2/profile/${encodeURIComponent(c.handle)}`}
                          className="font-display font-extrabold text-[13px] truncate hover:underline"
                        >
                          @{c.handle}
                        </Link>
                        {c.handle === 'you' && <Chip bg="pop" sm>YOU</Chip>}
                      </div>
                      <div className="flex items-baseline gap-2 shrink-0">
                        <MonoNum className="text-[13px]">{fmtUSD(c.pledged)}</MonoNum>
                        <MonoNum className="text-[10px] text-ink/55">{share.toFixed(1)}%</MonoNum>
                      </div>
                    </li>
                  );
                })}
            </ol>
          </div>
        </div>

        {/* RIGHT — join the pool */}
        <div className="lg:col-span-2 lg:sticky lg:top-[80px]">
          <Sticker bg="paper" tilt={-1} shadow={5}>
            <div className="font-display text-[10px] font-extrabold tracking-[0.18em] uppercase text-pop">
              ★ pool in
            </div>
            <div className="font-display font-black text-[22px] tracking-tight mt-0.5">
              {isFilled ? 'Pool is full.' : 'Stack with the crew.'}
            </div>

            {isFilled ? (
              <p className="font-display text-[12px] font-semibold text-ink/65 mt-2">
                This pool has hit its target. Waiting for execution. Your share of any future
                royalties will be proportional to your pledge.
              </p>
            ) : flow.phase === 'success' ? (
              <div className="text-center py-4">
                <div className="font-display font-black text-[18px] tracking-tight mt-2">
                  ★ YOU&apos;RE IN.
                </div>
                <p className="font-display text-[12px] font-semibold text-ink/65 mt-1">
                  Pledged <span className="font-mono font-extrabold">{fmtUSD(amount)}</span> — share locked in for any royalties.
                </p>
                <div className="mt-4">
                  <Btn variant="cool" size="md" onClick={flow.reset}>
                    add more →
                  </Btn>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <div className="font-display text-[10px] font-extrabold tracking-[0.14em] uppercase text-ink/60 mb-1.5">
                    your pledge
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 inline-flex items-center font-mono font-extrabold text-ink/70 text-[18px]">
                      $
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={1}
                      max={remaining}
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value) || 0)}
                      aria-label="Pledge amount in USDC"
                      className="w-full bg-canvas border-2 border-ink rounded-lg pl-7 pr-3 py-2 font-mono font-extrabold text-[24px] text-ink focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all"
                    />
                  </div>
                  <div className="text-[10px] font-display font-extrabold tracking-[0.1em] uppercase text-ink/50 mt-1">
                    still need · {fmtUSD(remaining)}
                  </div>
                </div>

                <div className="mt-4 bg-canvas border-2 border-ink rounded-lg p-3 space-y-1">
                  <Row label="your share" value={`${((amount / pool.target) * 100).toFixed(1)}%`} />
                  <Row label="contribution fee" value="$0.00" muted />
                  <Row label="early-exit penalty" value="20%" muted />
                  <Row label="your balance" value={fmtUSD(balanceUsdc)} muted />
                </div>

                <div className="mt-4">
                  <JoinAction
                    phase={flow.phase}
                    amount={amount}
                    onApprove={flow.approve}
                    onJoin={flow.submit}
                  />
                </div>
                <JoinHint phase={flow.phase} cost={amount} balanceUsdc={balanceUsdc} />
              </>
            )}
          </Sticker>
        </div>
      </section>
    </>
  );
}

/**
 * Phase-driven primary action for the join flow.
 */
function JoinAction({
  phase,
  amount,
  onApprove,
  onJoin,
}: {
  phase: PoolJoinPhase;
  amount: number;
  onApprove: () => void;
  onJoin: () => void;
}) {
  if (phase === 'disconnected' || phase === 'wrong-chain') {
    return (
      <div className="flex justify-center">
        <WalletBtn size="md" />
      </div>
    );
  }
  if (phase === 'idle') {
    return (
      <div className="flex justify-center py-2">
        <Wobble>checking balance…</Wobble>
      </div>
    );
  }
  if (phase === 'insufficient') {
    return (
      <Btn variant="pop" size="lg" disabled className="w-full">
        NEED MORE USDC
      </Btn>
    );
  }
  if (phase === 'needs-approval') {
    return (
      <Btn variant="primary" size="lg" star onClick={onApprove} className="w-full">
        APPROVE USDC
      </Btn>
    );
  }
  if (phase === 'approving') {
    return (
      <Btn variant="primary" size="lg" disabled className="w-full">
        APPROVING…
      </Btn>
    );
  }
  if (phase === 'submitting') {
    return (
      <Btn variant="pop" size="lg" disabled className="w-full">
        JOINING…
      </Btn>
    );
  }
  return (
    <Btn variant="pop" size="lg" star onClick={onJoin} className="w-full">
      JOIN POOL · <MonoNum>{fmtUSD(amount)}</MonoNum>
    </Btn>
  );
}

function JoinHint({ phase, cost, balanceUsdc }: { phase: PoolJoinPhase; cost: number; balanceUsdc: number }) {
  let hint = '';
  if (phase === 'insufficient') hint = `balance ${fmtUSD(balanceUsdc)} · need ${fmtUSD(cost)}`;
  else if (phase === 'needs-approval') hint = 'one-time USDC approval — then join the pool';
  else if (phase === 'approving' || phase === 'submitting') hint = 'confirm in your wallet…';
  if (!hint) return null;
  return (
    <div className="text-[10px] font-display font-bold text-ink/60 mt-3 text-center">
      {hint}
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={
          'font-display text-[11px] font-bold tracking-[0.04em] uppercase ' +
          (muted ? 'text-ink/50' : 'text-ink/80')
        }
      >
        {label}
      </span>
      <MonoNum className={'text-[13px] ' + (muted ? 'text-ink/60' : 'text-ink')}>
        {value}
      </MonoNum>
    </div>
  );
}
