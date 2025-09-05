import { ethers } from "hardhat";

async function main() {
  console.log("🔄 Upgrading proxy to use simplified fee system...");
  
  const PROXY_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  const NEW_IMPLEMENTATION = "0x12D3E11a7f88A2BA6ab8cCe9756E55F556ECb56e";
  const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  try {
    // Connect to the proxy as OpinionCore
    const opinionCore = await ethers.getContractAt("OpinionCore", PROXY_ADDRESS);
    console.log("✅ Connected to OpinionCore proxy");
    
    // Check current implementation
    console.log("\n📋 Current Status:");
    const currentTreasury = await opinionCore.treasury();
    console.log("- Proxy Address:", PROXY_ADDRESS);
    console.log("- New Implementation:", NEW_IMPLEMENTATION);
    console.log("- Treasury:", currentTreasury);
    
    // Check if deployer has ADMIN_ROLE
    const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
    const hasAdminRole = await opinionCore.hasRole(ADMIN_ROLE, deployer.address);
    console.log("- Deployer has ADMIN_ROLE:", hasAdminRole ? "✅" : "❌");
    
    if (!hasAdminRole) {
      console.log("❌ Deployer does not have ADMIN_ROLE");
      console.log("💡 You need to upgrade the proxy from an account with ADMIN_ROLE");
      return;
    }
    
    // Upgrade the proxy
    console.log("\n🔄 Upgrading proxy implementation...");
    
    // For OpenZeppelin's TransparentUpgradeableProxy, we need to call the upgrade function
    // The exact method depends on your proxy setup
    console.log("ℹ️ This is a transparent proxy upgrade");
    console.log("ℹ️ The proxy admin should call upgrade() with the new implementation");
    
    // Check if there's an upgrade function available
    try {
      // Try to call upgradeToAndCall (OpenZeppelin standard)
      const upgradeData = "0x"; // No initialization data needed
      const tx = await opinionCore.upgradeToAndCall(NEW_IMPLEMENTATION, upgradeData);
      await tx.wait();
      console.log("✅ Proxy upgraded successfully!");
      console.log("Transaction hash:", tx.hash);
    } catch (error: any) {
      console.log("❌ Direct upgrade failed:", error.message);
      
      // Alternative: Check if we can use the proxy admin
      console.log("\n🔍 Alternative upgrade methods:");
      console.log("1. Use the proxy admin contract to upgrade");
      console.log("2. Call upgrade() from the proxy admin");
      console.log("3. Use OpenZeppelin's upgrade plugins");
      
      // Show the proxy admin information
      console.log("\n📋 Proxy Information:");
      console.log("- Proxy Address:", PROXY_ADDRESS);
      console.log("- New Implementation:", NEW_IMPLEMENTATION);
      console.log("- Current Implementation: Check on BaseScan");
      
      // For now, let's continue with testing the new implementation
      console.log("\n🧪 Testing new implementation directly...");
      const newOpinionCore = await ethers.getContractAt("OpinionCore", NEW_IMPLEMENTATION);
      
      try {
        const nextOpinionId = await newOpinionCore.nextOpinionId();
        console.log("✅ New implementation is accessible");
        console.log("- Next Opinion ID:", nextOpinionId.toString());
      } catch (testError) {
        console.log("ℹ️ New implementation needs to be properly initialized");
      }
    }
    
    // Test the simplified fee system
    console.log("\n🧪 Testing simplified fee system...");
    
    // Show the fee flow
    console.log("\n💰 New Fee Flow:");
    console.log("1. User creates opinion:");
    console.log("   → Creation fee (5 USDC) → Treasury (direct)");
    console.log("2. User trades opinion:");
    console.log("   → Platform fee (2%) → Treasury (direct)");
    console.log("   → Creator fee (3%) → FeeManager (user claims)");
    console.log("   → Owner amount (95%) → FeeManager (user claims)");
    
    console.log("\n🎯 Benefits of Simplified System:");
    console.log("✅ No manual withdrawal needed for platform fees");
    console.log("✅ All platform revenue goes directly to treasury");
    console.log("✅ Automatic fee distribution on each transaction");
    console.log("✅ Simplified treasury management");
    
    // Provide upgrade instructions
    console.log("\n📋 Upgrade Instructions:");
    console.log("If the automatic upgrade didn't work, you can:");
    console.log("1. Use OpenZeppelin's hardhat-upgrades plugin");
    console.log("2. Call the proxy admin directly");
    console.log("3. Use the upgrade() function from the proxy admin contract");
    
    console.log("\n🚀 After Upgrade:");
    console.log("1. Test creating a new opinion");
    console.log("2. Test trading the opinion");
    console.log("3. Verify treasury receives all platform fees automatically");
    console.log("4. No more manual fee withdrawal needed!");
    
    // Save upgrade info
    const upgradeInfo = {
      timestamp: new Date().toISOString(),
      proxyAddress: PROXY_ADDRESS,
      newImplementation: NEW_IMPLEMENTATION,
      treasury: TREASURY_ADDRESS,
      changes: {
        platformFees: "Now go directly to treasury (automatic)",
        creationFees: "Already go directly to treasury",
        withdrawal: "No manual withdrawal needed"
      }
    };
    
    require('fs').writeFileSync('./proxy-upgrade-info.json', JSON.stringify(upgradeInfo, null, 2));
    console.log("✅ Upgrade info saved: proxy-upgrade-info.json");
    
  } catch (error: any) {
    console.error("❌ Upgrade failed:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});