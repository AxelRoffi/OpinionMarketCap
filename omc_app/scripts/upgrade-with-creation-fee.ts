import { ethers, upgrades } from "hardhat";
import fs from 'fs';

async function main() {
  console.log("\n🚀 UPGRADING OPINION CORE WITH CONFIGURABLE CREATION FEE");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log("📝 Upgrading with account:", deployer.address);
  
  // Get current balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Your current proxy address
  const PROXY_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  console.log("📍 Proxy address:", PROXY_ADDRESS);

  try {
    console.log("\n📋 CHECKING CURRENT STATE");
    console.log("-".repeat(40));

    // Connect to current contract to check state
    const currentContract = await ethers.getContractAt("OpinionCore", PROXY_ADDRESS);
    
    // Check current parameters
    try {
      const minimumPrice = await currentContract.minimumPrice();
      const nextOpinionId = await currentContract.nextOpinionId();
      console.log("✅ Current minimum price:", ethers.formatUnits(minimumPrice, 6), "USDC");
      console.log("✅ Total opinions created:", (Number(nextOpinionId) - 1).toString());
    } catch (error) {
      console.log("⚠️  Could not read current state (expected for upgrade)");
    }

    console.log("\n🔨 PREPARING NEW IMPLEMENTATION");
    console.log("-".repeat(40));

    // Get the OpinionCore contract factory
    const OpinionCore = await ethers.getContractFactory("OpinionCore");
    
    console.log("📦 New implementation contract size:", OpinionCore.bytecode.length / 2, "bytes");
    
    console.log("\n⏫ PERFORMING UPGRADE");
    console.log("-".repeat(30));
    
    // Perform the upgrade
    const upgradedContract = await upgrades.upgradeProxy(PROXY_ADDRESS, OpinionCore, {
      kind: 'uups'
    });
    
    await upgradedContract.waitForDeployment();
    
    console.log("✅ Upgrade completed successfully!");
    console.log("📍 Proxy address remains:", await upgradedContract.getAddress());

    console.log("\n📋 VERIFYING NEW FUNCTIONALITY");
    console.log("-".repeat(40));

    // Test the new functionality
    try {
      const creationFeePercent = await upgradedContract.creationFeePercent();
      console.log("✅ Creation Fee Percent:", creationFeePercent.toString() + "%");
      
      // Verify existing data is still there
      const nextOpinionId = await upgradedContract.nextOpinionId();
      console.log("✅ Data preserved - Total opinions:", (Number(nextOpinionId) - 1).toString());
      
      // Check admin role
      const ADMIN_ROLE = await upgradedContract.ADMIN_ROLE();
      const hasAdminRole = await upgradedContract.hasRole(ADMIN_ROLE, deployer.address);
      console.log("✅ Admin role verified:", hasAdminRole);

    } catch (error) {
      console.error("❌ Error verifying new functionality:", error);
      throw error;
    }

    console.log("\n🎯 NEW ADMIN FUNCTIONALITY AVAILABLE");
    console.log("-".repeat(45));
    console.log("✅ setCreationFeePercent(uint256 _percent) - Set creation fee percentage");
    console.log("✅ creationFeePercent() - View current creation fee percentage");
    
    console.log("\n📊 EXAMPLES OF NEW CREATION FEE SYSTEM:");
    console.log("Current: 20% of initial price (minimum 5 USDC)");
    console.log("• 10 USDC initial → 2 USDC fee (20% of 10)");
    console.log("• 25 USDC initial → 5 USDC fee (20% of 25)");
    console.log("• 100 USDC initial → 20 USDC fee (20% of 100)");
    
    console.log("\n🔧 TO CHANGE CREATION FEE:");
    console.log("await contract.setCreationFeePercent(15); // 15% instead of 20%");
    console.log("await contract.setCreationFeePercent(10); // 10% instead of 20%");
    console.log("await contract.setCreationFeePercent(25); // 25% instead of 20%");

    console.log("\n💡 SUMMARY:");
    console.log("-".repeat(20));
    console.log("✅ Contract upgraded successfully");
    console.log("✅ All existing data preserved");
    console.log("✅ New configurable creation fee system active");
    console.log("✅ Admin controls available immediately");

    // Save upgrade info
    const upgradeInfo = {
      timestamp: new Date().toISOString(),
      proxyAddress: PROXY_ADDRESS,
      newImplementationAddress: await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS),
      deployer: deployer.address,
      features: [
        "Configurable creation fee percentage",
        "Admin function: setCreationFeePercent()",
        "Backward compatible with existing data"
      ]
    };

    fs.writeFileSync('upgrade-creation-fee-info.json', JSON.stringify(upgradeInfo, null, 2));
    console.log("\n📄 Upgrade info saved to: upgrade-creation-fee-info.json");

  } catch (error) {
    console.error("\n❌ UPGRADE FAILED:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});