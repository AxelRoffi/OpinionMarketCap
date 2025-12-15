import { ethers } from "hardhat";

async function main() {
  console.log("⚙️ Configuring deployed FeeManager...");
  
  const FEEMANAGER_ADDRESS = "0xc8f879d86266C334eb9699963ca0703aa1189d8F";
  const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
  const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  try {
    // Connect to the deployed FeeManager
    const feeManager = await ethers.getContractAt("FeeManager", FEEMANAGER_ADDRESS);
    console.log("✅ Connected to FeeManager at:", FEEMANAGER_ADDRESS);
    
    // Check current parameters
    console.log("\n📋 Current FeeManager Configuration:");
    const currentTreasury = await feeManager.treasury();
    const platformFeePercent = await feeManager.platformFeePercent();
    const creatorFeePercent = await feeManager.creatorFeePercent();
    
    console.log("- Current Treasury:", currentTreasury);
    console.log("- Platform Fee:", platformFeePercent.toString(), "%");
    console.log("- Creator Fee:", creatorFeePercent.toString(), "%");
    
    // Grant roles
    console.log("\n🔐 Setting up roles...");
    const TREASURY_ROLE = await feeManager.TREASURY_ROLE();
    const CORE_CONTRACT_ROLE = await feeManager.CORE_CONTRACT_ROLE();
    
    // Check if roles are already granted
    const treasuryHasRole = await feeManager.hasRole(TREASURY_ROLE, TREASURY_ADDRESS);
    const coreHasRole = await feeManager.hasRole(CORE_CONTRACT_ROLE, OPINION_CORE_ADDRESS);
    
    console.log("- Treasury has TREASURY_ROLE:", treasuryHasRole ? "✅" : "❌");
    console.log("- OpinionCore has CORE_CONTRACT_ROLE:", coreHasRole ? "✅" : "❌");
    
    // Grant roles if needed
    if (!treasuryHasRole) {
      await feeManager.grantRole(TREASURY_ROLE, TREASURY_ADDRESS);
      console.log("✅ TREASURY_ROLE granted to:", TREASURY_ADDRESS);
    }
    
    if (!coreHasRole) {
      await feeManager.grantRole(CORE_CONTRACT_ROLE, OPINION_CORE_ADDRESS);
      console.log("✅ CORE_CONTRACT_ROLE granted to:", OPINION_CORE_ADDRESS);
    }
    
    // Test fee calculation
    console.log("\n🧮 Testing fee calculation...");
    const testPrice = ethers.parseUnits("10", 6); // 10 USDC
    const feeDistribution = await feeManager.calculateFeeDistribution(testPrice);
    
    console.log("Fee Distribution for 10 USDC:");
    console.log("- Platform Fee:", ethers.formatUnits(feeDistribution.platformFee, 6), "USDC");
    console.log("- Creator Fee:", ethers.formatUnits(feeDistribution.creatorFee, 6), "USDC");
    console.log("- Owner Amount:", ethers.formatUnits(feeDistribution.ownerAmount, 6), "USDC");
    
    console.log("\n💰 Important: Platform Fee Distribution");
    console.log("- Platform fees will be stored in the FeeManager contract");
    console.log("- Treasury can withdraw them using withdrawPlatformFees()");
    console.log("- This is DIFFERENT from creation fees which go directly to treasury");
    
    // Create configuration summary
    const configSummary = {
      feeManager: FEEMANAGER_ADDRESS,
      treasury: TREASURY_ADDRESS,
      opinionCore: OPINION_CORE_ADDRESS,
      platformFeePercent: platformFeePercent.toString(),
      creatorFeePercent: creatorFeePercent.toString(),
      roles: {
        treasuryRole: treasuryHasRole,
        coreRole: coreHasRole
      },
      nextSteps: [
        "Update OpinionCore to use new FeeManager",
        "Test fee distribution",
        "Verify treasury can withdraw platform fees"
      ]
    };
    
    console.log("\n📋 Configuration Summary:");
    console.log(JSON.stringify(configSummary, null, 2));
    
    // Save configuration
    require('fs').writeFileSync('./feemanager-config.json', JSON.stringify(configSummary, null, 2));
    console.log("✅ Configuration saved: feemanager-config.json");
    
  } catch (error: any) {
    console.error("❌ Configuration failed:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});