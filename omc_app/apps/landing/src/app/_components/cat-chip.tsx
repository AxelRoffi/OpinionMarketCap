'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CatChipProps = {
  bg?: string;
  fg?: string;
  border?: string;
  className?: string;
  /** Disable the rotate-in entrance animation. */
  noAnimate?: boolean;
  children: ReactNode;
};

/**
 * Inline category chip used inside stickers.
 * Pops in rotated, springs to a natural angle.
 */
export function CatChip({
  bg = '#FFFFFF',
  fg = '#15120D',
  border = '#15120D',
  className,
  noAnimate = false,
  children,
}: CatChipProps) {
  return (
    <motion.span
      className={cn(
        'inline-block rounded-full px-2 py-px text-[10px] font-extrabold leading-tight',
        className,
      )}
      initial={noAnimate ? false : { rotate: -8, scale: 0.7, opacity: 0 }}
      whileInView={noAnimate ? undefined : { rotate: 0, scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ type: 'spring', stiffness: 320, damping: 14, mass: 0.5 }}
      style={{ background: bg, color: fg, border: `2px solid ${border}` }}
    >
      {children}
    </motion.span>
  );
}
