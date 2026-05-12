import { cn } from '@/lib/utils';

type ProgressBarProps = {
  /** 0–100. Clamped. */
  value: number;
  /** Fill color. */
  fill?: 'pop' | 'cool' | 'canvas' | 'ink';
  /** Track height. */
  size?: 'sm' | 'md' | 'lg';
  /** Hatch pattern on the empty track. */
  striped?: boolean;
  /** Optional centered label rendered over the bar. */
  label?: string;
  className?: string;
};

const HEIGHT: Record<NonNullable<ProgressBarProps['size']>, string> = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
};

const FILL: Record<NonNullable<ProgressBarProps['fill']>, string> = {
  pop:    'bg-pop',
  cool:   'bg-cool',
  canvas: 'bg-canvas',
  ink:    'bg-ink',
};

/**
 * Hard-edged progress bar — ink track, solid color fill (no gradient).
 */
export function ProgressBar({
  value,
  fill = 'pop',
  size = 'md',
  striped = false,
  label,
  className,
}: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        'rounded-pill border-[2.5px] border-ink bg-paper',
        HEIGHT[size],
        className,
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
    >
      {/* striped backing layer */}
      {striped && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--ink) 0 4px, transparent 4px 10px)',
          }}
        />
      )}

      {/* fill */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-0',
          FILL[fill],
          'transition-[width] duration-500 ease-out',
        )}
        style={{ width: `${v}%` }}
      />

      {/* label */}
      {label && (
        <div className="absolute inset-0 flex items-center justify-center font-mono font-extrabold text-[11px] tracking-[0.06em] uppercase mix-blend-difference text-paper">
          {label}
        </div>
      )}
    </div>
  );
}
