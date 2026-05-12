'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type CopyFieldProps = {
  value: string;
  /** Optional label shown above the field. */
  label?: string;
  /** Toast message on success. */
  toastMessage?: string;
  /** Reduce padding for inline use. */
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Pill display of a copyable string (referral link, address, signature, etc.)
 * Click anywhere on the pill to copy. Visual feedback via toast + brief inline tick.
 */
export function CopyField({
  value,
  label,
  toastMessage = 'copied to clipboard',
  size = 'md',
  className,
}: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(toastMessage);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error('clipboard blocked — copy manually');
    }
  };

  const padding = size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2.5';
  const textSize = size === 'sm' ? 'text-[12px]' : 'text-[13px] md:text-[14px]';

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="font-display text-[10px] font-extrabold tracking-[0.14em] uppercase text-ink/60 mb-1.5">
          {label}
        </div>
      )}
      <button
        type="button"
        onClick={copy}
        className={cn(
          'group inline-flex items-center justify-between gap-3 w-full',
          'rounded-pill border-[2.5px] border-ink bg-paper text-ink',
          'shadow-[3px_3px_0_var(--ink)]',
          'transition-transform duration-100',
          'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_var(--ink)]',
          'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--ink)]',
          padding,
        )}
        aria-label="Copy to clipboard"
      >
        <span className={cn('font-mono font-extrabold truncate', textSize)}>
          {value}
        </span>
        <span
          className={cn(
            'shrink-0 inline-flex items-center gap-1.5',
            'font-display font-black tracking-[0.08em] uppercase text-[10px] md:text-[11px]',
            copied ? 'text-cool' : 'text-ink/80 group-hover:text-ink',
          )}
        >
          <span aria-hidden>{copied ? '✓' : '⧉'}</span>
          {copied ? 'copied' : 'copy'}
        </span>
      </button>
    </div>
  );
}
