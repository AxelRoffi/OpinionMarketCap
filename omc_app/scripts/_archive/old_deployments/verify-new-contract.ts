import { run } from "hardhat";

async function main() {
  console.log("🔍 Verifying OpinionCore contract on BaseScan...");
  
  // Contract addresses from deployment
  const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
  const PRICE_CALCULATOR_ADDRESS = "0x885a5Ae1f3E770FA56657f7eBDf3B90682C15F4d";
  
  // Deployment parameters
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
  const DEPLOYER_ADDRESS = "0x3E41d4F16Ccee680DBD4eAC54dE7Cc2E3D0cA1E3"; // Mock manager address

  try {
    console.log("📚 Verifying PriceCalculator library...");
    await run("verify:verify", {
      address: PRICE_CALCULATOR_ADDRESS,
      constructorArguments: [],
    });
    console.log("✅ PriceCalculator library verified!");
  } catch (error) {
    console.log("❌ PriceCalculator verification failed:", error);
  }

  try {
    console.log("🏗️ Verifying OpinionCore contract...");
    await run("verify:verify", {
      address: OPINION_CORE_ADDRESS,
      constructorArguments: [],
      libraries: {
        PriceCalculator: PRICE_CALCULATOR_ADDRESS,
      },
    });
    console.log("✅ OpinionCore contract verified!");
  } catch (error) {
    console.log("❌ OpinionCore verification failed:", error);
  }

  console.log("\n🎉 Verification completed!");
  console.log("🔗 Check your contract on BaseScan:");
  console.log(`https://sepolia.basescan.org/address/${OPINION_CORE_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });