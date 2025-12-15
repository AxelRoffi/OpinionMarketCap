const { ethers } = require("hardhat");

async function main() {
  console.log("=== Finding User With Accumulated Fees ===");
  
  // Contract addresses
  const FEE_MANAGER_ADDRESS = "0xc8f879d86266C334eb9699963ca0703aa1189d8F";
  const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  // Connect to contracts
  const FeeManager = await ethers.getContractFactory("FeeManager");
  const feeManager = FeeManager.attach(FEE_MANAGER_ADDRESS);
  
  try {
    console.log("📊 Searching for users with accumulated fees...");
    
    // Get all FeesAccumulated events from FeeManager
    const filter = feeManager.filters.FeesAccumulated();
    const events = await feeManager.queryFilter(filter, 0, 'latest');
    
    console.log(`Found ${events.length} fee accumulation events`);
    
    // Track unique users and their latest fees
    const userFees = new Map();
    
    for (const event of events) {
      const { recipient, amount, newTotal } = event.args;
      console.log(`User: ${recipient}, Amount: ${ethers.formatUnits(amount, 6)} USDC, New Total: ${ethers.formatUnits(newTotal, 6)} USDC`);
      userFees.set(recipient.toLowerCase(), newTotal);
    }
    
    console.log("\n--- Users with Accumulated Fees ---");
    for (const [user, fees] of userFees) {
      if (fees > 0) {
        console.log(`${user}: ${ethers.formatUnits(fees, 6)} USDC`);
        
        // Let's verify this by reading current fees
        const currentFees = await feeManager.getAccumulatedFees(user);
        console.log(`  Current fees (verified): ${ethers.formatUnits(currentFees, 6)} USDC`);
        
        if (currentFees > 0) {
          console.log(`  ✅ This user has claimable fees!`);
        }
      }
    }
    
    // Get total accumulated fees and contract balance
    console.log("\n--- Contract State ---");
    const totalFees = await feeManager.getTotalAccumulatedFees();
    console.log(`Total Accumulated Fees: ${ethers.formatUnits(totalFees, 6)} USDC`);
    
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const USDC = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    const contractBalance = await USDC.balanceOf(FEE_MANAGER_ADDRESS);
    console.log(`FeeManager USDC Balance: ${ethers.formatUnits(contractBalance, 6)} USDC`);
    
    // Check OpinionCore balance too
    const opinionCoreBalance = await USDC.balanceOf(OPINION_CORE_ADDRESS);
    console.log(`OpinionCore USDC Balance: ${ethers.formatUnits(opinionCoreBalance, 6)} USDC`);
    
    if (contractBalance < totalFees) {
      console.log(`\n❌ PROBLEM: Contract has insufficient balance to pay all accumulated fees`);
      console.log(`Shortfall: ${ethers.formatUnits(totalFees - contractBalance, 6)} USDC`);
    }
    
  } catch (error) {
    console.error("❌ Search failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });