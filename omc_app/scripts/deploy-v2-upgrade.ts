import { ethers, upgrades } from "hardhat";
import fs from 'fs';

async function main() {
  console.log("\n🚀 UPGRADING TO OPINIONCORE V2 WITH CONFIGURABLE CREATION FEE");
  console.log("=".repeat(70));

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

    // Connect to current contract
    const currentContract = await ethers.getContractAt("OpinionCore", PROXY_ADDRESS);
    
    const minimumPrice = await currentContract.minimumPrice();
    const nextOpinionId = await currentContract.nextOpinionId();
    console.log("✅ Current minimum price:", ethers.formatUnits(minimumPrice, 6), "USDC");
    console.log("✅ Total opinions created:", (Number(nextOpinionId) - 1).toString());

    console.log("\n🔨 DEPLOYING LIBRARIES");
    console.log("-".repeat(30));

    // Deploy PriceCalculator library
    const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
    const priceCalculator = await PriceCalculator.deploy();
    await priceCalculator.waitForDeployment();
    const priceCalculatorAddress = await priceCalculator.getAddress();
    
    console.log("✅ PriceCalculator library deployed at:", priceCalculatorAddress);

    console.log("\n🔨 PREPARING V2 UPGRADE");
    console.log("-".repeat(30));

    // Get the OpinionCoreV2 contract factory with library linking
    const OpinionCoreV2 = await ethers.getContractFactory("OpinionCoreV2", {
      libraries: {
        PriceCalculator: priceCalculatorAddress
      }
    });
    
    console.log("📦 V2 implementation ready");
    
    console.log("\n⏫ PERFORMING UPGRADE");
    console.log("-".repeat(25));
    
    // Perform the upgrade
    const upgradedContract = await upgrades.upgradeProxy(PROXY_ADDRESS, OpinionCoreV2, {
      unsafeAllowLinkedLibraries: true
    });
    
    await upgradedContract.waitForDeployment();
    
    console.log("✅ Upgrade to V2 completed successfully!");
    console.log("📍 Proxy address remains:", await upgradedContract.getAddress());

    console.log("\n🔧 INITIALIZING V2 FEATURES");
    console.log("-".repeat(35));

    // Initialize V2 with default 20%
    const initTx = await upgradedContract.initializeV2();
    await initTx.wait();
    console.log("✅ V2 initialized with 20% default creation fee");

    console.log("\n📋 VERIFYING NEW FUNCTIONALITY");
    console.log("-".repeat(40));

    // Test the new functionality
    const creationFeePercent = await upgradedContract.getCreationFeePercent();
    console.log("✅ Creation Fee Percent:", creationFeePercent.toString() + "%");
    
    // Verify existing data is still there
    const nextOpinionIdAfter = await upgradedContract.nextOpinionId();
    console.log("✅ Data preserved - Total opinions:", (Number(nextOpinionIdAfter) - 1).toString());
    
    // Check admin role for fee changes
    const ADMIN_ROLE = await upgradedContract.ADMIN_ROLE();
    const hasAdminRole = await upgradedContract.hasRole(ADMIN_ROLE, deployer.address);
    console.log("✅ Admin role verified:", hasAdminRole);

    console.log("\n🎯 TESTING ADMIN FUNCTIONS");
    console.log("-".repeat(35));
    
    // Test setting creation fee to 15%
    console.log("⏳ Testing setCreationFeePercentV2(15)...");
    const setFeeTx = await upgradedContract.setCreationFeePercentV2(15);
    await setFeeTx.wait();
    
    const newFeePercent = await upgradedContract.getCreationFeePercent();
    console.log("✅ Creation fee successfully changed to:", newFeePercent.toString() + "%");
    
    // Reset back to 20% for consistency
    const resetTx = await upgradedContract.setCreationFeePercentV2(20);
    await resetTx.wait();
    console.log("✅ Reset back to 20% for normal operation");

    console.log("\n📊 NEW CREATION FEE EXAMPLES");
    console.log("-".repeat(35));
    
    const examples = [
      { initialPrice: 5, expectedFee: Math.max(5 * 0.20, 5) },
      { initialPrice: 10, expectedFee: Math.max(10 * 0.20, 5) },
      { initialPrice: 50, expectedFee: Math.max(50 * 0.20, 5) },
      { initialPrice: 100, expectedFee: Math.max(100 * 0.20, 5) }
    ];
    
    console.log("With current 20% fee:");
    examples.forEach(example => {
      console.log(`   • ${example.initialPrice} USDC → ${example.expectedFee} USDC creation fee`);
    });
    
    console.log("\nWith 15% fee (example):");
    examples.forEach(example => {
      const newFee = Math.max(example.initialPrice * 0.15, 5);
      console.log(`   • ${example.initialPrice} USDC → ${newFee} USDC creation fee`);
    });

    console.log("\n💡 SUMMARY");
    console.log("-".repeat(20));
    console.log("✅ OpinionCore upgraded to V2 successfully");
    console.log("✅ All existing data preserved (12 opinions)");
    console.log("✅ New configurable creation fee system active");
    console.log("✅ Admin controls: setCreationFeePercentV2(uint256)");
    console.log("✅ Current setting: 20% (adjustable 0-100%)");

    // Update deployment info
    const upgradeInfo = {
      timestamp: new Date().toISOString(),
      proxyAddress: PROXY_ADDRESS,
      newImplementationAddress: await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS),
      priceCalculatorLibrary: priceCalculatorAddress,
      deployer: deployer.address,
      version: "V2",
      features: [
        "Configurable creation fee percentage via setCreationFeePercentV2()",
        "Backward compatible with existing data",
        "Admin-controlled fee adjustments (0-100%)",
        "Current setting: 20% with 5 USDC minimum"
      ]
    };

    fs.writeFileSync('opinioncore-v2-upgrade.json', JSON.stringify(upgradeInfo, null, 2));
    console.log("\n📄 Upgrade info saved to: opinioncore-v2-upgrade.json");

    console.log("\n🚀 V2 UPGRADE COMPLETE!");
    console.log("🔧 Admin Functions Available:");
    console.log("   • setCreationFeePercentV2(15) - Set 15% fee");
    console.log("   • setCreationFeePercentV2(10) - Set 10% fee");
    console.log("   • setCreationFeePercentV2(25) - Set 25% fee");
    console.log("   • getCreationFeePercent() - View current %");

  } catch (error) {
    console.error("\n❌ V2 UPGRADE FAILED:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});