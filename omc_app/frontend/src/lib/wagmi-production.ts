import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';
import { createStorage, cookieStorage } from 'wagmi';
import { createPublicClient, http, fallback } from 'viem';

import { getCurrentEnvironment, ENV } from './environment';

/**
 * 🔗 PRODUCTION-READY WAGMI CONFIGURATION
 * 
 * Environment-aware wallet configuration with proper RPC failover
 * and production safety features for mainnet deployment
 */

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

// Environment-specific RPC endpoints with fallback support
const getRPCConfig = () => {
  const environment = getCurrentEnvironment();
  
  if (environment === 'mainnet') {
    // Mainnet RPC configuration with multiple providers for reliability
    const rpcUrls = [
      'https://mainnet.base.org',
      'https://base.llamarpc.com',
      'https://base-mainnet.public.blastapi.io'
    ];

    // Add Alchemy if available
    if (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
      rpcUrls.unshift(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
    }

    return {
      chains: [base] as const,
      transports: {
        [base.id]: fallback(
          rpcUrls.map(url => http(url)),
          { rank: true }
        )
      }
    };
  } else {
    // Testnet RPC configuration
    const rpcUrls = [
      'https://sepolia.base.org',
      'https://base-sepolia-rpc.publicnode.com'
    ];

    // Add Alchemy if available
    if (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
      rpcUrls.unshift(`https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
    }

    return {
      chains: [baseSepolia] as const,
      transports: {
        [baseSepolia.id]: fallback(
          rpcUrls.map(url => http(url)),
          { rank: true }
        )
      }
    };
  }
};

// Get current RPC configuration
const rpcConfig = getRPCConfig();

// Create production wagmi config
export const wagmiConfig = getDefaultConfig({
  appName: 'OpinionMarketCap',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '2f05a7e3f5a0b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9',
  chains: rpcConfig.chains,
  transports: rpcConfig.transports,
  ssr: true,
  storage: createStorage({
    storage: createPersistentStorage(),
    key: `opinionmarket.wallet.${getCurrentEnvironment()}`,
  }),
});

// Create public client with same failover configuration
export const publicClient = createPublicClient({
  chain: ENV.network,
  transport: getCurrentEnvironment() === 'mainnet' 
    ? rpcConfig.transports[base.id]
    : rpcConfig.transports[baseSepolia.id]
});

// Connection health monitoring
export class ConnectionHealthMonitor {
  private static instance: ConnectionHealthMonitor;
  private healthStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
  private lastCheck = Date.now();
  private failedRequests = 0;
  private maxFailures = 3;
  
  static getInstance(): ConnectionHealthMonitor {
    if (!ConnectionHealthMonitor.instance) {
      ConnectionHealthMonitor.instance = new ConnectionHealthMonitor();
    }
    return ConnectionHealthMonitor.instance;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const start = Date.now();
      const blockNumber = await publicClient.getBlockNumber();
      const latency = Date.now() - start;
      
      if (latency > 5000) { // 5 second timeout
        this.recordFailure();
        return false;
      }
      
      this.recordSuccess();
      return true;
    } catch (error) {
      console.error('RPC health check failed:', error);
      this.recordFailure();
      return false;
    }
  }

  private recordSuccess() {
    this.failedRequests = 0;
    this.healthStatus = 'healthy';
    this.lastCheck = Date.now();
  }

  private recordFailure() {
    this.failedRequests++;
    if (this.failedRequests >= this.maxFailures) {
      this.healthStatus = 'critical';
    } else {
      this.healthStatus = 'degraded';
    }
    this.lastCheck = Date.now();
  }

  getHealthStatus() {
    return {
      status: this.healthStatus,
      failedRequests: this.failedRequests,
      lastCheck: this.lastCheck,
      isHealthy: this.healthStatus === 'healthy'
    };
  }
}

// Wallet connection utilities
export const walletUtils = {
  // Clear all wallet storage (for emergency reset)
  clearWalletStorage: () => {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.includes('opinionmarket.wallet') || 
        key.includes('wagmi') || 
        key.includes('rainbowkit')
      );
      
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('🧹 Wallet storage cleared');
    } catch (error) {
      console.error('Failed to clear wallet storage:', error);
    }
  },

  // Get connection timestamp
  getConnectionTimestamp: (): number => {
    try {
      const timestamp = localStorage.getItem('opinionmarket.connection.timestamp');
      return timestamp ? parseInt(timestamp) : 0;
    } catch {
      return 0;
    }
  },

  // Check if wallet connection is stale (older than 24 hours)
  isConnectionStale: (): boolean => {
    const timestamp = walletUtils.getConnectionTimestamp();
    if (!timestamp) return false;
    
    const hoursSinceConnection = (Date.now() - timestamp) / (1000 * 60 * 60);
    return hoursSinceConnection > 24;
  },

  // Validate environment consistency
  validateEnvironment: () => {
    const storedEnv = localStorage.getItem('opinionmarket.environment');
    const currentEnv = getCurrentEnvironment();
    
    if (storedEnv && storedEnv !== currentEnv) {
      console.warn('⚠️ Environment mismatch detected, clearing wallet storage');
      walletUtils.clearWalletStorage();
    }
    
    localStorage.setItem('opinionmarket.environment', currentEnv);
  }
};

// Initialize environment validation on load
if (typeof window !== 'undefined') {
  walletUtils.validateEnvironment();
  
  // Log configuration details
  console.log(`🔗 Wagmi configured for ${getCurrentEnvironment().toUpperCase()}`);
  console.log(`📡 Network: ${ENV.name} (${ENV.chainId})`);
  console.log(`🏭 Contracts configured: ${ENV.contracts.OPINION_CORE !== '0x0000000000000000000000000000000000000000'}`);
  
  if (getCurrentEnvironment() === 'mainnet') {
    console.log('🚨 MAINNET MODE: Real money transactions enabled!');
  } else {
    console.log('🧪 TESTNET MODE: Safe for testing');
  }
}

// Export health monitor instance
export const connectionMonitor = ConnectionHealthMonitor.getInstance();