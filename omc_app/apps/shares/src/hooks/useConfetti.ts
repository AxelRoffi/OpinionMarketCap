'use client';

import { useCallback } from 'react';

// Dynamically import to avoid SSR issues
async function getConfetti() {
  const confettiModule = await import('canvas-confetti');
  return confettiModule.default;
}

export type ConfettiType = 'success' | 'celebration' | 'fireworks' | 'stars';

export function useConfetti() {
  const triggerConfetti = useCallback(async (type: ConfettiType = 'success') => {
    try {
      const confetti = await getConfetti();

      switch (type) {
        case 'success':
          // Simple success burst
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
          });
          break;

        case 'celebration':
          // Double burst from sides
          const count = 200;
          const defaults = {
            origin: { y: 0.7 },
            colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
          };

          confetti({
            ...defaults,
            particleCount: count,
            spread: 100,
            angle: 60,
            origin: { x: 0, y: 0.7 },
          });

          confetti({
            ...defaults,
            particleCount: count,
            spread: 100,
            angle: 120,
            origin: { x: 1, y: 0.7 },
          });
          break;

        case 'fireworks':
          // Fireworks effect
          const duration = 2000;
          const animationEnd = Date.now() + duration;

          const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
          };

          const interval = setInterval(async () => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
              clearInterval(interval);
              return;
            }

            const confettiInstance = await getConfetti();
            const particleCount = 50 * (timeLeft / duration);

            confettiInstance({
              particleCount,
              startVelocity: 30,
              spread: 360,
              ticks: 60,
              origin: {
                x: randomInRange(0.1, 0.9),
                y: Math.random() - 0.2,
              },
              colors: ['#10b981', '#3b82f6', '#8b5cf6', '#fbbf24'],
            });
          }, 250);
          break;

        case 'stars':
          // Star-shaped confetti
          const starDefaults = {
            spread: 360,
            ticks: 100,
            gravity: 0,
            decay: 0.94,
            startVelocity: 30,
            shapes: ['star' as const],
            colors: ['#fbbf24', '#f59e0b', '#d97706'],
          };

          confetti({
            ...starDefaults,
            particleCount: 40,
            scalar: 1.2,
            origin: { x: 0.5, y: 0.5 },
          });

          confetti({
            ...starDefaults,
            particleCount: 20,
            scalar: 0.75,
            origin: { x: 0.5, y: 0.5 },
          });
          break;
      }
    } catch (error) {
      console.warn('Confetti failed to load:', error);
    }
  }, []);

  const triggerBuySuccess = useCallback(async () => {
    try {
      const confetti = await getConfetti();

      // Green-themed celebration for buying
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });

      // Delayed second burst
      setTimeout(async () => {
        const confetti2 = await getConfetti();
        confetti2({
          particleCount: 50,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#10b981', '#22c55e', '#4ade80'],
        });
      }, 150);
    } catch (error) {
      console.warn('Confetti failed:', error);
    }
  }, []);

  const triggerSellSuccess = useCallback(async () => {
    try {
      const confetti = await getConfetti();

      // Blue-green theme for selling (cashing out)
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#3b82f6', '#60a5fa', '#10b981', '#34d399'],
      });
    } catch (error) {
      console.warn('Confetti failed:', error);
    }
  }, []);

  const triggerClaimSuccess = useCallback(async () => {
    try {
      const confetti = await getConfetti();

      // Gold/amber theme for claiming fees
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#10b981'],
      });

      // Stars for extra flair
      setTimeout(async () => {
        const confetti2 = await getConfetti();
        confetti2({
          particleCount: 30,
          spread: 360,
          startVelocity: 25,
          ticks: 80,
          shapes: ['star' as const],
          colors: ['#fbbf24', '#f59e0b'],
          origin: { y: 0.5 },
        });
      }, 200);
    } catch (error) {
      console.warn('Confetti failed:', error);
    }
  }, []);

  return {
    triggerConfetti,
    triggerBuySuccess,
    triggerSellSuccess,
    triggerClaimSuccess,
  };
}
