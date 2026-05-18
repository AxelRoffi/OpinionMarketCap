'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { BottomTabBar } from '@/components/poster-arcade';

interface DappBottomChromeProps {
  children: ReactNode;
}

/**
 * Wraps Poster Arcade route content and renders the dapp-only bottom chrome
 * (BottomTabBar). Admin pages live inside the (poster) group but bring
 * their own bottom tab UI, so this hides the dapp chrome there to prevent
 * two bottom bars stacking.
 *
 * NOTE: StreakRail removed — it was rendering hardcoded fake stats. Will be
 * reintroduced when wired to real user data via useUserRoom.
 */
export function DappBottomChrome({ children }: DappBottomChromeProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;

  return (
    <>
      <div className={`flex-1 ${isAdminRoute ? '' : 'pb-[68px] md:pb-0'}`}>
        {children}
      </div>

      {!isAdminRoute && <BottomTabBar />}
    </>
  );
}
