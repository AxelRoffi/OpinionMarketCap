const { run } = require("hardhat");

async function main() {
  console.log("=== Verifying FeeManager Contract ===");
  
  const FEE_MANAGER_ADDRESS = "0xc8f879d86266C334eb9699963ca0703aa1189d8F";
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
  
  try {
    console.log("Verifying FeeManager at:", FEE_MANAGER_ADDRESS);
    console.log("Constructor args:");
    console.log("- USDC Token:", USDC_ADDRESS);
    console.log("- Treasury:", TREASURY_ADDRESS);
    
    await run("verify:verify", {
      address: FEE_MANAGER_ADDRESS,
      constructorArguments: [], // No constructor arguments for upgradeable contracts
      contract: "contracts/core/FeeManager.sol:FeeManager"
    });
    
    console.log("✅ FeeManager contract verified successfully!");
    console.log("🎉 Users can now interact with the contract through BaseScan!");
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    
    if (error.message.includes("already verified")) {
      console.log("✅ Contract is already verified!");
    } else if (error.message.includes("constructor arguments")) {
      console.log("💡 Try checking the constructor arguments in the deployment script");
    } else {
      console.log("💡 Make sure the contract source code matches the deployed bytecode");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });