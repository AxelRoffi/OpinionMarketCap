/**
 * OpinionCore V6 -> V7 Upgrade Script
 *
 * V7 change (single, surgical): real moderation. One new bit-packed branch in
 * setSelfExitParameter (ADMIN_ROLE):
 *   paramType 9, newValue = opinionId*2   -> deactivate opinion
 *   paramType 9, newValue = opinionId*2+1 -> reactivate opinion
 * Deactivated opinions can't trade (all entrypoints revert OpinionNotActive)
 * and the frontend stops listing them (filters on isActive). Replaces the
 * OpinionAdmin deactivateOpinion stub that only emitted an event.
 *
 * STORAGE-SAFE: no state variables added/removed/reordered (validate_v7_storage
 * passes). Run (LIVE, irreversible):
 *   npx hardhat run contracts/scripts/upgrade_to_v7.js --network base
 */
const { ethers, upgrades } = require("hardhat");

const OPINION_CORE_PROXY = "0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1";
const VALIDATION_LIBRARY = "0x95a60C951BCB6E77644081f0501c9d2dDDfDb681";
const PRICE_CALCULATOR   = "0xb6cEB6F62e929aC99068255AA3E380F01Ed69cB7";
const SELF_EXIT_LIB      = "0x30c465f5772dc86555d37fE1376218Cbf79a4D93";
const IMPL_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

async function main() {
    console.log("=".repeat(60));
    console.log("OpinionCore V6 -> V7 Upgrade — real moderation (deactivate)");
    console.log("=".repeat(60));

    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    const network = await ethers.provider.getNetwork();
    const isLiveBase = network.chainId === 8453n;
    console.log("Network chainId:", network.chainId.toString(), isLiveBase ? "(LIVE Base)" : "(dry-run)");

    const beforeSlot = await ethers.provider.getStorage(OPINION_CORE_PROXY, IMPL_SLOT);
    const beforeImpl = "0x" + beforeSlot.slice(-40);
    console.log("Current implementation:", beforeImpl);

    const proxy = await ethers.getContractAt("OpinionCoreV6", OPINION_CORE_PROXY);
    const nextIdBefore = await proxy.nextOpinionId();
    console.log("nextOpinionId (before):", nextIdBefore.toString());

    const V7 = await ethers.getContractFactory("OpinionCoreV7", {
        libraries: {
            ValidationLibrary: VALIDATION_LIBRARY,
            PriceCalculator: PRICE_CALCULATOR,
            SelfExitLib: SELF_EXIT_LIB,
        },
    });

    console.log("Upgrading proxy to V7...");
    const upgraded = await upgrades.upgradeProxy(OPINION_CORE_PROXY, V7, {
        unsafeAllowLinkedLibraries: true,
        redeployImplementation: "always",
    });
    await upgraded.waitForDeployment();

    // Re-read impl directly (the proxy view can lag right after the tx).
    const afterSlot = await ethers.provider.getStorage(OPINION_CORE_PROXY, IMPL_SLOT);
    const afterImpl = "0x" + afterSlot.slice(-40);
    const v7 = await ethers.getContractAt("OpinionCoreV7", OPINION_CORE_PROXY);
    const nextIdAfter = await v7.nextOpinionId();

    console.log("\n--- Upgrade Complete ---");
    console.log("Old implementation:", beforeImpl);
    console.log("New implementation:", afterImpl);
    console.log("nextOpinionId (after, preserved):", nextIdAfter.toString());
    if (nextIdAfter !== nextIdBefore) throw new Error("STATE MISMATCH after upgrade");

    if (isLiveBase) {
        const fs = require("fs");
        fs.writeFileSync("deployments/v7-upgrade-info.json", JSON.stringify({
            network: "base-mainnet", chainId: "8453",
            proxy: OPINION_CORE_PROXY,
            oldImplementation: beforeImpl,
            newImplementation: afterImpl,
            change: "V7: moderation branch in setSelfExitParameter (paramType 9, bit-packed id*2+activeBit)",
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
        }, null, 2));
        console.log("Saved deployments/v7-upgrade-info.json");
    }
}

main().then(() => process.exit(0)).catch((e) => {
    console.error("UPGRADE FAILED:", e);
    process.exit(1);
});
