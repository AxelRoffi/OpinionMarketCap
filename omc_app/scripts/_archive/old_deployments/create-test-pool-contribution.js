const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Creating test pool contribution with account:", signer.address);

  // Contract addresses
  const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  
  // Get contract instances
  const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
  const usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);
  
  console.log("\n=== CREATING TEST POOL FOR WITHDRAWAL TESTING ===");
  
  try {
    // Check current USDC balance
    const balance = await usdc.balanceOf(signer.address);
    console.log(`Current USDC balance: ${ethers.formatUnits(balance, 6)} USDC`);
    
    if (balance < ethers.parseUnits("5", 6)) {
      console.log("❌ Insufficient USDC balance to create pool");
      return;
    }
    
    // Create a test pool
    const opinionId = 3; // Opinion that exists
    const proposedAnswer = "Test Withdrawal Pool";
    const targetAmount = ethers.parseUnits("3", 6); // 3 USDC
    const deadline = Math.floor(Date.now() / 1000) + 60; // 1 minute from now (will expire quickly for testing)
    const name = "Test Pool for Withdrawal";
    const ipfsHash = "QmTestWithdrawalPool";
    
    console.log("\n--- CREATING POOL ---");
    console.log(`Opinion ID: ${opinionId}`);
    console.log(`Proposed Answer: ${proposedAnswer}`);
    console.log(`Target Amount: ${ethers.formatUnits(targetAmount, 6)} USDC`);
    console.log(`Deadline: ${new Date(deadline * 1000).toISOString()}`);
    
    // First, approve USDC for pool creation fee (1 USDC)
    const poolCreationFee = ethers.parseUnits("1", 6);
    console.log("\n--- APPROVING USDC FOR POOL CREATION ---");
    const approveTx = await usdc.approve(POOL_MANAGER_ADDRESS, poolCreationFee);
    await approveTx.wait();
    console.log("✅ USDC approved for pool creation");
    
    // Create the pool
    console.log("\n--- CREATING POOL TRANSACTION ---");
    const createTx = await poolManager.createPool(
      opinionId,
      proposedAnswer,
      targetAmount,
      deadline,
      name,
      ipfsHash
    );
    
    console.log(`Transaction hash: ${createTx.hash}`);
    const receipt = await createTx.wait();
    console.log(`✅ Pool created in block ${receipt.blockNumber}`);
    
    // Get the pool count to find the new pool ID
    const poolCount = await poolManager.poolCount();
    const newPoolId = poolCount - 1n; // Latest pool
    
    console.log(`New pool ID: ${newPoolId}`);
    
    // Now contribute to the pool
    const contributionAmount = ethers.parseUnits("2", 6); // 2 USDC contribution
    
    console.log("\n--- CONTRIBUTING TO POOL ---");
    console.log(`Contributing: ${ethers.formatUnits(contributionAmount, 6)} USDC`);
    
    // Approve USDC for contribution
    const contributionApproveTx = await usdc.approve(POOL_MANAGER_ADDRESS, contributionAmount);
    await contributionApproveTx.wait();
    console.log("✅ USDC approved for contribution");
    
    // Contribute to pool
    const contributeTx = await poolManager.contributeToPool(newPoolId, contributionAmount);
    console.log(`Contribution transaction hash: ${contributeTx.hash}`);
    const contributeReceipt = await contributeTx.wait();
    console.log(`✅ Contribution successful in block ${contributeReceipt.blockNumber}`);
    
    // Verify the contribution
    const userContribution = await poolManager.poolContributionAmounts(newPoolId, signer.address);
    console.log(`✅ User contribution verified: ${ethers.formatUnits(userContribution, 6)} USDC`);
    
    console.log("\n=== TEST POOL CREATED SUCCESSFULLY ===");
    console.log(`Pool ID: ${newPoolId}`);
    console.log(`User has ${ethers.formatUnits(userContribution, 6)} USDC contribution`);
    console.log(`Pool will expire at: ${new Date(deadline * 1000).toISOString()}`);
    console.log("💡 Wait for the pool to expire, then test withdrawal in frontend!");
    
  } catch (error) {
    console.error("❌ Failed to create test pool:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });