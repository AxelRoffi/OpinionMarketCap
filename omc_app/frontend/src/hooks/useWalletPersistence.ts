'use client';

import { useEffect, useCallback } from 'react';
import { useAccount, useReconnect } from 'wagmi';
import { usePathname } from 'next/navigation';

export function useWalletPersistence() {
  const { isConnected, address, connector } = useAccount();
  const { reconnect } = useReconnect();
  const pathname = usePathname();

  // Save wallet state on every route change
  const saveWalletState = useCallback(() => {
    if (isConnected && address && connector) {
      const state = {
        address,
        connector: connector.name,
        timestamp: Date.now(),
        route: pathname,
      };
      
      localStorage.setItem('opinionmarket.route.state', JSON.stringify(state));
      localStorage.setItem('opinionmarket.connection.timestamp', Date.now().toString());
    }
  }, [isConnected, address, connector, pathname]);

  // Monitor route changes and save state
  useEffect(() => {
    saveWalletState();
  }, [pathname, saveWalletState]);

  // Detect unexpected disconnections after route changes
  useEffect(() => {
    const checkConnectionAfterNavigation = async () => {
      const routeState = localStorage.getItem('opinionmarket.route.state');
      const lastTimestamp = localStorage.getItem('opinionmarket.connection.timestamp');
      
      if (routeState && lastTimestamp && !isConnected) {
        const state = JSON.parse(routeState);
        const timeSinceLastRoute = Date.now() - parseInt(lastTimestamp);
        
        // If we were connected recently (within 5 seconds) and are now disconnected
        if (timeSinceLastRoute < 5000 && state.address) {
          console.log('🔄 Route-based reconnection needed, attempting...');
          
          try {
            await reconnect();
          } catch (error) {
            console.log('Route reconnect failed:', error);
          }
        }
      }
    };

    // Check connection state after a brief delay to let route transition complete
    const timeoutId = setTimeout(checkConnectionAfterNavigation, 1000);
    return () => clearTimeout(timeoutId);
  }, [pathname, isConnected, reconnect]);

  return {
    isConnected,
    address,
    connector: connector?.name,
    currentRoute: pathname,
  };
}