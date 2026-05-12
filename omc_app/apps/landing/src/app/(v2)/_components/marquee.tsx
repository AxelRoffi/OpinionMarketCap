'use client';

import { ReactNode } from 'react';

type MarqueeProps = {
  items: ReactNode[];
  /** Loop duration in seconds. Default 35. */
  duration?: number;
  /** Reverse direction. */
  reverse?: boolean;
  className?: string;
};

/**
 * Infinite horizontal scrolling strip. Items render twice for seamless loop.
 * Uses CSS keyframe (defined in v2.css) — no JS animation cost.
 */
export function Marquee({ items, duration = 35, reverse = false, className }: MarqueeProps) {
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-canvas to-transparent" />
      <div
        className="flex gap-3 whitespace-nowrap"
        style={{
          animation: `marquee-scroll ${duration}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {[...items, ...items].map((it, i) => (
          <div key={i} className="shrink-0">{it}</div>
        ))}
      </div>
    </div>
  );
}
