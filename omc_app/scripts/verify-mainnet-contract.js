const { ethers } = require("hardhat");

async function verifyContract() {
  console.log("🔍 Verifying OpinionCoreSimplified Contract on Base Mainnet");
  console.log("=" .repeat(60));
  
  const contractAddress = "0x64997bd18520d93e7f0da87c69582d06b7f265d5";
  
  try {
    // This is likely an upgradeable proxy, so we need to verify the implementation
    console.log(`📋 Contract Address: ${contractAddress}`);
    
    // Try verification with no constructor arguments (typical for proxy)
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: "contracts/core/OpinionCoreSimplified.sol:OpinionCoreSimplified"
    });
    
    console.log("✅ Contract verified successfully!");
    
  } catch (error) {
    console.log("❌ Verification failed:", error.message);
    
    // If that fails, try verifying as implementation contract
    console.log("\n🔄 Trying alternative verification methods...");
    
    // Check if it's a proxy by looking for implementation slot
    const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
    const implementationAddress = await ethers.provider.getStorageAt(contractAddress, implementationSlot);
    
    if (implementationAddress !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      const cleanAddress = "0x" + implementationAddress.slice(-40);
      console.log(`🔍 Found implementation at: ${cleanAddress}`);
      
      try {
        await hre.run("verify:verify", {
          address: cleanAddress,
          constructorArguments: [],
          contract: "contracts/core/OpinionCoreSimplified.sol:OpinionCoreSimplified"
        });
        console.log("✅ Implementation contract verified!");
      } catch (implError) {
        console.log("❌ Implementation verification failed:", implError.message);
      }
    }
  }
}

verifyContract().catch(console.error);