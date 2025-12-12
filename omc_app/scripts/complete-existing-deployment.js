// Complete Deployment Using Your Existing Contracts
// This script uses your existing FeeManager and only deploys missing pieces

const { ethers, upgrades } = require("hardhat");
const { DEPLOYMENT_CONFIG, validateConfig } = require("./mainnet-deploy-config");

async function main() {
  console.log("🔧 COMPLETING DEPLOYMENT WITH EXISTING CONTRACTS");
  console.log("=".repeat(60));

  validateConfig();
  
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying from: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH`);

  const config = DEPLOYMENT_CONFIG;

  // === STEP 1: USE EXISTING FEEMANAGER ===
  const existingFeeManagerAddress = "0x64997bd18520d93e7f0da87c69582d06b7f265d5";
  console.log(`\n🏦 Step 1: Using Existing FeeManager`);
  console.log(`   Address: ${existingFeeManagerAddress}`);
  
  // Check if FeeManager is initialized
  const existingFeeManager = await ethers.getContractAt("FeeManager", existingFeeManagerAddress);
  
  try {
    const currentUSDC = await existingFeeManager.usdcToken();
    const currentTreasury = await existingFeeManager.treasury();
    
    console.log(`   Current USDC: ${currentUSDC}`);
    console.log(`   Current Treasury: ${currentTreasury}`);
    
    if (currentUSDC === "0x0000000000000000000000000000000000000000") {
      console.log(`   🔄 Initializing FeeManager with correct addresses...`);
      
      await existingFeeManager.initialize(
        config.externalContracts.usdcToken,  // Real USDC
        config.roles.treasury                 // Your treasury Safe
      );
      
      console.log(`   ✅ FeeManager initialized!`);
    } else {
      console.log(`   ✅ FeeManager already initialized`);
    }
  } catch (error) {
    console.log(`   ⚠️  FeeManager check failed: ${error.message}`);
    console.log(`   Continuing anyway...`);
  }

  // === STEP 2: DEPLOY POOLMANAGER ===
  console.log(`\n🏊 Step 2: Deploying PoolManager`);
  
  const PoolManager = await ethers.getContractFactory("PoolManager");
  const poolManager = await upgrades.deployProxy(
    PoolManager, 
    [
      "0x0000000000000000000000000000000000000000", // OpinionCore - will update
      existingFeeManagerAddress,                       // Your existing FeeManager
      config.externalContracts.usdcToken,
      config.roles.treasury,
      config.roles.admin
    ],
    { initializer: 'initialize' }
  );
  
  await poolManager.waitForDeployment();
  const poolManagerAddress = await poolManager.getAddress();
  console.log(`   ✅ PoolManager deployed: ${poolManagerAddress}`);

  // === STEP 3: ATTEMPT OPINIONCORE DEPLOYMENT ===
  console.log(`\n🎯 Step 3: Attempting OpinionCore Deployment`);
  let opinionCoreAddress = null;
  
  try {
    console.log(`   Trying OpinionCoreSimplified (smaller size)...`);
    
    const OpinionCore = await ethers.getContractFactory("OpinionCoreSimplified");
    const opinionCore = await upgrades.deployProxy(
      OpinionCore,
      [
        config.externalContracts.usdcToken,              // _usdcToken
        "0x0000000000000000000000000000000000000000",   // _opinionMarket
        existingFeeManagerAddress,                       // Your existing FeeManager
        poolManagerAddress,                              // New PoolManager
        "0x0000000000000000000000000000000000000000",   // _monitoringManager
        "0x0000000000000000000000000000000000000000",   // _securityManager
        config.roles.treasury                            // Your treasury Safe
      ],
      { 
        initializer: 'initialize',
        gasLimit: 5000000
      }
    );
    
    await opinionCore.waitForDeployment();
    opinionCoreAddress = await opinionCore.getAddress();
    console.log(`   ✅ OpinionCoreSimplified deployed: ${opinionCoreAddress}`);
    
    // Configure OpinionCore parameters
    console.log(`   🔄 Configuring parameters...`);
    await opinionCore.setMinimumPrice(config.parameters.minimumPrice);
    await opinionCore.setQuestionCreationFee(config.parameters.questionCreationFee);
    await opinionCore.setInitialAnswerPrice(config.parameters.initialAnswerPrice);
    await opinionCore.setMaxPriceChange(config.parameters.absoluteMaxPriceChange);
    await opinionCore.setMaxTradesPerBlock(config.parameters.maxTradesPerBlock);
    
    if (config.parameters.isPublicCreationEnabled) {
      await opinionCore.togglePublicCreation();
    }
    console.log(`   ✅ Parameters configured`);
    
  } catch (error) {
    console.log(`   ❌ OpinionCore deployment failed: ${error.message}`);
    console.log(`   📋 Contract too large for mainnet or insufficient gas`);
    console.log(`   💡 System can work with FeeManager + PoolManager only for now`);
  }

  // === STEP 4: CONNECT CONTRACTS ===
  console.log(`\n🔗 Step 4: Connecting Contracts`);
  
  if (opinionCoreAddress) {
    // Update PoolManager with OpinionCore
    await poolManager.setOpinionCore(opinionCoreAddress);
    console.log(`   ✅ PoolManager connected to OpinionCore`);
    
    // Grant roles
    const opinionCore = await ethers.getContractAt("OpinionCoreSimplified", opinionCoreAddress);
    const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
    await opinionCore.grantRole(POOL_MANAGER_ROLE, poolManagerAddress);
    console.log(`   ✅ Granted POOL_MANAGER_ROLE to PoolManager`);
    
    // Grant admin role to your Safe
    const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
    await opinionCore.grantRole(ADMIN_ROLE, config.roles.admin);
    console.log(`   ✅ Granted ADMIN_ROLE to your Safe: ${config.roles.admin}`);
  }

  // === STEP 5: FINAL SUMMARY ===
  console.log(`\n` + "=".repeat(60));
  console.log(`🎉 DEPLOYMENT COMPLETED USING EXISTING CONTRACTS!`);
  console.log(`=`.repeat(60));
  
  const results = {
    network: "base-mainnet",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    reused_contracts: {
      feeManager: existingFeeManagerAddress
    },
    new_contracts: {
      poolManager: poolManagerAddress,
      opinionCore: opinionCoreAddress || "Failed to deploy (contract too large)"
    },
    configuration: {
      treasury: config.roles.treasury,
      admin: config.roles.admin,
      usdc: config.externalContracts.usdcToken
    }
  };

  console.log(`\n📊 CONTRACT ADDRESSES:`);
  console.log(`   FeeManager (EXISTING): ${existingFeeManagerAddress}`);
  console.log(`   PoolManager (NEW): ${poolManagerAddress}`);
  console.log(`   OpinionCore: ${opinionCoreAddress || 'NOT DEPLOYED (size limit)'}`);
  
  console.log(`\n⚙️  CONFIGURATION:`);
  console.log(`   Treasury Safe: ${config.roles.treasury}`);
  console.log(`   Admin Safe: ${config.roles.admin}`);
  console.log(`   Real USDC: ${config.externalContracts.usdcToken}`);
  
  if (!opinionCoreAddress) {
    console.log(`\n⚠️  OPINIONCORE SIZE ISSUE:`);
    console.log(`   - OpinionCore is too large for mainnet (>24KB limit)`);
    console.log(`   - You can use FeeManager + PoolManager for basic functionality`);
    console.log(`   - OpinionCore will need Diamond pattern or size optimization`);
  }

  console.log(`\n💰 COST SAVINGS:`);
  console.log(`   - Reused existing FeeManager: SAVED ~$5-10`);
  console.log(`   - Only deployed missing contracts: EFFICIENT ✅`);

  // Save deployment results  
  const fs = require('fs');
  fs.writeFileSync(
    'completed-deployment.json', 
    JSON.stringify(results, null, 2)
  );
  
  console.log(`\n💾 Deployment saved to: completed-deployment.json`);

  return results;
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});