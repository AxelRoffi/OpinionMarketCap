import { run } from "hardhat";

async function main() {
  console.log("🔍 Verifying new OpinionCore implementation contract...");
  
  const implementationAddress = "0x9d0d22c617e03f2bab1045b692aa1647ca7232b5";
  
  try {
    await run("verify:verify", {
      address: implementationAddress,
      constructorArguments: [], // Implementation contracts typically have no constructor args
      contract: "contracts/core/OpinionCore.sol:OpinionCore"
    });
    
    console.log("✅ Contract verified successfully!");
    console.log(`📝 Implementation: ${implementationAddress}`);
    console.log("🔗 BaseScan should now show the correct ABI");
    
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("ℹ️ Contract is already verified");
    } else {
      console.error("❌ Verification failed:", error.message);
      
      // Try alternative verification methods
      console.log("\n🔄 Trying alternative verification...");
      
      try {
        await run("verify:verify", {
          address: implementationAddress,
          constructorArguments: [],
        });
        console.log("✅ Alternative verification successful!");
      } catch (altError: any) {
        console.error("❌ Alternative verification also failed:", altError.message);
        console.log("\n💡 Manual verification steps:");
        console.log("1. Go to https://sepolia.basescan.org/address/" + implementationAddress + "#code");
        console.log("2. Click 'Verify and Publish'");
        console.log("3. Select 'Solidity (Standard JSON Input)'");
        console.log("4. Upload the compiled contract JSON");
        console.log("5. Set compiler version to 0.8.20");
      }
    }
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});