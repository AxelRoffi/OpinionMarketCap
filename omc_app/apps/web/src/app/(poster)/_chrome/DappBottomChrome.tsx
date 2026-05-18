'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { BottomTabBar, StreakRail } from '@/components/poster-arcade';

interface DappBottomChromeProps {
  children: ReactNode;
}

/**
 * Wraps Poster Arcade route content and renders the dapp-only bottom chrome
 * (StreakRail + BottomTabBar). Admin pages live inside the (poster) group
 * but bring their own bottom tab UI, so this hides the dapp chrome there to
 * prevent two bottom bars stacking.
 */
export function DappBottomChrome({ children }: DappBottomChromeProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;

  return (
    <>
      <div className={`flex-1 ${isAdminRoute ? '' : 'pb-[110px] md:pb-12'}`}>
        {children}
      </div>

      {!isAdminRoute && (
        <>
          <div className="fixed bottom-[68px] md:bottom-0 inset-x-0 z-20">
            <StreakRail
              left={<>🔥 4-day streak · keep it going</>}
              middle={<>★ 12 takes · $1,247 bag · +$214 royalties</>}
              right={<>vitalik · jesse · prag are online</>}
            />
          </div>

          <BottomTabBar />
        </>
      )}
    </>
  );
}
