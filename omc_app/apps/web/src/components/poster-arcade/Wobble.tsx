import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

type WobbleProps = {
  className?: string;
  children?: ReactNode;
};

/**
 * Loading state — tilted sticker that wobbles. Use as universal spinner replacement.
 */
export function Wobble({ className, children = 'loading…' }: WobbleProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        'pa-sticker pa-loading',
        'bg-canvas text-ink font-display font-black text-sm',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {children}
    </div>
  );
}
