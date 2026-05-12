'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type HeroTitleProps = {
  className?: string;
  children: ReactNode;
  /** Delay before animation starts (in seconds). */
  delay?: number;
};

/**
 * Subtle reveal for the giant hero H1. Slide-up + soft scale + spring.
 * Designed to feel like the sticker just got placed — not a typing effect.
 * Use for above-the-fold H1 only (runs on mount, not on scroll).
 */
export function HeroTitle({ className, children, delay = 0.08 }: HeroTitleProps) {
  return (
    <motion.h1
      className={className}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1   }}
      transition={{ type: 'spring', stiffness: 180, damping: 22, mass: 0.8, delay }}
    >
      {children}
    </motion.h1>
  );
}

/** Eyebrow line above the hero H1. Fades in from above. */
export function HeroEyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/** Sub-paragraph under the hero H1. Fades up after the title. */
export function HeroLede({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.28 }}
    >
      {children}
    </motion.p>
  );
}
