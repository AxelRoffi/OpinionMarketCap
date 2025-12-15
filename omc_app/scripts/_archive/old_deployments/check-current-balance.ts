import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking current USDC balance...");
  
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const OPINION_CORE = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  const [signer] = await ethers.getSigners();
  console.log("User address:", signer.address);
  
  const usdcAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address,address) view returns (uint256)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
  ];
  
  try {
    const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, signer);
    
    console.log("📋 USDC Contract Info:");
    console.log("- Address:", USDC_ADDRESS);
    
    const name = await usdc.name();
    const symbol = await usdc.symbol();
    const decimals = await usdc.decimals();
    
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Decimals:", decimals);
    
    // Check balance
    const balance = await usdc.balanceOf(signer.address);
    const balanceFormatted = ethers.formatUnits(balance, 6);
    
    console.log("\n💰 Balance Information:");
    console.log("- Raw balance (wei):", balance.toString());
    console.log("- Formatted balance:", balanceFormatted, "USDC");
    
    // Check allowance
    const allowance = await usdc.allowance(signer.address, OPINION_CORE);
    const allowanceFormatted = ethers.formatUnits(allowance, 6);
    
    console.log("\n🔐 Allowance Information:");
    console.log("- Raw allowance (wei):", allowance.toString());
    console.log("- Formatted allowance:", allowanceFormatted, "USDC");
    
    // Test creation fee calculation
    const testPrices = [1, 3, 5, 10, 25, 50, 100];
    
    console.log("\n💳 Fee Calculation for Different Prices:");
    testPrices.forEach(price => {
      const feeCalculated = price * 0.2;
      const creationFee = feeCalculated < 5 ? 5 : feeCalculated;
      const creationFeeWei = ethers.parseUnits(creationFee.toString(), 6);
      const hasBalance = balance >= creationFeeWei;
      
      console.log(`- ${price} USDC → Fee: ${creationFee} USDC → Can afford: ${hasBalance}`);
    });
    
    console.log("\n🎯 Current Transaction Analysis:");
    const currentPrice = 3; // Example price
    const currentFee = 5; // Minimum fee
    const currentFeeWei = ethers.parseUnits(currentFee.toString(), 6);
    const canAfford = balance >= currentFeeWei;
    
    console.log("- Test price:", currentPrice, "USDC");
    console.log("- Creation fee:", currentFee, "USDC");
    console.log("- Fee in wei:", currentFeeWei.toString());
    console.log("- Your balance:", balanceFormatted, "USDC");
    console.log("- Can afford:", canAfford);
    
    if (!canAfford) {
      console.log("❌ This explains why the transaction is failing!");
      console.log("Need:", currentFee, "USDC");
      console.log("Have:", balanceFormatted, "USDC");
      console.log("Missing:", (currentFee - Number(balanceFormatted)).toFixed(6), "USDC");
    } else {
      console.log("✅ Balance is sufficient for transaction!");
    }
    
  } catch (error: any) {
    console.error("❌ Error checking balance:", error.message);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});