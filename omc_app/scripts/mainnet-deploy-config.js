// Mainnet Deployment Configuration for OpinionMarketCap
// Use this file to configure all parameters before deployment

const DEPLOYMENT_CONFIG = {
  // === NETWORK CONFIGURATION ===
  network: {
    name: "base-mainnet", 
    chainId: 8453,
    rpcUrl: process.env.BASE_MAINNET_RPC_URL,
    blockExplorer: "https://basescan.org"
  },

  // === CONTRACT ADDRESSES ===
  externalContracts: {
    // Base Mainnet USDC (6 decimals)
    usdcToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    
    // Deploy these first, then update addresses
    feeManager: "", // Deploy FeeManager first
    poolManager: "", // Deploy PoolManager first
    monitoringManager: "", // Optional - can be zero address
    securityManager: "", // Optional - can be zero address
  },

  // === ECONOMIC PARAMETERS ===
  parameters: {
    // Minimum price for any answer (6 decimals = USDC)
    minimumPrice: "1000000", // 1 USDC (prevent spam)
    
    // Fee to create a new opinion
    questionCreationFee: "1000000", // 1 USDC (quality filter)
    
    // Starting price for initial answers
    initialAnswerPrice: "1000000", // 1 USDC (meaningful stakes)
    
    // Maximum price change percentage (300 = 300%)
    absoluteMaxPriceChange: "300",
    
    // Max trades per block (5 = light rate limiting)
    maxTradesPerBlock: "5",
    
    // Enable public opinion creation
    isPublicCreationEnabled: true
  },

  // === ACCESS CONTROL ===
  roles: {
    // Treasury address for fee collection (Gnosis Safe)
    // This address will receive all fees from the platform
    treasury: "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d", // MAINNET Treasury Safe
    
    // Admin address (Gnosis Safe) - This is your dApp Admin
    // This address controls all contract parameters, upgrades, and admin functions
    admin: "0xd903412900e87D71BF3A420cc57757E86326B1C8", // MAINNET Admin Safe
    
    // Moderator addresses (can be same as admin initially)
    // These addresses can moderate content (deactivate/reactivate opinions)
    moderators: [
      "0xd903412900e87D71BF3A420cc57757E86326B1C8"  // Use same Admin Safe for moderation
    ]
  },

  // === CONTENT CONFIGURATION ===
  contentLimits: {
    // These are constants set at deployment time
    maxQuestionLength: 100,
    maxAnswerLength: 100, 
    maxDescriptionLength: 200,
    maxLinkLength: 500,
    maxIpfsHashLength: 68,
    maxCategoriesPerOpinion: 3,
    
    // Price ranges
    minInitialPrice: "1000000", // 1 USDC
    maxInitialPrice: "100000000" // 100 USDC
  },

  // === INITIAL CATEGORIES ===
  categories: [
    "Crypto",
    "Politics", 
    "Science",
    "Technology",
    "Sports",
    "Entertainment",
    "Culture",
    "Web3",
    "Social Media",
    "Other"
  ],

  // === DEPLOYMENT SETTINGS ===
  deployment: {
    // Gas settings for Base mainnet
    gasPrice: "1000000000", // 1 gwei (Base has low fees)
    gasLimit: "3000000",
    
    // Verification settings
    verify: true,
    
    // Use proxy pattern for upgradeability
    useProxy: true,
    
    // Wait for confirmations
    confirmations: 3
  }
};

// === VALIDATION FUNCTIONS ===
function validateConfig() {
  const errors = [];
  
  // Check required addresses
  if (!DEPLOYMENT_CONFIG.externalContracts.usdcToken) {
    errors.push("USDC token address required");
  }
  
  if (!DEPLOYMENT_CONFIG.roles.treasury) {
    errors.push("Treasury address required");
  }
  
  if (!DEPLOYMENT_CONFIG.roles.admin) {
    errors.push("Admin address required");  
  }
  
  // Check economic parameters
  const params = DEPLOYMENT_CONFIG.parameters;
  if (parseInt(params.minimumPrice) < 100000) { // 0.1 USDC minimum
    errors.push("minimumPrice too low (should be >= 0.1 USDC)");
  }
  
  if (parseInt(params.questionCreationFee) < 500000) { // 0.5 USDC minimum  
    errors.push("questionCreationFee too low (should be >= 0.5 USDC)");
  }
  
  if (parseInt(params.absoluteMaxPriceChange) > 1000) { // 1000% max
    errors.push("absoluteMaxPriceChange too high (should be <= 1000%)");
  }
  
  if (errors.length > 0) {
    console.error("❌ Configuration errors:");
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
  
  console.log("✅ Configuration validation passed");
}

module.exports = {
  DEPLOYMENT_CONFIG,
  validateConfig
};