const { ethers } = require("hardhat");

async function main() {
  console.log("=== Testing Fee Reading ===");
  
  // Contract addresses
  const FEE_MANAGER_ADDRESS = "0xc8f879d86266C334eb9699963ca0703aa1189d8F";
  const TEST_USER_ADDRESS = "0x644541778b26D101b6E6516B7796768631217b68"; // User with accumulated fees (from debug script)
  
  // Connect to deployed FeeManager
  const FeeManager = await ethers.getContractFactory("FeeManager");
  const feeManager = FeeManager.attach(FEE_MANAGER_ADDRESS);
  
  try {
    console.log("📊 Reading fee data...");
    console.log("FeeManager Address:", FEE_MANAGER_ADDRESS);
    console.log("Test User Address:", TEST_USER_ADDRESS);
    
    // 1. Read accumulated fees for test user
    console.log("\n--- User Fee Data ---");
    const userFees = await feeManager.getAccumulatedFees(TEST_USER_ADDRESS);
    console.log(`User Accumulated Fees: ${ethers.formatUnits(userFees, 6)} USDC`);
    console.log(`User Accumulated Fees (raw): ${userFees.toString()}`);
    
    // 2. Read total accumulated fees
    console.log("\n--- Global Fee Data ---");
    const totalFees = await feeManager.getTotalAccumulatedFees();
    console.log(`Total Accumulated Fees: ${ethers.formatUnits(totalFees, 6)} USDC`);
    console.log(`Total Accumulated Fees (raw): ${totalFees.toString()}`);
    
    // 3. Test fee calculation for a sample price
    console.log("\n--- Fee Calculation Test ---");
    const samplePrice = ethers.parseUnits("10", 6); // 10 USDC
    const feeDistribution = await feeManager.calculateFees(samplePrice);
    console.log(`Sample Price: ${ethers.formatUnits(samplePrice, 6)} USDC`);
    console.log(`Platform Fee: ${ethers.formatUnits(feeDistribution.platformFee, 6)} USDC`);
    console.log(`Creator Fee: ${ethers.formatUnits(feeDistribution.creatorFee, 6)} USDC`);
    console.log(`Owner Amount: ${ethers.formatUnits(feeDistribution.ownerAmount, 6)} USDC`);
    
    // 4. Check contract balance
    console.log("\n--- Contract State ---");
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const USDC = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    const contractBalance = await USDC.balanceOf(FEE_MANAGER_ADDRESS);
    console.log(`FeeManager USDC Balance: ${ethers.formatUnits(contractBalance, 6)} USDC`);
    
    // 5. Verify user has claimable fees
    console.log("\n--- Claimability Check ---");
    if (userFees > 0) {
      console.log("✅ User has claimable fees!");
      console.log(`💰 Claimable amount: ${ethers.formatUnits(userFees, 6)} USDC`);
      
      // Check if contract has enough balance
      if (contractBalance >= userFees) {
        console.log("✅ Contract has sufficient balance for claim");
      } else {
        console.log("❌ Contract does not have sufficient balance for claim");
        console.log(`Shortfall: ${ethers.formatUnits(userFees - contractBalance, 6)} USDC`);
      }
    } else {
      console.log("❌ User has no claimable fees");
    }
    
    console.log("\n🎉 Fee reading test completed successfully!");
    
  } catch (error) {
    console.error("❌ Fee reading test failed:", error.message);
    
    if (error.message.includes("provider")) {
      console.log("💡 Make sure you're connected to Base Sepolia network");
    } else if (error.message.includes("contract")) {
      console.log("💡 Check if the contract addresses are correct");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });