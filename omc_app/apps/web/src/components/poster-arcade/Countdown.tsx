'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MonoNum } from './MonoNum';

type CountdownProps = {
  /** Target time as ms since epoch. */
  deadlineMs: number;
  /** Compact display omits seconds, used in cards. */
  compact?: boolean;
  /** Optional callback when the countdown reaches zero. */
  onExpire?: () => void;
  className?: string;
};

type Parts = { d: number; h: number; m: number; s: number; done: boolean };

function parts(remaining: number): Parts {
  if (remaining <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
  const d = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const h = Math.floor((remaining / (60 * 60 * 1000)) % 24);
  const m = Math.floor((remaining / (60 * 1000)) % 60);
  const s = Math.floor((remaining / 1000) % 60);
  return { d, h, m, s, done: false };
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Mono countdown to a target time. SSR-safe — renders `--d --h --m --s` on
 * first paint and hydrates to the live remaining time. Updates every second.
 */
export function Countdown({ deadlineMs, compact = false, onExpire, className }: CountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (now != null && now >= deadlineMs && onExpire) onExpire();
  }, [now, deadlineMs, onExpire]);

  if (now == null) {
    return (
      <MonoNum className={cn('text-[14px]', className)}>
        {compact ? '— · — · —' : '— · — · — · —'}
      </MonoNum>
    );
  }

  const p = parts(deadlineMs - now);
  if (p.done) {
    return (
      <span
        className={cn(
          'font-display font-extrabold tracking-[0.06em] uppercase text-pop',
          className,
        )}
      >
        closed
      </span>
    );
  }

  return (
    <MonoNum className={cn('text-[14px]', className)}>
      {p.d > 0 && <>{p.d}d </>}
      {pad(p.h)}h {pad(p.m)}m{!compact && <> {pad(p.s)}s</>}
    </MonoNum>
  );
}
