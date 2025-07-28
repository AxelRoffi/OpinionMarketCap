const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing actual pool withdrawal with account:", signer.address);

  // Contract addresses
  const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  
  // Get contract instances
  const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
  const usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);
  
  console.log("\n=== TESTING ACTUAL POOL WITHDRAWAL ===");
  
  const poolId = 2; // Pool with user contribution
  
  try {
    // Check initial state
    console.log("\n--- BEFORE WITHDRAWAL ---");
    const initialContribution = await poolManager.poolContributionAmounts(poolId, signer.address);
    const initialBalance = await usdc.balanceOf(signer.address);
    
    console.log(`Pool ${poolId} - User Contribution: ${ethers.formatUnits(initialContribution, 6)} USDC`);
    console.log(`User USDC Balance: ${ethers.formatUnits(initialBalance, 6)} USDC`);
    
    if (initialContribution > 0) {
      console.log("\n--- ATTEMPTING WITHDRAWAL ---");
      
      // Estimate gas
      const gasEstimate = await poolManager.withdrawFromExpiredPool.estimateGas(poolId);
      console.log(`Estimated gas: ${gasEstimate.toString()}`);
      
      // Execute withdrawal
      console.log("🚀 Executing withdrawal transaction...");
      const tx = await poolManager.withdrawFromExpiredPool(poolId, {
        gasLimit: gasEstimate * 2n // 2x gas estimate for safety
      });
      
      console.log(`Transaction hash: ${tx.hash}`);
      console.log("⏳ Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);
      
      // Check final state
      console.log("\n--- AFTER WITHDRAWAL ---");
      const finalContribution = await poolManager.poolContributionAmounts(poolId, signer.address);
      const finalBalance = await usdc.balanceOf(signer.address);
      
      console.log(`Pool ${poolId} - User Contribution: ${ethers.formatUnits(finalContribution, 6)} USDC`);
      console.log(`User USDC Balance: ${ethers.formatUnits(finalBalance, 6)} USDC`);
      
      // Calculate changes
      const contributionChange = initialContribution - finalContribution;
      const balanceChange = finalBalance - initialBalance;
      
      console.log("\n--- WITHDRAWAL RESULTS ---");
      console.log(`✅ Contribution reduced by: ${ethers.formatUnits(contributionChange, 6)} USDC`);
      console.log(`✅ Balance increased by: ${ethers.formatUnits(balanceChange, 6)} USDC`);
      
      if (contributionChange === balanceChange && finalContribution === 0n) {
        console.log("🎉 WITHDRAWAL SUCCESSFUL - ALL CHECKS PASSED!");
      } else {
        console.log("❌ Something unexpected happened with the withdrawal");
      }
      
    } else {
      console.log("❌ No contribution found to withdraw");
    }
    
  } catch (error) {
    console.error("❌ Withdrawal failed:", error.message);
    
    // Parse common errors
    if (error.message.includes("PoolNotExpired")) {
      console.log("💡 Error reason: Pool is not expired yet");
    } else if (error.message.includes("PoolNoContribution")) {
      console.log("💡 Error reason: No contribution found in this pool");
    } else if (error.message.includes("insufficient funds")) {
      console.log("💡 Error reason: Insufficient funds for gas");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });