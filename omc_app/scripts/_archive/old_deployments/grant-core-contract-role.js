const { ethers } = require("hardhat");

async function main() {
  console.log("=== Granting CORE_CONTRACT_ROLE to OpinionCore ===");
  
  // Contract addresses
  const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  const FEE_MANAGER_ADDRESS = "0xc8f879d86266C334eb9699963ca0703aa1189d8F";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));
  
  // Get the FeeManager contract
  console.log("\n📋 Getting FeeManager contract...");
  const FeeManager = await ethers.getContractFactory("FeeManager");
  const feeManager = FeeManager.attach(FEE_MANAGER_ADDRESS);
  
  // Check if OpinionCore already has the role
  console.log("\n🔍 Checking current roles...");
  const CORE_CONTRACT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("CORE_CONTRACT_ROLE"));
  const hasRole = await feeManager.hasRole(CORE_CONTRACT_ROLE, OPINION_CORE_ADDRESS);
  
  console.log("OpinionCore address:", OPINION_CORE_ADDRESS);
  console.log("FeeManager address:", FEE_MANAGER_ADDRESS);
  console.log("Has CORE_CONTRACT_ROLE:", hasRole);
  
  if (hasRole) {
    console.log("\n✅ OpinionCore already has CORE_CONTRACT_ROLE - no action needed!");
    return;
  }
  
  // Grant the role
  console.log("\n🚀 Granting CORE_CONTRACT_ROLE to OpinionCore...");
  try {
    const tx = await feeManager.grantCoreContractRole(OPINION_CORE_ADDRESS);
    console.log("Transaction hash:", tx.hash);
    
    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    
    // Verify the role was granted
    const hasRoleAfter = await feeManager.hasRole(CORE_CONTRACT_ROLE, OPINION_CORE_ADDRESS);
    console.log("✅ Role granted successfully:", hasRoleAfter);
    
    if (hasRoleAfter) {
      console.log("\n🎉 SUCCESS! OpinionCore can now accumulate fees in FeeManager!");
      console.log("💡 Users should now be able to claim their accumulated fees properly.");
    } else {
      console.log("\n❌ ERROR: Role was not granted successfully.");
    }
    
  } catch (error) {
    console.error("\n❌ Error granting role:", error.message);
    
    if (error.message.includes("AccessControlUnauthorizedAccount")) {
      console.error("💡 SOLUTION: Make sure you're using an account with ADMIN_ROLE on the FeeManager contract");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });