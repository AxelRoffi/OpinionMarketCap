const { ethers } = require("hardhat");

async function main() {
  console.log("Setting up roles between contracts...");
  
  // Get deployed contracts (adapt according to your deployment method)
  const OpinionMarket = await ethers.getContract("OpinionMarket");
  const OpinionCore = await ethers.getContract("OpinionCore");
  const FeeManager = await ethers.getContract("FeeManager");
  const PoolManager = await ethers.getContract("PoolManager");
  
  console.log("Contracts retrieved, configuring roles...");
  
  // 1. OpinionCore needs to grant rights to OpinionMarket and PoolManager
  const marketContractRole = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("MARKET_CONTRACT_ROLE")
  );
  const poolManagerRole = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("POOL_MANAGER_ROLE")
  );
  
  // 2. FeeManager needs to grant rights to OpinionCore
  const coreContractRole = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("CORE_CONTRACT_ROLE")
  );
  
  try {
    // Grant MARKET_CONTRACT_ROLE to OpinionMarket in OpinionCore
    console.log("Granting MARKET_CONTRACT_ROLE to OpinionMarket...");
    const tx1 = await OpinionCore.grantMarketContractRole(OpinionMarket.address);
    await tx1.wait();
    console.log("✅ MARKET_CONTRACT_ROLE granted to OpinionMarket");
    
    // Grant POOL_MANAGER_ROLE to PoolManager in OpinionCore
    console.log("Granting POOL_MANAGER_ROLE to PoolManager...");
    // Check if this function exists, otherwise use grantRole directly
    if (OpinionCore.grantPoolManagerRole) {
      const tx2 = await OpinionCore.grantPoolManagerRole(PoolManager.address);
      await tx2.wait();
    } else {
      const tx2 = await OpinionCore.grantRole(poolManagerRole, PoolManager.address);
      await tx2.wait();
    }
    console.log("✅ POOL_MANAGER_ROLE granted to PoolManager");
    
    // Grant CORE_CONTRACT_ROLE to OpinionCore in FeeManager
    console.log("Granting CORE_CONTRACT_ROLE to OpinionCore...");
    const tx3 = await FeeManager.grantCoreContractRole(OpinionCore.address);
    await tx3.wait();
    console.log("✅ CORE_CONTRACT_ROLE granted to OpinionCore");
    
    console.log("🚀 Role configuration completed successfully!");
  } catch (error) {
    console.error("❌ Error during role configuration:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });