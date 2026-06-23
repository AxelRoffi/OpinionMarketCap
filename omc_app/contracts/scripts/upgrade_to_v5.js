/**
 * OpinionCore V4 -> V5 Upgrade Script
 *
 * V5 change (single, surgical):
 * - `createOpinion(question, answer, description, link, initialPrice, categories)`
 *   now accepts an optional `link` (source URL) for the creator's bootstrap
 *   answer, stored on the Opinion. Brings createOpinion to parity with
 *   submitAnswer (which already stored link).
 *
 * STORAGE-SAFE: no state variables added/removed/reordered. The Opinion struct
 * already had a `link` field; V4 hard-wrote "" at creation, V5 stores the
 * caller value. All V4 economics (self-exit, reclaim, locked stake) preserved.
 *
 * Run (DRY-RUN on a forked Base mainnet):
 *   npx hardhat run contracts/scripts/upgrade_to_v5.js
 * Run (LIVE on Base mainnet — irreversible, signs a real tx):
 *   npx hardhat run contracts/scripts/upgrade_to_v5.js --network base
 */

const { ethers, upgrades } = require("hardhat");

// ─── Base Mainnet addresses (V4 stack) ───────────────────────────────────
const OPINION_CORE_PROXY = "0xAdc44c00dc6A45B8776fDDBB1f977950838EafC1";

// Libraries already deployed and linked into the V4 implementation.
const VALIDATION_LIBRARY = "0x95a60C951BCB6E77644081f0501c9d2dDDfDb681";
const PRICE_CALCULATOR   = "0xb6cEB6F62e929aC99068255AA3E380F01Ed69cB7";
const SELF_EXIT_LIB      = "0x30c465f5772dc86555d37fE1376218Cbf79a4D93";

const IMPL_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

async function main() {
    console.log("=".repeat(60));
    console.log("OpinionCore V4 -> V5 Upgrade");
    console.log("createOpinion: add optional `link` parameter");
    console.log("=".repeat(60));

    const [deployer] = await ethers.getSigners();
    console.log("\nDeployer:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");

    const network = await ethers.provider.getNetwork();
    console.log("Network chainId:", network.chainId.toString());
    const isLiveBase = network.chainId === 8453n;
    console.log(isLiveBase ? "Mode: LIVE Base mainnet" : "Mode: DRY-RUN (local/fork)");

    // ─── Pre-upgrade checks ──────────────────────────────────────────────
    console.log("\n--- Pre-Upgrade Checks ---");
    const currentImplSlot = await ethers.provider.getStorage(OPINION_CORE_PROXY, IMPL_SLOT);
    const currentImpl = "0x" + currentImplSlot.slice(-40);
    console.log("Current Implementation:", currentImpl);

    const proxyV4 = await ethers.getContractAt("OpinionCoreV4", OPINION_CORE_PROXY);
    const nextIdBefore = await proxyV4.nextOpinionId();
    const minPriceBefore = await proxyV4.minimumPrice();
    const spamFeeBefore = await proxyV4.spamFee();
    const selfExitBefore = await proxyV4.selfExitEnabled();
    console.log("nextOpinionId:", nextIdBefore.toString());
    console.log("minimumPrice:", ethers.formatUnits(minPriceBefore, 6), "USDC");
    console.log("spamFee:", ethers.formatUnits(spamFeeBefore, 6), "USDC");
    console.log("selfExitEnabled:", selfExitBefore);

    // ─── Deploy V5 implementation + upgrade ──────────────────────────────
    console.log("\n--- Upgrading proxy to V5 ---");
    const OpinionCoreV5 = await ethers.getContractFactory("OpinionCoreV5", {
        libraries: {
            ValidationLibrary: VALIDATION_LIBRARY,
            PriceCalculator: PRICE_CALCULATOR,
            SelfExitLib: SELF_EXIT_LIB,
        },
    });

    const upgraded = await upgrades.upgradeProxy(OPINION_CORE_PROXY, OpinionCoreV5, {
        unsafeAllowLinkedLibraries: true,
        redeployImplementation: "always",
    });
    await upgraded.waitForDeployment();

    const newImplSlot = await ethers.provider.getStorage(OPINION_CORE_PROXY, IMPL_SLOT);
    const newImpl = "0x" + newImplSlot.slice(-40);

    console.log("\n--- Upgrade Complete ---");
    console.log("Proxy:", OPINION_CORE_PROXY);
    console.log("Old Implementation:", currentImpl);
    console.log("New Implementation:", newImpl);

    // ─── Post-upgrade verification: state preserved + new ABI present ────
    console.log("\n--- Post-Upgrade Verification ---");
    const v5 = await ethers.getContractAt("OpinionCoreV5", OPINION_CORE_PROXY);

    const nextIdAfter = await v5.nextOpinionId();
    const minPriceAfter = await v5.minimumPrice();
    const spamFeeAfter = await v5.spamFee();
    const selfExitAfter = await v5.selfExitEnabled();
    console.log("nextOpinionId (preserved):", nextIdAfter.toString());
    console.log("minimumPrice (preserved):", ethers.formatUnits(minPriceAfter, 6), "USDC");
    console.log("spamFee (preserved):", ethers.formatUnits(spamFeeAfter, 6), "USDC");
    console.log("selfExitEnabled (preserved):", selfExitAfter);

    // Assert state survived the upgrade.
    const ok =
        nextIdAfter === nextIdBefore &&
        minPriceAfter === minPriceBefore &&
        spamFeeAfter === spamFeeBefore &&
        selfExitAfter === selfExitBefore;
    if (!ok) throw new Error("STATE MISMATCH after upgrade — aborting verification");

    // Confirm the new 6-arg createOpinion signature is in the ABI.
    const frag = v5.interface.getFunction(
        "createOpinion(string,string,string,string,uint96,string[])"
    );
    console.log("createOpinion signature present:", frag ? frag.format("full") : "MISSING");
    if (!frag) throw new Error("V5 createOpinion(link) signature missing from ABI");

    console.log("\n" + "=".repeat(60));
    console.log("V5 UPGRADE OK — state preserved, createOpinion(link) live.");
    console.log("=".repeat(60));

    // ─── Save deployment info ────────────────────────────────────────────
    const fs = require("fs");
    const info = {
        network: isLiveBase ? "base-mainnet" : "dry-run",
        chainId: network.chainId.toString(),
        upgradedAt: new Date().toISOString(),
        proxyAddress: OPINION_CORE_PROXY,
        oldImplementation: currentImpl,
        newImplementation: newImpl,
        validationLibrary: VALIDATION_LIBRARY,
        priceCalculatorLibrary: PRICE_CALCULATOR,
        selfExitLibrary: SELF_EXIT_LIB,
        version: "V5",
        change: "createOpinion now accepts optional `link` (source URL)",
        statePreserved: { nextOpinionId: nextIdAfter.toString() },
    };
    if (isLiveBase) {
        fs.writeFileSync("deployments/v5-upgrade-info.json", JSON.stringify(info, null, 2));
        console.log("\nDeployment info saved to deployments/v5-upgrade-info.json");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
