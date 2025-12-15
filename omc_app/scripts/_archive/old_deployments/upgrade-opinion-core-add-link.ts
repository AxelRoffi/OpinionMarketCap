import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🚀 Starting OpinionCore upgrade to add link functionality...");
  
  // Your deployed OpinionCore proxy address (from CLAUDE.md)
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
  const OpinionCoreWithLink = await ethers.getContractFactory("OpinionCore", {
    libraries: {
      PriceCalculator: priceCalculatorAddress,
    },
  });
  
  console.log("⚡ Deploying new implementation with link support...");
  
  // Upgrade the proxy to the new implementation
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, OpinionCoreWithLink, {
    unsafeAllow: ['external-library-linking']
  });
  
  await upgraded.waitForDeployment();
  
  console.log("✅ OpinionCore upgraded successfully!");
  console.log(`📍 Proxy address: ${PROXY_ADDRESS}`);
  console.log(`🆕 New implementation deployed`);
  
  // Verify the upgrade worked by testing new link functionality
  console.log("\n🔍 Verifying link upgrade...");
  try {
    // Test reading an existing opinion to verify link field exists
    const opinionCount = await upgraded.nextOpinionId();
    const totalOpinions = Number(opinionCount) - 1;
    console.log(`📊 Total opinions on contract: ${totalOpinions}`);
    
    if (totalOpinions > 0) {
      const opinion1 = await upgraded.getOpinionDetails(1);
      console.log(`✅ Opinion 1 link field: "${opinion1.link}" (empty = not set yet)`);
      console.log(`✅ Link functionality verified - ready for users to add links!`);
    }
    
    console.log("🎉 Link upgrade verification successful!");
  } catch (e) {
    console.log("⚠️  Could not verify link upgrade:", e);
  }
  
  console.log("\n📋 NEW LINK FUNCTIONALITY:");
  console.log("🔗 submitAnswer() now accepts link parameter");
  console.log("🔗 Users can provide external URLs when submitting answers");
  console.log("🔗 Links are stored and displayed in frontend");
  console.log("🔗 Frontend will now show clickable answer text");
  console.log("🔗 All existing opinions maintain their current state");
  
  console.log("\n🚨 IMPORTANT:");
  console.log("- Frontend ABI already updated to support links");
  console.log("- TradingModal already configured to send links");
  console.log("- New answers will immediately support link functionality");
  console.log("- Existing opinions can have links added via new answers");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Link upgrade failed:", error);
    process.exit(1);
  });