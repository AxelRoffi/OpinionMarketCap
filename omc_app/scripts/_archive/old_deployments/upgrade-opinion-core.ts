import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🚀 Starting OpinionCore upgrade...");
  
  // Your deployed OpinionCore proxy address
  const PROXY_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  console.log(`📍 Upgrading OpinionCore at: ${PROXY_ADDRESS}`);
  
  // First deploy the PriceCalculator library
  console.log("📚 Deploying PriceCalculator library...");
  const PriceCalculatorLibrary = await ethers.getContractFactory("PriceCalculator");
  const priceCalculatorLib = await PriceCalculatorLibrary.deploy();
  await priceCalculatorLib.waitForDeployment();
  const priceCalculatorAddress = await priceCalculatorLib.getAddress();
  console.log(`✅ PriceCalculator library deployed at: ${priceCalculatorAddress}`);
  
  // Get the OpinionCore contract factory with library linking
  const OpinionCoreV2 = await ethers.getContractFactory("OpinionCore", {
    libraries: {
      PriceCalculator: priceCalculatorAddress,
    },
  });
  
  console.log("⚡ Deploying new implementation...");
  
  // Upgrade the proxy to the new implementation
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, OpinionCoreV2, {
    unsafeAllow: ['external-library-linking']
  });
  
  await upgraded.waitForDeployment();
  
  console.log("✅ OpinionCore upgraded successfully!");
  console.log(`📍 Proxy address: ${PROXY_ADDRESS}`);
  console.log(`🆕 New implementation deployed`);
  
  // Verify the upgrade worked by checking the new minimum price
  console.log("\n🔍 Verifying upgrade...");
  try {
    const minPrice = await upgraded.MIN_INITIAL_PRICE();
    const minPriceUsdc = Number(minPrice) / 1_000_000;
    console.log(`✅ MIN_INITIAL_PRICE: ${minPriceUsdc} USDC (should be 1 USDC)`);
    
    if (minPriceUsdc === 1) {
      console.log("🎉 Upgrade verification successful!");
    } else {
      console.log("⚠️  Upgrade verification failed - unexpected MIN_INITIAL_PRICE");
    }
  } catch (e) {
    console.log("⚠️  Could not verify upgrade:", e);
  }
  
  console.log("\n📋 Summary of changes:");
  console.log("🏆 AUCTION DYNAMICS FIX:");
  console.log("- Single trader: Market regime pricing (volatility allowed)");
  console.log("- 2+ competing traders: Guaranteed 8-12% price increases");
  console.log("- Competition tracking: 24h reset window");
  console.log("- Economic result: Fair auction pricing when traders compete");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Upgrade failed:", error);
    process.exit(1);
  });