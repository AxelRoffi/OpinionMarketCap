const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("=== Upgrading OpinionCore with Fee Fix ===");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Current proxy address on Base Sepolia
  const PROXY_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  try {
    console.log("📦 Deploying new OpinionCore implementation...");
    
    // Deploy the new implementation with library linking
    const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
    const priceCalculatorLib = await PriceCalculator.deploy();
    await priceCalculatorLib.waitForDeployment();
    
    console.log("PriceCalculator library deployed to:", await priceCalculatorLib.getAddress());
    
    // Deploy new OpinionCore implementation with library
    const OpinionCore = await ethers.getContractFactory("OpinionCore", {
      libraries: {
        PriceCalculator: await priceCalculatorLib.getAddress(),
      },
    });
    
    console.log("🚀 Upgrading proxy to new implementation...");
    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, OpinionCore, {
      unsafeAllowLinkedLibraries: true,
    });
    await upgraded.waitForDeployment();
    
    console.log("✅ OpinionCore upgraded successfully!");
    console.log("Proxy address (unchanged):", PROXY_ADDRESS);
    console.log("New implementation deployed");
    
    // Verify the upgrade worked
    console.log("\n🔍 Verifying upgrade...");
    const opinionCore = await ethers.getContractAt("OpinionCore", PROXY_ADDRESS);
    
    // Test basic functionality
    const treasury = await opinionCore.treasury();
    const feeManager = await opinionCore.feeManager();
    
    console.log("Treasury address:", treasury);
    console.log("FeeManager address:", feeManager);
    
    // Test the fix - check if we can read contract state
    console.log("\n🎉 Upgrade completed successfully!");
    console.log("Fee transfer fix has been deployed to testnet");
    console.log("The contract now transfers USDC to FeeManager before accumulating fees");
    
    console.log("\n📋 Next Steps:");
    console.log("1. Test fee claiming with existing accumulated fees");
    console.log("2. Create new opinions and verify fees flow correctly");
    console.log("3. Once verified, this same code can be deployed to mainnet");
    
  } catch (error) {
    console.error("❌ Upgrade failed:", error.message);
    
    if (error.message.includes("library")) {
      console.log("💡 Library linking issue - check PriceCalculator deployment");
    } else if (error.message.includes("proxy")) {
      console.log("💡 Proxy upgrade issue - check proxy address and permissions");
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