import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ChipBg = 'paper' | 'pop' | 'cool' | 'canvas' | 'ink';

const BG: Record<ChipBg, string> = {
  paper:  'bg-paper text-ink',
  pop:    'bg-pop text-paper',
  cool:   'bg-cool text-ink',
  canvas: 'bg-canvas text-ink',
  ink:    'bg-ink text-canvas',
};

type ChipProps = {
  bg?: ChipBg;
  /** Smaller variant for nested contexts. */
  sm?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Pill chip — pop-in entrance via parent, ink border, emoji-prefixed labels.
 */
export function Chip({ bg = 'paper', sm = false, className, children }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-block border-2 border-ink rounded-pill font-extrabold',
        sm ? 'px-2 py-[1px] text-[10px]' : 'px-2.5 py-0.5 text-[11px]',
        'font-display',
        BG[bg],
        className,
      )}
    >
      {children}
    </span>
  );
}
