// Completes the V4 enable when the main script got stuck on nonce.
// Calls only setSelfExitFlag(1, true) + setStalePoolExitEnabled(true), bumped gas price.
import { ethers } from "hardhat";

const OPINION_CORE = "0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1";
const POOL_MANAGER = "0x34537a749F4b16E7542a59e5322338372A6a1E3c";

async function main() {
  const [signer] = await ethers.getSigners();
  const provider = signer.provider!;
  const fee = await provider.getFeeData();
  // Bump 4× over the 0.05 gwei default to clear any stuck tx
  const bumped = (fee.gasPrice ?? 50_000_000n) * 4n;
  console.log(`Signer: ${signer.address}`);
  console.log(`Using gasPrice: ${ethers.formatUnits(bumped, "gwei")} gwei`);

  const opinionCore = await ethers.getContractAt("OpinionCoreV4", OPINION_CORE, signer);
  const poolManager = await ethers.getContractAt("PoolManagerV2", POOL_MANAGER, signer);

  console.log("\n── Pre-flight ──");
  console.log(`  reclaimVacantSlotEnabled: ${await opinionCore.reclaimVacantSlotEnabled()}`);
  console.log(`  stalePoolExitEnabled:     ${await poolManager.stalePoolExitEnabled()}`);

  if (!(await opinionCore.reclaimVacantSlotEnabled())) {
    console.log("\n── setSelfExitFlag(1, true) ──");
    const tx = await opinionCore.setSelfExitFlag(1, true, { gasPrice: bumped });
    console.log(`    sent: ${tx.hash}`);
    await tx.wait();
    console.log("    ✓ confirmed");
  } else {
    console.log("    (already enabled)");
  }

  if (!(await poolManager.stalePoolExitEnabled())) {
    console.log("\n── poolManager.setStalePoolExitEnabled(true) ──");
    const tx = await poolManager.setStalePoolExitEnabled(true, { gasPrice: bumped });
    console.log(`    sent: ${tx.hash}`);
    await tx.wait();
    console.log("    ✓ confirmed");
  } else {
    console.log("    (already enabled)");
  }

  console.log("\n── Post state ──");
  console.log(`  selfExitEnabled:          ${await opinionCore.selfExitEnabled()}`);
  console.log(`  reclaimVacantSlotEnabled: ${await opinionCore.reclaimVacantSlotEnabled()}`);
  console.log(`  stalePoolExitEnabled:     ${await poolManager.stalePoolExitEnabled()}`);
  console.log(`  soloCooldown (s):         ${await opinionCore.soloCooldown()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
