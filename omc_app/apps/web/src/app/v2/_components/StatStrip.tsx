import { type ReactNode } from 'react';
import { MonoNum } from '@/components/poster-arcade';
import { cn } from '@/lib/utils';

export type StatItem = {
  label: string;
  /** Display string — already formatted (e.g. "$1,247", "+18.4%"). */
  value: ReactNode;
  /** Optional emoji / glyph after the value (e.g. 🔥 for streak). */
  glyph?: string;
  /** Tint the value: gain (cool) / loss (pop) / default ink. */
  tone?: 'gain' | 'loss' | 'default';
  /** Hidden when user opted out (renders ▒▒▒). */
  hidden?: boolean;
};

type StatStripProps = {
  items: StatItem[];
  className?: string;
};

/**
 * Horizontal stat strip. Each stat = uppercase eyebrow + MonoNum value.
 * Used at the top of /v2/portfolio and /v2/profile.
 */
export function StatStrip({ items, className }: StatStripProps) {
  return (
    <ul
      className={cn(
        'grid grid-cols-2 md:grid-cols-4 gap-3',
        className,
      )}
    >
      {items.map((s) => (
        <li
          key={s.label}
          className="bg-paper border-2 border-ink rounded-lg p-3 shadow-[3px_3px_0_var(--ink)]"
        >
          <div className="font-display text-[9px] font-extrabold tracking-[0.16em] uppercase text-ink/55">
            {s.label}
          </div>
          {s.hidden ? (
            <div className="font-mono font-extrabold text-[18px] mt-1 text-ink/40 tracking-[0.2em]">
              ▒▒▒▒
            </div>
          ) : (
            <MonoNum
              className={cn(
                'block mt-1 text-[20px]',
                s.tone === 'gain' && 'text-gain',
                s.tone === 'loss' && 'text-loss',
              )}
            >
              {s.value}{s.glyph ? <span aria-hidden> {s.glyph}</span> : null}
            </MonoNum>
          )}
        </li>
      ))}
    </ul>
  );
}
