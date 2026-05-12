'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StickerBg = 'pop' | 'cool' | 'canvas' | 'paper' | 'ink' | string;

const PAL: Record<string, { bg: string; fg: string }> = {
  pop:    { bg: 'var(--pop)',    fg: '#FFFFFF' },
  cool:   { bg: 'var(--cool)',   fg: 'var(--ink)' },
  canvas: { bg: 'var(--canvas)', fg: 'var(--ink)' },
  paper:  { bg: 'var(--paper)',  fg: 'var(--ink)' },
  ink:    { bg: 'var(--ink)',    fg: 'var(--canvas)' },
};

type StickerProps = {
  /** Background color: keyword (pop/cool/canvas/paper/ink) or any CSS color. */
  bg?: StickerBg;
  /** Foreground color. Defaults inferred from bg keyword. */
  fg?: string;
  /** Rotation in degrees. Keep between -3 and +3. */
  tilt?: number;
  /** Hard-shadow offset in px. 4–6. */
  shadow?: 4 | 5 | 6;
  /** Tappable — enables click wobble + pointer cursor. */
  tappable?: boolean;
  /** Skip slap-in entrance (e.g. when wrapped in another animated container). */
  noAnimate?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  children: ReactNode;
};

/**
 * Atom of Poster Arcade. 2.5px ink border + hard offset shadow + slight tilt.
 * Slap-in spring on viewport entry, hover lift, optional tap wobble.
 * Respects prefers-reduced-motion — renders in resting state, no spring/wobble.
 */
export function Sticker({
  bg = 'pop',
  fg,
  tilt = -1.5,
  shadow = 5,
  tappable = false,
  noAnimate = false,
  className,
  style,
  onClick,
  children,
}: StickerProps) {
  const reduceMotion = useReducedMotion();
  const palette = PAL[bg as keyof typeof PAL];
  const background = palette ? palette.bg : bg;
  const color = fg ?? palette?.fg ?? 'var(--ink)';

  const overshoot = tilt + (tilt >= 0 ? 5 : -5);
  const restShadow = `${shadow}px ${shadow}px 0 var(--ink)`;
  const liftShadow = `${shadow + 3}px ${shadow + 3}px 0 var(--ink)`;

  const variants: Variants = {
    hidden:  { scale: 0.85, rotate: overshoot, opacity: 0 },
    visible: { scale: 1,    rotate: tilt,      opacity: 1 },
  };

  // When motion is suppressed, render directly at the resting tilt — no spring,
  // no hover/tap animation. The static tilt is part of the brand, not motion.
  const initial = reduceMotion || noAnimate ? false : 'hidden';
  const animate = reduceMotion ? 'visible' : undefined;
  const whileInView = reduceMotion || noAnimate ? undefined : 'visible';

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'relative border-[2.5px] border-ink rounded-sticker p-[14px_16px]',
        tappable && 'cursor-pointer select-none',
        className,
      )}
      initial={initial}
      animate={animate}
      whileInView={whileInView}
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 240, damping: 18, mass: 0.6 }
      }
      whileHover={
        reduceMotion
          ? undefined
          : tappable
            ? { y: -3, boxShadow: liftShadow }
            : { y: -2, boxShadow: liftShadow }
      }
      whileTap={
        reduceMotion || !tappable
          ? undefined
          : {
              rotate: [tilt - 2, tilt + 2, tilt - 1, tilt],
              transition: { duration: 0.28, ease: 'easeOut' },
            }
      }
      style={{
        background,
        color,
        boxShadow: restShadow,
        // Force resting tilt as a static transform when motion is reduced so the
        // sticker doesn't appear at rotate(0) until animated in.
        ...(reduceMotion ? { transform: `rotate(${tilt}deg)` } : {}),
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
