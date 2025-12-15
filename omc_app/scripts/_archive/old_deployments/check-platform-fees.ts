import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking platform fees distribution...");
  
  const CONTRACT_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
  
  const [deployer] = await ethers.getSigners();
  
  try {
    // Get contract instance
    const OpinionCore = await ethers.getContractFactory("OpinionCore");
    const opinionCore = OpinionCore.attach(CONTRACT_ADDRESS);
    
    // Check contract addresses
    console.log("📋 Contract Configuration:");
    const treasuryAddress = await opinionCore.treasury();
    const feeManagerAddress = await opinionCore.feeManager();
    
    console.log("- Treasury Address:", treasuryAddress);
    console.log("- FeeManager Address:", feeManagerAddress);
    console.log("- Expected Treasury:", TREASURY_ADDRESS);
    console.log("- Match:", treasuryAddress === TREASURY_ADDRESS ? "✅" : "❌");
    
    // Check USDC balances
    const USDC = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    
    console.log("\n💰 USDC Balance Analysis:");
    const opinionCoreBalance = await USDC.balanceOf(CONTRACT_ADDRESS);
    const feeManagerBalance = await USDC.balanceOf(feeManagerAddress);
    const treasuryBalance = await USDC.balanceOf(TREASURY_ADDRESS);
    
    console.log("- OpinionCore Balance:", ethers.formatUnits(opinionCoreBalance, 6), "USDC");
    console.log("- FeeManager Balance:", ethers.formatUnits(feeManagerBalance, 6), "USDC");
    console.log("- Treasury Balance:", ethers.formatUnits(treasuryBalance, 6), "USDC");
    
    // Check FeeManager details
    console.log("\n🏦 FeeManager Analysis:");
    const FeeManager = await ethers.getContractAt("IFeeManager", feeManagerAddress);
    
    try {
      const totalAccumulatedFees = await FeeManager.totalAccumulatedFees();
      console.log("- Total Accumulated Fees:", ethers.formatUnits(totalAccumulatedFees, 6), "USDC");
      
      const platformFeePercent = await FeeManager.platformFeePercent();
      console.log("- Platform Fee Percent:", platformFeePercent.toString(), "%");
      
      // Check if treasury has TREASURY_ROLE
      const TREASURY_ROLE = await FeeManager.TREASURY_ROLE();
      const hasTreasuryRole = await FeeManager.hasRole(TREASURY_ROLE, TREASURY_ADDRESS);
      console.log("- Treasury has TREASURY_ROLE:", hasTreasuryRole ? "✅" : "❌");
      
      // Check deployer's role
      const deployerHasTreasuryRole = await FeeManager.hasRole(TREASURY_ROLE, deployer.address);
      console.log("- Deployer has TREASURY_ROLE:", deployerHasTreasuryRole ? "✅" : "❌");
      
    } catch (error: any) {
      console.log("❌ Error accessing FeeManager:", error.message);
    }
    
    // Calculate platform fees in contract
    console.log("\n💡 Platform Fee Location:");
    console.log("Platform fees are stored in the FeeManager contract");
    console.log("They can be withdrawn using withdrawPlatformFees() function");
    console.log("Only addresses with TREASURY_ROLE can withdraw platform fees");
    
    const platformFeesInContract = Number(feeManagerBalance) / 1_000_000;
    if (platformFeesInContract > 0) {
      console.log(`\n💰 Found ${platformFeesInContract} USDC in platform fees!`);
      console.log("To withdraw these fees:");
      console.log("1. Ensure your treasury address has TREASURY_ROLE");
      console.log("2. Call withdrawPlatformFees(usdcAddress, treasuryAddress)");
    }
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});