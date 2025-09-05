import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Verifying wallet connection and balance...");
  
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  
  const [signer] = await ethers.getSigners();
  
  console.log("📋 Wallet Information:");
  console.log("- Connected Address:", signer.address);
  console.log("- Network: Base Sepolia");
  console.log("- Chain ID: 84532");
  
  // Check ETH balance
  const ethBalance = await signer.provider.getBalance(signer.address);
  console.log("- ETH Balance:", ethers.formatEther(ethBalance), "ETH");
  
  // Check USDC balance
  const usdcAbi = ["function balanceOf(address) view returns (uint256)"];
  const usdc = new ethers.Contract(USDC_ADDRESS, usdcAbi, signer);
  const usdcBalance = await usdc.balanceOf(signer.address);
  console.log("- USDC Balance:", ethers.formatUnits(usdcBalance, 6), "USDC");
  
  console.log("\n🎯 Please verify:");
  console.log("1. Is this the correct wallet address?");
  console.log("2. Are you connected to Base Sepolia network?");
  console.log("3. Does your wallet show the same USDC balance for this address on Base Sepolia?");
  
  console.log("\n💡 If you have 16 USDC but this shows 4.917232 USDC:");
  console.log("- Check if your wallet is on the correct network (Base Sepolia)");
  console.log("- Verify the connected account matches this address");
  console.log("- Try refreshing your wallet or reconnecting");
  
  console.log("\n📱 To check your balance manually:");
  console.log("1. Go to https://sepolia.basescan.org/address/" + signer.address);
  console.log("2. Look for USDC token balance");
  console.log("3. Make sure you're viewing Base Sepolia, not Ethereum mainnet");
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});