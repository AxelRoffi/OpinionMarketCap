/**
 * Upgrade OpinionCore to V2
 *
 * V2 fixes:
 * - Fee transfer: fees now properly sent to FeeManager
 * - Added pause()/unpause() admin functions
 * - Added emergencyWithdraw() function
 * - Added rescueStuckFees() to recover fees from V1
 *
 * Run with: npx hardhat run scripts/upgrade-opinioncore-v2.js --network base
 */

const hre = require("hardhat");
const { ethers, upgrades } = hre;

const DEPLOYED = {
  OPINION_CORE_PROXY: "0x7b5d97fb78fbf41432F34f46a901C6da7754A726",
  VALIDATION_LIBRARY: "0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5",
  FEE_MANAGER: "0x31D604765CD76Ff098A283881B2ca57e7F703199",
};

async function main() {
  console.log("=== Upgrading OpinionCore to V2 ===\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Step 1: Deploy new implementation
  console.log("1. Getting OpinionCoreV2 factory...");

  const OpinionCoreV2 = await ethers.getContractFactory("OpinionCoreV2", {
    libraries: {
      ValidationLibrary: DEPLOYED.VALIDATION_LIBRARY,
    },
  });

  console.log("2. Upgrading proxy to V2...");

  // Note: We need to force the upgrade since we're adding new functions
  const upgraded = await upgrades.upgradeProxy(
    DEPLOYED.OPINION_CORE_PROXY,
    OpinionCoreV2,
    {
      unsafeAllowLinkedLibraries: true,
      // unsafeSkipStorageCheck: true, // Only if storage layout issues
    }
  );

  await upgraded.waitForDeployment();
  const newImplAddress = await upgrades.erc1967.getImplementationAddress(DEPLOYED.OPINION_CORE_PROXY);

  console.log("✅ Upgrade complete!");
  console.log("   Proxy address:", DEPLOYED.OPINION_CORE_PROXY);
  console.log("   New implementation:", newImplAddress);

  // Step 2: Rescue stuck fees from V1
  console.log("\n3. Checking for stuck fees...");

  const usdc = await ethers.getContractAt(
    ["function balanceOf(address) view returns (uint256)"],
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  );

  const stuckFees = await usdc.balanceOf(DEPLOYED.OPINION_CORE_PROXY);
  console.log("   Stuck USDC in OpinionCore:", ethers.formatUnits(stuckFees, 6), "USDC");

  if (stuckFees > 0) {
    console.log("\n4. Rescuing stuck fees to FeeManager...");
    const tx = await upgraded.rescueStuckFees();
    await tx.wait();
    console.log("   ✅ Fees rescued! TX:", tx.hash);
  } else {
    console.log("   No stuck fees to rescue.");
  }

  // Step 3: Verify new functions exist
  console.log("\n5. Verifying V2 functions...");

  try {
    const isPaused = await upgraded.isPaused();
    console.log("   ✅ isPaused():", isPaused);
  } catch (e) {
    console.log("   ❌ isPaused() failed:", e.message);
  }

  console.log("\n=== Upgrade Summary ===");
  console.log("New admin functions available:");
  console.log("  - pause() - Pause all trading");
  console.log("  - unpause() - Resume trading");
  console.log("  - emergencyWithdraw(token, to, amount) - Emergency withdrawal (when paused)");
  console.log("  - rescueStuckFees() - Transfer stuck USDC to FeeManager");
  console.log("\nFee flow fixed:");
  console.log("  - submitAnswer() now transfers 5% fees to FeeManager");
  console.log("  - Creators can claim their 3% from FeeManager");
  console.log("  - Platform can withdraw 2% from FeeManager to treasury");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
