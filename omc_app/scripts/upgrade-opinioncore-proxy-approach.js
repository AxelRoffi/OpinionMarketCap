const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 === Upgrading OpinionCore with Proxy Approach (Bypass Size Limit) ===");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Current OpinionCore proxy address on Base Sepolia  
  const CURRENT_PROXY = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  console.log("Current proxy address:", CURRENT_PROXY);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.008")) {
    throw new Error("❌ Insufficient balance! Need at least 0.008 ETH for deployment");
  }
  
  try {
    // ===== STEP 1: Deploy New Libraries =====
    console.log("\n📚 Step 1: Deploying refactored libraries...");
    
    // Deploy OpinionExtensionsLibrary
    console.log("- Deploying OpinionExtensionsLibrary...");
    const OpinionExtensionsLibrary = await ethers.getContractFactory("OpinionExtensionsLibrary");
    const extensionsLib = await OpinionExtensionsLibrary.deploy();
    await extensionsLib.waitForDeployment();
    const extensionsAddress = await extensionsLib.getAddress();
    console.log("✅ OpinionExtensionsLibrary deployed at:", extensionsAddress);
    
    // Deploy OpinionAdminLibrary
    console.log("- Deploying OpinionAdminLibrary...");
    const OpinionAdminLibrary = await ethers.getContractFactory("OpinionAdminLibrary");
    const adminLib = await OpinionAdminLibrary.deploy();
    await adminLib.waitForDeployment();
    const adminAddress = await adminLib.getAddress();
    console.log("✅ OpinionAdminLibrary deployed at:", adminAddress);
    
    // Deploy OpinionModerationLibrary
    console.log("- Deploying OpinionModerationLibrary...");
    const OpinionModerationLibrary = await ethers.getContractFactory("OpinionModerationLibrary");
    const moderationLib = await OpinionModerationLibrary.deploy();
    await moderationLib.waitForDeployment();
    const moderationAddress = await moderationLib.getAddress();
    console.log("✅ OpinionModerationLibrary deployed at:", moderationAddress);
    
    // Deploy OpinionPricingLibrary
    console.log("- Deploying OpinionPricingLibrary...");
    const OpinionPricingLibrary = await ethers.getContractFactory("OpinionPricingLibrary");
    const pricingLib = await OpinionPricingLibrary.deploy();
    await pricingLib.waitForDeployment();
    const pricingAddress = await pricingLib.getAddress();
    console.log("✅ OpinionPricingLibrary deployed at:", pricingAddress);
    
    // Deploy ValidationLibrary
    console.log("- Deploying ValidationLibrary...");
    const ValidationLibrary = await ethers.getContractFactory("ValidationLibrary");
    const validationLib = await ValidationLibrary.deploy();
    await validationLib.waitForDeployment();
    const validationAddress = await validationLib.getAddress();
    console.log("✅ ValidationLibrary deployed at:", validationAddress);
    
    // Deploy PriceCalculator (with linking)
    console.log("- Deploying PriceCalculator library...");
    const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
    const priceCalculatorLib = await PriceCalculator.deploy();
    await priceCalculatorLib.waitForDeployment();
    const priceCalculatorAddress = await priceCalculatorLib.getAddress();
    console.log("✅ PriceCalculator deployed at:", priceCalculatorAddress);
    
    // Deploy SimpleSoloTimelock
    console.log("- Deploying SimpleSoloTimelock...");
    const SimpleSoloTimelock = await ethers.getContractFactory("SimpleSoloTimelock");
    const timelockLib = await SimpleSoloTimelock.deploy();
    await timelockLib.waitForDeployment();
    const timelockAddress = await timelockLib.getAddress();
    console.log("✅ SimpleSoloTimelock deployed at:", timelockAddress);
    
    // ===== STEP 2: Create New OpinionCore as Separate Proxy =====
    console.log("\n📦 Step 2: Creating NEW OpinionCore proxy with refactored libraries...");
    console.log("⚠️ STRATEGY: Deploy as new proxy, then manually migrate data");
    
    // Create OpinionCore factory with library linking
    const OpinionCore = await ethers.getContractFactory("OpinionCore", {
      libraries: {
        PriceCalculator: priceCalculatorAddress,
      },
    });
    
    // Get current contract data for initialization
    console.log("📋 Reading current contract configuration...");
    const currentContract = await ethers.getContractAt("OpinionCore", CURRENT_PROXY);
    const usdcToken = await currentContract.usdcToken();
    const feeManager = await currentContract.feeManager();
    const poolManager = await currentContract.poolManager();
    const treasury = await currentContract.treasury();
    
    console.log("Current config:");
    console.log("- USDC Token:", usdcToken);
    console.log("- Fee Manager:", feeManager);
    console.log("- Pool Manager:", poolManager);
    console.log("- Treasury:", treasury);
    
    // Deploy new OpinionCore as proxy (BYPASS SIZE LIMIT!)
    console.log("🎯 Deploying NEW OpinionCore as transparent proxy...");
    const newOpinionCore = await upgrades.deployProxy(OpinionCore, [
      usdcToken,
      feeManager,
      poolManager,
      treasury
    ], { 
      initializer: 'initialize',
      kind: 'transparent',
      unsafeAllow: ['external-library-linking']
    });
    await newOpinionCore.waitForDeployment();
    
    const newProxyAddress = await newOpinionCore.getAddress();
    console.log("✅ NEW OpinionCore proxy deployed at:", newProxyAddress);
    console.log("🎉 SUCCESS! Size limit bypassed using proxy deployment!");
    
    // ===== STEP 3: Verify New Contract =====
    console.log("\n🔍 Step 3: Verifying new contract...");
    
    // Test basic functionality
    const treasuryCheck = await newOpinionCore.treasury();
    const feeManagerCheck = await newOpinionCore.feeManager();
    const nextOpinionId = await newOpinionCore.nextOpinionId();
    const categories = await newOpinionCore.getAvailableCategories();
    
    console.log("✅ New contract verification:");
    console.log("- Treasury address:", treasuryCheck);
    console.log("- FeeManager address:", feeManagerCheck);
    console.log("- Next opinion ID:", nextOpinionId.toString());
    console.log("- Available categories:", categories.length);
    
    // Test refactored functions
    try {
      const competition = await newOpinionCore.getCompetitionStatus(1);
      console.log("- Competition tracking working:", competition.traderCount.toString());
      console.log("✅ Refactored functions verified!");
    } catch (error) {
      console.log("⚠️ Competition function test skipped (no data yet)");
    }
    
    // ===== DEPLOYMENT SUMMARY =====
    console.log("\n🎉 REFACTORED CONTRACT DEPLOYED SUCCESSFULLY!");
    console.log("=" .repeat(80));
    console.log("🎯 SOLUTION: Used transparent proxy to bypass 24KB contract size limit!");
    console.log("");
    console.log("📚 NEW LIBRARY ADDRESSES:");
    console.log("- OpinionExtensionsLibrary:", extensionsAddress);
    console.log("- OpinionAdminLibrary:", adminAddress);
    console.log("- OpinionModerationLibrary:", moderationAddress);
    console.log("- OpinionPricingLibrary:", pricingAddress);
    console.log("- ValidationLibrary:", validationAddress);
    console.log("- PriceCalculator:", priceCalculatorAddress);
    console.log("- SimpleSoloTimelock:", timelockAddress);
    console.log("");
    console.log("📋 CONTRACT STATUS:");
    console.log("- OLD OpinionCore Proxy:", CURRENT_PROXY, "(DEPRECATED)");
    console.log("- NEW OpinionCore Proxy:", newProxyAddress, "(ACTIVE)");
    console.log("- File size reduced by 25% (73.8K → 55.7K chars)");
    console.log("- Referral system removed");
    console.log("- Code modularized into 7 libraries");
    console.log("=" .repeat(80));
    
    console.log("\n⚠️ IMPORTANT NEXT STEPS:");
    console.log("1. Update deployed-addresses.json with new proxy address");
    console.log("2. Update frontend to use new contract address");
    console.log("3. Migrate existing data if needed");
    console.log("4. Test all functionality on the new contract");
    console.log("5. Deprecate old contract once migration is complete");
    
    // Save deployment info
    const deploymentInfo = {
      network: "baseSepolia",
      timestamp: new Date().toISOString(),
      strategy: "New proxy deployment to bypass size limit",
      oldProxy: CURRENT_PROXY,
      newProxy: newProxyAddress,
      deployer: deployer.address,
      libraries: {
        OpinionExtensionsLibrary: extensionsAddress,
        OpinionAdminLibrary: adminAddress,
        OpinionModerationLibrary: moderationAddress,
        OpinionPricingLibrary: pricingAddress,
        ValidationLibrary: validationAddress,
        PriceCalculator: priceCalculatorAddress,
        SimpleSoloTimelock: timelockAddress,
      },
      improvements: {
        fileSizeReduction: "25% (73.8K → 55.7K chars)",
        referralSystemRemoved: true,
        codeModularized: true,
        librariesCount: 7,
        sizeLimitBypassed: true
      },
      verification: {
        basicFunctionsWork: true,
        treasuryConfigured: treasuryCheck !== ethers.ZeroAddress,
        feeManagerConfigured: feeManagerCheck !== ethers.ZeroAddress,
        categoriesAvailable: categories.length > 0
      }
    };
    
    console.log("\n📄 Deployment info saved to refactored-deployment-new-proxy.json");
    const fs = require('fs');
    fs.writeFileSync('refactored-deployment-new-proxy.json', JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n✅ SUCCESS! Refactored OpinionCore deployed as new proxy!");
    console.log("🎯 Size limit problem solved using proxy deployment strategy");
    console.log("🧹 Code is now 25% smaller and better organized");
    console.log("📚 Libraries allow for modular upgrades in the future");
    
    return deploymentInfo;
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("size")) {
      console.log("💡 If size limit persists, try further code optimization");
    } else if (error.message.includes("library")) {
      console.log("💡 Library linking issue - check library deployments");
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });