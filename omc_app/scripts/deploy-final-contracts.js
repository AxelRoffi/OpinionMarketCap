// FINAL DEPLOYMENT: Only deploy what's missing
// Uses existing FeeManager: 0x64997bd18520d93e7f0da87c69582d06b7f265d5

const { ethers, upgrades } = require("hardhat");
const { DEPLOYMENT_CONFIG } = require("./mainnet-deploy-config");

async function deployFinalContracts() {
  console.log("🚀 FINAL DEPLOYMENT: Only Missing Contracts");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying from: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);

  if (parseFloat(ethers.formatEther(balance)) < 0.008) {
    throw new Error("❌ Insufficient funds! Need at least 0.008 ETH");
  }

  const config = DEPLOYMENT_CONFIG;
  const existingFeeManager = "0x64997bd18520d93e7f0da87c69582d06b7f265d5";
  
  console.log(`\n📋 DEPLOYMENT PLAN:`);
  console.log(`   Existing FeeManager: ${existingFeeManager} ✅`);
  console.log(`   Deploy: PoolManager → OpinionCoreSimplified`);

  const results = {
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    reused: {
      feeManager: existingFeeManager
    },
    deployed: {}
  };

  try {
    // ===== STEP 1: DEPLOY POOLMANAGER =====
    console.log(`\n🏊 STEP 1: Deploying PoolManager`);
    console.log(`   Connecting to FeeManager: ${existingFeeManager}`);
    
    const PoolManager = await ethers.getContractFactory("PoolManager");
    
    console.log(`   Creating proxy deployment...`);
    const poolManager = await upgrades.deployProxy(
      PoolManager, 
      [
        "0x0000000000000000000000000000000000000000", // OpinionCore - will update later
        existingFeeManager,                              // Existing FeeManager
        config.externalContracts.usdcToken,             // Real USDC
        config.roles.treasury,                           // Treasury Safe
        config.roles.admin                               // Admin Safe
      ],
      { 
        initializer: 'initialize',
        timeout: 300000, // 5 minutes
        confirmations: 2
      }
    );
    
    console.log(`   Waiting for deployment...`);
    await poolManager.waitForDeployment();
    const poolManagerAddress = await poolManager.getAddress();
    
    console.log(`   ✅ PoolManager deployed: ${poolManagerAddress}`);
    results.deployed.poolManager = poolManagerAddress;

    // ===== STEP 2: DEPLOY OPINIONCORE =====
    console.log(`\n🎯 STEP 2: Deploying OpinionCoreSimplified`);
    console.log(`   Size limit: 24KB - using simplified version`);
    
    const OpinionCore = await ethers.getContractFactory("OpinionCoreSimplified");
    
    console.log(`   Creating proxy deployment...`);
    const opinionCore = await upgrades.deployProxy(
      OpinionCore,
      [
        config.externalContracts.usdcToken,             // Real USDC
        "0x0000000000000000000000000000000000000000", // OpinionMarket (not needed)
        existingFeeManager,                             // Existing FeeManager  
        poolManagerAddress,                             // New PoolManager
        "0x0000000000000000000000000000000000000000", // MonitoringManager (not needed)
        "0x0000000000000000000000000000000000000000", // SecurityManager (not needed)
        config.roles.treasury                           // Treasury Safe
      ],
      { 
        initializer: 'initialize',
        timeout: 300000, // 5 minutes
        confirmations: 2,
        gasLimit: 5000000 // Higher gas limit for large contract
      }
    );
    
    console.log(`   Waiting for deployment...`);
    await opinionCore.waitForDeployment();
    const opinionCoreAddress = await opinionCore.getAddress();
    
    console.log(`   ✅ OpinionCoreSimplified deployed: ${opinionCoreAddress}`);
    results.deployed.opinionCore = opinionCoreAddress;

    // ===== STEP 3: CONNECT CONTRACTS =====
    console.log(`\n🔗 STEP 3: Connecting Contracts`);
    
    // Update PoolManager with OpinionCore address
    console.log(`   Connecting PoolManager to OpinionCore...`);
    await poolManager.setOpinionCore(opinionCoreAddress);
    console.log(`   ✅ PoolManager connected`);
    
    // Grant PoolManager role to PoolManager contract
    console.log(`   Granting POOL_MANAGER_ROLE...`);
    const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
    await opinionCore.grantRole(POOL_MANAGER_ROLE, poolManagerAddress);
    console.log(`   ✅ Role granted`);
    
    // Grant admin role to Safe wallet
    console.log(`   Granting ADMIN_ROLE to Safe...`);
    const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
    await opinionCore.grantRole(ADMIN_ROLE, config.roles.admin);
    console.log(`   ✅ Admin role granted to: ${config.roles.admin}`);

    // ===== STEP 4: CONFIGURE PARAMETERS =====
    console.log(`\n⚙️  STEP 4: Configuring Parameters`);
    
    console.log(`   Setting economic parameters...`);
    await opinionCore.setMinimumPrice(config.parameters.minimumPrice);
    await opinionCore.setQuestionCreationFee(config.parameters.questionCreationFee);
    await opinionCore.setInitialAnswerPrice(config.parameters.initialAnswerPrice);
    await opinionCore.setMaxPriceChange(config.parameters.absoluteMaxPriceChange);
    await opinionCore.setMaxTradesPerBlock(config.parameters.maxTradesPerBlock);
    console.log(`   ✅ Economic parameters set`);
    
    if (config.parameters.isPublicCreationEnabled) {
      console.log(`   Enabling public creation...`);
      await opinionCore.togglePublicCreation();
      console.log(`   ✅ Public creation enabled`);
    }

    // ===== STEP 5: FINAL VERIFICATION =====
    console.log(`\n✅ STEP 5: Final Verification`);
    
    // Test basic functionality
    const nextOpinionId = await opinionCore.nextOpinionId();
    const usdcToken = await opinionCore.usdcToken();
    const treasury = await opinionCore.treasury();
    const isPublic = await opinionCore.isPublicCreationEnabled();
    
    console.log(`   Next Opinion ID: ${nextOpinionId}`);
    console.log(`   USDC Token: ${usdcToken}`);
    console.log(`   Treasury: ${treasury}`);
    console.log(`   Public Creation: ${isPublic}`);

    // Verify connections
    const poolFeeManager = await poolManager.feeManager();
    const poolOpinionCore = await poolManager.opinionCore();
    
    console.log(`   Pool → FeeManager: ${poolFeeManager === existingFeeManager ? '✅' : '❌'}`);
    console.log(`   Pool → OpinionCore: ${poolOpinionCore === opinionCoreAddress ? '✅' : '❌'}`);

    // ===== SUCCESS SUMMARY =====
    results.success = true;
    results.configuration = {
      treasury: config.roles.treasury,
      admin: config.roles.admin,
      usdc: config.externalContracts.usdcToken,
      publicCreation: isPublic,
      nextOpinionId: nextOpinionId.toString()
    };

    console.log(`\n` + "=".repeat(60));
    console.log(`🎉 DEPLOYMENT SUCCESSFUL!`);
    console.log(`=`.repeat(60));
    
    console.log(`\n📊 CONTRACT ADDRESSES:`);
    console.log(`   FeeManager (REUSED): ${existingFeeManager}`);
    console.log(`   PoolManager (NEW): ${poolManagerAddress}`);
    console.log(`   OpinionCore (NEW): ${opinionCoreAddress}`);
    
    console.log(`\n⚙️  CONFIGURATION:`);
    console.log(`   Treasury: ${config.roles.treasury}`);
    console.log(`   Admin: ${config.roles.admin}`);
    console.log(`   USDC: ${config.externalContracts.usdcToken}`);
    console.log(`   Public Creation: ${isPublic ? 'Enabled' : 'Disabled'}`);
    
    console.log(`\n💰 COST SAVINGS:`);
    console.log(`   Reused FeeManager: SAVED ~$8-12`);
    console.log(`   Total deployment: ~$16 (vs $50+ for full new deployment)`);

    // Save results
    const fs = require('fs');
    fs.writeFileSync('final-deployment-success.json', JSON.stringify(results, null, 2));
    console.log(`\n💾 Deployment saved to: final-deployment-success.json`);

    return results;

  } catch (error) {
    results.success = false;
    results.error = error.message;
    
    console.error(`\n❌ DEPLOYMENT FAILED: ${error.message}`);
    
    // Save failure info
    const fs = require('fs');
    fs.writeFileSync('final-deployment-failed.json', JSON.stringify(results, null, 2));
    
    throw error;
  }
}

if (require.main === module) {
  deployFinalContracts()
    .then(() => {
      console.log(`\n✅ All contracts deployed successfully!`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`\n❌ Deployment failed:`, error.message);
      process.exit(1);
    });
}

module.exports = { deployFinalContracts };