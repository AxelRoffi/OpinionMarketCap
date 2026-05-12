import { type ReactNode } from 'react';

type StreakRailProps = {
  /** Left slot — e.g. "🔥 4-day streak · keep it going" */
  left?: ReactNode;
  /** Middle slot — e.g. stats */
  middle?: ReactNode;
  /** Right slot — e.g. "vitalik · jesse are online" */
  right?: ReactNode;
};

/**
 * Sticky-ish bottom ink rail. Three slots, single line, 12px font.
 * On mobile it sits ABOVE the BottomTabBar (handled by parent layout spacing).
 */
export function StreakRail({ left, middle, right }: StreakRailProps) {
  return (
    <div className="pa-rail flex-wrap gap-2 text-canvas">
      {left  && <span>{left}</span>}
      {middle && <span className="hidden sm:inline">{middle}</span>}
      {right && <span className="hidden md:inline">{right}</span>}
    </div>
  );
}
