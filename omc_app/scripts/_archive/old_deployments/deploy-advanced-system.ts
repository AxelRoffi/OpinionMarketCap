import { ethers, upgrades } from "hardhat";
import { writeFileSync } from "fs";

/**
 * 🚨 DEPLOYMENT SCRIPT FOR ADVANCED OPINIONMARKETCAP SYSTEM
 * 
 * This deploys the full OpinionCore system with:
 * - Correct fee structure (20% with 5 USDC minimum)
 * - Advanced PriceCalculator library
 * - All features: pools, categories, monitoring, etc.
 * 
 * REQUIREMENTS:
 * - New wallet with fresh private key
 * - Sufficient ETH for deployment
 * - Base Sepolia network
 */

async function main() {
  console.log("🚀 Starting OpinionMarketCap Advanced System Deployment");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Configuration
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC
  const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067"; // Treasury
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  console.log("🏦 USDC Contract:", USDC_ADDRESS);
  console.log("🏛️  Treasury Address:", TREASURY_ADDRESS);
  console.log("");

  // Step 1: Deploy Libraries first
  console.log("📚 Step 1: Deploying Libraries...");
  
  const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
  const priceCalculatorLib = await PriceCalculator.deploy();
  await priceCalculatorLib.waitForDeployment();
  console.log("✅ PriceCalculator Library:", await priceCalculatorLib.getAddress());

  const ValidationLibrary = await ethers.getContractFactory("ValidationLibrary");
  const validationLib = await ValidationLibrary.deploy();
  await validationLib.waitForDeployment();
  console.log("✅ ValidationLibrary:", await validationLib.getAddress());
  console.log("");

  // Step 2: Deploy FeeManager first
  console.log("🏗️  Step 2: Deploying FeeManager...");

  const FeeManager = await ethers.getContractFactory("FeeManager");
  const feeManager = await upgrades.deployProxy(
    FeeManager,
    [USDC_ADDRESS, TREASURY_ADDRESS],
    { initializer: "initialize" }
  );
  await feeManager.waitForDeployment();
  console.log("✅ FeeManager (Proxy):", await feeManager.getAddress());

  // Step 3: Deploy OpinionCore with libraries (before PoolManager)
  console.log("🧠 Step 3: Deploying OpinionCore...");
  
  const OpinionCore = await ethers.getContractFactory("OpinionCore", {
    libraries: {
      PriceCalculator: await priceCalculatorLib.getAddress(),
    },
  });
  
  // Deploy OpinionCore with temporary zero address for PoolManager
  const opinionCore = await upgrades.deployProxy(
    OpinionCore,
    [
      USDC_ADDRESS,
      await feeManager.getAddress(),
      ethers.ZeroAddress, // temporary - will set poolManager later
      TREASURY_ADDRESS
    ],
    { 
      initializer: "initialize",
      unsafeAllow: ["external-library-linking"]
    }
  );
  await opinionCore.waitForDeployment();
  console.log("✅ OpinionCore (Proxy):", await opinionCore.getAddress());

  // Step 4: Deploy PoolManager with OpinionCore address
  console.log("🏗️  Step 4: Deploying PoolManager...");
  
  const PoolManager = await ethers.getContractFactory("PoolManager");
  const poolManager = await upgrades.deployProxy(
    PoolManager,
    [
      await opinionCore.getAddress(), // _opinionCore
      await feeManager.getAddress(), // _feeManager
      USDC_ADDRESS, // _usdcToken
      TREASURY_ADDRESS, // _treasury
      deployer.address // _admin
    ],
    { initializer: "initialize" }
  );
  await poolManager.waitForDeployment();
  console.log("✅ PoolManager (Proxy):", await poolManager.getAddress());

  // Step 5: Deploy OpinionMarket (Main Entry Point)
  console.log("🎯 Step 5: Deploying OpinionMarket...");
  
  const OpinionMarket = await ethers.getContractFactory("OpinionMarket");
  const opinionMarket = await upgrades.deployProxy(
    OpinionMarket,
    [
      USDC_ADDRESS,
      await opinionCore.getAddress(),
      await feeManager.getAddress(),
      await poolManager.getAddress(),
      ethers.ZeroAddress, // monitoringManager (optional)
      ethers.ZeroAddress, // securityManager (optional)
      TREASURY_ADDRESS
    ],
    { initializer: "initialize" }
  );
  await opinionMarket.waitForDeployment();
  console.log("✅ OpinionMarket (Proxy):", await opinionMarket.getAddress());
  console.log("");

  // Step 6: Setup Cross-Contract References
  console.log("🔗 Step 6: Setting up Cross-Contract References...");
  
  // Set PoolManager address in OpinionCore
  await opinionCore.setPoolManager(await poolManager.getAddress());
  console.log("✅ Set PoolManager address in OpinionCore");

  // Grant POOL_MANAGER_ROLE to PoolManager in OpinionCore
  await opinionCore.grantRole(
    await opinionCore.POOL_MANAGER_ROLE(),
    await poolManager.getAddress()
  );
  console.log("✅ Granted POOL_MANAGER_ROLE to PoolManager");

  // Grant MARKET_CONTRACT_ROLE to OpinionMarket in OpinionCore
  await opinionCore.grantMarketContractRole(await opinionMarket.getAddress());
  console.log("✅ Granted MARKET_CONTRACT_ROLE to OpinionMarket");

  // Enable public creation
  await opinionCore.togglePublicCreation();
  console.log("✅ Enabled public opinion creation");
  console.log("");

  // Step 7: Verify Deployment
  console.log("✅ Step 7: Deployment Verification...");
  
  // Check categories
  const categories = await opinionCore.getAvailableCategories();
  console.log("📋 Available Categories:", categories);
  
  // Check fee structure
  const nextOpinionId = await opinionCore.nextOpinionId();
  console.log("🆔 Next Opinion ID:", nextOpinionId.toString());
  
  console.log("");
  console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Step 7: Save Deployment Info
  const deploymentInfo = {
    network: "baseSepolia",
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      // Libraries
      priceCalculatorLibrary: await priceCalculatorLib.getAddress(),
      validationLibrary: await validationLib.getAddress(),
      
      // Core Contracts
      opinionCore: await opinionCore.getAddress(),
      feeManager: await feeManager.getAddress(),
      poolManager: await poolManager.getAddress(),
      opinionMarket: await opinionMarket.getAddress(),
      
      // External
      usdcToken: USDC_ADDRESS,
      treasury: TREASURY_ADDRESS,
    },
    features: {
      feeStructure: "20% with 5 USDC minimum",
      publicCreationEnabled: true,
      advancedPricing: true,
      pools: true,
      categories: categories,
    },
    usage: {
      mainContract: await opinionMarket.getAddress(),
      frontendShouldUse: await opinionMarket.getAddress(),
    }
  };

  // Save to file
  writeFileSync(
    "./deployed-addresses-advanced.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("📁 Deployment info saved to: deployed-addresses-advanced.json");
  console.log("");
  console.log("🎯 FRONTEND CONFIGURATION:");
  console.log("   Main Contract Address:", await opinionMarket.getAddress());
  console.log("   USDC Address:", USDC_ADDRESS);
  console.log("   Treasury Address:", TREASURY_ADDRESS);
  console.log("");
  console.log("✅ Ready for frontend integration!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });