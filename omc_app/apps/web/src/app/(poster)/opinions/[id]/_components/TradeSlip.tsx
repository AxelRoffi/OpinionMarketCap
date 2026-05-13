'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatUnits } from 'viem';
import {
  Btn,
  MonoNum,
  Sticker,
  Tabs,
  WalletBtn,
  Wobble,
  popConfetti,
  type Tab,
} from '@/components/poster-arcade';
import { fmtUSD, type DisplayTake } from '../../../_data/mock-takes';
import { useWatchlist } from '../../../_lib/watchlist';
import { useTakeFlow, type TakeFlowPhase } from '../../../_lib/use-take-flow';

type SlipTab = 'take' | 'watch';

// Offer tab was removed — V4 has no on-chain offer matching for the answer
// slot, so showing the form would just confuse users. The Take-it path is
// the only way to dethrone a king today. The /opinions/[id] page
// surfaces the related concept (offers on QUESTIONS, also roadmap) via
// the QuestionOwnership card.
const TABS: Tab<SlipTab>[] = [
  { value: 'take',  label: 'Take it' },
  { value: 'watch', label: 'Watch' },
];

const ANSWER_MAX = 60;
const DESCRIPTION_MAX = 120;

type TradeSlipProps = {
  take: DisplayTake;
};

export function TradeSlip({ take }: TradeSlipProps) {
  const [tab, setTab] = useState<SlipTab>('take');

  return (
    <Sticker bg="paper" tilt={-1} shadow={5} className="w-full">
      <Tabs<SlipTab> tabs={TABS} value={tab} onChange={setTab} className="w-full justify-between flex" />
      <div className="mt-4">
        {tab === 'take'  && <TakeIt take={take} />}
        {tab === 'watch' && <Watch take={take} />}
      </div>
    </Sticker>
  );
}

/* ─────────────────────────── TAKE IT ─────────────────────────── */

function TakeIt({ take }: { take: DisplayTake }) {
  const { phase, balance, approve, submit, reset, error } = useTakeFlow(take.id, take.price);

  const [answer, setAnswer] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const balanceUsdc = Number(formatUnits(balance, 6));
  const trimmedAnswer = answer.trim();
  const trimmedLink = link.trim();
  const isValidAnswer = trimmedAnswer.length >= 2 && trimmedAnswer.length <= ANSWER_MAX;
  const isSamePosition = trimmedAnswer.toLowerCase() === take.answer.toLowerCase();
  // Empty link is allowed; non-empty must look like a URL.
  const isValidLink = trimmedLink === '' || /^https?:\/\/\S+\.\S+/i.test(trimmedLink);
  const canSubmit = phase === 'ready' && isValidAnswer && !isSamePosition && isValidLink;

  // Fire confetti + toast once on success.
  useEffect(() => {
    if (phase === 'success') {
      popConfetti({ count: 90 });
      toast.success(`you hold the floor on take #${take.id}`, {
        description: `${trimmedAnswer || take.answer} · ${fmtUSD(take.price)} locked`,
      });
    }
  }, [phase, take.id, take.answer, take.price, trimmedAnswer]);

  // Surface tx errors via toast.
  useEffect(() => {
    if (error) {
      const msg = (error.message || 'transaction failed').split('\n')[0];
      toast.error('tx failed', { description: msg.slice(0, 180) });
    }
  }, [error]);

  /* ─── disconnected ─── */
  if (phase === 'disconnected') {
    return (
      <div className="text-center py-6">
        <div className="font-display font-black text-[18px] tracking-tight">
          CONNECT TO TAKE.
        </div>
        <p className="font-display text-[12px] font-semibold text-ink/65 mt-1 max-w-[280px] mx-auto">
          You&apos;ll need a wallet on Base with USDC to dethrone the current king.
        </p>
        <div className="mt-5 flex justify-center">
          <WalletBtn size="md" />
        </div>
      </div>
    );
  }

  /* ─── wrong chain ─── */
  if (phase === 'wrong-chain') {
    return (
      <div className="text-center py-6">
        <div className="font-display font-black text-[18px] tracking-tight">
          WRONG CHAIN.
        </div>
        <p className="font-display text-[12px] font-semibold text-ink/65 mt-1 max-w-[280px] mx-auto">
          Takes live on Base. Switch your wallet to Base mainnet to continue.
        </p>
        <div className="mt-5 flex justify-center">
          <WalletBtn size="md" />
        </div>
      </div>
    );
  }

  /* ─── success ─── */
  if (phase === 'success') {
    return (
      <div className="text-center py-6">
        <div className="font-display font-black text-[20px] tracking-tight">
          ★ YOU HOLD THE FLOOR.
        </div>
        <p className="font-display text-[12px] font-semibold text-ink/70 mt-1 max-w-[280px] mx-auto">
          Take #{take.id} is yours. <span className="font-mono font-extrabold">3%</span> royalty
          locked in forever, even after the next king takes it.
        </p>
        <div className="mt-5 flex flex-col items-center gap-2">
          <Btn variant="cool" size="md" onClick={reset}>
            take another →
          </Btn>
        </div>
      </div>
    );
  }

  /* ─── the form ─── */
  return (
    <div>
      <Label>your answer</Label>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value.slice(0, ANSWER_MAX))}
        placeholder={take.answer === 'UNANSWERED' ? 'BE FIRST' : 'YOUR NEW TAKE'}
        aria-label="Your new answer"
        className="w-full bg-canvas border-2 border-ink rounded-lg px-3 py-2.5 font-display font-black text-[20px] tracking-tight text-ink uppercase placeholder:text-ink/40 focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all"
      />
      <div className="flex items-center justify-between text-[10px] font-mono font-extrabold text-ink/40 mt-1">
        <span>
          {isSamePosition
            ? 'pick a different answer'
            : !isValidAnswer && answer.length > 0
              ? 'min 2 chars'
              : ''}
        </span>
        <span>{answer.length}/{ANSWER_MAX}</span>
      </div>

      {/* Advanced — description + link, both optional */}
      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="mt-3 font-display text-[10px] font-extrabold tracking-[0.12em] uppercase text-ink/55 hover:text-ink"
      >
        {showAdvanced
          ? '− hide description + link'
          : '+ add description / link (optional)'}
      </button>
      {showAdvanced && (
        <div className="mt-2 space-y-3">
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
              rows={2}
              placeholder="explain your take in one line"
              aria-label="Optional description"
              className="w-full bg-canvas border-2 border-ink rounded-lg px-3 py-2 font-display font-semibold text-[13px] text-ink placeholder:text-ink/45 focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all resize-none"
            />
            <div className="text-[10px] font-mono font-extrabold text-ink/40 text-right mt-1">
              {description.length}/{DESCRIPTION_MAX}
            </div>
          </div>

          <div>
            <Label>source link (optional)</Label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://x.com/… or https://…"
              aria-label="Optional source link backing your take"
              inputMode="url"
              className="w-full bg-canvas border-2 border-ink rounded-lg px-3 py-2 font-mono font-semibold text-[12px] text-ink placeholder:text-ink/45 focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all"
            />
            {trimmedLink !== '' && !isValidLink && (
              <div className="text-[10px] font-display font-extrabold tracking-[0.1em] uppercase text-pop mt-1">
                must start with http:// or https://
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cost breakdown */}
      <div className="mt-4 border-t-2 border-dashed border-ink/40 pt-3 space-y-1.5">
        <Row label="take cost"     value={fmtUSD(take.price)} bold />
        <Row label="your balance"  value={fmtUSD(balanceUsdc)} muted />
        <Row label="royalty earn"  value="3% forever" muted />
      </div>

      {/* Action */}
      <div className="mt-4">
        <PrimaryAction
          phase={phase}
          canSubmit={canSubmit}
          cost={take.price}
          onApprove={approve}
          onSubmit={() => submit(trimmedAnswer, description.trim(), trimmedLink)}
        />
      </div>

      <PhaseHint phase={phase} balanceUsdc={balanceUsdc} cost={take.price} />
    </div>
  );
}

/**
 * Phase-driven primary action — same button slot cycles through:
 *   approve → submit pending → submitting → ready
 */
function PrimaryAction({
  phase,
  canSubmit,
  cost,
  onApprove,
  onSubmit,
}: {
  phase: TakeFlowPhase;
  canSubmit: boolean;
  cost: number;
  onApprove: () => void;
  onSubmit: () => void;
}) {
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
      <Btn variant="primary" size="lg" star className="w-full" onClick={onApprove}>
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
        TAKING…
      </Btn>
    );
  }

  // ready
  return (
    <Btn variant="pop" size="lg" star className="w-full" onClick={onSubmit} disabled={!canSubmit}>
      TAKE IT · <MonoNum>{fmtUSD(cost)}</MonoNum>
    </Btn>
  );
}

