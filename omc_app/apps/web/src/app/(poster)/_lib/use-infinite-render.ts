'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Progressive client-side rendering for an already-in-memory list.
 *
 * Renders `step` items, then `+step` more whenever a sentinel near the bottom
 * scrolls into view. No network — the caller already holds every item, so
 * this is pure render windowing for scale.
 *
 * The sentinel uses a CALLBACK ref: React re-renders can replace the sentinel
 * DOM node (data refetches every 30s re-render the grid), and an effect-bound
 * observer would keep watching the old detached node and never fire again.
 * The callback ref re-attaches the observer to whichever node is live.
 *
 * Pass a `resetKey` (e.g. the active sort+category) so the window snaps back
 * to the first page when the user changes filters.
 */
export function useInfiniteRender<T>(items: T[], step = 12, resetKey?: unknown) {
  const [count, setCount] = useState(step);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Snap back to the first page when filters/sort change.
  useEffect(() => {
    setCount(step);
  }, [resetKey, step]);

  // Tear the observer down when the consuming component unmounts.
  useEffect(() => () => observerRef.current?.disconnect(), []);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node) return;
      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) setCount((c) => c + step);
        },
        { rootMargin: '600px' },
      );
      io.observe(node);
      observerRef.current = io;
    },
    [step],
  );

  /** Manual fallback — the sentinel is also a clickable "load more". */
  const loadMore = useCallback(() => setCount((c) => c + step), [step]);

  const total = items.length;
  const visible = Math.min(count, total);

  return {
    visibleItems: items.slice(0, visible),
    visible,
    total,
    sentinelRef,
    loadMore,
    hasMore: visible < total,
  };
}
