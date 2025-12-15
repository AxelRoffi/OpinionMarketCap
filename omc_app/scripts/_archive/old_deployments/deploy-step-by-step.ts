import { ethers, upgrades } from "hardhat";
import { writeFileSync } from "fs";

/**
 * 🚨 STEP-BY-STEP DEPLOYMENT - MINIMAL AND WORKING
 * 
 * This deploys contracts one by one with proper validation
 */

async function main() {
  console.log("🔍 STEP-BY-STEP DEPLOYMENT - DIAGNOSTIC MODE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Configuration
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // Step 1: Test USDC contract exists
  console.log("🔍 Step 1: Validating USDC contract...");
  try {
    const code = await deployer.provider.getCode(USDC_ADDRESS);
    if (code === "0x") {
      throw new Error("USDC contract not found at address");
    }
    console.log("✅ USDC contract exists at", USDC_ADDRESS);
  } catch (error) {
    console.log("❌ USDC validation failed:", error);
    return;
  }

  // Step 2: Deploy PriceCalculator Library ONLY
  console.log("📚 Step 2: Deploying PriceCalculator Library...");
  try {
    const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
    const priceCalculatorLib = await PriceCalculator.deploy();
    await priceCalculatorLib.waitForDeployment();
    console.log("✅ PriceCalculator Library:", await priceCalculatorLib.getAddress());
  } catch (error) {
    console.log("❌ PriceCalculator deployment failed:", error);
    return;
  }

  console.log("");
  console.log("🎉 BASIC DEPLOYMENT TEST PASSED!");
  console.log("Next: Try deploying FeeManager...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });