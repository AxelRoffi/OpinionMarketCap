'use client';

import { useMemo, useState } from 'react';
import {
  Btn,
  MonoNum,
  Sticker,
  Tabs,
  type Tab,
} from '@/components/poster-arcade';
import { fmtUSD, type MockTake } from '../../../_data/mock-takes';
import { getNextBidPrice } from '../../../_data/take-detail';
import { useWatchlist } from '../../../_lib/watchlist';

type SlipTab = 'take' | 'offer' | 'watch';

const TABS: Tab<SlipTab>[] = [
  { value: 'take',  label: 'Take it' },
  { value: 'offer', label: 'Offer' },
  { value: 'watch', label: 'Watch' },
];

type TradeSlipProps = {
  take: MockTake;
};

export function TradeSlip({ take }: TradeSlipProps) {
  const [tab, setTab] = useState<SlipTab>('take');

  return (
    <Sticker bg="paper" tilt={-1} shadow={5} className="w-full">
      <Tabs<SlipTab> tabs={TABS} value={tab} onChange={setTab} className="w-full justify-between flex" />
      <div className="mt-4">
        {tab === 'take'  && <TakeIt take={take} />}
        {tab === 'offer' && <MakeOffer take={take} />}
        {tab === 'watch' && <Watch take={take} />}
      </div>
    </Sticker>
  );
}

/* ─────────────────────────── TAKE IT ─────────────────────────── */

function TakeIt({ take }: { take: MockTake }) {
  const defaultBid = useMemo(() => getNextBidPrice(take.price), [take.price]);
  const [bid, setBid] = useState<number>(defaultBid);

  // Premium = 12% of bid (locked spec). Royalty = 3% of bid back to creator.
  const premium = Math.round(bid * 0.12 * 100) / 100;
  const royaltyOnFlip = Math.round(bid * 0.03 * 100) / 100;
  const totalCost = Math.round((bid + premium) * 100) / 100;
  const payoutIfOutbid = Math.round((bid - royaltyOnFlip) * 100) / 100;

  return (
    <div>
      <Label>your bid</Label>
      <NumberInput
        value={bid}
        onChange={setBid}
        min={defaultBid}
      />
      <div className="text-[10px] font-display font-extrabold tracking-[0.1em] uppercase text-ink/50 mt-1">
        min bid · {fmtUSD(defaultBid)} (1.15× floor)
      </div>

      <div className="mt-4 border-t-2 border-dashed border-ink/40 pt-3 space-y-1.5">
        <Row label="bid"             value={fmtUSD(bid)} />
        <Row label="+ premium (12%)" value={fmtUSD(premium)} muted />
        <Row label="= total cost"    value={fmtUSD(totalCost)} bold />
      </div>

      <div className="mt-3 bg-canvas border-2 border-ink rounded-lg p-3">
        <div className="text-[10px] font-display font-extrabold tracking-[0.1em] uppercase text-ink/60">
          if outbid you receive
        </div>
        <div className="font-mono font-extrabold text-[18px] text-ink mt-0.5">
          {fmtUSD(payoutIfOutbid)}
        </div>
        <div className="text-[10px] font-display font-bold text-ink/70 mt-0.5">
          (bid back minus 3% royalty to creator · forever)
        </div>
      </div>

      <div className="mt-4">
        <Btn variant="pop" size="lg" star className="w-full">
          TAKE IT · <MonoNum>{fmtUSD(totalCost)}</MonoNum>
        </Btn>
      </div>

      <div className="text-[10px] font-display font-bold text-ink/60 mt-3 text-center">
        wallet wiring lands in a later phase
      </div>
    </div>
  );
}

/* ─────────────────────────── OFFER ─────────────────────────── */

function MakeOffer({ take }: { take: MockTake }) {
  const [amount, setAmount] = useState<number>(Math.round(take.price * 0.5));
  const [message, setMessage] = useState('');
  const [expiry, setExpiry] = useState<'24h' | '7d' | 'never'>('7d');

  return (
    <div>
      <Label>offer amount</Label>
      <NumberInput value={amount} onChange={setAmount} min={1} />
      <div className="text-[10px] font-display font-extrabold tracking-[0.1em] uppercase text-ink/50 mt-1">
        current floor · {fmtUSD(take.price)}
      </div>

      <Label className="mt-4">message (optional)</Label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        maxLength={140}
        placeholder="say something cheeky"
        className="w-full bg-canvas border-2 border-ink rounded-lg px-3 py-2 font-display font-semibold text-[13px] text-ink placeholder:text-ink/50 focus:outline-none focus:shadow-[3px_3px_0_var(--ink)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all resize-none"
      />
      <div className="text-[10px] font-mono font-extrabold text-ink/40 text-right mt-1">
        {message.length}/140
      </div>

      <Label className="mt-3">expiry</Label>
      <div className="flex gap-2 mt-1">
        {(['24h', '7d', 'never'] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setExpiry(opt)}
            className={
              'flex-1 rounded-pill border-2 border-ink py-1.5 font-display font-extrabold text-[11px] tracking-[0.06em] uppercase ' +
              (expiry === opt
                ? 'bg-ink text-canvas shadow-[2px_2px_0_var(--pop)]'
                : 'bg-paper text-ink')
            }
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Btn variant="primary" size="lg" star className="w-full">
          SEND OFFER · <MonoNum>{fmtUSD(amount)}</MonoNum>
        </Btn>
      </div>

      <div className="text-[10px] font-display font-bold text-ink/60 mt-3 text-center">
        offers are a roadmap feature
      </div>
    </div>
  );
}

/* ─────────────────────────── WATCH ─────────────────────────── */

function Watch({ take }: { take: MockTake }) {
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
        saved in your browser · <a href="/v2/watchlist" className="underline hover:text-ink">see watchlist</a>
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
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
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
