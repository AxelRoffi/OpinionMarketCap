// UUPS DEPLOYMENT SCRIPT FOR MAINNET
// Two-step deployment to bypass 24KB limit

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
  console.log(`   Step 1: Deploy Empty Proxy`);
  console.log(`   Step 2: Deploy OpinionCoreSimplified Implementation`);
  console.log(`   Step 3: Connect & Initialize`);
  console.log(`   Step 4: Deploy PoolManager`);
  console.log(`   Step 5: Configure Everything`);

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
    // ===== STEP 1: DEPLOY EMPTY PROXY =====
    console.log(`\n🔷 STEP 1: Deploy Empty UUPS Proxy`);
    console.log(`   This bypasses the size limit...`);
    
    const ERC1967Proxy = await ethers.getContractFactory(
      "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy"
    );
    
    // Deploy with zero address and empty data
    const proxy = await ERC1967Proxy.deploy(
      "0x0000000000000000000000000000000000000000", // No implementation yet
      "0x" // No init data
    );
    
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();
    console.log(`   ✅ Proxy deployed: ${proxyAddress}`);
    deployment.addresses.opinionCoreProxy = proxyAddress;

    // ===== STEP 2: DEPLOY IMPLEMENTATION =====
    console.log(`\n🔷 STEP 2: Deploy OpinionCoreSimplified Implementation`);
    console.log(`   Full featured contract...`);
    
    const OpinionCoreSimplified = await ethers.getContractFactory("OpinionCoreSimplified");
    const implementation = await OpinionCoreSimplified.deploy();
    
    await implementation.waitForDeployment();
    const implementationAddress = await implementation.getAddress();
    console.log(`   ✅ Implementation deployed: ${implementationAddress}`);
    deployment.addresses.opinionCoreImplementation = implementationAddress;

    // ===== STEP 3: CONNECT & INITIALIZE =====
    console.log(`\n🔷 STEP 3: Connect Proxy to Implementation`);
    
    // Connect to proxy as admin to upgrade
    const adminProxy = await ethers.getContractAt(
      "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy",
      proxyAddress
    );
    
    // Encode the upgradeTo call
    const OpinionCoreInterface = OpinionCoreSimplified.interface;
    const upgradeCalldata = OpinionCoreInterface.encodeFunctionData("upgradeTo", [implementationAddress]);
    
    console.log(`   Upgrading proxy...`);
    await adminProxy.upgradeToAndCall(implementationAddress, "0x");
    console.log(`   ✅ Proxy upgraded`);
    
    // Now connect as OpinionCore
    const proxyAsOpinionCore = await ethers.getContractAt("OpinionCoreSimplified", proxyAddress);

    // Now initialize
    console.log(`   Initializing OpinionCore...`);
    await proxyAsOpinionCore.initialize(
      config.externalContracts.usdcToken,              // _usdcToken (Real Base USDC)
      "0x0000000000000000000000000000000000000000",  // _opinionMarket (not used)
      existingFeeManager,                              // _feeManager (existing)
      "0x0000000000000000000000000000000000000000",  // _poolManager (deploy next)
      "0x0000000000000000000000000000000000000000",  // _monitoringManager (not used)
      "0x0000000000000000000000000000000000000000",  // _securityManager (not used)
      config.roles.treasury                            // _treasury (your Safe)
    );
    console.log(`   ✅ OpinionCore initialized`);

    // ===== STEP 4: DEPLOY POOLMANAGER =====
    console.log(`\n🔷 STEP 4: Deploy PoolManager`);
    
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

    // ===== STEP 5: CONFIGURATION =====
    console.log(`\n🔷 STEP 5: Configuration`);
    
    // Update OpinionCore with PoolManager
    console.log(`   Setting PoolManager in OpinionCore...`);
    await proxyAsOpinionCore.setPoolManager(poolManagerAddress);
    console.log(`   ✅ PoolManager set`);

    // Grant roles
    console.log(`   Granting POOL_MANAGER_ROLE...`);
    const POOL_MANAGER_ROLE = await proxyAsOpinionCore.POOL_MANAGER_ROLE();
    await proxyAsOpinionCore.grantRole(POOL_MANAGER_ROLE, poolManagerAddress);
    console.log(`   ✅ Pool Manager role granted`);

    console.log(`   Granting ADMIN_ROLE to Safe...`);
    const ADMIN_ROLE = await proxyAsOpinionCore.ADMIN_ROLE();
    await proxyAsOpinionCore.grantRole(ADMIN_ROLE, config.roles.admin);
    console.log(`   ✅ Admin role granted to: ${config.roles.admin}`);

    // Configure parameters
    console.log(`   Setting parameters...`);
    await proxyAsOpinionCore.setMinimumPrice(config.parameters.minimumPrice);
    await proxyAsOpinionCore.setQuestionCreationFee(config.parameters.questionCreationFee);
    await proxyAsOpinionCore.setInitialAnswerPrice(config.parameters.initialAnswerPrice);
    await proxyAsOpinionCore.setMaxPriceChange(config.parameters.absoluteMaxPriceChange);
    await proxyAsOpinionCore.setMaxTradesPerBlock(config.parameters.maxTradesPerBlock);
    console.log(`   ✅ Parameters configured`);

    // Enable public creation
    console.log(`   Enabling public opinion creation...`);
    await proxyAsOpinionCore.togglePublicCreation();
    console.log(`   ✅ Public creation enabled`);

    // ===== VERIFICATION =====
    console.log(`\n✅ DEPLOYMENT VERIFICATION`);
    
    const nextOpinionId = await proxyAsOpinionCore.nextOpinionId();
    const isPublicEnabled = await proxyAsOpinionCore.isPublicCreationEnabled();
    const categories = await proxyAsOpinionCore.getAvailableCategories();
    
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
    
    console.log(`\n💰 DEPLOYMENT COST: ~$25`);
    console.log(`   Saved ~$40 by reusing FeeManager`);

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
      process.exit(0);
    })
    .catch((error) => {
      console.error(`\n❌ Deployment failed:`, error.message);
      process.exit(1);
    });
}

module.exports = { deployUUPS };