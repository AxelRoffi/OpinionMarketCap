'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BtnVariant = 'primary' | 'pop' | 'cool' | 'ghost';
type BtnSize = 'sm' | 'md' | 'lg';

type BtnProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: BtnVariant;
  size?: BtnSize;
  /** Show ★ prefix (primary actions). */
  star?: boolean;
  /** Render as <a> when href present. */
  href?: string;
  external?: boolean;
  children: ReactNode;
};

const VARIANTS: Record<BtnVariant, string> = {
  primary: 'bg-ink text-canvas shadow-[4px_4px_0_var(--pop)]',
  pop:     'bg-pop text-paper shadow-[4px_4px_0_var(--ink)]',
  cool:    'bg-cool text-ink shadow-[4px_4px_0_var(--ink)]',
  ghost:   'bg-paper text-ink shadow-[4px_4px_0_var(--ink)] font-extrabold',
};

const SIZES: Record<BtnSize, string> = {
  sm: 'px-4 py-2 text-[11px]',
  md: 'px-5 py-3 text-[13px]',
  lg: 'px-7 py-4 text-[15px]',
};

/**
 * Pill button — ink border, hard offset shadow, hover lift, press-down.
 */
export const Btn = forwardRef<HTMLButtonElement, BtnProps>(function Btn(
  {
    variant = 'primary',
    size = 'md',
    star = false,
    href,
    external,
    className,
    children,
    ...rest
  },
  ref,
) {
  const base = cn(
    'inline-flex items-center justify-center gap-1.5',
    'rounded-pill border-[2.5px] border-ink',
    'font-display font-black tracking-[0.06em] uppercase',
    'transition-transform transition-shadow duration-100',
    'active:translate-x-[2px] active:translate-y-[2px]',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = (
    <>
      {star && <span aria-hidden>★</span>}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={base}
        whileHover={{ x: -1, y: -1 }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref}
      className={base}
      whileHover={{ x: -1, y: -1 }}
      {...rest}
    >
      {content}
    </motion.button>
  );
});
