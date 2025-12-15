import { run } from "hardhat";

async function main() {
  console.log("🔍 Starting contract verification...");

  const PRICE_CALCULATOR_ADDRESS = "0xc930A12280fa44a7f7Ed0faEcB1756fEa02Cf113";
  const OPINION_CORE_ADDRESS = "0xBba64bc9b3964dF3CE84Bb07A04Db818cb28C2Bc";
  const MOCK_USDC_ADDRESS = "0xAb462fb7F8c952C63b62EF4371A60020e2abcA95";

  // Verify PriceCalculator library (already done but showing for completeness)
  console.log("✅ PriceCalculator library already verified at:");
  console.log(`https://sepolia.basescan.org/address/${PRICE_CALCULATOR_ADDRESS}#code`);

  // Verify OpinionCore with libraries
  console.log("\n📋 Verifying OpinionCore contract...");
  try {
    await run("verify:verify", {
      address: OPINION_CORE_ADDRESS,
      libraries: {
        PriceCalculator: PRICE_CALCULATOR_ADDRESS,
      },
    });
    console.log("✅ OpinionCore verified successfully!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ OpinionCore was already verified!");
    } else {
      console.log("❌ OpinionCore verification failed:", error.message);
    }
  }

  // Verify Mock USDC
  console.log("\n💰 Verifying Mock USDC...");
  try {
    await run("verify:verify", {
      address: MOCK_USDC_ADDRESS,
      constructorArguments: ["USD Coin", "USDC"],
    });
    console.log("✅ Mock USDC verified successfully!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Mock USDC was already verified!");
    } else {
      console.log("❌ Mock USDC verification failed:", error.message);
    }
  }

  console.log("\n🎉 Verification complete! View your contracts:");
  console.log(`📚 PriceCalculator: https://sepolia.basescan.org/address/${PRICE_CALCULATOR_ADDRESS}#code`);
  console.log(`🧠 OpinionCore: https://sepolia.basescan.org/address/${OPINION_CORE_ADDRESS}#code`);
  console.log(`💰 Mock USDC: https://sepolia.basescan.org/address/${MOCK_USDC_ADDRESS}#code`);
  
  console.log("\n🔍 You can now:");
  console.log("- Read contract functions on BaseScan");
  console.log("- Verify the new fee model parameters");
  console.log("- Interact with the contract directly through the UI");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification script failed:", error);
    process.exit(1);
  });