function PhaseHint({ phase, balanceUsdc, cost }: { phase: TakeFlowPhase; balanceUsdc: number; cost: number }) {
  let hint = '';
  if (phase === 'insufficient') hint = `balance ${fmtUSD(balanceUsdc)} · need ${fmtUSD(cost)}`;
  else if (phase === 'needs-approval') hint = 'one-time USDC approval — then take it';
  else if (phase === 'approving' || phase === 'submitting') hint = 'confirm in your wallet…';

  if (!hint) return null;
  return (
    <div className="text-[10px] font-display font-bold text-ink/60 mt-3 text-center">
      {hint}
    </div>
  );
}


/* ─────────────────────────── WATCH ─────────────────────────── */

function Watch({ take }: { take: DisplayTake }) {
  const { hydrated, isWatched, toggle } = useWatchlist();
  const on = hydrated && isWatched(take.id);

  return (
    <div className="text-center py-6">
      <div className="font-display font-black text-[18px] tracking-tight">
        {on ? 'WATCHING.' : 'WATCH THIS TAKE.'}
      </div>
      <div className="text-[12px] font-display font-semibold text-ink/70 mt-1 max-w-[260px] mx-auto">
        Get notified the moment <span className="font-mono font-extrabold">{fmtUSD(take.price)}</span> moves.
      </div>
      <button
        onClick={() => toggle(take.id)}
        className={
          'mt-5 inline-flex items-center gap-2 rounded-pill border-[2.5px] border-ink px-5 py-3 font-display font-black text-[13px] tracking-[0.06em] uppercase transition-all ' +
          (on
            ? 'bg-cool text-ink shadow-[4px_4px_0_var(--ink)]'
            : 'bg-paper text-ink shadow-[4px_4px_0_var(--ink)] hover:-translate-x-[1px] hover:-translate-y-[1px]')
        }
        aria-pressed={on}
      >
        <span aria-hidden>{on ? '★' : '☆'}</span>
        {on ? 'WATCHING' : 'ADD TO WATCHLIST'}
      </button>
      <div className="font-display text-[10px] font-bold text-ink/55 mt-3">
        saved in your browser · <a href="/watchlist" className="underline hover:text-ink">see watchlist</a>
      </div>
    </div>
  );
}

/* ─────────────────────────── helpers ─────────────────────────── */

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        'font-display text-[10px] font-extrabold tracking-[0.14em] uppercase text-ink/60 mb-1 ' +
        (className ?? '')
      }
    >
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
}) {
  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-3 inline-flex items-center font-mono font-extrabold text-ink/70 text-[18px]">
        $
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        aria-label="Amount in USDC"
        className="w-full bg-canvas border-2 border-ink rounded-lg pl-7 pr-3 py-2 font-mono font-extrabold text-[24px] text-ink focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all"
      />
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
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
      <MonoNum
        className={
          (bold ? 'text-[16px]' : 'text-[13px]') +
          ' ' +
          (muted ? 'text-ink/60' : 'text-ink')
        }
      >
        {value}
      </MonoNum>
    </div>
  );
}
