/**
 * Grant CORE_CONTRACT_ROLE to OpinionCore on FeeManager
 *
 * This fixes the issue where OpinionCore cannot call accumulateFee()
 * on FeeManager because it lacks the CORE_CONTRACT_ROLE.
 *
 * Run with: npx hardhat run scripts/grant-core-role-to-feemanager.js --network base
 */

const hre = require("hardhat");

async function main() {
  const FEEMANAGER_ADDRESS = "0x31D604765CD76Ff098A283881B2ca57e7F703199";
  const OPINIONCORE_ADDRESS = "0x7b5d97fb78fbf41432F34f46a901C6da7754A726";

  console.log("=== Grant CORE_CONTRACT_ROLE to OpinionCore on FeeManager ===\n");

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Signer address:", signer.address);

  // Get FeeManager contract
  const feeManager = await hre.ethers.getContractAt(
    [
      "function grantCoreContractRole(address contractAddress) external",
      "function hasRole(bytes32 role, address account) view returns (bool)",
      "function CORE_CONTRACT_ROLE() view returns (bytes32)",
      "function ADMIN_ROLE() view returns (bytes32)"
    ],
    FEEMANAGER_ADDRESS,
    signer
  );

  // Check current state
  const CORE_CONTRACT_ROLE = await feeManager.CORE_CONTRACT_ROLE();
  const ADMIN_ROLE = await feeManager.ADMIN_ROLE();

  console.log("\nCORE_CONTRACT_ROLE:", CORE_CONTRACT_ROLE);

  const hasAdminRole = await feeManager.hasRole(ADMIN_ROLE, signer.address);
  console.log("Signer has ADMIN_ROLE:", hasAdminRole);

  if (!hasAdminRole) {
    console.error("\n❌ ERROR: Signer does not have ADMIN_ROLE on FeeManager");
    console.log("You need to use the admin wallet (0x9786eDdf2f254d5B582DA45FD332Bf5769DB4D8C)");
    process.exit(1);
  }

  const hasCoreRoleBefore = await feeManager.hasRole(CORE_CONTRACT_ROLE, OPINIONCORE_ADDRESS);
  console.log("OpinionCore has CORE_CONTRACT_ROLE (before):", hasCoreRoleBefore);

  if (hasCoreRoleBefore) {
    console.log("\n✅ OpinionCore already has CORE_CONTRACT_ROLE. No action needed.");
    return;
  }

  // Grant role
  console.log("\n📝 Granting CORE_CONTRACT_ROLE to OpinionCore...");
  const tx = await feeManager.grantCoreContractRole(OPINIONCORE_ADDRESS);
  console.log("Transaction hash:", tx.hash);

  console.log("Waiting for confirmation...");
  await tx.wait();

  // Verify
  const hasCoreRoleAfter = await feeManager.hasRole(CORE_CONTRACT_ROLE, OPINIONCORE_ADDRESS);
  console.log("\nOpinionCore has CORE_CONTRACT_ROLE (after):", hasCoreRoleAfter);

  if (hasCoreRoleAfter) {
    console.log("\n✅ SUCCESS! OpinionCore now has CORE_CONTRACT_ROLE on FeeManager");
    console.log("Trading should work now.");
  } else {
    console.error("\n❌ FAILED: Role was not granted");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
