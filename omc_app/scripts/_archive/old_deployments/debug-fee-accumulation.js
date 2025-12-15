const { ethers } = require("hardhat");

async function main() {
  console.log("=== Debugging Fee Accumulation ===");
  
  // Contract addresses
  const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  const FEE_MANAGER_ADDRESS = "0xc8f879d86266C334eb9699963ca0703aa1189d8F";
  const USER_ADDRESS = "0x644541778b26D101b6E6516B7796768631217b68"; // From the logs
  
  // Get contracts
  const FeeManager = await ethers.getContractFactory("FeeManager");
  const feeManager = FeeManager.attach(FEE_MANAGER_ADDRESS);
  
  // Skip OpinionCore for now due to library linking issue
  const opinionCore = null;
  
  console.log("User address:", USER_ADDRESS);
  console.log("FeeManager address:", FEE_MANAGER_ADDRESS);
  console.log("OpinionCore address:", OPINION_CORE_ADDRESS);
  
  // Check actual accumulated fees in FeeManager
  console.log("\n🔍 Checking actual accumulated fees in FeeManager...");
  try {
    const accumulatedFees = await feeManager.getAccumulatedFees(USER_ADDRESS);
    console.log("Accumulated fees (raw):", accumulatedFees.toString());
    console.log("Accumulated fees (USDC):", ethers.formatUnits(accumulatedFees, 6));
  } catch (error) {
    console.error("Error reading accumulated fees:", error.message);
  }
  
  // Skip opinion checking for now due to library linking issue
  console.log("\n🔍 Skipping opinion checking due to library linking issue...");
  
  // Check FeeManager configuration
  console.log("\n🔍 Checking FeeManager configuration...");
  try {
    const totalAccumulatedFees = await feeManager.getTotalAccumulatedFees();
    console.log("Total accumulated fees in FeeManager:", ethers.formatUnits(totalAccumulatedFees, 6), "USDC");
    
    const platformFeePercent = await feeManager.platformFeePercent();
    const creatorFeePercent = await feeManager.creatorFeePercent();
    console.log("Platform fee percent:", platformFeePercent.toString(), "%");
    console.log("Creator fee percent:", creatorFeePercent.toString(), "%");
    
  } catch (error) {
    console.error("Error reading FeeManager config:", error.message);
  }
  
  // Skip OpinionCore configuration check for now
  console.log("\n🔍 Skipping OpinionCore configuration check due to library linking issue...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });