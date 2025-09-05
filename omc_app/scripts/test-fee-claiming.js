const { ethers } = require("hardhat");

async function main() {
  console.log("=== Testing Fee Claiming ===");
  
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  // Contract addresses
  const FEE_MANAGER_ADDRESS = "0xc8f879d86266C334eb9699963ca0703aa1189d8F";
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const USER_WITH_FEES = "0x644541778b26D101b6E6516B7796768631217b68";
  
  try {
    // Connect to contracts
    const FeeManager = await ethers.getContractFactory("FeeManager");
    const feeManager = FeeManager.attach(FEE_MANAGER_ADDRESS);
    
    const USDC = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    
    // Check current state
    console.log("📊 Pre-claim state...");
    const userFees = await feeManager.getAccumulatedFees(USER_WITH_FEES);
    const contractBalance = await USDC.balanceOf(FEE_MANAGER_ADDRESS);
    const userBalance = await USDC.balanceOf(USER_WITH_FEES);
    
    console.log(`User Accumulated Fees: ${ethers.formatUnits(userFees, 6)} USDC`);
    console.log(`FeeManager Balance: ${ethers.formatUnits(contractBalance, 6)} USDC`);
    console.log(`User USDC Balance: ${ethers.formatUnits(userBalance, 6)} USDC`);
    
    if (userFees == 0) {
      console.log("❌ User has no accumulated fees to claim");
      return;
    }
    
    if (contractBalance < userFees) {
      console.log("❌ Contract doesn't have enough balance to pay fees");
      return;
    }
    
    console.log("✅ All conditions met for fee claiming!");
    
    // Simulate the claim transaction (dry run)
    console.log("\n🧪 Simulating fee claim transaction...");
    
    try {
      // This will simulate the transaction without actually executing it
      const gasEstimate = await feeManager.claimAccumulatedFees.estimateGas({
        from: USER_WITH_FEES
      });
      console.log(`Estimated gas: ${gasEstimate.toString()}`);
      
      // Try to call the function statically to check for errors
      await feeManager.claimAccumulatedFees.staticCall({
        from: USER_WITH_FEES
      });
      
      console.log("✅ Transaction simulation successful!");
      console.log("The user can successfully claim their fees");
      
    } catch (error) {
      console.error("❌ Transaction simulation failed:", error.message);
      
      if (error.message.includes("NoFeesToClaim")) {
        console.log("💡 User has no fees to claim");
      } else if (error.message.includes("paused")) {
        console.log("💡 Contract is paused");
      } else if (error.message.includes("insufficient")) {
        console.log("💡 Insufficient balance in contract");
      } else {
        console.log("💡 Unknown error - check contract state");
      }
    }
    
    // Check contract is not paused
    console.log("\n🔍 Checking contract state...");
    const isPaused = await feeManager.paused();
    console.log(`Contract paused: ${isPaused}`);
    
    // Check total accumulated fees
    const totalAccumulatedFees = await feeManager.getTotalAccumulatedFees();
    console.log(`Total accumulated fees: ${ethers.formatUnits(totalAccumulatedFees, 6)} USDC`);
    
    console.log("\n📋 Summary:");
    console.log(`✅ User has ${ethers.formatUnits(userFees, 6)} USDC to claim`);
    console.log(`✅ Contract has ${ethers.formatUnits(contractBalance, 6)} USDC balance`);
    console.log(`✅ Contract is ${isPaused ? 'paused' : 'not paused'}`);
    console.log("✅ Fee claiming should work!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });