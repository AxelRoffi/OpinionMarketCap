'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useAccount, useChainId } from 'wagmi';
import {
  initAnalytics,
  identifyUser,
  resetUser,
  track,
  WalletEvents,
  EngagementEvents,
} from '@/lib/analytics';

interface AnalyticsContextType {
  trackPageView: (page: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics();
  }, []);

  // Track wallet connection/disconnection
  useEffect(() => {
    if (isConnected && address) {
      identifyUser(address, {
        walletType: connector?.name || 'unknown',
        chainId,
      });
      WalletEvents.connected(connector?.name || 'unknown', chainId);
    } else if (!isConnected) {
      resetUser();
    }
  }, [isConnected, address, connector?.name, chainId]);

  // Track page views
  const trackPageView = (page: string) => {
    EngagementEvents.pageViewed(page);
  };

  return (
    <AnalyticsContext.Provider value={{ trackPageView }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
