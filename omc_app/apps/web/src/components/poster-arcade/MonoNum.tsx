import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

type MonoNumProps = {
  /** Trigger 'gain' or 'loss' flash animation. */
  flash?: 'gain' | 'loss';
  className?: string;
  children: ReactNode;
};

/**
 * JetBrains Mono 800 number — Poster Arcade rule: every number is mono.
 */
export function MonoNum({ flash, className, children }: MonoNumProps) {
  const flashClass =
    flash === 'gain' ? 'animate-flash-gain text-gain'
    : flash === 'loss' ? 'animate-flash-loss text-loss'
    : '';

  return (
    <span className={cn('font-mono font-extrabold tabular-nums', flashClass, className)}>
      {children}
    </span>
  );
}
