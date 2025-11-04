// Grant admin role to yourself
// Run: npx hardhat run grant-admin-role.js --network baseSepolia

const { ethers } = require("hardhat");

async function main() {
  console.log("🔐 Granting Admin Role");
  
  // Your contract address
  const CONTRACT_ADDRESS = "0x21d8Cff98E50b1327022e786156749CcdBcE9d5e";
  
  // Get the contract
  const contract = await ethers.getContractAt("OpinionCore", CONTRACT_ADDRESS);
  
  // Get your address
  const [signer] = await ethers.getSigners();
  const yourAddress = signer.address;
  
  console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`👤 Your address: ${yourAddress}`);
  
  try {
    // Get admin role
    const adminRole = await contract.ADMIN_ROLE();
    console.log(`🔑 Admin Role: ${adminRole}`);
    
    // Check if you already have admin role
    const hasAdminRole = await contract.hasRole(adminRole, yourAddress);
    console.log(`✅ Already has admin role: ${hasAdminRole}`);
    
    if (hasAdminRole) {
      console.log("🎉 You already have admin access! Go to /admin");
      return;
    }
    
    // Grant admin role to yourself
    console.log("🚀 Granting admin role...");
    const tx = await contract.grantRole(adminRole, yourAddress);
    console.log(`📝 Transaction hash: ${tx.hash}`);
    
    // Wait for confirmation
    await tx.wait();
    console.log("✅ Admin role granted successfully!");
    console.log("🌐 You can now access the admin dashboard at /admin");
    
  } catch (error) {
    if (error.message.includes("AccessControl")) {
      console.log("❌ Access denied: You need to be the contract owner or have admin role to grant roles");
      console.log("💡 Try using the contract deployer account");
    } else {
      console.log("❌ Failed to grant admin role:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });