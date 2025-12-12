// Simple Mainnet Deployment Script (No Proxy)
// For testing if contracts can be deployed without upgradeable proxy

const { ethers } = require("hardhat");
const { DEPLOYMENT_CONFIG, validateConfig } = require("./mainnet-deploy-config");

async function main() {
  console.log("🚀 Simple Mainnet Deployment (No Proxy)");
  console.log("=".repeat(50));

  validateConfig();
  
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying from: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH`);

  const config = DEPLOYMENT_CONFIG;

  try {
    // Step 1: Deploy FeeManager (simple, no proxy)
    console.log("\n🏦 Step 1: FeeManager Deployment (No Proxy)");
    const FeeManager = await ethers.getContractFactory("FeeManager");
    const feeManager = await FeeManager.deploy();
    await feeManager.waitForDeployment();
    const feeManagerAddress = await feeManager.getAddress();
    console.log(`   ✅ FeeManager deployed: ${feeManagerAddress}`);
    
    // Initialize FeeManager
    await feeManager.initialize(
      config.externalContracts.usdcToken,
      config.roles.treasury
    );
    console.log(`   ✅ FeeManager initialized`);

    // Step 2: Deploy PoolManager (simple, no proxy)  
    console.log("\n🏊 Step 2: PoolManager Deployment (No Proxy)");
    const PoolManager = await ethers.getContractFactory("PoolManager");
    const poolManager = await PoolManager.deploy();
    await poolManager.waitForDeployment();
    const poolManagerAddress = await poolManager.getAddress();
    console.log(`   ✅ PoolManager deployed: ${poolManagerAddress}`);
    
    // Initialize PoolManager
    await poolManager.initialize(
      "0x0000000000000000000000000000000000000000", // OpinionCore - will update
      feeManagerAddress,
      config.externalContracts.usdcToken,
      config.roles.treasury,
      config.roles.admin
    );
    console.log(`   ✅ PoolManager initialized`);

    // Step 3: Try to deploy OpinionCoreSimplified (simple, no proxy)
    console.log("\n🎯 Step 3: OpinionCoreSimplified Deployment (No Proxy)");
    
    try {
      const OpinionCoreSimplified = await ethers.getContractFactory("OpinionCoreSimplified");
      const opinionCore = await OpinionCoreSimplified.deploy();
      await opinionCore.waitForDeployment();
      const opinionCoreAddress = await opinionCore.getAddress();
      console.log(`   ✅ OpinionCoreSimplified deployed: ${opinionCoreAddress}`);
      
      // Initialize OpinionCoreSimplified
      await opinionCore.initialize(
        config.externalContracts.usdcToken,
        "0x0000000000000000000000000000000000000000", // _opinionMarket
        feeManagerAddress,
        poolManagerAddress,
        "0x0000000000000000000000000000000000000000", // _monitoringManager
        "0x0000000000000000000000000000000000000000", // _securityManager
        config.roles.treasury
      );
      console.log(`   ✅ OpinionCoreSimplified initialized`);

      // Update PoolManager with OpinionCore address
      console.log("\n🔄 Step 4: Updating PoolManager Configuration");
      await poolManager.setOpinionCore(opinionCoreAddress);
      console.log("   ✅ PoolManager updated with OpinionCore address");

      // Grant roles
      console.log("\n🔐 Step 5: Setting up roles");
      const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
      await opinionCore.grantRole(POOL_MANAGER_ROLE, poolManagerAddress);
      console.log("   ✅ Granted POOL_MANAGER_ROLE to PoolManager");

      // Save deployment results
      const deploymentResults = {
        network: "base-mainnet",
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
          opinionCore: opinionCoreAddress,
          feeManager: feeManagerAddress,
          poolManager: poolManagerAddress,
          treasury: config.roles.treasury,
          admin: config.roles.admin,
          usdc: config.externalContracts.usdcToken
        }
      };

      const fs = require('fs');
      fs.writeFileSync(
        'mainnet-deployment-simple.json', 
        JSON.stringify(deploymentResults, null, 2)
      );

      console.log("\n" + "=".repeat(50));
      console.log("🎉 SIMPLE DEPLOYMENT SUCCESSFUL!");
      console.log("=".repeat(50));
      console.log(`\n📊 Deployed Contracts:`);
      console.log(`   OpinionCoreSimplified: ${opinionCoreAddress}`);
      console.log(`   FeeManager: ${feeManagerAddress}`);
      console.log(`   PoolManager: ${poolManagerAddress}`);
      console.log(`\n⚠️  NOTE: These contracts are NOT upgradeable (no proxy)`);
      console.log(`\n💾 Deployment saved to: mainnet-deployment-simple.json`);

    } catch (error) {
      console.log(`   ❌ OpinionCoreSimplified deployment failed: ${error.message}`);
      console.log(`   Likely still too large for mainnet`);

      // Try with a different contract or approach
      console.log(`\n🔧 Attempting alternative: Check existing working contracts`);
      console.log(`   Use existing contracts that are already deployed:`);
      console.log(`   FeeManager: ${feeManagerAddress}`);
      console.log(`   PoolManager: ${poolManagerAddress}`);
      
      const simpleResults = {
        network: "base-mainnet",
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        status: "partial",
        working_contracts: {
          feeManager: feeManagerAddress,
          poolManager: poolManagerAddress,
          treasury: config.roles.treasury,
          admin: config.roles.admin,
          usdc: config.externalContracts.usdcToken
        },
        error: "OpinionCore too large for mainnet deployment"
      };

      const fs = require('fs');
      fs.writeFileSync(
        'mainnet-deployment-partial.json', 
        JSON.stringify(simpleResults, null, 2)
      );

      console.log(`   💾 Partial deployment saved to: mainnet-deployment-partial.json`);
    }

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  }
}

main().catch(console.error);