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
 * disabled buttons are visually dimmed and skip the hover/press motion.
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
    disabled,
    ...rest
  },
  ref,
) {
  const base = cn(
    'inline-flex items-center justify-center gap-1.5',
    'rounded-pill border-[2.5px] border-ink',
    'font-display font-black tracking-[0.06em] uppercase',
    'transition-transform transition-shadow duration-100',
    !disabled && 'active:translate-x-[2px] active:translate-y-[2px]',
    disabled && 'opacity-50 grayscale cursor-not-allowed',
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

  // Render as anchor when href present and not disabled.
  if (href && !disabled) {
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

  // Disabled-anchor fallback — render as styled span so screen readers
  // don't treat it as actionable.
  if (href && disabled) {
    return (
      <span className={base} aria-disabled="true" role="link">
        {content}
      </span>
    );
  }

  return (
    <motion.button
      ref={ref}
      type={rest.type ?? 'button'}
      className={base}
      disabled={disabled}
      aria-disabled={disabled ? true : undefined}
      whileHover={disabled ? undefined : { x: -1, y: -1 }}
      {...rest}
    >
      {content}
    </motion.button>
  );
});
