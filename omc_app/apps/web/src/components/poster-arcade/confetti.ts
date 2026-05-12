/**
 * Poster Arcade confetti — burst in canvas/ink/pop/cool, slight tilt-aware origin.
 * Wraps canvas-confetti so call-sites stay simple.
 */

import confetti from 'canvas-confetti';

const COLORS = ['#15120D', '#FF4D6B', '#4DFFE0', '#FFE94D', '#FFFFFF'];

export type ConfettiOptions = {
  /** Burst origin in [0,1]² page coords. Defaults to centred. */
  x?: number;
  y?: number;
  /** Particle count. */
  count?: number;
  /** Spread arc, degrees. */
  spread?: number;
};

export function popConfetti({ x = 0.5, y = 0.4, count = 70, spread = 90 }: ConfettiOptions = {}) {
  if (typeof window === 'undefined') return;
  confetti({
    particleCount: count,
    spread,
    origin: { x, y },
    colors: COLORS,
    ticks: 220,
    gravity: 1.1,
    scalar: 1.1,
    shapes: ['square', 'circle'],
    disableForReducedMotion: true,
  });
}
