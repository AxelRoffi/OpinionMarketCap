'use client';

/**
 * Tiny localStorage-backed watchlist for the /v2 redesign. Phase 6 wires the
 * UI; a later phase will swap this for a hook backed by a per-wallet record.
 *
 * Cross-component sync:
 *   - storage event covers cross-tab updates
 *   - pa-watchlist-change CustomEvent covers same-tab updates (the storage
 *     event does NOT fire in the tab that wrote the value)
 */

import { useCallback, useEffect, useState } from 'react';

const KEY = 'pa-watchlist-v1';
const EVENT = 'pa-watchlist-change';

function read(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

function write(ids: number[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function useWatchlist() {
  const [ids, setIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(read());
    setHydrated(true);

    const sync = () => setIds(read());
    window.addEventListener('storage', sync);
    window.addEventListener(EVENT, sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(EVENT, sync as EventListener);
    };
  }, []);

  const isWatched = useCallback((id: number) => ids.includes(id), [ids]);

  const add = useCallback(
    (id: number) => {
      const cur = read();
      if (cur.includes(id)) return;
      write([...cur, id]);
    },
    [],
  );

  const remove = useCallback(
    (id: number) => {
      const cur = read();
      write(cur.filter((x) => x !== id));
    },
    [],
  );

  const toggle = useCallback(
    (id: number) => {
      const cur = read();
      write(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
    },
    [],
  );

  const clear = useCallback(() => write([]), []);

  return { ids, hydrated, isWatched, add, remove, toggle, clear };
}
