/**
 * OpinionExtensionsV2 Upgrade Script
 *
 * This script upgrades the OpinionExtensions proxy to V2 which fixes:
 * - validateCategories() now requires at least one category (was allowing empty arrays)
 * - initializeOpinionCategories() now requires at least one category
 *
 * Run with: npx hardhat run contracts/active/deploy/UpgradeOpinionExtensionsV2.js --network base
 */

const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("UPGRADING OpinionExtensions to V2");
  console.log("=".repeat(60));

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("\nDeployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  // Existing proxy address (from mainnet deployment)
  const OPINION_EXTENSIONS_PROXY = "0x2a5a4Dc8AE4eF69a15D9974df54f3f38B3e883aA";

  console.log("\n" + "-".repeat(60));
  console.log("STEP 1: Verify Current Implementation");
  console.log("-".repeat(60));

  // Get current implementation address
  const implSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  const currentImpl = await ethers.provider.getStorage(OPINION_EXTENSIONS_PROXY, implSlot);
  const currentImplAddress = "0x" + currentImpl.slice(26);
  console.log("Current implementation:", currentImplAddress);

  console.log("\n" + "-".repeat(60));
  console.log("STEP 2: Deploy New Implementation (V2)");
  console.log("-".repeat(60));

  // Get the V2 contract factory
  const OpinionExtensionsV2 = await ethers.getContractFactory("OpinionExtensionsV2");

  console.log("Upgrading OpinionExtensions proxy to V2...");

  // Perform the upgrade
  const upgraded = await upgrades.upgradeProxy(OPINION_EXTENSIONS_PROXY, OpinionExtensionsV2);
  await upgraded.waitForDeployment();

  const newAddress = await upgraded.getAddress();
  console.log("✅ Upgrade complete!");
  console.log("Proxy address (unchanged):", newAddress);

  // Get new implementation address
  const newImpl = await ethers.provider.getStorage(OPINION_EXTENSIONS_PROXY, implSlot);
  const newImplAddress = "0x" + newImpl.slice(26);
  console.log("New implementation:", newImplAddress);

  console.log("\n" + "-".repeat(60));
  console.log("STEP 3: Verify V2 Fix");
  console.log("-".repeat(60));

  // Test that empty categories now return false
  const extensionsV2 = await ethers.getContractAt("OpinionExtensionsV2", OPINION_EXTENSIONS_PROXY);

  // Note: We can't call validateCategories directly as it requires CORE_CONTRACT_ROLE
  // But we can verify the MIN_CATEGORIES_PER_OPINION constant
  const minCategories = await extensionsV2.MIN_CATEGORIES_PER_OPINION();
  console.log("MIN_CATEGORIES_PER_OPINION:", minCategories.toString());

  const maxCategories = await extensionsV2.MAX_CATEGORIES_PER_OPINION();
  console.log("MAX_CATEGORIES_PER_OPINION:", maxCategories.toString());

  console.log("\n" + "=".repeat(60));
  console.log("UPGRADE SUMMARY");
  console.log("=".repeat(60));
  console.log("Contract: OpinionExtensions");
  console.log("Proxy Address:", OPINION_EXTENSIONS_PROXY);
  console.log("Old Implementation:", currentImplAddress);
  console.log("New Implementation:", newImplAddress);
  console.log("\nV2 Fixes:");
  console.log("- validateCategories() now requires at least 1 category");
  console.log("- initializeOpinionCategories() now requires at least 1 category");
  console.log("=".repeat(60));

  // Return deployment info for verification
  return {
    proxy: OPINION_EXTENSIONS_PROXY,
    oldImplementation: currentImplAddress,
    newImplementation: newImplAddress
  };
}

main()
  .then((result) => {
    console.log("\n✅ Upgrade successful!");
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Upgrade failed:", error);
    process.exit(1);
  });
