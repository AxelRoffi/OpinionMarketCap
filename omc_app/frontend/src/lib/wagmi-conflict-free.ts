import { createConfig, http, createStorage, cookieStorage } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { metaMask, walletConnect, injected } from 'wagmi/connectors';

// Extension conflict prevention storage
const createConflictFreeStorage = () => {
  if (typeof window === 'undefined') {
    return cookieStorage;
  }

  // Clear any conflicting ethereum providers
  const cleanupEthereumProviders = () => {
    try {
      // Store the original provider if it exists
      const originalEthereum = (window as any).ethereum;
      
      // Remove conflicting property descriptors
      if (originalEthereum) {
        console.log('🔧 Cleaning up wallet provider conflicts...');
        
        // Create a stable provider reference
        const stableProvider = {
          ...originalEthereum,
          request: originalEthereum.request?.bind(originalEthereum),
          sendAsync: originalEthereum.sendAsync?.bind(originalEthereum),
          send: originalEthereum.send?.bind(originalEthereum),
        };
        
        // Replace with stable provider
        Object.defineProperty(window, 'ethereum', {
          value: stableProvider,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
    } catch (error) {
      console.debug('Provider cleanup failed (non-critical):', error);
    }
  };

  // Run cleanup on initialization
  cleanupEthereumProviders();

  return {
    getItem: (key: string) => {
      try {
        const item = localStorage.getItem(key);
        return item;
      } catch (error) {
        console.debug('Storage getItem error:', error);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.debug('Storage setItem error:', error);
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.debug('Storage removeItem error:', error);
      }
    },
  };
};

// Wallet connectors with conflict prevention
const connectors = [
  injected({
    target: 'metaMask',
  }),
  metaMask({
    dappMetadata: {
      name: 'OpinionMarketCap',
    },
  }),
  walletConnect({
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '2f05a7e3f5a0b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9',
    metadata: {
      name: 'OpinionMarketCap',
      description: 'Prediction market platform',
      url: 'https://test.opinionmarketcap.xyz',
      icons: ['https://test.opinionmarketcap.xyz/favicon.ico']
    },
  }),
];

export const conflictFreeWagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors,
  transports: {
    [baseSepolia.id]: http(),
  },
  storage: createStorage({
    storage: createConflictFreeStorage(),
    key: 'omc.wallet',
  }),
  ssr: true,
  multiInjectedProviderDiscovery: false, // Disable to prevent conflicts
});

// Extension error suppression for console
export const suppressExtensionErrors = () => {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    const message = args.join(' ');
    
    // Suppress wallet extension conflicts
    if (
      message.includes('Cannot redefine property: ethereum') ||
      message.includes('chrome.runtime.sendMessage') ||
      message.includes('Extension ID') ||
      message.includes('chrome-extension://') ||
      message.includes('inpage.js') ||
      message.includes('MetaMask encountered an error setting the global Ethereum provider')
    ) {
      return;
    }
    
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Suppress wallet extension warnings
    if (
      message.includes('Cannot redefine property: ethereum') ||
      message.includes('chrome.runtime.sendMessage') ||
      message.includes('Extension ID') ||
      message.includes('chrome-extension://')
    ) {
      return;
    }
    
    originalWarn.apply(console, args);
  };
};