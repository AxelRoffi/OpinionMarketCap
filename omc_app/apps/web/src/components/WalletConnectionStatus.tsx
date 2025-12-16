'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useReconnect } from 'wagmi';
import { toast } from 'sonner';

export function WalletConnectionStatus() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connectors } = useConnect();
  const { reconnect } = useReconnect();
  const [hasAttemptedReconnect, setHasAttemptedReconnect] = useState(false);
  const [connectionHistory, setConnectionHistory] = useState<string[]>([]);

  // Log connection state changes
  useEffect(() => {
    const status = `${new Date().toLocaleTimeString()}: Connected=${isConnected}, Connecting=${isConnecting}, Reconnecting=${isReconnecting}, Address=${address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'none'}`;
    setConnectionHistory(prev => [status, ...prev.slice(0, 4)]); // Keep last 5 entries
    
    console.log('🔗 Wallet Status:', {
      isConnected,
      isConnecting,
      isReconnecting,
      address,
      connectors: connectors.map(c => c.name)
    });
  }, [isConnected, isConnecting, isReconnecting, address, connectors]);

  // Attempt auto-reconnect on load
  useEffect(() => {
    if (!isConnected && !isConnecting && !hasAttemptedReconnect) {
      console.log('🔄 Attempting auto-reconnect...');
      setHasAttemptedReconnect(true);
      
      // Try to reconnect after a short delay
      const timeoutId = setTimeout(() => {
        try {
          reconnect();
        } catch (error) {
          console.log('Auto-reconnect failed:', error);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [isConnected, isConnecting, hasAttemptedReconnect, reconnect]);

  // Show connection status changes
  useEffect(() => {
    if (isConnected && address) {
      toast.success('Wallet connected successfully!', {
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        duration: 3000,
      });
    } else if (!isConnected && hasAttemptedReconnect && !isConnecting) {
      toast.info('Wallet disconnected', {
        description: 'Your wallet connection was lost',
        duration: 3000,
      });
    }
  }, [isConnected, address, hasAttemptedReconnect, isConnecting]);

  // Only show debug info in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-3 rounded-lg text-xs max-w-xs z-50 border border-gray-700">
      <div className="font-bold mb-2">Wallet Debug</div>
      <div>Status: {isConnected ? '✅ Connected' : isConnecting ? '🔄 Connecting' : isReconnecting ? '🔄 Reconnecting' : '❌ Disconnected'}</div>
      {address && <div>Address: {address.slice(0, 6)}...{address.slice(-4)}</div>}
      <div>Connectors: {connectors.length}</div>
      
      {!isConnected && (
        <div className="mt-2 space-y-1">
          <button
            onClick={() => reconnect()}
            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
            disabled={isConnecting || isReconnecting}
          >
            {isConnecting || isReconnecting ? 'Connecting...' : 'Reconnect'}
          </button>
        </div>
      )}
      
      <div className="mt-2 text-xs opacity-75 max-h-16 overflow-y-auto">
        <div className="font-semibold">Recent:</div>
        {connectionHistory.map((entry, index) => (
          <div key={index} className="truncate">{entry}</div>
        ))}
      </div>
    </div>
  );
}