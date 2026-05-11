// Enables V4 self-exit feature flags + lowers cooldown to 60s for live mainnet test.
// Run: npx hardhat run scripts/v4-enable-self-exit.ts --network base
import { ethers } from "hardhat";

const OPINION_CORE = "0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1";
const POOL_MANAGER = "0x34537a749F4b16E7542a59e5322338372A6a1E3c";

const VALIDATION_LIB = "0x95a60C951BCB6E77644081f0501c9d2dDDfDb681";
const PRICE_CALC = "0xb6cEB6F62e929aC99068255AA3E380F01Ed69cB7";
const SELF_EXIT_LIB = "0x30c465f5772dc86555d37fE1376218Cbf79a4D93";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log(`Signer:        ${signer.address}`);
  console.log(`OpinionCoreV4: ${OPINION_CORE}`);
  console.log(`PoolManagerV2: ${POOL_MANAGER}`);

  const opinionCore = await ethers.getContractAt(
    "OpinionCoreV4",
    OPINION_CORE,
    signer
  );
  const poolManager = await ethers.getContractAt(
    "PoolManagerV2",
    POOL_MANAGER,
    signer
  );

  console.log("\n── Pre-flight flag state ──");
  console.log(`  selfExitEnabled:          ${await opinionCore.selfExitEnabled()}`);
  console.log(`  reclaimVacantSlotEnabled: ${await opinionCore.reclaimVacantSlotEnabled()}`);
  console.log(`  stalePoolExitEnabled:     ${await poolManager.stalePoolExitEnabled()}`);
  console.log(`  soloCooldown (s):         ${await opinionCore.soloCooldown()}`);

  console.log("\n── 1) setSelfExitParameter(0, 60)  // soloCooldown = 60s ──");
  await (await opinionCore.setSelfExitParameter(0, 60)).wait();
  console.log("    ✓ done");

  console.log("\n── 2) setSelfExitFlag(0, true)     // selfExitEnabled ──");
  await (await opinionCore.setSelfExitFlag(0, true)).wait();
  console.log("    ✓ done");

  console.log("\n── 3) setSelfExitFlag(1, true)     // reclaimVacantSlotEnabled ──");
  await (await opinionCore.setSelfExitFlag(1, true)).wait();
  console.log("    ✓ done");

  console.log("\n── 4) poolManager.setStalePoolExitEnabled(true) ──");
  await (await poolManager.setStalePoolExitEnabled(true)).wait();
  console.log("    ✓ done");

  console.log("\n── Post state ──");
  console.log(`  selfExitEnabled:          ${await opinionCore.selfExitEnabled()}`);
  console.log(`  reclaimVacantSlotEnabled: ${await opinionCore.reclaimVacantSlotEnabled()}`);
  console.log(`  stalePoolExitEnabled:     ${await poolManager.stalePoolExitEnabled()}`);
  console.log(`  soloCooldown (s):         ${await opinionCore.soloCooldown()}`);

  console.log("\n✅ V4 self-exit enabled. Run full UAT, then call scripts/v4-restore-cooldown.ts");

  // Silence unused-import warnings about libraries.
  void VALIDATION_LIB;
  void PRICE_CALC;
  void SELF_EXIT_LIB;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
