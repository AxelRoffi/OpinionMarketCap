const hre = require("hardhat");

async function main() {
  console.log("Testing MockPoolManager on Base Sepolia...");
  
  const poolManagerAddress = "0x3B4584e690109484059D95d7904dD9fEbA246612";
  
  // Get the contract
  const poolManager = await hre.ethers.getContractAt("SimplePoolManager", poolManagerAddress);
  
  try {
    // Test basic read functions
    console.log("Testing basic reads...");
    const poolId = await poolManager.poolId();
    const totalAmount = await poolManager.totalAmount();
    const targetPrice = await poolManager.targetPrice();
    const status = await poolManager.status();
    
    console.log("Pool ID:", poolId.toString());
    console.log("Total Amount:", totalAmount.toString());
    console.log("Target Price:", targetPrice.toString());
    console.log("Status:", status.toString());
    
    // Test if addContribution function exists
    console.log("Testing addContribution function...");
    const [signer] = await hre.ethers.getSigners();
    console.log("Using signer:", signer.address);
    
    // Try to call addContribution with 10 units
    console.log("Attempting to add 10 units...");
    const tx = await poolManager.addContribution(10);
    console.log("Transaction submitted:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    // Check updated amount
    const newTotalAmount = await poolManager.totalAmount();
    console.log("New Total Amount:", newTotalAmount.toString());
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});