/**
 * Mainnet Configuration Constants for OpinionMarketCap
 * 
 * These are the production addresses and settings for Base Mainnet deployment.
 * All addresses have been verified and are official Base ecosystem contracts.
 */

export const MAINNET_CONFIG = {
  // Base Mainnet Chain Configuration
  CHAIN_ID: 8453,
  NETWORK_NAME: "base",
  RPC_URL: "https://mainnet.base.org",
  BLOCK_EXPLORER: "https://basescan.org",
  
  // Official Base Mainnet Token Addresses
  TOKENS: {
    // Official USDC on Base (Circle's USD Coin)
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    // Wrapped ETH on Base
    WETH: "0x4200000000000000000000000000000000000006",
    // Native ETH (for gas)
    ETH: "0x0000000000000000000000000000000000000000"
  },
  
  // OpinionMarketCap Production Settings
  PLATFORM_SETTINGS: {
    // Initial creation fee (2 USDC minimum)
    INITIAL_QUESTION_FEE: "2000000", // 2 * 10^6 (USDC has 6 decimals)
    
    // Initial answer price (10 USDC) 
    INITIAL_ANSWER_PRICE: "10000000", // 10 * 10^6
    
    // Minimum price for trading (1 USDC)
    MINIMUM_PRICE: "1000000", // 1 * 10^6
    
    // Maximum price change percentage (200%)
    MAX_PRICE_CHANGE_PERCENT: 200,
    
    // Maximum trades per block per user (for rate limiting)
    MAX_TRADES_PER_BLOCK: 3
  },
  
  // Safety Limits for Initial Launch
  LAUNCH_LIMITS: {
    // Maximum daily volume (start conservative)
    MAX_DAILY_VOLUME_USDC: "10000000000", // 10,000 USDC
    
    // Maximum single trade
    MAX_SINGLE_TRADE_USDC: "1000000000", // 1,000 USDC
    
    // Maximum per-user daily trading
    MAX_USER_DAILY_VOLUME_USDC: "2000000000", // 2,000 USDC
    
    // Initial price range for new opinions
    MIN_INITIAL_PRICE_USDC: "1000000",  // 1 USDC
    MAX_INITIAL_PRICE_USDC: "100000000" // 100 USDC
  },
  
  // Fee Structure (in basis points - 100 bp = 1%)
  FEE_STRUCTURE: {
    // Platform fee percentage (7% initially)
    PLATFORM_FEE_BP: 700,
    
    // Creator fee percentage (3% to question creator)  
    CREATOR_FEE_BP: 300,
    
    // Previous owner fee (remaining 90%)
    OWNER_FEE_BP: 9000,
    
    // Question sale platform fee (10%)
    QUESTION_SALE_PLATFORM_FEE_BP: 1000
  },
  
  // Production Treasury Configuration
  TREASURY: {
    // MUST be a multisig wallet for security
    // This should be a Gnosis Safe or similar multisig
    MULTISIG_REQUIRED: true,
    MIN_SIGNATURES: 3,
    TOTAL_SIGNERS: 5
  },
  
  // Gas Configuration for Base Mainnet
  GAS_SETTINGS: {
    // Base gas price (1 gwei is typically sufficient on Base)
    BASE_GAS_PRICE_GWEI: 1,
    
    // Maximum gas price willing to pay (20 gwei max)
    MAX_GAS_PRICE_GWEI: 20,
    
    // Gas limits for different operations
    DEPLOYMENT_GAS_LIMIT: 5000000,
    TRANSACTION_GAS_LIMIT: 300000,
    
    // Confirmation requirements
    CONFIRMATION_BLOCKS: 2
  },
  
  // Monitoring and Health Checks
  MONITORING: {
    // Health check intervals (in milliseconds)
    HEALTH_CHECK_INTERVAL: 300000, // 5 minutes
    
    // Alert thresholds
    HIGH_GAS_THRESHOLD_GWEI: 15,
    LOW_BALANCE_THRESHOLD_ETH: "0.01",
    HIGH_VOLUME_ALERT_USDC: "50000000000", // 50K USDC
    
    // Critical error patterns to monitor
    CRITICAL_ERRORS: [
      "revert",
      "OutOfGas", 
      "InsufficientBalance",
      "AccessControl"
    ]
  },
  
  // External Service Integration
  EXTERNAL_SERVICES: {
    // BaseScan API for contract verification
    BASESCAN_API: "https://api.basescan.org/api",
    
    // Alchemy for reliable RPC
    ALCHEMY_BASE_URL: "https://base-mainnet.g.alchemy.com/v2/",
    
    // Backup RPC providers
    BACKUP_RPC: [
      "https://base.llamarpc.com",
      "https://1rpc.io/base",
      "https://base.meowrpc.com"
    ]
  },
  
  // Security Settings
  SECURITY: {
    // Require manual confirmation for high-value transactions
    MANUAL_CONFIRMATION_THRESHOLD_USDC: "1000000000", // 1K USDC
    
    // Rate limiting settings
    RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
    MAX_REQUESTS_PER_WINDOW: 100,
    
    // Emergency pause conditions
    EMERGENCY_PAUSE_CONDITIONS: {
      HIGH_FAILURE_RATE: 0.1, // 10% transaction failure rate
      UNUSUAL_GAS_USAGE: 1000000, // 1M gas in single transaction
      RAPID_PRICE_CHANGES: 5 // More than 5x price change in 1 block
    }
  },
  
  // Default Categories for Production Launch
  INITIAL_CATEGORIES: [
    "Crypto",
    "Politics", 
    "Science",
    "Technology",
    "Sports",
    "Entertainment",
    "Culture",
    "Web",
    "Social Media",
    "Other"
  ]
} as const;

// Type definitions for better TypeScript support
export type MainnetConfig = typeof MAINNET_CONFIG;
export type TokenAddress = keyof typeof MAINNET_CONFIG.TOKENS;
export type Category = typeof MAINNET_CONFIG.INITIAL_CATEGORIES[number];

// Helper functions for common operations
export const formatUSDC = (amount: string): number => {
  return parseInt(amount) / 1000000; // Convert from 6-decimal USDC to human readable
};

export const parseUSDC = (amount: number): string => {
  return (amount * 1000000).toString(); // Convert from human readable to 6-decimal USDC
};

export const isMainnetAddress = (address: string): boolean => {
  return address.startsWith("0x") && address.length === 42;
};

export const validateMainnetConfig = (): boolean => {
  // Verify all critical addresses are set
  const requiredAddresses = [
    MAINNET_CONFIG.TOKENS.USDC,
    MAINNET_CONFIG.TOKENS.WETH
  ];
  
  return requiredAddresses.every(addr => isMainnetAddress(addr));
};

// Export individual constants for convenience
export const {
  CHAIN_ID,
  NETWORK_NAME,
  TOKENS,
  PLATFORM_SETTINGS,
  LAUNCH_LIMITS,
  FEE_STRUCTURE,
  GAS_SETTINGS
} = MAINNET_CONFIG;