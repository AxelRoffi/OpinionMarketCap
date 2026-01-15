/**
 * OpinionCore V2 -> V3 Upgrade Script
 *
 * V3 Features:
 * - Dynamic pricing using PriceCalculator library
 * - 4 market regimes: CONSOLIDATION, BULLISH_TRENDING, MILD_CORRECTION, PARABOLIC
 * - Activity-based regime selection (cold/warm/hot topics)
 * - Price changes range from -20% to +80% (vs fixed 10% in V2)
 *
 * Run: npx hardhat run contracts/scripts/upgrade_to_v3.js --network base
 */

const { ethers, upgrades } = require("hardhat");

// Base Mainnet addresses
const OPINION_CORE_PROXY = "0x7b5d97fb78fbf41432F34f46a901C6da7754A726";
const VALIDATION_LIBRARY = "0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5";

async function main() {
    console.log("=".repeat(60));
    console.log("OpinionCore V2 -> V3 Upgrade");
    console.log("Dynamic Pricing with Market Regimes");
    console.log("=".repeat(60));

    const [deployer] = await ethers.getSigners();
    console.log("\nDeployer:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");

    // Verify we're on Base mainnet
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId.toString());

    if (network.chainId !== 8453n) {
        console.error("ERROR: This script is for Base mainnet (chainId 8453)");
        process.exit(1);
    }

    console.log("\n--- Pre-Upgrade Checks ---");

    // Get current implementation
    const currentImplSlot = await ethers.provider.getStorage(
        OPINION_CORE_PROXY,
        "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
    );
    const currentImpl = "0x" + currentImplSlot.slice(-40);
    console.log("Current Implementation:", currentImpl);

    // Verify proxy is accessible
    const proxyContract = await ethers.getContractAt("OpinionCoreV2", OPINION_CORE_PROXY);
    try {
        const nextOpinionId = await proxyContract.nextOpinionId();
        console.log("Current nextOpinionId:", nextOpinionId.toString());

        const isPaused = await proxyContract.isPaused();
        console.log("Contract paused:", isPaused);
    } catch (e) {
        console.error("Failed to read proxy state:", e.message);
        process.exit(1);
    }

    console.log("\n--- Deploying V3 Implementation ---");

    // Get OpinionCoreV3 factory with ValidationLibrary linked
    const OpinionCoreV3 = await ethers.getContractFactory("OpinionCoreV3", {
        libraries: {
            ValidationLibrary: VALIDATION_LIBRARY
        }
    });

    console.log("Upgrading proxy to V3...");

    try {
        const upgraded = await upgrades.upgradeProxy(
            OPINION_CORE_PROXY,
            OpinionCoreV3,
            {
                unsafeAllowLinkedLibraries: true,
                redeployImplementation: "always"
            }
        );

        await upgraded.waitForDeployment();

        const newImplSlot = await ethers.provider.getStorage(
            OPINION_CORE_PROXY,
            "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
        );
        const newImpl = "0x" + newImplSlot.slice(-40);

        console.log("\n--- Upgrade Complete ---");
        console.log("Proxy Address:", OPINION_CORE_PROXY);
        console.log("Old Implementation:", currentImpl);
        console.log("New Implementation:", newImpl);

        // Verify upgrade
        console.log("\n--- Post-Upgrade Verification ---");
        const v3Contract = await ethers.getContractAt("OpinionCoreV3", OPINION_CORE_PROXY);

        const nextOpinionIdAfter = await v3Contract.nextOpinionId();
        console.log("nextOpinionId (preserved):", nextOpinionIdAfter.toString());

        const nonce = await v3Contract.getPriceNonce();
        console.log("Price nonce:", nonce.toString());

        const minimumPrice = await v3Contract.minimumPrice();
        console.log("Minimum price:", ethers.formatUnits(minimumPrice, 6), "USDC");

        const maxPriceChange = await v3Contract.absoluteMaxPriceChange();
        console.log("Max price change:", maxPriceChange.toString(), "%");

        console.log("\n" + "=".repeat(60));
        console.log("V3 UPGRADE SUCCESSFUL!");
        console.log("Dynamic pricing with market regimes is now active.");
        console.log("=".repeat(60));

        console.log("\nV3 Market Regimes:");
        console.log("- CONSOLIDATION (25%): -10% to +15%");
        console.log("- BULLISH_TRENDING (60%): +5% to +40%");
        console.log("- MILD_CORRECTION (15%): -20% to +5%");
        console.log("- PARABOLIC (2%): +40% to +80%");

        // Save deployment info
        const fs = require("fs");
        const deploymentInfo = {
            network: "base-mainnet",
            chainId: 8453,
            upgradedAt: new Date().toISOString(),
            proxyAddress: OPINION_CORE_PROXY,
            oldImplementation: currentImpl,
            newImplementation: newImpl,
            version: "V3",
            features: [
                "Dynamic pricing with PriceCalculator",
                "4 market regimes",
                "Activity-based regime selection",
                "Price range: -20% to +80%"
            ]
        };

        fs.writeFileSync(
            "deployments/v3-upgrade-info.json",
            JSON.stringify(deploymentInfo, null, 2)
        );
        console.log("\nDeployment info saved to deployments/v3-upgrade-info.json");

    } catch (e) {
        console.error("\nUpgrade failed:", e.message);
        console.error(e);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
