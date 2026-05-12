'use client';

import { useEffect, useRef, useState } from 'react';

type AnimatedNumberProps = {
  /** End value as a number (will be formatted with commas). */
  value: number;
  /** Prefix (e.g. "$"). */
  prefix?: string;
  /** Suffix (e.g. "%"). */
  suffix?: string;
  /** Duration in ms. Default 1500. */
  duration?: number;
  /** Decimal places. Default 0. */
  decimals?: number;
  /** Class on the wrapper span. */
  className?: string;
};

/**
 * Ticks a number from 0 to `value` when scrolled into view.
 * Uses easeOutCubic so the final third feels slow.
 */
export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 1500,
  decimals = 0,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        let raf = 0;
        const t0 = performance.now();

        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(eased * value);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  const formatted = display.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
