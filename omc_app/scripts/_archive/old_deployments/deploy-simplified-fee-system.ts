import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying simplified fee system...");
  
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
  const EXISTING_FEEMANAGER = "0xc8f879d86266C334eb9699963ca0703aa1189d8F";
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  try {
    // Deploy PriceCalculator library
    console.log("\n📦 Deploying PriceCalculator library...");
    const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
    const priceCalculator = await PriceCalculator.deploy();
    await priceCalculator.waitForDeployment();
    const priceCalculatorAddress = await priceCalculator.getAddress();
    console.log("PriceCalculator deployed at:", priceCalculatorAddress);
    
    // Deploy OpinionCore with simplified fee system
    console.log("\n📦 Deploying OpinionCore with simplified fees...");
    const OpinionCore = await ethers.getContractFactory("OpinionCore", {
      libraries: {
        PriceCalculator: priceCalculatorAddress,
      },
    });
    
    const opinionCore = await OpinionCore.deploy();
    await opinionCore.waitForDeployment();
    const opinionCoreAddress = await opinionCore.getAddress();
    console.log("OpinionCore deployed at:", opinionCoreAddress);
    
    // Initialize OpinionCore
    console.log("\n⚙️ Initializing OpinionCore...");
    await opinionCore.initialize(
      USDC_ADDRESS,
      EXISTING_FEEMANAGER, // Use existing FeeManager for creator/owner fees
      deployer.address, // poolManager
      TREASURY_ADDRESS
    );
    console.log("✅ OpinionCore initialized");
    
    // Enable public creation
    await opinionCore.togglePublicCreation();
    console.log("✅ Public creation enabled");
    
    // Grant necessary roles to the FeeManager
    console.log("\n🔐 Setting up FeeManager roles...");
    const feeManager = await ethers.getContractAt("FeeManager", EXISTING_FEEMANAGER);
    const CORE_CONTRACT_ROLE = await feeManager.CORE_CONTRACT_ROLE();
    
    try {
      await feeManager.grantRole(CORE_CONTRACT_ROLE, opinionCoreAddress);
      console.log("✅ CORE_CONTRACT_ROLE granted to new OpinionCore");
    } catch (error) {
      console.log("ℹ️ Role may already be granted or permission denied");
    }
    
    // Test fee calculation
    console.log("\n🧮 Testing fee calculation...");
    const testPrice = ethers.parseUnits("10", 6); // 10 USDC
    const feeDistribution = await feeManager.calculateFeeDistribution(testPrice);
    
    console.log("Fee Distribution for 10 USDC:");
    console.log("- Platform Fee:", ethers.formatUnits(feeDistribution.platformFee, 6), "USDC → Treasury (direct)");
    console.log("- Creator Fee:", ethers.formatUnits(feeDistribution.creatorFee, 6), "USDC → FeeManager (claim)");
    console.log("- Owner Amount:", ethers.formatUnits(feeDistribution.ownerAmount, 6), "USDC → FeeManager (claim)");
    
    // Save deployment information
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      network: "baseSepolia",
      contracts: {
        opinionCore: opinionCoreAddress,
        priceCalculator: priceCalculatorAddress,
        feeManager: EXISTING_FEEMANAGER,
        treasury: TREASURY_ADDRESS,
        usdc: USDC_ADDRESS
      },
      changes: {
        platformFees: "Now go directly to treasury",
        creationFees: "Already go directly to treasury",
        creatorFees: "Still accumulate in FeeManager",
        ownerFees: "Still accumulate in FeeManager"
      },
      nextSteps: [
        "Update proxy implementation to use new OpinionCore",
        "Test with real transaction",
        "Verify treasury receives platform fees automatically"
      ]
    };
    
    console.log("\n📋 Deployment Summary:");
    console.log("- New OpinionCore:", opinionCoreAddress);
    console.log("- PriceCalculator:", priceCalculatorAddress);
    console.log("- FeeManager:", EXISTING_FEEMANAGER);
    console.log("- Treasury:", TREASURY_ADDRESS);
    
    console.log("\n🎯 Simplified Fee System:");
    console.log("✅ Platform fees → Treasury (direct, automatic)");
    console.log("✅ Creation fees → Treasury (direct, automatic)");
    console.log("✅ Creator fees → FeeManager (users claim)");
    console.log("✅ Owner fees → FeeManager (users claim)");
    
    console.log("\n🚀 Next Steps:");
    console.log("1. Update your proxy to use the new implementation");
    console.log("2. Test with a real transaction");
    console.log("3. Verify treasury receives all platform fees automatically");
    
    // Save deployment info
    require('fs').writeFileSync('./simplified-fee-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("✅ Deployment info saved: simplified-fee-deployment.json");
    
  } catch (error: any) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});