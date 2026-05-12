import { cn } from '@/lib/utils';

type StepperProps = {
  steps: string[];
  /** Zero-indexed current step. */
  current: number;
  className?: string;
};

/**
 * Three-state step indicator. Done = ink/canvas; current = pop/paper with shadow;
 * upcoming = paper/ink-faded. Hatch dashes between bubbles.
 */
export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol
      className={cn('flex items-center gap-2 md:gap-3', className)}
      aria-label="Wizard progress"
    >
      {steps.map((label, i) => {
        const state: 'done' | 'active' | 'todo' =
          i < current ? 'done' : i === current ? 'active' : 'todo';

        const bubble =
          state === 'active'
            ? 'bg-pop text-paper shadow-[2px_2px_0_var(--ink)]'
          : state === 'done'
            ? 'bg-ink text-canvas'
            : 'bg-paper text-ink/60';

        const text =
          state === 'active'
            ? 'text-ink'
          : state === 'done'
            ? 'text-ink/80'
            : 'text-ink/40';

        return (
          <li key={label} className="flex items-center gap-2 md:gap-3">
            <div
              className={cn(
                'inline-flex items-center justify-center',
                'h-7 w-7 rounded-full border-2 border-ink',
                'font-display font-black text-[12px]',
                bubble,
              )}
              aria-current={state === 'active' ? 'step' : undefined}
            >
              {state === 'done' ? '✓' : i + 1}
            </div>
            <span
              className={cn(
                'font-display font-extrabold text-[11px] tracking-[0.1em] uppercase hidden sm:inline',
                text,
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="hidden sm:inline-block w-6 md:w-10 border-t-2 border-dashed border-ink/40"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
