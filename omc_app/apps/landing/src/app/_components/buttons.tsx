'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type BtnProps = Omit<HTMLMotionProps<'button'>, 'ref'>;

const baseClasses =
  'inline-flex items-center justify-center rounded-full border-[2.5px] border-ink px-[22px] py-[14px] text-sm font-black tracking-[0.06em] uppercase cursor-pointer will-change-transform';

const heartbeat = {
  animate: { y: [0, -1.5, 0, 1, 0] },
  transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const },
};

const wobble = {
  whileHover: { rotate: [-1.2, 1.2, -0.8, 0.6, 0], scale: 1.03 },
  transition: { duration: 0.35, ease: 'easeOut' as const },
};

const tap = {
  whileTap: { translateX: 2, translateY: 2, boxShadow: '2px 2px 0 #15120D' },
};

export const BtnPrimary = forwardRef<HTMLButtonElement, BtnProps>(function BtnPrimary(
  { className, children, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      className={cn(baseClasses, 'bg-pop text-white shadow-cta', className)}
      animate={heartbeat.animate}
      transition={heartbeat.transition}
      whileHover={wobble.whileHover}
      whileTap={tap.whileTap}
      {...rest}
    >
      {children}
    </motion.button>
  );
});

export const BtnSecondary = forwardRef<HTMLButtonElement, BtnProps>(function BtnSecondary(
  { className, children, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      className={cn(baseClasses, 'bg-paper text-ink shadow-cta tracking-[0.04em]')}
      whileHover={{ y: -2, boxShadow: '6px 6px 0 #15120D' }}
      transition={{ duration: 0.15, ease: 'easeOut' as const }}
      whileTap={tap.whileTap}
      {...rest}
    >
      {children}
    </motion.button>
  );
});

/** Nav-mode CTA. Ink fill, canvas text, pop-colored shadow. */
export const BtnNav = forwardRef<HTMLButtonElement, BtnProps>(function BtnNav(
  { className, children, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-ink px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-canvas shadow-cta-pop cursor-pointer will-change-transform',
        className,
      )}
      animate={heartbeat.animate}
      transition={heartbeat.transition}
      whileHover={{ scale: 1.05, rotate: [-1, 1, 0] }}
      whileTap={tap.whileTap}
      {...rest}
    >
      {children}
    </motion.button>
  );
});
