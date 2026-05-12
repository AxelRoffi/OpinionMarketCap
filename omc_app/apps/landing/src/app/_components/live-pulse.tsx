'use client';

import { motion } from 'framer-motion';

/**
 * The "LIVE NOW" indicator: pop-pink dot + expanding halo ring.
 * Single source of truth — drop this anywhere you want the live signal.
 */
export function LivePulse({ label = 'LIVE NOW' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-block h-3 w-3">
        {/* halo ring */}
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-pop"
          animate={{ scale: [1, 2.4], opacity: [0.8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        />
        {/* core dot */}
        <motion.span
          className="absolute inset-0 inline-block rounded-full border-2 border-ink bg-pop"
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <span className="font-mono text-xs font-extrabold tracking-widest">{label}</span>
    </div>
  );
}
