import { type ReactNode } from 'react';
import { Nav, BottomTabBar, StreakRail, Halftone } from '@/components/poster-arcade';

export const metadata = {
  title: 'OpinionMarketCap — Take a stand. Get paid for it.',
};

export default function V2Layout({ children }: { children: ReactNode }) {
  return (
    <div className="pa-root min-h-screen bg-canvas text-ink font-display">
      <Halftone as="main" className="flex flex-col min-h-screen">
        {/* Top nav */}
        <Nav />

        {/* Route content */}
        <div className="flex-1 pb-[110px] md:pb-12">{children}</div>

        {/* Streak rail — desktop fixed, mobile sits above tab bar */}
        <div className="fixed bottom-[68px] md:bottom-0 inset-x-0 z-20">
          <StreakRail
            left={<>🔥 4-day streak · keep it going</>}
            middle={<>★ 12 takes · $1,247 bag · +$214 royalties</>}
            right={<>vitalik · jesse · prag are online</>}
          />
        </div>

        {/* Mobile bottom nav */}
        <BottomTabBar />
      </Halftone>
    </div>
  );
}
