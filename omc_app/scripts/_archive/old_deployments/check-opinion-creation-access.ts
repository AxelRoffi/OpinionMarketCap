import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking opinion creation access control...");
  
  const OPINION_CORE = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  const [signer] = await ethers.getSigners();
  console.log("Signer address:", signer.address);
  
  // Opinion Core ABI for checking access
  const opinionCoreAbi = [
    "function isPublicCreationEnabled() view returns (bool)",
    "function hasRole(bytes32,address) view returns (bool)",
    "function ADMIN_ROLE() view returns (bytes32)"
  ];
  
  try {
    const opinionCore = new ethers.Contract(OPINION_CORE, opinionCoreAbi, signer);
    
    console.log("📋 Access Control Check:");
    console.log("- Contract Address:", OPINION_CORE);
    
    // Check if public creation is enabled
    try {
      const isPublicEnabled = await opinionCore.isPublicCreationEnabled();
      console.log("- Public Creation Enabled:", isPublicEnabled);
    } catch (e) {
      console.log("- Public Creation Enabled: Could not fetch");
    }
    
    // Check if user has admin role
    try {
      const adminRole = await opinionCore.ADMIN_ROLE();
      const hasAdminRole = await opinionCore.hasRole(adminRole, signer.address);
      console.log("- User has ADMIN_ROLE:", hasAdminRole);
      console.log("- ADMIN_ROLE:", adminRole);
    } catch (e) {
      console.log("- User has ADMIN_ROLE: Could not fetch");
    }
    
    console.log("\n🎯 Result:");
    const isPublicEnabled = await opinionCore.isPublicCreationEnabled();
    const adminRole = await opinionCore.ADMIN_ROLE();
    const hasAdminRole = await opinionCore.hasRole(adminRole, signer.address);
    
    if (isPublicEnabled) {
      console.log("✅ User CAN create opinions (public creation is enabled)");
    } else if (hasAdminRole) {
      console.log("✅ User CAN create opinions (has ADMIN_ROLE)");
    } else {
      console.log("❌ User CANNOT create opinions (public creation disabled and no admin role)");
      console.log("💡 To fix: Enable public creation or grant ADMIN_ROLE to user");
    }
    
  } catch (error: any) {
    console.error("❌ Contract interaction failed:", error.message);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});