import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionTitleProps = {
  /** Emoji prefix + heading text. */
  children: ReactNode;
  /** Right-side meta — counts, mono stats, etc. */
  meta?: ReactNode;
  className?: string;
};

/**
 * Display H2 with poster-arcade tracking + optional right-side meta line.
 * Used on /v2/portfolio, /v2/profile, /v2/leaderboard.
 */
export function SectionTitle({ children, meta, className }: SectionTitleProps) {
  return (
    <header className={cn('flex items-end justify-between flex-wrap gap-2 mb-4', className)}>
      <h2 className="font-display font-black text-[22px] md:text-[28px] tracking-[-0.03em] text-ink">
        {children}
      </h2>
      {meta && (
        <div className="font-mono text-[12px] md:text-[13px] font-extrabold text-ink/70">
          {meta}
        </div>
      )}
    </header>
  );
}
