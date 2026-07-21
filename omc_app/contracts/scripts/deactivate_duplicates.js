/**
 * Deactivate duplicate-question opinions via the V7 moderation branch.
 * For each id: setSelfExitParameter(9, id*2) -> opinions[id].isActive = false.
 * (Reactivate later with setSelfExitParameter(9, id*2+1).)
 *
 * Duplicate groups (June 2026 scan) — first mint of each group is KEPT:
 *   keep 16 (Biggest Tech Breakthrough?)          drop 17
 *   keep 22 (Best Smartphone Brand?)              drop 25, 27, 35, 41
 *   keep 23 (Greatest Boxer Ever?)                drop 28, 36, 42
 *   keep 24 (Best F1 Driver of All Time?)         drop 29, 37, 44
 *   keep 26 (Most Beautiful Beach in the World?)  drop 34, 39, 40
 *   keep 30 (Most Beautiful Woman in the World?)  drop 38, 45
 *   keep 31 (Best Hip Hop Album Ever?)            drop 43
 *   keep 32 (Best Country to Live In?)            drop 46
 *   keep 33 (GOAT Tennis Player?)                 drop 47
 *
 * Run (LIVE): npx hardhat run contracts/scripts/deactivate_duplicates.js --network base
 */
const { ethers } = require("hardhat");

const OPINION_CORE_PROXY = "0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1";
const IDS_TO_DEACTIVATE = [17, 25, 27, 35, 41, 28, 36, 42, 29, 37, 44, 34, 39, 40, 38, 45, 43, 46, 47];

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Signer:", signer.address);
    const core = await ethers.getContractAt("OpinionCoreV7", OPINION_CORE_PROXY);

    const ADMIN_ROLE = await core.ADMIN_ROLE();
    if (!(await core.hasRole(ADMIN_ROLE, signer.address))) {
        throw new Error("Signer does not hold ADMIN_ROLE — aborting.");
    }

    // NB: isOpinionActive() is onlyLinkedContracts — read via getOpinionDetails.
    const isActive = async (id) => (await core.getOpinionDetails(id)).isActive;

    let done = 0, skipped = 0, failed = 0;
    for (const id of IDS_TO_DEACTIVATE) {
        const before = await isActive(id);
        if (!before) {
            console.log(`id ${id}: already inactive — skip`);
            skipped++;
            continue;
        }
        try {
            const tx = await core.setSelfExitParameter(9, BigInt(id) * 2n); // id*2 => deactivate
            await tx.wait(2); // 2 confirmations — avoids stale post-tx reads
            await new Promise((r) => setTimeout(r, 3000)); // RPC in-flight throttle
            const after = await isActive(id);
            if (after) throw new Error("still active after tx");
            console.log(`id ${id}: DEACTIVATED ✅ (tx ${tx.hash})`);
            done++;
        } catch (e) {
            console.log(`id ${id}: FAILED — ${e.shortMessage ?? e.message}`);
            failed++;
        }
    }
    console.log(`\nDone: ${done} deactivated · ${skipped} already inactive · ${failed} failed`);
    if (failed > 0) process.exit(1);
}

main().then(() => process.exit(0)).catch((e) => {
    console.error("FAILED:", e.message || e);
    process.exit(1);
});
