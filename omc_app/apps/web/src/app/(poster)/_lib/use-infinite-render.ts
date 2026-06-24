'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Progressive client-side rendering for an already-in-memory list.
 *
 * Renders `step` items, then `+step` more whenever a sentinel near the bottom
 * scrolls into view (IntersectionObserver). No network — `useTakes` already
 * holds every on-chain take, so this is pure render windowing for scale.
 *
 * Pass a `resetKey` (e.g. the active sort+category) so the window snaps back
 * to the first page when the user changes filters.
 */
export function useInfiniteRender<T>(items: T[], step = 12, resetKey?: unknown) {
  const [count, setCount] = useState(step);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Snap back to the first page when filters/sort change.
  useEffect(() => {
    setCount(step);
  }, [resetKey, step]);

  const total = items.length;
  const visible = Math.min(count, total);

  // Re-creating the observer on each `visible` change means observing fires the
  // initial intersection state immediately — so if the sentinel is still in
  // view after a bump (tall viewport), it cascades another bump until filled.
  useEffect(() => {
    if (visible >= total) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setCount((c) => c + step);
      },
      { rootMargin: '400px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, total, step]);

  return {
    visibleItems: items.slice(0, visible),
    visible,
    total,
    sentinelRef,
    hasMore: visible < total,
  };
}
