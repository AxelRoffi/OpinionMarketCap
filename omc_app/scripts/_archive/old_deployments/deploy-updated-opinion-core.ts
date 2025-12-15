import { ethers, upgrades } from "hardhat";
import fs from 'fs';

async function main() {
  console.log("\n🚀 DEPLOYING UPDATED OPINION CORE WITH NEW VALIDATION LIMITS");
  console.log("=" .repeat(70));

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Get current balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Load existing deployment info
  let deploymentData: any = {};
  try {
    const existingData = fs.readFileSync('deployed-addresses.json', 'utf8');
    deploymentData = JSON.parse(existingData);
    console.log("📋 Loaded existing deployment data");
  } catch (error) {
    console.log("⚠️  No existing deployment data found, creating new");
  }

  // Contract addresses from existing deployment
  const USDC_ADDRESS = deploymentData.usdcToken || "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC
  const TREASURY_ADDRESS = deploymentData.treasurySecureEnhanced || "0xAe78a6c716DEA5C1580bca0B05C4A4ca6337C94a";

  console.log("\n📋 DEPLOYMENT CONFIGURATION");
  console.log("-".repeat(50));
  console.log("🏦 USDC Token:", USDC_ADDRESS);
  console.log("🏛️  Treasury:", TREASURY_ADDRESS);

  try {
    console.log("\n🔧 STEP 1: Deploy FeeManager");
    console.log("-".repeat(30));
    
    const FeeManager = await ethers.getContractFactory("FeeManager");
    const feeManager = await upgrades.deployProxy(FeeManager, [
      USDC_ADDRESS,
      TREASURY_ADDRESS
    ], {
      initializer: 'initialize',
      kind: 'uups'
    });
    await feeManager.waitForDeployment();
    const feeManagerAddress = await feeManager.getAddress();
    console.log("✅ FeeManager deployed to:", feeManagerAddress);

    console.log("\n🔧 STEP 2: Deploy MinimalPoolManager");
    console.log("-".repeat(40));
    
    const MinimalPoolManager = await ethers.getContractFactory("MinimalPoolManager");
    const poolManager = await upgrades.deployProxy(MinimalPoolManager, [
      USDC_ADDRESS,
      feeManagerAddress,
      TREASURY_ADDRESS
    ], {
      initializer: 'initialize',
      kind: 'uups'
    });
    await poolManager.waitForDeployment();
    const poolManagerAddress = await poolManager.getAddress();
    console.log("✅ MinimalPoolManager deployed to:", poolManagerAddress);

    console.log("\n🔧 STEP 3: Deploy Updated OpinionCore");
    console.log("-".repeat(40));
    
    const OpinionCore = await ethers.getContractFactory("OpinionCore");
    const opinionCore = await upgrades.deployProxy(OpinionCore, [
      USDC_ADDRESS,
      feeManagerAddress,
      poolManagerAddress,
      TREASURY_ADDRESS
    ], {
      initializer: 'initialize',
      kind: 'uups'
    });
    await opinionCore.waitForDeployment();
    const opinionCoreAddress = await opinionCore.getAddress();
    console.log("✅ OpinionCore deployed to:", opinionCoreAddress);

    console.log("\n🔧 STEP 4: Configure Roles and Permissions");
    console.log("-".repeat(45));

    // Grant roles
    const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
    await opinionCore.grantRole(POOL_MANAGER_ROLE, poolManagerAddress);
    console.log("✅ Granted POOL_MANAGER_ROLE to PoolManager");

    // Set OpinionCore address in PoolManager
    await poolManager.setOpinionCore(opinionCoreAddress);
    console.log("✅ Set OpinionCore address in PoolManager");

    console.log("\n🔧 STEP 5: Verify New Validation Limits");
    console.log("-".repeat(42));

    // Check the new validation limits
    const maxQuestionLength = await opinionCore.maxQuestionLength();
    const maxAnswerLength = await opinionCore.maxAnswerLength();
    const maxDescriptionLength = await opinionCore.maxDescriptionLength();
    
    console.log("📏 Max Question Length:", maxQuestionLength.toString(), "characters");
    console.log("📏 Max Answer Length:", maxAnswerLength.toString(), "characters");
    console.log("📏 Max Description Length:", maxDescriptionLength.toString(), "characters");
    
    // Verify the limits match our expected values
    if (maxQuestionLength.toString() === "60" && 
        maxAnswerLength.toString() === "60" && 
        maxDescriptionLength.toString() === "240") {
      console.log("✅ Validation limits correctly updated!");
    } else {
      console.log("❌ Validation limits don't match expected values");
    }

    console.log("\n🔧 STEP 6: Enable Public Opinion Creation");
    console.log("-".repeat(45));
    
    await opinionCore.togglePublicCreation();
    console.log("✅ Public opinion creation enabled");

    // Update deployment addresses
    const updatedDeployment = {
      ...deploymentData,
      opinionCore: opinionCoreAddress,
      feeManager: feeManagerAddress,
      poolManager: poolManagerAddress,
      contractType: "OpinionCore",
      isProxy: true,
      lastUpgrade: new Date().toISOString(),
      validationLimits: {
        maxQuestionLength: 60,
        maxAnswerLength: 60,
        maxDescriptionLength: 240
      },
      network: "baseSepolia",
      deployer: deployer.address
    };

    // Save updated deployment info
    fs.writeFileSync('deployed-addresses.json', JSON.stringify(updatedDeployment, null, 2));

    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("=" .repeat(70));
    console.log("📊 NEW CONTRACT ADDRESSES:");
    console.log("🔗 OpinionCore:", opinionCoreAddress);
    console.log("🔗 FeeManager:", feeManagerAddress);  
    console.log("🔗 PoolManager:", poolManagerAddress);
    console.log("🏛️  Treasury:", TREASURY_ADDRESS);
    console.log("🏦 USDC:", USDC_ADDRESS);
    
    console.log("\n✨ FEATURES:");
    console.log("• Updated validation limits (2-60 chars for questions/answers)");
    console.log("• Descriptions: 2-240 characters (optional)");
    console.log("• Smart content filtering ready");
    console.log("• Public opinion creation enabled");
    console.log("• Full proxy upgradeability");

    console.log("\n📝 NEXT STEPS:");
    console.log("1. Update frontend contracts.ts with new addresses");
    console.log("2. Test creating opinions with new limits");
    console.log("3. Verify content filtering works as expected");
    console.log("4. Consider migrating data from old contract if needed");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});