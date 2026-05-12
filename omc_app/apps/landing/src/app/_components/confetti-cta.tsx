'use client';

import { useRef } from 'react';
import { BtnPrimary } from './buttons';
import { useConfetti } from './confetti';

type ConfettiCTAProps = {
  href: string;
  /** Label shown inside the button. */
  children: React.ReactNode;
  /** Open in new tab. Default true. */
  external?: boolean;
  /** Delay navigation by this many ms so the confetti can play. Default 220. */
  navDelay?: number;
};

/**
 * Big mint/launch CTA. Fires confetti from the button's center on click,
 * then navigates after a short delay so users see the burst. Use for the
 * two flagship CTAs (mint, launch app). Don't use everywhere — keep the
 * delight rare.
 */
export function ConfettiCTA({ href, children, external = true, navDelay = 220 }: ConfettiCTAProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { fire, Confetti } = useConfetti();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const btn = ref.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      fire(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    window.setTimeout(() => {
      if (external) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = href;
      }
    }, navDelay);
  };

  return (
    <>
      <BtnPrimary ref={ref} onClick={handleClick}>
        {children}
      </BtnPrimary>
      <Confetti />
    </>
  );
}
