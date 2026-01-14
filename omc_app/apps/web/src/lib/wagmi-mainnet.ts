// 🚀 WAGMI CONFIGURATION - MAINNET SUPPORT
// Enhanced wagmi configuration with environment-aware network switching

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';
import { createStorage, cookieStorage } from 'wagmi';
import { getCurrentEnvironment, CURRENT_NETWORK, isMainnet } from './environment';

// Enhanced localStorage wrapper with backup/restore capabilities
const createPersistentStorage = () => {
  if (typeof window === 'undefined') {
    return cookieStorage;
  }

  const env = getCurrentEnvironment();
  const storagePrefix = `opinionmarket.${env}`;

  return {
    getItem: (key: string) => {
      try {
        const fullKey = `${storagePrefix}.${key}`;
        const primary = localStorage.getItem(fullKey);
        if (primary) return primary;
        
        // Fallback to backup if primary is missing
        const backup = localStorage.getItem(`${fullKey}.backup`);
        if (backup) {
          console.log(`🔄 Restoring ${env} wallet state from backup`);
          localStorage.setItem(fullKey, backup);
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
        const fullKey = `${storagePrefix}.${key}`;
        localStorage.setItem(fullKey, value);
        // Create backup copy
        localStorage.setItem(`${fullKey}.backup`, value);
        // Update timestamp
        localStorage.setItem(`${storagePrefix}.connection.timestamp`, Date.now().toString());
      } catch (error) {
        console.error('Storage setItem error:', error);
      }
    },
    removeItem: (key: string) => {
      try {
        const fullKey = `${storagePrefix}.${key}`;
        localStorage.removeItem(fullKey);
        localStorage.removeItem(`${fullKey}.backup`);
      } catch (error) {
        console.error('Storage removeItem error:', error);
      }
    },
  };
};

// Environment-aware chain configuration
function getChains(): readonly [typeof base] | readonly [typeof baseSepolia] {
  const env = getCurrentEnvironment();
  
  if (env === 'mainnet') {
    return [base] as const;
  }
  
  return [baseSepolia] as const;
}

// WalletConnect Project ID with environment awareness
function getWalletConnectProjectId(): string {
  // Try environment-specific project ID first
  if (isMainnet()) {
    const mainnetProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_MAINNET_PROJECT_ID;
    if (mainnetProjectId) return mainnetProjectId;
  }
  
  // Fallback to general project ID
  const generalProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  if (generalProjectId) return generalProjectId;
  
  // Last resort fallback
  console.warn('⚠️ WalletConnect Project ID not configured');
  return '2f05a7e3f5a0b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9';
}

// App metadata based on environment
function getAppMetadata() {
  const env = getCurrentEnvironment();
  
  return {
    name: env === 'mainnet' ? 'OpinionMarketCap' : 'OpinionMarketCap (Testnet)',
    description: env === 'mainnet' 
      ? 'Decentralized Prediction Market on Base' 
      : 'OpinionMarketCap Testnet - Safe Testing Environment',
    url: env === 'mainnet' 
      ? 'https://opinionmarketcap.xyz' 
      : 'https://app.opinionmarketcap.xyz',
    icons: ['https://opinionmarketcap.xyz/favicon.ico'],
  };
}

// Create wagmi configuration with environment awareness
export const wagmiConfig = getDefaultConfig({
  appName: getAppMetadata().name,
  appDescription: getAppMetadata().description,
  appUrl: getAppMetadata().url,
  appIcon: getAppMetadata().icons[0],
  projectId: getWalletConnectProjectId(),
  chains: getChains(),
  ssr: true,
  storage: createStorage({
    storage: createPersistentStorage(),
    key: `opinionmarket.${getCurrentEnvironment()}.wallet.state`,
  }),
});

// Environment-specific RainbowKit theme
export const getRainbowKitTheme = () => {
  return isMainnet() ? {
    // Production theme - more professional
    blurs: {
      modalOverlay: 'blur(4px)',
    },
    colors: {
      accentColor: '#0052ff', // Base blue
      accentColorForeground: 'white',
      actionButtonBorder: 'rgba(0, 0, 0, 0.04)',
      actionButtonBorderMobile: 'rgba(0, 0, 0, 0.06)',
      actionButtonSecondaryBackground: 'rgba(0, 0, 0, 0.06)',
      closeButton: 'rgba(60, 66, 66, 0.8)',
      closeButtonBackground: 'rgba(0, 0, 0, 0.06)',
      connectButtonBackground: '#ffffff',
      connectButtonBackgroundError: '#ff494a',
      connectButtonInnerBackground: 'linear-gradient(0deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.06))',
      connectButtonText: '#25292e',
      connectButtonTextError: '#ffffff',
      connectionIndicator: '#30e000',
      downloadBottomCardBackground: 'linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), #ffffff',
      downloadTopCardBackground: 'linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), #ffffff',
      error: '#ff494a',
      generalBorder: 'rgba(0, 0, 0, 0.06)',
      generalBorderDim: 'rgba(0, 0, 0, 0.03)',
      menuItemBackground: 'rgba(60, 66, 66, 0.1)',
      modalBackdrop: 'rgba(0, 0, 0, 0.3)',
      modalBackground: '#ffffff',
      modalBorder: 'transparent',
      modalText: '#25292e',
      modalTextDim: 'rgba(60, 66, 66, 0.3)',
      modalTextSecondary: 'rgba(60, 66, 66, 0.6)',
      profileAction: '#ffffff',
      profileActionHover: 'rgba(255, 255, 255, 0.5)',
      profileForeground: 'rgba(60, 66, 66, 0.06)',
      selectedOptionBorder: 'rgba(60, 66, 66, 0.1)',
      standby: '#ffd641',
    },
    fonts: {
      body: 'SFRounded, ui-rounded, "SF Pro Rounded", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    radii: {
      actionButton: '12px',
      connectButton: '12px',
      menuButton: '12px',
      modal: '24px',
      modalMobile: '24px',
    },
    shadows: {
      connectButton: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      dialog: '0px 8px 32px rgba(0, 0, 0, 0.32)',
      profileDetailsAction: '0px 2px 6px rgba(37, 41, 46, 0.04)',
      selectedOption: '0px 2px 6px rgba(0, 0, 0, 0.24)',
      selectedWallet: '0px 2px 6px rgba(0, 0, 0, 0.12)',
      walletLogo: '0px 2px 16px rgba(0, 0, 0, 0.16)',
    },
  } : {
    // Testnet theme - more colorful/obvious
    blurs: {
      modalOverlay: 'blur(4px)',
    },
    colors: {
      accentColor: '#ff6b35', // Orange for testnet
      accentColorForeground: 'white',
      modalBackground: '#fffbf5', // Slightly warm background
      connectButtonBackground: '#fff3e6',
      error: '#ff494a',
      modalText: '#25292e',
    },
  };
};

// Connection status helpers
export function getConnectionStatusMessage(): string | null {
  const env = getCurrentEnvironment();
  
  if (env === 'mainnet') {
    return '🚨 Connected to Base Mainnet - Real transactions!';
  }
  
  return '🧪 Connected to Base Sepolia Testnet - Safe for testing';
}

// Network switching helpers
export async function switchToCorrectNetwork(switchNetworkAsync?: (chainId: number) => Promise<void>) {
  const env = getCurrentEnvironment();
  const expectedChainId = env === 'mainnet' ? 8453 : 84532;
  
  if (switchNetworkAsync) {
    try {
      await switchNetworkAsync(expectedChainId);
      console.log(`✅ Switched to ${env} network`);
    } catch (error) {
      console.error(`❌ Failed to switch to ${env} network:`, error);
    }
  }
}

// Export current environment info
export const WAGMI_ENVIRONMENT = {
  current: getCurrentEnvironment(),
  isMainnet: isMainnet(),
  chains: getChains(),
  projectId: getWalletConnectProjectId(),
  appMetadata: getAppMetadata(),
} as const;

// Log current configuration
if (typeof window !== 'undefined') {
  console.log('🔌 Wagmi Configuration:');
  console.log(`   Environment: ${WAGMI_ENVIRONMENT.current}`);
  console.log(`   Chains: ${WAGMI_ENVIRONMENT.chains.map(c => `${c.name} (${c.id})`).join(', ')}`);
  console.log(`   Storage Key: opinionmarket.${WAGMI_ENVIRONMENT.current}.wallet.state`);
  
  if (WAGMI_ENVIRONMENT.isMainnet) {
    console.log('🚨 MAINNET WALLET CONFIG - Real transactions enabled!');
  }
}