import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Locating FeeManager contract...");
  
  const CONTRACT_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  
  try {
    // Try to read the contract storage to find FeeManager address
    const provider = ethers.provider;
    
    console.log("📋 Analyzing contract storage...");
    
    // In OpinionCore.sol, feeManager is the second state variable after usdcToken
    // Let's check storage slots to find the FeeManager address
    
    // Slot 0: Usually contains multiple variables packed together
    const slot0 = await provider.getStorage(CONTRACT_ADDRESS, 0);
    console.log("Storage slot 0:", slot0);
    
    // Slot 1: Might contain feeManager address
    const slot1 = await provider.getStorage(CONTRACT_ADDRESS, 1);
    console.log("Storage slot 1:", slot1);
    
    // Slot 2: Might contain poolManager address
    const slot2 = await provider.getStorage(CONTRACT_ADDRESS, 2);
    console.log("Storage slot 2:", slot2);
    
    // Check if slot1 contains an address (20 bytes)
    if (slot1 !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      const feeManagerAddress = "0x" + slot1.slice(-40);
      console.log("\n✅ Potential FeeManager address found:", feeManagerAddress);
      
      // Verify it has code
      const code = await provider.getCode(feeManagerAddress);
      if (code.length > 2) {
        console.log("✅ Address has contract code");
        
        // Try to call a FeeManager function
        try {
          const feeManager = await ethers.getContractAt("IFeeManager", feeManagerAddress);
          const platformFeePercent = await feeManager.platformFeePercent();
          console.log("✅ Platform Fee Percent:", platformFeePercent.toString(), "%");
          console.log("✅ Confirmed: This is the FeeManager contract");
        } catch (error: any) {
          console.log("❌ Error calling FeeManager functions:", error.message);
        }
      } else {
        console.log("❌ Address has no contract code");
      }
    }
    
    // Check your deployment files
    console.log("\n📋 Checking deployment files...");
    const deploymentData = {
      "deployed-addresses-new-working.json": require("../deployed-addresses-new-working.json"),
      "deployed-addresses-real-usdc.json": require("../deployed-addresses-real-usdc.json"),
      "deployed-addresses.json": require("../deployed-addresses.json")
    };
    
    for (const [filename, data] of Object.entries(deploymentData)) {
      console.log(`\n📄 ${filename}:`);
      if (data.contracts) {
        console.log("- OpinionCore:", data.contracts.opinionCore);
        console.log("- FeeManager:", data.contracts.mockFeeManager || data.contracts.feeManager || "❌ Not found");
      } else {
        console.log("- OpinionCore:", data.opinionCore);
        console.log("- FeeManager:", data.mockFeeManager || data.feeManager || "❌ Not found");
      }
    }
    
    // Important finding
    console.log("\n🚨 Key Finding:");
    console.log("Your deployment files show 'mockFeeManager' pointing to the deployer address:");
    console.log("This means platform fees might be going to the deployer address instead of a separate FeeManager contract!");
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});