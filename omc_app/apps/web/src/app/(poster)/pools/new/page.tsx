'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Sticker,
  Btn,
  MonoNum,
  Chip,
  WalletBtn,
  Wobble,
  popConfetti,
} from '@/components/poster-arcade';
import { useAccount } from 'wagmi';
import { useTakes } from '../../_lib/chain-adapters';
import { useCreatePool } from '@/hooks/useCreatePool';
import { fmtUSD } from '../../_data/mock-takes';

const ANSWER_MAX = 60;
const NAME_MAX = 80;
const MIN_CONTRIB_USDC = 1;
// Defaults that satisfy the V2 PoolManager validator: ≥ 2 days, ≤ 60 days.
const MIN_DURATION_DAYS = 2;
const MAX_DURATION_DAYS = 60;
const DEFAULT_DURATION_DAYS = 7;
// Pool can only be created against opinions with nextPrice >= 100 USDC
// (PoolManager.createPool reverts with PoolNextPriceTooLow otherwise).
const MIN_NEXT_PRICE_USDC = 100;

export default function NewPoolPage() {
  const { isConnected } = useAccount();
  const { takes, isLoading: takesLoading } = useTakes();

  // Form state
  const [opinionId, setOpinionId] = useState<number | null>(null);
  const [proposedAnswer, setProposedAnswer] = useState('');
  const [poolName, setPoolName] = useState('');
  const [initialContribution, setInitialContribution] = useState<number>(5);
  const [durationDays, setDurationDays] = useState<number>(DEFAULT_DURATION_DAYS);

  const eligibleTakes = useMemo(
    () => takes.filter((t) => t.price >= MIN_NEXT_PRICE_USDC).sort((a, b) => b.price - a.price),
    [takes],
  );

  const selectedTake = useMemo(
    () => takes.find((t) => t.id === opinionId) ?? null,
    [takes, opinionId],
  );

  const deadlineUnix = useMemo(
    () => Math.floor(Date.now() / 1000) + durationDays * 24 * 60 * 60,
    [durationDays],
  );

  const {
    step,
    error,
    hasBalance,
    needsApproval,
    poolCreationFeeUSDC,
    totalCostUSDC,
    newPoolId,
    submit,
    reset,
  } = useCreatePool(initialContribution);

  const trimmedAnswer = proposedAnswer.trim();
  const trimmedName = poolName.trim();
  const isValidAnswer = trimmedAnswer.length >= 2 && trimmedAnswer.length <= ANSWER_MAX;
  const isValidName = trimmedName.length >= 2 && trimmedName.length <= NAME_MAX;
  const isValidContrib = initialContribution >= MIN_CONTRIB_USDC;
  const isValidDuration =
    durationDays >= MIN_DURATION_DAYS && durationDays <= MAX_DURATION_DAYS;
  const sameAsCurrent =
    !!selectedTake &&
    trimmedAnswer.toLowerCase() === selectedTake.answer.toLowerCase();
  const canSubmit =
    !!selectedTake &&
    isValidAnswer &&
    !sameAsCurrent &&
    isValidName &&
    isValidContrib &&
    isValidDuration &&
    hasBalance &&
    (step === 'idle' || step === 'error');

  // Toasts on success / error.
  useEffect(() => {
    if (step === 'success') {
      popConfetti({ count: 90 });
      toast.success('pool created · invite friends to contribute', {
        description: newPoolId != null ? `pool #${newPoolId}` : undefined,
      });
    }
  }, [step, newPoolId]);
  useEffect(() => {
    if (error) {
      const msg = (error.message || 'pool creation failed').split('\n')[0];
      toast.error('pool creation failed', { description: msg.slice(0, 180) });
    }
  }, [error]);

  /* ─── disconnected ─── */
  if (!isConnected) {
    return (
      <section className="px-4 md:px-10 py-16 text-center">
        <h1 className="font-display font-black text-[40px] md:text-[56px] tracking-[-0.04em]">
          OPEN A POOL.
        </h1>
        <p className="font-display text-[12px] font-semibold text-ink/70 mt-2 max-w-[360px] mx-auto">
          Connect a wallet on Base with USDC to coordinate a take flip.
        </p>
        <div className="mt-6 flex justify-center">
          <WalletBtn size="md" />
        </div>
      </section>
    );
  }

  /* ─── success ─── */
  if (step === 'success') {
    return (
      <section className="px-4 md:px-10 py-16 flex flex-col items-center text-center">
        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-ink/70">
          ★ pool live
        </p>
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[40px] md:text-[64px] mt-2 text-ink">
          POOLED.
        </h1>
        {newPoolId != null && (
          <p className="font-display text-[12px] font-extrabold tracking-[0.14em] uppercase text-ink/60 mt-2">
            pool #{newPoolId}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {newPoolId != null && (
            <Btn href={`/pools/${newPoolId}`} variant="pop" size="lg" star>
              view your pool →
            </Btn>
          )}
          <Btn href="/pools" variant="ghost" size="lg">
            all pools →
          </Btn>
        </div>
      </section>
    );
  }

  /* ─── form ─── */
  return (
    <>
      <div className="px-4 md:px-10 pt-4 pb-1">
        <Link
          href="/pools"
          className="font-display text-[11px] font-extrabold tracking-[0.12em] uppercase text-ink/60 hover:text-ink"
        >
          ← back to pools
        </Link>
      </div>

      <section className="px-4 md:px-10 pt-6 pb-4">
        <h1 className="font-display font-black tracking-[-0.04em] leading-[0.95] text-[40px] md:text-[56px] text-ink">
          OPEN A POOL.
        </h1>
        <p className="font-display font-semibold text-[13px] md:text-[14px] text-ink/70 mt-1 max-w-[480px]">
          Coordinate USDC with anyone on Base to flip a take. Once the pool
          hits the floor price, the answer flips and every contributor
          shares the gain.
        </p>
      </section>

      <section className="px-4 md:px-10 pb-16 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-start">
        {/* LEFT — form */}
        <div className="lg:col-span-3 bg-paper border-[2.5px] border-ink rounded-sticker shadow-[5px_5px_0_var(--ink)] p-5 md:p-7">
          {/* Opinion picker */}
          <Label>1 · pick a take to flip</Label>
          {takesLoading ? (
            <div className="font-display text-[11px] font-bold text-ink/55 mt-1">
              loading on-chain takes…
            </div>
          ) : eligibleTakes.length === 0 ? (
            <div className="font-display text-[11px] font-bold text-pop mt-1">
              no eligible takes — need at least one take with floor ≥
              <MonoNum>{fmtUSD(MIN_NEXT_PRICE_USDC)}</MonoNum>. mint or trade
              one up first.
            </div>
          ) : (
            <select
              value={opinionId ?? ''}
              onChange={(e) => setOpinionId(e.target.value ? Number(e.target.value) : null)}
              className="w-full mt-1 bg-canvas border-2 border-ink rounded-lg px-3 py-2.5 font-display font-bold text-[14px] text-ink focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all"
            >
              <option value="">— select a take —</option>
              {eligibleTakes.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.id} · {t.question} · floor {fmtUSD(t.price)}
                </option>
              ))}
            </select>
          )}
          <Hint>
            Pools only open for takes with floor ≥{' '}
            <MonoNum>{fmtUSD(MIN_NEXT_PRICE_USDC)}</MonoNum>.
          </Hint>

          {selectedTake && (
            <div className="mt-4 bg-canvas border-2 border-ink rounded-lg p-3 text-[12px] font-display">
              <div className="font-bold italic text-ink/70">
                &ldquo;{selectedTake.question}&rdquo;
              </div>
              <div className="font-black text-[18px] mt-0.5">
                Current: {selectedTake.answer}.
              </div>
            </div>
          )}

          {/* Proposed answer */}
          <div className="mt-6">
            <Label>2 · your proposed answer</Label>
            <input
              type="text"
              value={proposedAnswer}
              onChange={(e) => setProposedAnswer(e.target.value.slice(0, ANSWER_MAX))}
              placeholder="YOUR NEW TAKE"
              className="w-full bg-canvas border-2 border-ink rounded-lg px-3 py-2.5 font-display font-black text-[18px] tracking-tight text-ink uppercase placeholder:text-ink/40 focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all"
            />
            <div className="flex items-center justify-between text-[10px] font-mono font-extrabold text-ink/40 mt-1">
              <span>
                {sameAsCurrent
                  ? 'must differ from current answer'
                  : !isValidAnswer && proposedAnswer.length > 0
                    ? 'min 2 chars'
                    : ''}
              </span>
              <span>{proposedAnswer.length}/{ANSWER_MAX}</span>
            </div>
          </div>

          {/* Pool name */}
          <div className="mt-6">
            <Label>3 · pool name</Label>
            <input
              type="text"
              value={poolName}
              onChange={(e) => setPoolName(e.target.value.slice(0, NAME_MAX))}
              placeholder="e.g. CRYPTO BROS WHO REMEMBER ETHEREUM"
              className="w-full bg-canvas border-2 border-ink rounded-lg px-3 py-2 font-display font-bold text-[14px] text-ink placeholder:text-ink/40 focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all"
            />
            <div className="text-[10px] font-mono font-extrabold text-ink/40 mt-1 text-right">
              {poolName.length}/{NAME_MAX}
            </div>
          </div>

          {/* Initial contribution */}
          <div className="mt-6">
            <Label>4 · your initial contribution (USDC)</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 inline-flex items-center font-mono font-extrabold text-ink/70 text-[18px]">
                $
              </span>
              <input
                type="number"
                inputMode="decimal"
                min={MIN_CONTRIB_USDC}
                step="0.01"
                value={initialContribution}
                onChange={(e) => setInitialContribution(Number(e.target.value) || 0)}
                className="w-full bg-canvas border-2 border-ink rounded-lg pl-7 pr-3 py-2 font-mono font-extrabold text-[20px] text-ink focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all"
              />
            </div>
            <Hint>
              You can add more later. Min {fmtUSD(MIN_CONTRIB_USDC)}.
            </Hint>
          </div>

          {/* Duration */}
          <div className="mt-6">
            <Label>5 · pool runs for</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                inputMode="numeric"
                min={MIN_DURATION_DAYS}
                max={MAX_DURATION_DAYS}
                step="1"
                value={durationDays}
                onChange={(e) =>
                  setDurationDays(
                    Math.max(
                      MIN_DURATION_DAYS,
                      Math.min(MAX_DURATION_DAYS, Number(e.target.value) || MIN_DURATION_DAYS),
                    ),
                  )
                }
                className="w-24 bg-canvas border-2 border-ink rounded-lg px-3 py-2 font-mono font-extrabold text-[18px] text-ink focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all"
              />
              <span className="font-display text-[14px] font-bold text-ink/75">days</span>
              <span className="font-display text-[10px] font-extrabold tracking-[0.1em] uppercase text-ink/50 ml-2">
                · expires {new Date(deadlineUnix * 1000).toLocaleDateString()}
              </span>
            </div>
            <Hint>
              {MIN_DURATION_DAYS}–{MAX_DURATION_DAYS} days. Unfilled pools
              expire and refund contributors.
            </Hint>
          </div>

          {/* Cost summary */}
          <div className="mt-6 border-t-2 border-dashed border-ink/40 pt-4 space-y-1.5">
            <Row label="pool creation fee" value={fmtUSD(poolCreationFeeUSDC)} muted />
            <Row label="your contribution" value={fmtUSD(initialContribution)} muted />
            <Row label="you pay now" value={fmtUSD(totalCostUSDC)} bold />
          </div>

          {/* Action */}
          <div className="mt-6">
            <SubmitButton
              step={step}
              canSubmit={canSubmit}
              hasBalance={hasBalance}
              needsApproval={needsApproval}
              cost={totalCostUSDC}
              onSubmit={() => {
                if (!selectedTake) return;
                submit({
                  opinionId: selectedTake.id,
                  proposedAnswer: trimmedAnswer,
                  poolName: trimmedName,
                  initialContributionUSDC: initialContribution,
                  deadline: deadlineUnix,
                });
              }}
            />
          </div>
        </div>

        {/* RIGHT — explainer */}
        <div className="lg:col-span-2 space-y-4">
          <Sticker bg="canvas" tilt={1.5} shadow={5}>
            <Chip bg="ink" sm>HOW IT WORKS</Chip>
            <ul className="mt-3 font-display text-[12px] font-semibold text-ink/80 space-y-2">
              <li>
                <span className="font-extrabold">1.</span> You pick a take + propose a new answer.
              </li>
              <li>
                <span className="font-extrabold">2.</span> Anyone can contribute USDC to your pool.
              </li>
              <li>
                <span className="font-extrabold">3.</span> When the pool hits the floor, it flips
                the answer. Contributors share the new royalty stream pro-rata.
              </li>
              <li>
                <span className="font-extrabold">4.</span> If time runs out, contributors get
                refunded.
              </li>
            </ul>
          </Sticker>
          <Sticker bg="paper" tilt={-1.5} shadow={4}>
            <Chip bg="ink" sm>EARLY EXIT</Chip>
            <p className="mt-3 font-display text-[12px] font-semibold text-ink/75">
              Contributors can exit early with a{' '}
              <span className="font-mono font-extrabold">20%</span> penalty
              before the pool fills.
            </p>
          </Sticker>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────── helpers ─────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display text-[10px] font-extrabold tracking-[0.14em] uppercase text-ink/60 mb-1">
      {children}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display text-[10px] font-extrabold tracking-[0.06em] uppercase text-ink/45 mt-1">
      {children}
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={'font-display text-[11px] font-bold tracking-[0.04em] uppercase ' + (muted ? 'text-ink/55' : 'text-ink/80')}>
        {label}
      </span>
      <MonoNum className={(bold ? 'text-[16px]' : 'text-[13px]') + ' ' + (muted ? 'text-ink/65' : 'text-ink')}>
        {value}
      </MonoNum>
    </div>
  );
}

function SubmitButton({
  step,
  canSubmit,
  hasBalance,
  needsApproval,
  cost,
  onSubmit,
}: {
  step: 'idle' | 'approve' | 'submit' | 'success' | 'error';
  canSubmit: boolean;
  hasBalance: boolean;
  needsApproval: boolean;
  cost: number;
  onSubmit: () => void;
}) {
  if (!hasBalance) {
    return (
      <Btn variant="pop" size="lg" disabled className="w-full">
        NEED MORE USDC · {fmtUSD(cost)}
      </Btn>
    );
  }
  if (step === 'approve') {
    return (
      <Btn variant="primary" size="lg" disabled className="w-full">
        <Wobble>APPROVING…</Wobble>
      </Btn>
    );
  }
  if (step === 'submit') {
    return (
      <Btn variant="pop" size="lg" disabled className="w-full">
        <Wobble>CREATING…</Wobble>
      </Btn>
    );
  }
  const label = needsApproval ? `APPROVE + OPEN POOL · ${fmtUSD(cost)}` : `OPEN POOL · ${fmtUSD(cost)}`;
  return (
    <Btn variant="pop" size="lg" star className="w-full" onClick={onSubmit} disabled={!canSubmit}>
      {label}
    </Btn>
  );
}
