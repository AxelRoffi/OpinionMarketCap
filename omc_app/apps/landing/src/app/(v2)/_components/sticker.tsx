'use client';

import { motion, type Variants } from 'framer-motion';
import { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StickerProps = {
  bg?: string;
  fg?: string;
  /** Rotation in degrees. Keep between -3 and +4. */
  tilt?: number;
  /** Hard-shadow offset in px. 4–6. */
  shadow?: 4 | 5 | 6;
  tappable?: boolean;
  /** Disable slap-in entrance animation (useful if Sticker is in a hero already animated). */
  noAnimate?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Hero atom of Poster Arcade. 2.5px ink border + hard offset shadow + slight tilt.
 * Animations:
 *  · Slap-in on viewport entry (scale up + rotate-overshoot, spring)
 *  · Hover lift (translate up + shadow grows)
 */
export function Sticker({
  bg = '#FF4D6B',
  fg = '#FFFFFF',
  tilt = -1.5,
  shadow = 5,
  tappable = false,
  noAnimate = false,
  className,
  style,
  children,
}: StickerProps) {
  // Overshoot tilt: enters tilted further then springs back to resting tilt.
  const overshoot = tilt + (tilt >= 0 ? 5 : -5);
  const restShadow = `${shadow}px ${shadow}px 0 #15120D`;
  const liftShadow = `${shadow + 3}px ${shadow + 3}px 0 #15120D`;

  const variants: Variants = {
    hidden: { scale: 0.85, rotate: overshoot, opacity: 0 },
    visible: { scale: 1, rotate: tilt, opacity: 1 },
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-sticker border-[2.5px] border-ink p-[14px_16px]',
        tappable && 'sticker-tappable cursor-pointer',
        className,
      )}
      initial={noAnimate ? false : 'hidden'}
      whileInView={noAnimate ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
      transition={{ type: 'spring', stiffness: 240, damping: 18, mass: 0.6 }}
      whileHover={{ y: -3, boxShadow: liftShadow }}
      style={{
        background: bg,
        color: fg,
        boxShadow: restShadow,
        ['--tilt' as string]: `${tilt}deg`,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
