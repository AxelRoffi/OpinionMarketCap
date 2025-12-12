const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🔍 Verifying Proxy Contract on Base Mainnet");
  console.log("=" .repeat(50));
  
  const proxyAddress = "0x64997bd18520d93e7f0da87c69582d06b7f265d5";
  
  try {
    // For UUPS proxy contracts, we need to verify both proxy and implementation
    console.log(`📋 Proxy Address: ${proxyAddress}`);
    
    // Get the implementation address from the proxy
    const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
    const provider = ethers.provider;
    const implementationStorageValue = await provider.getStorageAt(proxyAddress, implementationSlot);
    const implementationAddress = "0x" + implementationStorageValue.slice(-40);
    
    console.log(`🔍 Implementation Address: ${implementationAddress}`);
    
    if (implementationAddress === "0x0000000000000000000000000000000000000000") {
      console.log("❌ This doesn't appear to be a proxy contract");
      return;
    }
    
    // Try to verify the implementation contract
    console.log("\n🔄 Verifying implementation contract...");
    
    await hre.run("verify:verify", {
      address: implementationAddress,
      constructorArguments: [],
      contract: "contracts/core/OpinionCoreSimplified.sol:OpinionCoreSimplified"
    });
    
    console.log("✅ Implementation contract verified!");
    
    // Now try to verify the proxy
    console.log("\n🔄 Verifying proxy contract...");
    try {
      await upgrades.verify(proxyAddress);
      console.log("✅ Proxy contract verified!");
    } catch (proxyError) {
      console.log("ℹ️  Proxy verification note:", proxyError.message);
      console.log("📝 The implementation is verified, which is the main contract code.");
    }
    
  } catch (error) {
    console.log("❌ Verification failed:", error.message);
    
    if (error.message.includes("Stack too deep")) {
      console.log("\n💡 Stack too deep error detected!");
      console.log("📋 Alternative solutions:");
      console.log("1. Use BaseScan's manual verification with 'via-ir' enabled");
      console.log("2. Create a minimal verification contract");
      console.log("3. Use Sourcify for verification");
      
      // Try Sourcify verification
      console.log("\n🔄 Attempting Sourcify verification...");
      try {
        await hre.run("sourcify:verify", {
          address: proxyAddress
        });
        console.log("✅ Sourcify verification successful!");
      } catch (sourcifyError) {
        console.log("❌ Sourcify verification failed:", sourcifyError.message);
      }
    }
  }
}

main().catch(console.error);