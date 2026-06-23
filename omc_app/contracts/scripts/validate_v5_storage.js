/**
 * Pre-flight storage-layout validation for the V4 -> V5 upgrade.
 *
 * Pure local comparison via @openzeppelin/hardhat-upgrades — no network, no
 * fork, no manifest. Confirms V5 is a storage-compatible upgrade of V4.
 *
 * Run: npx hardhat run contracts/scripts/validate_v5_storage.js
 */
const { ethers, upgrades } = require("hardhat");

const LIBS = {
    ValidationLibrary: "0x95a60C951BCB6E77644081f0501c9d2dDDfDb681",
    PriceCalculator: "0xb6cEB6F62e929aC99068255AA3E380F01Ed69cB7",
    SelfExitLib: "0x30c465f5772dc86555d37fE1376218Cbf79a4D93",
};

async function main() {
    const V4 = await ethers.getContractFactory("OpinionCoreV4", { libraries: LIBS });
    const V5 = await ethers.getContractFactory("OpinionCoreV5", { libraries: LIBS });

    console.log("Validating OpinionCoreV4 -> OpinionCoreV5 storage layout...");
    await upgrades.validateUpgrade(V4, V5, {
        kind: "uups",
        unsafeAllowLinkedLibraries: true,
    });
    console.log("STORAGE-SAFE: V5 is a compatible upgrade of V4.");
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("STORAGE VALIDATION FAILED:");
        console.error(e.message || e);
        process.exit(1);
    });
