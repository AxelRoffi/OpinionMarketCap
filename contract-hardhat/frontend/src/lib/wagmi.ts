import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';
import { createStorage, cookieStorage } from 'wagmi';

// Enhanced localStorage wrapper with backup/restore capabilities
const createPersistentStorage = () => {
  if (typeof window === 'undefined') {
    return cookieStorage;
  }

  return {
    getItem: (key: string) => {
      try {
        const primary = localStorage.getItem(key);
        if (primary) return primary;
        
        // Fallback to backup if primary is missing
        const backup = localStorage.getItem(`${key}.backup`);
        if (backup) {
          console.log('🔄 Restoring wallet state from backup');
          localStorage.setItem(key, backup);
          return backup;
        }
        
        return null;
      } catch (error) {
        console.error('Storage getItem error:', error);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
        // Create backup copy
        localStorage.setItem(`${key}.backup`, value);
        // Update timestamp
        localStorage.setItem('opinionmarket.connection.timestamp', Date.now().toString());
      } catch (error) {
        console.error('Storage setItem error:', error);
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}.backup`);
      } catch (error) {
        console.error('Storage removeItem error:', error);
      }
    },
  };
};

export const wagmiConfig = getDefaultConfig({
  appName: 'OpinionMarketCap',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '2f05a7e3f5a0b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9',
  chains: [baseSepolia],
  ssr: true,
  storage: createStorage({
    storage: createPersistentStorage(),
    key: 'opinionmarket.wallet.state',
  }),
  walletConnectParameters: {
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '2f05a7e3f5a0b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9',
  },
  syncConnectedChain: true,
  enableWalletConnect: true,
  enableInjected: true,
  enableCoinbase: true,
  enableSafe: true,
  enableEIP6963: true,
  // Enhanced multiInjectedProviderDiscovery for better wallet detection
  multiInjectedProviderDiscovery: true,
});