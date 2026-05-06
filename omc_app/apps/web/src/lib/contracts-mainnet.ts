// 🚀 MAINNET CONTRACT CONFIGURATION
// Base Mainnet (Chain ID: 8453) contract addresses and configuration
// V4 + V2 fresh deployment (May 2026): self-exit feature, α-vanilla economics

// Contract addresses - LIVE ON BASE MAINNET
export const MAINNET_CONTRACTS = {
  OPINION_CORE: '0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1' as `0x${string}`,        // OpinionCoreV4
  FEE_MANAGER: '0x5dc8502Db4ed7Fb3689703F5B8D4fa1F2bD305AA' as `0x${string}`,
  POOL_MANAGER: '0x34537a749F4b16E7542a59e5322338372A6a1E3c' as `0x${string}`,         // PoolManagerV2
  OPINION_ADMIN: '0x202Bc4E3aB50147212bee0506bF5f2B544333b5D' as `0x${string}`,
  OPINION_EXTENSIONS: '0x2eD0DC454043A768cB3FA7e480c41Be7b8954394' as `0x${string}`,
  VALIDATION_LIBRARY: '0x95a60C951BCB6E77644081f0501c9d2dDDfDb681' as `0x${string}`,
  PRICE_CALCULATOR: '0xb6cEB6F62e929aC99068255AA3E380F01Ed69cB7' as `0x${string}`,
  SELF_EXIT_LIB: '0x30c465f5772dc86555d37fE1376218Cbf79a4D93' as `0x${string}`,
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