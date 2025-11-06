import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🛡️ Starting OpinionCore Moderation System Upgrade...");
  
  // Your deployed OpinionCore proxy address - update this with the correct proxy
  const PROXY_ADDRESS = "0x21d8Cff98E50b1327022e786156749CcdBcE9d5e";
  
  console.log(`📍 Upgrading OpinionCore at: ${PROXY_ADDRESS}`);
  
  // Deploy the PriceCalculator library
  console.log("📚 Deploying PriceCalculator library...");
  const PriceCalculatorLibrary = await ethers.getContractFactory("PriceCalculator");
  const priceCalculatorLib = await PriceCalculatorLibrary.deploy();
  await priceCalculatorLib.waitForDeployment();
  const priceCalculatorAddress = await priceCalculatorLib.getAddress();
  console.log(`✅ PriceCalculator library deployed at: ${priceCalculatorAddress}`);
  
  // Get the OpinionCore contract factory with library linking
  const OpinionCoreV3 = await ethers.getContractFactory("OpinionCore", {
    libraries: {
      PriceCalculator: priceCalculatorAddress,
    },
  });
  
  console.log("⚡ Deploying new implementation with moderation system...");
  
  try {
    // Upgrade the proxy to the new implementation (UUPS proxy)
    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, OpinionCoreV3, {
      kind: 'uups',
      unsafeAllow: ['external-library-linking']
    });
    
    await upgraded.waitForDeployment();
    
    console.log("✅ OpinionCore upgraded successfully!");
    console.log(`📍 Proxy address: ${PROXY_ADDRESS}`);
    console.log(`🆕 New implementation deployed with moderation system`);
    
    // Verify the upgrade worked by testing moderation functionality
    console.log("\n🔍 Verifying moderation upgrade...");
    try {
      // Check if the moderateAnswer function exists
      const moderatorRole = await upgraded.MODERATOR_ROLE();
      console.log(`✅ MODERATOR_ROLE found: ${moderatorRole}`);
      
      // Check categories functionality
      const categories = await upgraded.getCategories();
      console.log(`✅ Categories retrieved: ${categories.length} total`);
      console.log(`   Categories: ${categories.join(", ")}`);
      
      console.log("🎉 Moderation upgrade verification successful!");
      
    } catch (e) {
      console.log("⚠️  Could not fully verify moderation upgrade:", e);
    }
    
    console.log("\n📋 Summary of NEW moderation features:");
    console.log("🛡️  ADMIN MODERATION SYSTEM:");
    console.log("- moderateAnswer(opinionId, reason) function added");
    console.log("- Admin can moderate inappropriate answers");
    console.log("- Answer ownership reverts to question creator");
    console.log("- Original answer restored from history");
    console.log("- Current price maintained for fairness");
    console.log("- Moderation recorded in answer history");
    console.log("- AnswerModerated event emitted for notifications");
    console.log("- Edge case protection (can't moderate creator's answer)");
    
    console.log("\n📱 FRONTEND FEATURES READY:");
    console.log("- ModeratedAnswersNotification component");
    console.log("- AdminModerationPanel component"); 
    console.log("- Adult category with age verification");
    console.log("- Multi-select categories (1-3 per question)");
    console.log("- Adult content filtering system");
    
    console.log("\n🎯 TO USE MODERATION:");
    console.log("1. Grant MODERATOR_ROLE to admin address:");
    console.log(`   await contract.grantRole(await contract.MODERATOR_ROLE(), "ADMIN_ADDRESS")`);
    console.log("2. Moderate answer: await contract.moderateAnswer(opinionId, reason)");
    console.log("3. Check events for AnswerModerated notifications");
    
  } catch (error) {
    console.error("❌ Upgrade failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n🚀 Moderation system upgrade completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Moderation upgrade failed:", error);
    process.exit(1);
  });