// 🚀 MAINNET CONTRACT CONFIGURATION
// Base Mainnet (Chain ID: 8453) contract addresses and configuration
// Deployed: 2025-01-07

// Contract addresses - LIVE ON BASE MAINNET
export const MAINNET_CONTRACTS = {
  OPINION_CORE: '0x7b5d97fb78fbf41432F34f46a901C6da7754A726' as `0x${string}`,
  FEE_MANAGER: '0x31D604765CD76Ff098A283881B2ca57e7F703199' as `0x${string}`,
  POOL_MANAGER: '0xF7f8fB9df7CCAa7fe438A921A51aC1e67749Fb5e' as `0x${string}`,
  OPINION_ADMIN: '0x4F0A1938E8707292059595275F9BBD067A301FD2' as `0x${string}`,
  OPINION_EXTENSIONS: '0x2a5a4Dc8AE4eF69a15D9974df54f3f38B3e883aA' as `0x${string}`,
  VALIDATION_LIBRARY: '0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5' as `0x${string}`,
  // Real USDC on Base Mainnet
  USDC_TOKEN: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
} as const;

// Treasury address
export const MAINNET_TREASURY_ADDRESS = '0x67902d93E37Ab7C1CD016affa797a4AF3b53D1a9' as `0x${string}`;

// Network configuration
export const MAINNET_NETWORK = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://mainnet.base.org'] },
    default: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    etherscan: { name: 'BaseScan', url: 'https://basescan.org' },
    default: { name: 'BaseScan', url: 'https://basescan.org' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`,
      blockCreated: 5022,
    },
  },
} as const;

// Environment validation
export function validateMainnetEnvironment(): boolean {
  const requiredAddresses = [
    MAINNET_CONTRACTS.OPINION_CORE,
    MAINNET_CONTRACTS.FEE_MANAGER,
    MAINNET_CONTRACTS.POOL_MANAGER,
    MAINNET_CONTRACTS.OPINION_ADMIN,
    MAINNET_CONTRACTS.OPINION_EXTENSIONS,
  ];

  const hasValidAddresses = requiredAddresses.every(
    address => address !== '0x0000000000000000000000000000000000000000'
  );

  if (!hasValidAddresses) {
    console.error('❌ Mainnet contracts not properly configured.');
    return false;
  }

  return true;
}

// Real USDC configuration
export const MAINNET_USDC = {
  ADDRESS: MAINNET_CONTRACTS.USDC_TOKEN,
  SYMBOL: 'USDC',
  NAME: 'USD Coin',
  DECIMALS: 6,
} as const;

// Production feature flags
export const MAINNET_FEATURES = {
  ENABLE_PUBLIC_CREATION: false, // Start with admin-only
  ENABLE_QUESTION_MARKETPLACE: true,
  ENABLE_POOLS: true,
  ENABLE_ADMIN_PANEL: false, // Disable in production initially
  MAX_GAS_PRICE_GWEI: 5, // Maximum gas price for transactions
  TRANSACTION_DEADLINE_MINUTES: 20, // Transaction deadline
} as const;

// Production-specific UI configuration
export const MAINNET_UI_CONFIG = {
  SHOW_TESTNET_WARNING: false,
  ENABLE_DEBUG_MODE: false,
  SHOW_GAS_ESTIMATES: true,
  REQUIRE_TRANSACTION_CONFIRMATION: true,
  ENABLE_ANALYTICS: true,
  SHOW_PRICE_IN_USD: true,
} as const;

// Export all mainnet configuration
export const MAINNET_CONFIG = {
  CONTRACTS: MAINNET_CONTRACTS,
  TREASURY: MAINNET_TREASURY_ADDRESS,
  NETWORK: MAINNET_NETWORK,
  USDC: MAINNET_USDC,
  FEATURES: MAINNET_FEATURES,
  UI: MAINNET_UI_CONFIG,
} as const;