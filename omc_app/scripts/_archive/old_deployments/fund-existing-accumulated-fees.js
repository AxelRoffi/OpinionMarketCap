const { ethers } = require("hardhat");

async function main() {
  console.log("=== Funding Existing Accumulated Fees ===");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Contract addresses
  const FEE_MANAGER_ADDRESS = "0xc8f879d86266C334eb9699963ca0703aa1189d8F";
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
  
  try {
    // Connect to contracts
    const FeeManager = await ethers.getContractFactory("FeeManager");
    const feeManager = FeeManager.attach(FEE_MANAGER_ADDRESS);
    
    const USDC = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    
    // Check current state
    console.log("📊 Checking current state...");
    const totalAccumulatedFees = await feeManager.getTotalAccumulatedFees();
    const feeManagerBalance = await USDC.balanceOf(FEE_MANAGER_ADDRESS);
    const deployerBalance = await USDC.balanceOf(deployer.address);
    
    console.log(`Total Accumulated Fees: ${ethers.formatUnits(totalAccumulatedFees, 6)} USDC`);
    console.log(`FeeManager Balance: ${ethers.formatUnits(feeManagerBalance, 6)} USDC`);
    console.log(`Deployer Balance: ${ethers.formatUnits(deployerBalance, 6)} USDC`);
    
    // Calculate amount needed
    const amountNeeded = totalAccumulatedFees - feeManagerBalance;
    console.log(`Amount needed: ${ethers.formatUnits(amountNeeded, 6)} USDC`);
    
    if (amountNeeded <= 0) {
      console.log("✅ FeeManager already has sufficient balance!");
      return;
    }
    
    if (deployerBalance < amountNeeded) {
      console.log("❌ Deployer doesn't have enough USDC");
      console.log(`Need ${ethers.formatUnits(amountNeeded, 6)} USDC but only have ${ethers.formatUnits(deployerBalance, 6)} USDC`);
      
      // Let's check treasury balance as alternative
      const treasuryBalance = await USDC.balanceOf(TREASURY_ADDRESS);
      console.log(`Treasury Balance: ${ethers.formatUnits(treasuryBalance, 6)} USDC`);
      
      if (treasuryBalance >= amountNeeded) {
        console.log("💡 Treasury has sufficient funds - you could transfer from treasury to FeeManager");
        console.log(`Treasury transfer command: transfer ${ethers.formatUnits(amountNeeded, 6)} USDC from ${TREASURY_ADDRESS} to ${FEE_MANAGER_ADDRESS}`);
      }
      return;
    }
    
    console.log("💰 Transferring USDC to FeeManager...");
    
    // Transfer USDC to FeeManager
    const tx = await USDC.transfer(FEE_MANAGER_ADDRESS, amountNeeded);
    console.log("Transaction hash:", tx.hash);
    
    await tx.wait();
    console.log("✅ Transfer completed!");
    
    // Verify the transfer
    const newFeeManagerBalance = await USDC.balanceOf(FEE_MANAGER_ADDRESS);
    console.log(`New FeeManager Balance: ${ethers.formatUnits(newFeeManagerBalance, 6)} USDC`);
    
    if (newFeeManagerBalance >= totalAccumulatedFees) {
      console.log("🎉 FeeManager now has sufficient balance to pay all accumulated fees!");
      console.log("Users can now claim their fees successfully!");
    } else {
      console.log("⚠️ FeeManager still doesn't have sufficient balance");
    }
    
  } catch (error) {
    console.error("❌ Funding failed:", error.message);
    
    if (error.message.includes("transfer amount exceeds balance")) {
      console.log("💡 Insufficient balance - check USDC balance of deployer");
    } else if (error.message.includes("allowance")) {
      console.log("💡 Insufficient allowance - approve USDC spending first");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });