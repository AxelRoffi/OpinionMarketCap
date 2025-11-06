// 🌍 ENVIRONMENT CONFIGURATION
// Handles switching between testnet and mainnet configurations

import { CONTRACTS as TESTNET_CONTRACTS, USDC_ADDRESS as TESTNET_USDC_ADDRESS, TREASURY_ADDRESS as TESTNET_TREASURY_ADDRESS } from './contracts';
import { MAINNET_CONFIG, validateMainnetEnvironment } from './contracts-mainnet';
import { baseSepolia } from 'wagmi/chains';

// Environment detection
export type Environment = 'testnet' | 'mainnet';

export function getCurrentEnvironment(): Environment {
  // Check environment variable first
  const envVar = process.env.NEXT_PUBLIC_ENVIRONMENT?.toLowerCase();
  if (envVar === 'mainnet') return 'mainnet';
  if (envVar === 'testnet') return 'testnet';
  
  // Check chain ID
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  if (chainId === '8453') return 'mainnet';
  if (chainId === '84532') return 'testnet';
  
  // Default to testnet for safety
  return 'testnet';
}

// Environment-specific configurations
export const ENVIRONMENT_CONFIG = {
  testnet: {
    name: 'Base Sepolia Testnet',
    chainId: 84532,
    isProduction: false,
    contracts: {
      OPINION_CORE: TESTNET_CONTRACTS.OPINION_CORE,
      FEE_MANAGER: TESTNET_CONTRACTS.FEE_MANAGER,
      POOL_MANAGER: TESTNET_CONTRACTS.POOL_MANAGER,
      USDC_TOKEN: TESTNET_USDC_ADDRESS,
    },
    treasury: TESTNET_TREASURY_ADDRESS,
    network: baseSepolia,
    blockExplorer: {
      name: 'BaseScan Testnet',
      url: 'https://sepolia.basescan.org',
    },
    features: {
      ENABLE_PUBLIC_CREATION: true,
      ENABLE_DEBUG_MODE: true,
      SHOW_TESTNET_WARNING: true,
      ENABLE_ADMIN_PANEL: true,
      MAX_GAS_PRICE_GWEI: 10,
    },
    usdc: {
      ADDRESS: TESTNET_USDC_ADDRESS,
      SYMBOL: 'USDC',
      NAME: 'USD Coin (Testnet)',
      DECIMALS: 6,
    },
  },
  mainnet: {
    name: 'Base Mainnet',
    chainId: 8453,
    isProduction: true,
    contracts: {
      OPINION_CORE: MAINNET_CONFIG.CONTRACTS.OPINION_CORE,
      FEE_MANAGER: MAINNET_CONFIG.CONTRACTS.FEE_MANAGER,
      POOL_MANAGER: MAINNET_CONFIG.CONTRACTS.POOL_MANAGER,
      USDC_TOKEN: MAINNET_CONFIG.CONTRACTS.USDC_TOKEN,
    },
    treasury: MAINNET_CONFIG.TREASURY,
    network: MAINNET_CONFIG.NETWORK,
    blockExplorer: {
      name: 'BaseScan',
      url: 'https://basescan.org',
    },
    features: {
      ENABLE_PUBLIC_CREATION: MAINNET_CONFIG.FEATURES.ENABLE_PUBLIC_CREATION,
      ENABLE_DEBUG_MODE: false,
      SHOW_TESTNET_WARNING: false,
      ENABLE_ADMIN_PANEL: MAINNET_CONFIG.FEATURES.ENABLE_ADMIN_PANEL,
      MAX_GAS_PRICE_GWEI: MAINNET_CONFIG.FEATURES.MAX_GAS_PRICE_GWEI,
    },
    usdc: MAINNET_CONFIG.USDC,
  },
} as const;

// Current environment configuration
const currentEnv = getCurrentEnvironment();
export const ENV = ENVIRONMENT_CONFIG[currentEnv];

// Environment validation
export function validateCurrentEnvironment(): boolean {
  const env = getCurrentEnvironment();
  
  if (env === 'mainnet') {
    return validateMainnetEnvironment();
  }
  
  // Testnet validation (less strict)
  const hasTestnetContracts = ENV.contracts.OPINION_CORE !== '0x0000000000000000000000000000000000000000';
  
  if (!hasTestnetContracts) {
    console.warn('⚠️  Testnet environment may not be fully configured');
  }
  
  return true;
}

// Environment-aware contract addresses
export const CURRENT_CONTRACTS = ENV.contracts;
export const CURRENT_TREASURY = ENV.treasury;
export const CURRENT_NETWORK = ENV.network;
export const CURRENT_USDC = ENV.usdc;
export const CURRENT_FEATURES = ENV.features;

// Helper functions
export function isMainnet(): boolean {
  return getCurrentEnvironment() === 'mainnet';
}

export function isTestnet(): boolean {
  return getCurrentEnvironment() === 'testnet';
}

export function getEnvironmentDisplayName(): string {
  return ENV.name;
}

export function getBlockExplorerUrl(hash?: string, address?: string): string {
  const baseUrl = ENV.blockExplorer.url;
  if (hash) return `${baseUrl}/tx/${hash}`;
  if (address) return `${baseUrl}/address/${address}`;
  return baseUrl;
}

// Environment switch warning
export function getEnvironmentWarning(): string | null {
  if (isTestnet()) {
    return '⚠️ You are on Base Sepolia Testnet. Transactions use test tokens.';
  }
  
  if (isMainnet()) {
    return '🚨 You are on Base Mainnet. Transactions use real money!';
  }
  
  return null;
}

// Console environment info
if (typeof window !== 'undefined') {
  console.log(`🌍 Environment: ${currentEnv.toUpperCase()}`);
  console.log(`🔗 Network: ${ENV.name} (${ENV.chainId})`);
  console.log(`💰 USDC: ${ENV.usdc.ADDRESS}`);
  console.log(`🏭 OpinionCore: ${ENV.contracts.OPINION_CORE}`);
  
  if (isMainnet()) {
    console.log('🚨 MAINNET MODE: Real money transactions!');
  } else {
    console.log('🧪 TESTNET MODE: Safe for testing');
  }
}

// Type exports
export type EnvironmentConfig = typeof ENVIRONMENT_CONFIG[Environment];
export type ContractAddresses = typeof ENV.contracts;
export type EnvironmentFeatures = typeof ENV.features;