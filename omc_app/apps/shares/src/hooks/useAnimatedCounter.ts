'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from its previous value to the target using requestAnimationFrame.
 * Re-triggers animation when target changes.
 */
export function useAnimatedCounter(target: number, duration = 600): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const fromRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }

    fromRef.current = current;
    startRef.current = 0;

    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = fromRef.current + (target - fromRef.current) * eased;

      setCurrent(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

/**
 * Animates a BigInt value (converts to number for display)
 */
export function useAnimatedBigIntCounter(target: bigint, decimals = 6, duration = 600): number {
  const numericTarget = Number(target) / Math.pow(10, decimals);
  return useAnimatedCounter(numericTarget, duration);
}
