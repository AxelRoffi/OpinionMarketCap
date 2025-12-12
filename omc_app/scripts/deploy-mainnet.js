// OpinionMarketCap Mainnet Deployment Script
// Run with: npx hardhat run scripts/deploy-mainnet.js --network base-mainnet

const { ethers, upgrades } = require("hardhat");
const { DEPLOYMENT_CONFIG, validateConfig } = require("./mainnet-deploy-config");

async function main() {
  console.log("🚀 Starting OpinionMarketCap Mainnet Deployment");
  console.log("=".repeat(50));

  console.log("⚙️  Validating configuration...");
  // Validate configuration
  validateConfig();
  console.log("✅ Configuration validated successfully");

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying from: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  Low ETH balance detected. Recommended minimum: 0.05 ETH");
    console.log("   Continuing with reduced balance...");
  }

  const config = DEPLOYMENT_CONFIG;
  let deploymentResults = {};

  console.log("\n📋 Deployment Configuration:");
  console.log(`   Network: ${config.network.name}`);  
  console.log(`   USDC Token: ${config.externalContracts.usdcToken}`);
  console.log(`   Treasury: ${config.roles.treasury}`);
  console.log(`   Admin: ${config.roles.admin}`);
  console.log(`   Question Creation Fee: ${config.parameters.questionCreationFee} (${ethers.formatUnits(config.parameters.questionCreationFee, 6)} USDC)`);
  console.log(`   Minimum Price: ${config.parameters.minimumPrice} (${ethers.formatUnits(config.parameters.minimumPrice, 6)} USDC)`);

  // Step 1: Deploy FeeManager (if not provided)
  console.log("\n🏦 Step 1: FeeManager Deployment");
  let feeManagerAddress = config.externalContracts.feeManager;
  
  if (!feeManagerAddress) {
    console.log("   Deploying new FeeManager...");
    const FeeManager = await ethers.getContractFactory("FeeManager");
    const feeManager = await upgrades.deployProxy(
      FeeManager,
      [
        config.externalContracts.usdcToken,
        config.roles.treasury
      ],
      { initializer: 'initialize' }
    );
    await feeManager.waitForDeployment();
    feeManagerAddress = await feeManager.getAddress();
    console.log(`   ✅ FeeManager deployed: ${feeManagerAddress}`);
    deploymentResults.feeManager = feeManagerAddress;
  } else {
    console.log(`   ✅ Using existing FeeManager: ${feeManagerAddress}`);
  }

  // Step 2: Deploy PoolManager (if not provided) 
  console.log("\n🏊 Step 2: PoolManager Deployment");
  let poolManagerAddress = config.externalContracts.poolManager;
  
  if (!poolManagerAddress) {
    console.log("   Deploying new PoolManager...");
    const PoolManager = await ethers.getContractFactory("PoolManager");
    
    // Note: We'll update the OpinionCore address after deployment
    const poolManager = await upgrades.deployProxy(
      PoolManager, 
      [
        "0x0000000000000000000000000000000000000000", // OpinionCore address - will update
        feeManagerAddress,
        config.externalContracts.usdcToken,
        config.roles.treasury,
        config.roles.admin               // admin address
      ],
      { initializer: 'initialize' }
    );
    await poolManager.waitForDeployment();
    poolManagerAddress = await poolManager.getAddress();
    console.log(`   ✅ PoolManager deployed: ${poolManagerAddress}`);
    deploymentResults.poolManager = poolManagerAddress;
  } else {
    console.log(`   ✅ Using existing PoolManager: ${poolManagerAddress}`);
  }

  // Step 3: Deploy OpinionCore  
  console.log("\n🎯 Step 3: OpinionCore Deployment");
  console.log("   Deploying OpinionCore with proxy...");
  
  const OpinionCore = await ethers.getContractFactory("OpinionCoreSimplified");
  const opinionCore = await upgrades.deployProxy(
    OpinionCore,
    [
      config.externalContracts.usdcToken,                                      // _usdcToken
      "0x0000000000000000000000000000000000000000",                          // _opinionMarket (not needed)
      feeManagerAddress,                                                       // _feeManager  
      poolManagerAddress,                                                      // _poolManager
      "0x0000000000000000000000000000000000000000",                          // _monitoringManager (not needed)
      "0x0000000000000000000000000000000000000000",                          // _securityManager (not needed)
      config.roles.treasury                                                    // _treasury
    ],
    { 
      initializer: 'initialize',
      gasLimit: config.deployment.gasLimit
    }
  );
  
  await opinionCore.waitForDeployment();
  const opinionCoreAddress = await opinionCore.getAddress();
  console.log(`   ✅ OpinionCore deployed: ${opinionCoreAddress}`);
  deploymentResults.opinionCore = opinionCoreAddress;

  // Step 4: Configure Parameters
  console.log("\n⚙️  Step 4: Parameter Configuration");
  
  // Set economic parameters
  console.log("   Setting economic parameters...");
  await opinionCore.setMinimumPrice(config.parameters.minimumPrice);
  await opinionCore.setQuestionCreationFee(config.parameters.questionCreationFee);
  await opinionCore.setInitialAnswerPrice(config.parameters.initialAnswerPrice);
  await opinionCore.setMaxPriceChange(config.parameters.absoluteMaxPriceChange);
  await opinionCore.setMaxTradesPerBlock(config.parameters.maxTradesPerBlock);
  
  // Enable public creation if configured
  if (config.parameters.isPublicCreationEnabled) {
    await opinionCore.togglePublicCreation();
    console.log("   ✅ Public opinion creation enabled");
  }

  // Step 5: Setup Roles
  console.log("\n👥 Step 5: Role Configuration");
  
  const MODERATOR_ROLE = await opinionCore.MODERATOR_ROLE();
  for (const moderator of config.roles.moderators) {
    if (moderator !== deployer.address) {
      await opinionCore.grantRole(MODERATOR_ROLE, moderator);
      console.log(`   ✅ Granted MODERATOR_ROLE to: ${moderator}`);
    }
  }

  // Step 6: Update PoolManager with OpinionCore address
  if (deploymentResults.poolManager) {
    console.log("\n🔄 Step 6: Updating PoolManager Configuration");
    const poolManager = await ethers.getContractAt("PoolManager", poolManagerAddress);
    await poolManager.setOpinionCore(opinionCoreAddress);
    console.log("   ✅ PoolManager updated with OpinionCore address");
  }

  // Step 7: Grant roles to contracts
  console.log("\n🔐 Step 7: Contract Role Setup");
  const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
  await opinionCore.grantRole(POOL_MANAGER_ROLE, poolManagerAddress);
  console.log("   ✅ Granted POOL_MANAGER_ROLE to PoolManager");

  // Step 8: Verification (if enabled)
  if (config.deployment.verify) {
    console.log("\n📋 Step 8: Contract Verification");
    console.log("   Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    try {
      const hardhat = require("hardhat");
      await hardhat.run("verify:verify", {
        address: opinionCoreAddress,
        constructorArguments: []
      });
      console.log("   ✅ OpinionCore verified on BaseScan");
    } catch (error) {
      console.log("   ⚠️  Verification may have failed:", error.message);
    }
  }

  // Final Summary
  console.log("\n" + "=".repeat(50));
  console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(50));
  
  console.log("\n📊 Deployed Contracts:");
  console.log(`   OpinionCore: ${opinionCoreAddress}`);
  console.log(`   FeeManager: ${feeManagerAddress}`);
  console.log(`   PoolManager: ${poolManagerAddress}`);
  
  console.log("\n💰 Configuration Summary:");
  console.log(`   Question Creation Fee: ${ethers.formatUnits(config.parameters.questionCreationFee, 6)} USDC`);
  console.log(`   Minimum Price: ${ethers.formatUnits(config.parameters.minimumPrice, 6)} USDC`);
  console.log(`   Initial Answer Price: ${ethers.formatUnits(config.parameters.initialAnswerPrice, 6)} USDC`);
  console.log(`   Max Price Change: ${config.parameters.absoluteMaxPriceChange}%`);
  console.log(`   Public Creation: ${config.parameters.isPublicCreationEnabled ? 'Enabled' : 'Disabled'}`);
  
  console.log("\n🔧 Admin Functions Available:");
  console.log("   - setMinimumPrice(uint96)");
  console.log("   - setQuestionCreationFee(uint96)"); 
  console.log("   - setInitialAnswerPrice(uint96)");
  console.log("   - setMaxPriceChange(uint256)");
  console.log("   - setMaxTradesPerBlock(uint256)");
  console.log("   - togglePublicCreation()");
  console.log("   - setTreasury(address)");
  
  console.log("\n🚀 Next Steps:");
  console.log("   1. Update frontend with new contract address");
  console.log("   2. Test all functions on mainnet");
  console.log("   3. Announce launch to users");
  console.log("   4. Monitor contract activity");
  
  // Save deployment results
  const fs = require('fs');
  const deploymentData = {
    network: config.network.name,
    timestamp: new Date().toISOString(),
    contracts: deploymentResults,
    configuration: config.parameters,
    deployer: deployer.address
  };
  
  fs.writeFileSync(
    'deployment-mainnet.json', 
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("\n💾 Deployment data saved to deployment-mainnet.json");
}

// Set a timeout for deployment (10 minutes)
const deploymentTimeout = setTimeout(() => {
  console.error("❌ Deployment timed out after 10 minutes");
  process.exit(1);
}, 10 * 60 * 1000);

main()
  .then(() => {
    clearTimeout(deploymentTimeout);
    process.exit(0);
  })
  .catch((error) => {
    clearTimeout(deploymentTimeout);
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });