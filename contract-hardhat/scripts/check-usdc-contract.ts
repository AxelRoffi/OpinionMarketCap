import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking USDC contract details...");
  
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const OPINION_CORE = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  const [signer] = await ethers.getSigners();
  console.log("Signer address:", signer.address);
  
  // Simple USDC ABI
  const usdcAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address,address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)"
  ];
  
  try {
    const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, signer);
    
    console.log("📋 USDC Contract Info:");
    console.log("- Address:", USDC_ADDRESS);
    
    try {
      const name = await usdc.name();
      console.log("- Name:", name);
    } catch (e) {
      console.log("- Name: Could not fetch");
    }
    
    try {
      const symbol = await usdc.symbol();
      console.log("- Symbol:", symbol);
    } catch (e) {
      console.log("- Symbol: Could not fetch");
    }
    
    try {
      const decimals = await usdc.decimals();
      console.log("- Decimals:", decimals);
    } catch (e) {
      console.log("- Decimals: Could not fetch");
    }
    
    // Check balance
    try {
      const balance = await usdc.balanceOf(signer.address);
      console.log("- Your balance:", ethers.formatUnits(balance, 6), "USDC");
    } catch (e) {
      console.log("- Balance: Could not fetch");
    }
    
    // Check allowance
    try {
      const allowance = await usdc.allowance(signer.address, OPINION_CORE);
      console.log("- Current allowance to OpinionCore:", ethers.formatUnits(allowance, 6), "USDC");
    } catch (e) {
      console.log("- Allowance: Could not fetch");
    }
    
    console.log("\n🧪 Testing small approval...");
    try {
      // Try a small approval first (1 USDC)
      const tx = await usdc.approve(OPINION_CORE, ethers.parseUnits("1", 6));
      console.log("Small approval transaction:", tx.hash);
      await tx.wait();
      console.log("✅ Small approval successful!");
      
      // Check new allowance
      const newAllowance = await usdc.allowance(signer.address, OPINION_CORE);
      console.log("New allowance:", ethers.formatUnits(newAllowance, 6), "USDC");
      
    } catch (error: any) {
      console.error("❌ Small approval failed:", error.message);
    }
    
  } catch (error: any) {
    console.error("❌ Contract interaction failed:", error.message);
    console.log("\n💡 This might indicate:");
    console.log("1. Wrong USDC contract address");
    console.log("2. Network mismatch");
    console.log("3. Contract not deployed on this network");
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});