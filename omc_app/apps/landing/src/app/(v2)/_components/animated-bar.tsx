'use client';

import { motion } from 'framer-motion';

type AnimatedBarProps = {
  /** Target width as a percentage (0–100). */
  pct: number;
  /** Bar fill color (passed inline). */
  bg: string;
  /** Optional className for the outer track. */
  className?: string;
  /** Delay before animation in ms. */
  delayMs?: number;
};

/** Horizontal bar that fills from 0% to `pct` on viewport entry. */
export function AnimatedBar({ pct, bg, className, delayMs = 0 }: AnimatedBarProps) {
  return (
    <div className={`h-3 overflow-hidden rounded-full border-2 border-ink bg-canvas ${className ?? ''}`}>
      <motion.div
        initial={{ width: '0%' }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: delayMs / 1000 }}
        className="h-full rounded-full border-r-2 border-ink"
        style={{ background: bg }}
      />
    </div>
  );
}
