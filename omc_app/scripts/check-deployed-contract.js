const hre = require("hardhat");

async function main() {
  console.log("Checking what's deployed at MockPoolManager address...");
  
  const poolManagerAddress = "0x3B4584e690109484059D95d7904dD9fEbA246612";
  
  // Get the bytecode
  const code = await hre.ethers.provider.getCode(poolManagerAddress);
  console.log("Contract bytecode length:", code.length);
  console.log("Is contract deployed:", code !== "0x");
  
  if (code === "0x") {
    console.log("NO CONTRACT FOUND AT THIS ADDRESS!");
    return;
  }
  
  // Try different contract interfaces
  console.log("\n1. Trying SimplePoolManager interface...");
  try {
    const simplePool = await hre.ethers.getContractAt("SimplePoolManager", poolManagerAddress);
    const poolId = await simplePool.poolId();
    console.log("✅ SimplePoolManager works! Pool ID:", poolId.toString());
  } catch (error) {
    console.log("❌ SimplePoolManager failed:", error.message);
  }
  
  console.log("\n2. Trying PoolManager interface...");
  try {
    const poolManager = await hre.ethers.getContractAt("PoolManager", poolManagerAddress);
    const poolCount = await poolManager.poolCount();
    console.log("✅ PoolManager works! Pool Count:", poolCount.toString());
  } catch (error) {
    console.log("❌ PoolManager failed:", error.message);
  }
  
  console.log("\n3. Trying to call basic functions directly...");
  try {
    const abi = [
      "function poolId() view returns (uint256)",
      "function totalAmount() view returns (uint256)", 
      "function status() view returns (uint8)",
      "function poolCount() view returns (uint256)"
    ];
    const contract = new hre.ethers.Contract(poolManagerAddress, abi, hre.ethers.provider);
    
    try {
      const poolId = await contract.poolId();
      console.log("✅ poolId() works:", poolId.toString());
    } catch (e) {
      console.log("❌ poolId() failed:", e.message);
    }
    
    try {
      const poolCount = await contract.poolCount();
      console.log("✅ poolCount() works:", poolCount.toString());
    } catch (e) {
      console.log("❌ poolCount() failed:", e.message);
    }
    
  } catch (error) {
    console.log("❌ Direct calls failed:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});