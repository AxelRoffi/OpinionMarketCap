/**
 * OpinionCore V2 -> V3 Manual Upgrade Script
 * Deploys implementation directly and calls upgradeTo
 */

const { ethers } = require("hardhat");

// Base Mainnet addresses
const OPINION_CORE_PROXY = "0x7b5d97fb78fbf41432F34f46a901C6da7754A726";
const VALIDATION_LIBRARY = "0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5";
const PRICE_CALCULATOR = "0x99677761a6908EBde8BaD60cEfb2374C9f9afCEE"; // Already deployed

async function main() {
    console.log("=".repeat(60));
    console.log("OpinionCore V2 -> V3 Manual Upgrade");
    console.log("=".repeat(60));

    const [deployer] = await ethers.getSigners();
    console.log("\nDeployer:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");

    // Verify network
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId.toString());

    if (network.chainId !== 8453n) {
        console.error("ERROR: This script is for Base mainnet (chainId 8453)");
        process.exit(1);
    }

    // Get current implementation
    const implSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
    const currentImplSlot = await ethers.provider.getStorage(OPINION_CORE_PROXY, implSlot);
    const currentImpl = "0x" + currentImplSlot.slice(-40);
    console.log("\nCurrent Implementation:", currentImpl);

    console.log("\n--- Step 1: Deploy OpinionCoreV3 Implementation ---");

    // Get factory with libraries linked
    const OpinionCoreV3 = await ethers.getContractFactory("OpinionCoreV3", {
        libraries: {
            ValidationLibrary: VALIDATION_LIBRARY,
            PriceCalculator: PRICE_CALCULATOR
        }
    });

    // Deploy implementation directly
    const v3Impl = await OpinionCoreV3.deploy();
    await v3Impl.waitForDeployment();
    const v3ImplAddress = await v3Impl.getAddress();
    console.log("V3 Implementation deployed at:", v3ImplAddress);

    console.log("\n--- Step 2: Upgrade Proxy ---");

    // Get proxy contract with V2 ABI (which has upgradeToAndCall)
    const proxyAbi = [
        "function upgradeToAndCall(address newImplementation, bytes memory data) external",
        "function upgradeTo(address newImplementation) external",
        "function nextOpinionId() view returns (uint256)",
        "function minimumPrice() view returns (uint96)",
        "function absoluteMaxPriceChange() view returns (uint256)"
    ];

    const proxy = new ethers.Contract(OPINION_CORE_PROXY, proxyAbi, deployer);

    // Call upgradeTo (no initialization needed since storage is preserved)
    console.log("Calling upgradeToAndCall...");
    const tx = await proxy.upgradeToAndCall(v3ImplAddress, "0x");
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("Transaction confirmed!");

    // Verify new implementation
    const newImplSlot = await ethers.provider.getStorage(OPINION_CORE_PROXY, implSlot);
    const newImpl = "0x" + newImplSlot.slice(-40);
    console.log("\nNew Implementation:", newImpl);

    if (newImpl.toLowerCase() !== v3ImplAddress.toLowerCase()) {
        console.error("WARNING: Implementation mismatch!");
        console.log("Expected:", v3ImplAddress);
        console.log("Got:", newImpl);
    } else {
        console.log("SUCCESS: Implementation upgraded!");
    }

    console.log("\n--- Step 3: Verify V3 Functions ---");

    const v3Abi = [
        "function nextOpinionId() view returns (uint256)",
        "function minimumPrice() view returns (uint96)",
        "function absoluteMaxPriceChange() view returns (uint256)",
        "function getPriceNonce() view returns (uint256)",
        "function getPriceMetadata(uint256 opinionId) view returns (uint256)"
    ];

    const v3Proxy = new ethers.Contract(OPINION_CORE_PROXY, v3Abi, deployer);

    const nextOpinionId = await v3Proxy.nextOpinionId();
    console.log("nextOpinionId:", nextOpinionId.toString());

    const minPrice = await v3Proxy.minimumPrice();
    console.log("minimumPrice:", ethers.formatUnits(minPrice, 6), "USDC");

    const maxChange = await v3Proxy.absoluteMaxPriceChange();
    console.log("absoluteMaxPriceChange:", maxChange.toString(), "%");

    try {
        const nonce = await v3Proxy.getPriceNonce();
        console.log("getPriceNonce:", nonce.toString(), "(V3 function works!)");
    } catch (e) {
        console.log("getPriceNonce: Failed -", e.message);
    }

    console.log("\n" + "=".repeat(60));
    console.log("V3 UPGRADE COMPLETE!");
    console.log("=".repeat(60));

    // Save deployment info
    const fs = require("fs");
    const deploymentInfo = {
        network: "base-mainnet",
        chainId: 8453,
        upgradedAt: new Date().toISOString(),
        proxyAddress: OPINION_CORE_PROXY,
        oldImplementation: currentImpl,
        newImplementation: v3ImplAddress,
        priceCalculatorLibrary: PRICE_CALCULATOR,
        validationLibrary: VALIDATION_LIBRARY,
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
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
