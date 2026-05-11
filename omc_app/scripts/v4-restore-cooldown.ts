// Restores production soloCooldown (14 days) on OpinionCoreV4.
// Run: npx hardhat run scripts/v4-restore-cooldown.ts --network base
import { ethers } from "hardhat";

const OPINION_CORE = "0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1";
const PROD_COOLDOWN = 14 * 24 * 60 * 60; // 1209600 = 14 days

async function main() {
  const [signer] = await ethers.getSigners();
  console.log(`Signer: ${signer.address}`);

  const opinionCore = await ethers.getContractAt(
    "OpinionCoreV4",
    OPINION_CORE,
    signer
  );

  const before = await opinionCore.soloCooldown();
  console.log(`soloCooldown before: ${before} s`);

  console.log(`Setting soloCooldown to ${PROD_COOLDOWN} s (14 days)…`);
  await (await opinionCore.setSelfExitParameter(0, PROD_COOLDOWN)).wait();

  const after = await opinionCore.soloCooldown();
  console.log(`soloCooldown after:  ${after} s`);
  if (Number(after) !== PROD_COOLDOWN) {
    throw new Error(`expected ${PROD_COOLDOWN}, got ${after}`);
  }
  console.log("✅ Production cooldown restored.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
