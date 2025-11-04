import { ethers } from "hardhat";
import { MAINNET_USDC } from "../config/mainnet-constants";

/**
 * 🔍 USDC VALIDATION SCRIPT
 * 
 * Validates the real USDC contract on Base Mainnet
 * Ensures we're using the correct contract address
 */

const USDC_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
];

async function validateUSDC() {
  console.log("🔍 VALIDATING USDC CONTRACT ON BASE MAINNET");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Setup provider for Base Mainnet
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  
  console.log("📍 USDC Address:", MAINNET_USDC.ADDRESS);
  console.log("🌐 Network: Base Mainnet (Chain ID: 8453)");
  console.log("");
  
  try {
    // Check if contract exists
    console.log("1️⃣ Checking contract existence...");
    const code = await provider.getCode(MAINNET_USDC.ADDRESS);
    if (code === "0x") {
      throw new Error("❌ No contract found at USDC address");
    }
    console.log("✅ Contract exists");
    
    // Create contract instance
    const usdcContract = new ethers.Contract(MAINNET_USDC.ADDRESS, USDC_ABI, provider);
    
    // Validate contract properties
    console.log("\n2️⃣ Validating contract properties...");
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      usdcContract.name(),
      usdcContract.symbol(),
      usdcContract.decimals(),
      usdcContract.totalSupply()
    ]);
    
    console.log("📛 Name:", name);
    console.log("🏷️  Symbol:", symbol);
    console.log("🔢 Decimals:", decimals.toString());
    console.log("💰 Total Supply:", ethers.formatUnits(totalSupply, decimals));
    
    // Validate expected values
    console.log("\n3️⃣ Validating expected values...");
    
    const validations = [
      { check: "Symbol", expected: MAINNET_USDC.SYMBOL, actual: symbol },
      { check: "Decimals", expected: MAINNET_USDC.DECIMALS.toString(), actual: decimals.toString() },
      { check: "Name contains 'USD'", expected: true, actual: name.toLowerCase().includes('usd') }
    ];
    
    let allValid = true;
    for (const validation of validations) {
      const isValid = validation.expected.toString() === validation.actual.toString();
      console.log(`${isValid ? '✅' : '❌'} ${validation.check}: ${validation.actual} ${isValid ? '' : `(expected: ${validation.expected})`}`);
      if (!isValid) allValid = false;
    }
    
    // Get latest block info
    console.log("\n4️⃣ Network status...");
    const latestBlock = await provider.getBlock("latest");
    console.log("📦 Latest Block:", latestBlock?.number);
    console.log("⏰ Block Time:", new Date(latestBlock?.timestamp ? latestBlock.timestamp * 1000 : 0).toISOString());
    
    // Final validation
    if (allValid) {
      console.log("\n🎉 USDC VALIDATION PASSED!");
      console.log("✅ Real USDC contract on Base Mainnet is correctly configured");
      console.log(`✅ Address: ${MAINNET_USDC.ADDRESS}`);
      console.log(`✅ Symbol: ${symbol}`);
      console.log(`✅ Decimals: ${decimals}`);
      console.log(`✅ Total Supply: ${ethers.formatUnits(totalSupply, decimals)} USDC`);
    } else {
      console.log("\n❌ USDC VALIDATION FAILED!");
      console.log("Please review the contract address and configuration");
    }
    
  } catch (error) {
    console.error("\n❌ VALIDATION ERROR:", error);
    console.log("\nTroubleshooting:");
    console.log("• Check network connectivity to Base Mainnet");
    console.log("• Verify USDC contract address is correct");
    console.log("• Ensure Base Mainnet RPC is working");
    process.exit(1);
  }
}

// Additional function to validate USDC balance for a specific address
export async function validateUSDCBalance(address: string): Promise<string> {
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  const usdcContract = new ethers.Contract(MAINNET_USDC.ADDRESS, USDC_ABI, provider);
  
  try {
    const balance = await usdcContract.balanceOf(address);
    return ethers.formatUnits(balance, MAINNET_USDC.DECIMALS);
  } catch (error) {
    console.error("Error checking USDC balance:", error);
    return "0";
  }
}

// Run validation if script is called directly
if (require.main === module) {
  validateUSDC()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Validation failed:", error);
      process.exit(1);
    });
}

export { validateUSDC };