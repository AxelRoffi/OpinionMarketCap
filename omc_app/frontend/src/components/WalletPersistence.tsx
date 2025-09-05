'use client';

import { useEffect, useRef } from 'react';
import { useAccount, useReconnect, useConnect } from 'wagmi';

export function WalletPersistence() {
  const { isConnected, isConnecting, isReconnecting, address, connector } = useAccount();
  const { reconnect, isLoading: isReconnectLoading } = useReconnect();
  const { connectors } = useConnect();
  const connectionStateRef = useRef<{
    address?: string;
    connector?: string;
    isConnected: boolean;
  }>({ isConnected: false });

  // Enhanced connection persistence logic
  useEffect(() => {
    const attemptReconnection = async () => {
      if (!isConnected && !isConnecting && !isReconnecting && !isReconnectLoading) {
        try {
          // Check multiple storage locations for wallet state
          const wagmiStore = localStorage.getItem('wagmi.store');
          const opinionStore = localStorage.getItem('opinionmarket.wallet.state');
          const backupState = localStorage.getItem('opinionmarket.wallet.backup');
          
          if (wagmiStore || opinionStore || backupState) {
            console.log('🔄 Attempting wallet reconnection...');
            
            // Try reconnecting with available connectors
            const availableConnectors = connectors.filter(c => c.type !== 'injected' || window?.ethereum);
            
            if (availableConnectors.length > 0) {
              await reconnect();
            }
          }
        } catch (error) {
          console.log('Auto-reconnect attempt failed:', error);
        }
      }
    };

    const timeoutId = setTimeout(attemptReconnection, 1000);
    return () => clearTimeout(timeoutId);
  }, [isConnected, isConnecting, isReconnecting, isReconnectLoading, connectors, reconnect]);

  // Save connection state whenever it changes
  useEffect(() => {
    if (isConnected && address && connector) {
      const connectionState = {
        address,
        connector: connector.name,
        isConnected: true,
        timestamp: Date.now(),
      };
      
      localStorage.setItem('opinionmarket.wallet.backup', JSON.stringify(connectionState));
      connectionStateRef.current = connectionState;
      
      console.log('✅ Wallet connection saved:', connectionState);
    } else if (!isConnected) {
      connectionStateRef.current = { isConnected: false };
    }
  }, [isConnected, address, connector]);

  // Enhanced beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isConnected) {
        // Save current state to multiple locations
        const currentState = {
          ...connectionStateRef.current,
          timestamp: Date.now(),
        };
        
        localStorage.setItem('opinionmarket.wallet.backup', JSON.stringify(currentState));
        localStorage.setItem('opinionmarket.connection.timestamp', Date.now().toString());
        
        // Try to preserve wagmi's internal state
        const wagmiState = localStorage.getItem('wagmi.store');
        if (wagmiState) {
          localStorage.setItem('wagmi.store.backup', wagmiState);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isConnected) {
        // Page is being hidden - save state
        const currentState = {
          ...connectionStateRef.current,
          timestamp: Date.now(),
        };
        localStorage.setItem('opinionmarket.wallet.backup', JSON.stringify(currentState));
      }
    };

    // Handle page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    // Handle tab switching
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected]);

  // Monitor for unexpected disconnections and attempt immediate reconnect
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    
    if (!isConnected && !isConnecting && !isReconnecting) {
      // Check if we should be connected based on recent activity
      const lastConnectionTime = localStorage.getItem('opinionmarket.connection.timestamp');
      const backupState = localStorage.getItem('opinionmarket.wallet.backup');
      
      if (lastConnectionTime && backupState) {
        const timeSinceLastConnection = Date.now() - parseInt(lastConnectionTime);
        // If disconnected within the last 30 seconds, attempt reconnect
        if (timeSinceLastConnection < 30000) {
          console.log('🔄 Unexpected disconnection detected, attempting reconnect...');
          reconnectTimeout = setTimeout(async () => {
            try {
              await reconnect();
            } catch (error) {
              console.log('Automatic reconnect failed:', error);
            }
          }, 1000);
        }
      }
    }
    
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [isConnected, isConnecting, isReconnecting, reconnect]);

  return null;
}