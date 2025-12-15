import { ethers } from "hardhat";

async function main() {
  console.log("🔄 Updating OpinionCore to use new FeeManager...");
  
  const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  const NEW_FEEMANAGER_ADDRESS = "0xc8f879d86266C334eb9699963ca0703aa1189d8F";
  const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  try {
    // Connect to OpinionCore
    const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
    console.log("✅ Connected to OpinionCore at:", OPINION_CORE_ADDRESS);
    
    // Check current FeeManager
    console.log("\n📋 Current Configuration:");
    const currentFeeManager = await opinionCore.feeManager();
    const currentTreasury = await opinionCore.treasury();
    
    console.log("- Current FeeManager:", currentFeeManager);
    console.log("- New FeeManager:", NEW_FEEMANAGER_ADDRESS);
    console.log("- Treasury:", currentTreasury);
    
    // Check if deployer has ADMIN_ROLE
    const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
    const hasAdminRole = await opinionCore.hasRole(ADMIN_ROLE, deployer.address);
    console.log("- Deployer has ADMIN_ROLE:", hasAdminRole ? "✅" : "❌");
    
    if (!hasAdminRole) {
      console.log("❌ Deployer does not have ADMIN_ROLE, cannot update FeeManager");
      console.log("💡 Solution: Grant ADMIN_ROLE to deployer or use an account with ADMIN_ROLE");
      return;
    }
    
    // Update FeeManager address
    if (currentFeeManager !== NEW_FEEMANAGER_ADDRESS) {
      console.log("\n🔄 Updating FeeManager address...");
      const tx = await opinionCore.setFeeManager(NEW_FEEMANAGER_ADDRESS);
      await tx.wait();
      console.log("✅ FeeManager updated successfully!");
      console.log("Transaction hash:", tx.hash);
    } else {
      console.log("ℹ️ FeeManager address is already correct");
    }
    
    // Verify the update
    console.log("\n🔍 Verifying update...");
    const updatedFeeManager = await opinionCore.feeManager();
    console.log("- Updated FeeManager:", updatedFeeManager);
    console.log("- Update successful:", updatedFeeManager === NEW_FEEMANAGER_ADDRESS ? "✅" : "❌");
    
    // Test the new FeeManager integration
    console.log("\n🧪 Testing new FeeManager integration...");
    const feeManager = await ethers.getContractAt("FeeManager", NEW_FEEMANAGER_ADDRESS);
    
    // Test fee calculation
    const testPrice = ethers.parseUnits("5", 6); // 5 USDC
    const feeDistribution = await feeManager.calculateFeeDistribution(testPrice);
    
    console.log("Fee Distribution for 5 USDC:");
    console.log("- Platform Fee:", ethers.formatUnits(feeDistribution.platformFee, 6), "USDC");
    console.log("- Creator Fee:", ethers.formatUnits(feeDistribution.creatorFee, 6), "USDC");
    console.log("- Owner Amount:", ethers.formatUnits(feeDistribution.ownerAmount, 6), "USDC");
    
    // Final summary
    console.log("\n🎉 Update Complete!");
    console.log("- OpinionCore now uses the proper FeeManager");
    console.log("- Platform fees will be accumulated in FeeManager");
    console.log("- Treasury can withdraw fees using withdrawPlatformFees()");
    console.log("- Creation fees still go directly to treasury");
    
    console.log("\n💡 How Platform Fees Now Work:");
    console.log("1. User trades opinion → pays trading fees");
    console.log("2. Platform fees accumulate in FeeManager contract");
    console.log("3. Treasury calls withdrawPlatformFees() to collect them");
    console.log("4. Treasury receives the platform fees");
    
    console.log("\n🚀 Next Steps:");
    console.log("1. Create a new opinion to test the new fee system");
    console.log("2. Have someone trade the opinion to generate platform fees");
    console.log("3. Check FeeManager balance for accumulated fees");
    console.log("4. Test withdrawPlatformFees() from treasury address");
    
    // Save update info
    const updateInfo = {
      timestamp: new Date().toISOString(),
      opinionCore: OPINION_CORE_ADDRESS,
      oldFeeManager: currentFeeManager,
      newFeeManager: NEW_FEEMANAGER_ADDRESS,
      treasury: TREASURY_ADDRESS,
      success: updatedFeeManager === NEW_FEEMANAGER_ADDRESS
    };
    
    require('fs').writeFileSync('./feemanager-update.json', JSON.stringify(updateInfo, null, 2));
    console.log("✅ Update info saved: feemanager-update.json");
    
  } catch (error: any) {
    console.error("❌ Update failed:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});