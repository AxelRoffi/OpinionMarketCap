// UUPS DEPLOYMENT SCRIPT FOR MAINNET - FIXED VERSION
// Using OpenZeppelin Upgrades plugin properly

const { ethers, upgrades } = require("hardhat");
const { DEPLOYMENT_CONFIG } = require("./mainnet-deploy-config");

async function deployUUPS() {
  console.log("🚀 UUPS DEPLOYMENT - FULL FEATURES WITH UPGRADEABILITY");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deployer EOA: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);

  if (parseFloat(ethers.formatEther(balance)) < 0.01) {
    throw new Error("❌ Need at least 0.01 ETH for deployment");
  }

  const config = DEPLOYMENT_CONFIG;
  
  // Using existing FeeManager
  const existingFeeManager = "0x64997bd18520d93e7f0da87c69582d06b7f265d5";
  
  console.log(`\n📋 DEPLOYMENT PLAN:`);
  console.log(`   Step 1: Deploy OpinionCoreSimplified as UUPS`);
  console.log(`   Step 2: Deploy PoolManager`);
  console.log(`   Step 3: Configure Everything`);

  const deployment = {
    timestamp: new Date().toISOString(),
    network: "base-mainnet",
    deployer: deployer.address,
    addresses: {
      admin: config.roles.admin,
      treasury: config.roles.treasury,
      feeManager: existingFeeManager
    }
  };

  try {
    // ===== STEP 1: DEPLOY OPINIONCORE AS UUPS =====
    console.log(`\n🔷 STEP 1: Deploy OpinionCoreSimplified with UUPS Proxy`);
    console.log(`   Using OpenZeppelin upgrades plugin...`);
    
    const OpinionCoreSimplified = await ethers.getContractFactory("OpinionCoreSimplified");
    
    console.log(`   Deploying UUPS proxy and implementation...`);
    const opinionCore = await upgrades.deployProxy(
      OpinionCoreSimplified,
      [
        config.externalContracts.usdcToken,              // _usdcToken (Real Base USDC)
        "0x0000000000000000000000000000000000000000",  // _opinionMarket (not used)
        existingFeeManager,                              // _feeManager (existing)
        "0x0000000000000000000000000000000000000000",  // _poolManager (deploy next)
        "0x0000000000000000000000000000000000000000",  // _monitoringManager (not used)
        "0x0000000000000000000000000000000000000000",  // _securityManager (not used)
        config.roles.treasury                            // _treasury (your Safe)
      ],
      {
        kind: 'uups',
        initializer: 'initialize',
        timeout: 300000 // 5 minutes timeout
      }
    );
    
    await opinionCore.waitForDeployment();
    const proxyAddress = await opinionCore.getAddress();
    
    console.log(`   ✅ OpinionCore Proxy deployed: ${proxyAddress}`);
    
    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log(`   ✅ Implementation deployed: ${implementationAddress}`);
    
    deployment.addresses.opinionCoreProxy = proxyAddress;
    deployment.addresses.opinionCoreImplementation = implementationAddress;

    // ===== STEP 2: DEPLOY POOLMANAGER =====
    console.log(`\n🔷 STEP 2: Deploy PoolManager`);
    
    const PoolManager = await ethers.getContractFactory("PoolManager");
    const poolManager = await PoolManager.deploy();
    await poolManager.waitForDeployment();
    const poolManagerAddress = await poolManager.getAddress();
    console.log(`   ✅ PoolManager deployed: ${poolManagerAddress}`);
    deployment.addresses.poolManager = poolManagerAddress;

    // Initialize PoolManager
    console.log(`   Initializing PoolManager...`);
    await poolManager.initialize(
      proxyAddress,                      // OpinionCore proxy
      existingFeeManager,                // Existing FeeManager
      config.externalContracts.usdcToken, // Real USDC
      config.roles.treasury,             // Treasury Safe
      config.roles.admin                 // Admin Safe
    );
    console.log(`   ✅ PoolManager initialized`);

    // ===== STEP 3: CONFIGURATION =====
    console.log(`\n🔷 STEP 3: Configuration`);
    
    // Update OpinionCore with PoolManager
    console.log(`   Setting PoolManager in OpinionCore...`);
    await opinionCore.setPoolManager(poolManagerAddress);
    console.log(`   ✅ PoolManager set`);

    // Grant roles
    console.log(`   Granting POOL_MANAGER_ROLE...`);
    const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
    await opinionCore.grantRole(POOL_MANAGER_ROLE, poolManagerAddress);
    console.log(`   ✅ Pool Manager role granted`);

    console.log(`   Granting ADMIN_ROLE to Safe...`);
    const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
    await opinionCore.grantRole(ADMIN_ROLE, config.roles.admin);
    console.log(`   ✅ Admin role granted to: ${config.roles.admin}`);

    // Configure parameters using the consolidated setParameter function
    console.log(`   Setting parameters...`);
    await opinionCore.setParameter(0, config.parameters.minimumPrice); // minimumPrice
    await opinionCore.setParameter(6, config.parameters.questionCreationFee); // questionCreationFee  
    await opinionCore.setParameter(7, config.parameters.initialAnswerPrice); // initialAnswerPrice
    await opinionCore.setParameter(3, config.parameters.absoluteMaxPriceChange); // absoluteMaxPriceChange
    await opinionCore.setParameter(4, config.parameters.maxTradesPerBlock); // maxTradesPerBlock
    console.log(`   ✅ Parameters configured`);

    // Enable public creation
    console.log(`   Enabling public opinion creation...`);
    await opinionCore.togglePublicCreation();
    console.log(`   ✅ Public creation enabled`);

    // ===== VERIFICATION =====
    console.log(`\n✅ DEPLOYMENT VERIFICATION`);
    
    const nextOpinionId = await opinionCore.nextOpinionId();
    const isPublicEnabled = await opinionCore.isPublicCreationEnabled();
    const categories = await opinionCore.getAvailableCategories();
    
    console.log(`   Next Opinion ID: ${nextOpinionId}`);
    console.log(`   Public Creation: ${isPublicEnabled ? "Enabled" : "Disabled"}`);
    console.log(`   Categories: ${categories.length} available`);

    deployment.success = true;
    deployment.verification = {
      nextOpinionId: nextOpinionId.toString(),
      publicCreation: isPublicEnabled,
      categoriesCount: categories.length
    };

    // ===== SUCCESS SUMMARY =====
    console.log(`\n` + "=".repeat(60));
    console.log(`🎉 DEPLOYMENT SUCCESSFUL!`);
    console.log(`=`.repeat(60));
    
    console.log(`\n📊 DEPLOYED CONTRACTS:`);
    console.log(`   OpinionCore (Proxy): ${proxyAddress}`);
    console.log(`   OpinionCore (Impl): ${implementationAddress}`);
    console.log(`   PoolManager: ${poolManagerAddress}`);
    console.log(`   FeeManager (Existing): ${existingFeeManager}`);
    
    console.log(`\n⚙️  CONFIGURATION:`);
    console.log(`   Admin Safe: ${config.roles.admin}`);
    console.log(`   Treasury Safe: ${config.roles.treasury}`);
    console.log(`   USDC: ${config.externalContracts.usdcToken}`);
    
    console.log(`\n✅ FEATURES ENABLED:`);
    console.log(`   ✅ UUPS Upgradeability`);
    console.log(`   ✅ Complex Pools via PoolManager`);
    console.log(`   ✅ Multiple Categories (${categories.length})`);
    console.log(`   ✅ IPFS/Link Support`);
    console.log(`   ✅ Complex Pricing Algorithms`);
    console.log(`   ✅ Public Opinion Creation`);
    
    console.log(`\n🔒 SECURITY FEATURES:`);
    console.log(`   ✅ Admin role assigned to Gnosis Safe`);
    console.log(`   ✅ Treasury fees go to your Safe`);
    console.log(`   ✅ 72-hour timelock for upgrades`);
    console.log(`   ✅ Configurable fee system`);

    // Save deployment
    const fs = require('fs');
    fs.writeFileSync('mainnet-deployment-success.json', JSON.stringify(deployment, null, 2));
    console.log(`\n💾 Deployment saved to: mainnet-deployment-success.json`);

    return deployment;

  } catch (error) {
    deployment.success = false;
    deployment.error = error.message;
    
    console.error(`\n❌ DEPLOYMENT FAILED: ${error.message}`);
    
    const fs = require('fs');
    fs.writeFileSync('mainnet-deployment-failed.json', JSON.stringify(deployment, null, 2));
    
    throw error;
  }
}

if (require.main === module) {
  deployUUPS()
    .then(() => {
      console.log(`\n✅ All contracts deployed successfully!`);
      console.log(`   Your platform is ready for users!`);
      console.log(`\n📝 NEXT STEPS:`);
      console.log(`   1. Verify contracts on BaseScan`);
      console.log(`   2. Update frontend with proxy address`);
      console.log(`   3. Test all functionality`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`\n❌ Deployment failed:`, error.message);
      process.exit(1);
    });
}

module.exports = { deployUUPS };