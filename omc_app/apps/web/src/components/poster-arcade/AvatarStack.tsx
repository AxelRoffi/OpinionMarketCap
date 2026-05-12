import { cn } from '@/lib/utils';

type AvatarStackProps = {
  /** Avatar glyphs — emoji, letters, etc. */
  avatars: string[];
  /** How many to render before collapsing into a +N pill. */
  max?: number;
  /** Avatar diameter. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE: Record<NonNullable<AvatarStackProps['size']>, string> = {
  sm: 'h-7 w-7 text-[14px]',
  md: 'h-8 w-8 text-[16px]',
  lg: 'h-10 w-10 text-[20px]',
};

const PALETTE = ['bg-pop', 'bg-cool', 'bg-canvas', 'bg-paper'];
const TEXT = ['text-paper', 'text-ink', 'text-ink', 'text-ink'];

/**
 * Overlapping circle stack — used for pool contributors.
 */
export function AvatarStack({ avatars, max = 4, size = 'md', className }: AvatarStackProps) {
  const shown = avatars.slice(0, max);
  const extra = avatars.length - shown.length;
  const sizing = SIZE[size];

  return (
    <div className={cn('inline-flex items-center', className)}>
      {shown.map((a, i) => (
        <span
          key={`${a}-${i}`}
          aria-hidden
          className={cn(
            'inline-flex items-center justify-center rounded-full border-[2.5px] border-ink',
            'shadow-[2px_2px_0_var(--ink)]',
            sizing,
            PALETTE[i % PALETTE.length],
            TEXT[i % TEXT.length],
            i > 0 && '-ml-2',
          )}
          style={{ zIndex: shown.length - i }}
        >
          {a}
        </span>
      ))}
      {extra > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full border-[2.5px] border-ink bg-ink text-canvas font-display font-black -ml-2',
            sizing,
          )}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
