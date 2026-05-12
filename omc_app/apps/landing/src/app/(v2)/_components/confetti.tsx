'use client';

import { motion } from 'framer-motion';
import { useCallback, useId, useRef, useState } from 'react';

type ConfettiPiece = {
  id: number;
  color: string;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  rot: number;
  delay: number;
};

const COLORS = ['#FF4D6B', '#4DFFE0', '#FFE94D', '#FFFFFF', '#15120D'];

/**
 * Hook returning a `(originX, originY) => void` confetti fire function.
 * Originator passes the screen-relative origin in px; pieces burst outward.
 * Render the returned `<Confetti …/>` somewhere in your component tree.
 */
export function useConfetti() {
  const [bursts, setBursts] = useState<ConfettiPiece[][]>([]);
  const burstIdRef = useRef(0);

  const fire = useCallback((originX: number, originY: number) => {
    const burst: ConfettiPiece[] = Array.from({ length: 18 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.3;
      const speed = 80 + Math.random() * 90;
      return {
        id: i,
        color: COLORS[i % COLORS.length],
        startX: originX,
        startY: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60, // bias upward
        rot: Math.random() * 720 - 360,
        delay: Math.random() * 0.05,
      };
    });
    const id = burstIdRef.current++;
    setBursts((b) => [...b, burst]);
    // GC after animation
    window.setTimeout(() => {
      setBursts((b) => b.filter((_, idx) => idx !== bursts.length));
    }, 1400);
  }, [bursts.length]);

  const Confetti = useCallback(() => (
    <ConfettiLayer bursts={bursts} />
  ), [bursts]);

  return { fire, Confetti };
}

function ConfettiLayer({ bursts }: { bursts: ConfettiPiece[][] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {bursts.flatMap((burst, bi) =>
        burst.map((p) => (
          <motion.div
            key={`${bi}-${p.id}`}
            className="absolute h-2.5 w-2.5 border-2 border-ink"
            style={{
              background: p.color,
              left: p.startX,
              top: p.startY,
            }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{
              x: p.vx * 4,
              y: p.vy * 4 + 800, // gravity
              rotate: p.rot,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: p.delay, times: [0, 0.7, 1] }}
          />
        )),
      )}
    </div>
  );
}

/**
 * Standalone wrapper that fires confetti from the button's center when clicked,
 * then runs the original onClick. Lets you wrap any element with confetti.
 *
 * Usage:
 *   <ConfettiTrigger><BtnPrimary>★ MINT</BtnPrimary></ConfettiTrigger>
 */
export function ConfettiTrigger({ children }: { children: React.ReactNode }) {
  const { fire, Confetti } = useConfetti();
  const id = useId();

  const handleClick = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    fire(rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  return (
    <>
      <span id={id} className="inline-block" onClickCapture={handleClick}>
        {children}
      </span>
      <Confetti />
    </>
  );
}
