/**
 * OpinionCore V3 Upgrade Only - Implementation already deployed
 */

const { ethers } = require("hardhat");

const OPINION_CORE_PROXY = "0x7b5d97fb78fbf41432F34f46a901C6da7754A726";
const V3_IMPLEMENTATION = "0x8de10cFABaEE6dB8aA0c0fD88e6d3E228a59Ee6d";

async function main() {
    console.log("=".repeat(60));
    console.log("OpinionCore V3 Upgrade - Implementation Already Deployed");
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
    console.log("V3 Implementation:", V3_IMPLEMENTATION);

    if (currentImpl.toLowerCase() === V3_IMPLEMENTATION.toLowerCase()) {
        console.log("\nProxy is already upgraded to V3!");
        return;
    }

    console.log("\n--- Upgrading Proxy to V3 ---");

    const proxyAbi = [
        "function upgradeToAndCall(address newImplementation, bytes memory data) external"
    ];

    const proxy = new ethers.Contract(OPINION_CORE_PROXY, proxyAbi, deployer);

    // Use higher gas price
    const feeData = await ethers.provider.getFeeData();
    const gasPrice = feeData.gasPrice * 2n; // Double the current gas price
    console.log("Using gas price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");

    console.log("Calling upgradeToAndCall...");
    const tx = await proxy.upgradeToAndCall(V3_IMPLEMENTATION, "0x", { gasPrice });
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("Transaction confirmed!");

    // Verify new implementation
    const newImplSlot = await ethers.provider.getStorage(OPINION_CORE_PROXY, implSlot);
    const newImpl = "0x" + newImplSlot.slice(-40);
    console.log("\nNew Implementation:", newImpl);

    if (newImpl.toLowerCase() === V3_IMPLEMENTATION.toLowerCase()) {
        console.log("\nSUCCESS: Proxy upgraded to V3!");
    } else {
        console.log("\nWARNING: Implementation mismatch!");
    }

    // Verify V3 functions
    console.log("\n--- Verifying V3 Functions ---");
    const v3Abi = [
        "function nextOpinionId() view returns (uint256)",
        "function minimumPrice() view returns (uint96)",
        "function getPriceNonce() view returns (uint256)"
    ];

    const v3Proxy = new ethers.Contract(OPINION_CORE_PROXY, v3Abi, deployer);

    try {
        const nextOpinionId = await v3Proxy.nextOpinionId();
        console.log("nextOpinionId:", nextOpinionId.toString());

        const minPrice = await v3Proxy.minimumPrice();
        console.log("minimumPrice:", ethers.formatUnits(minPrice, 6), "USDC");

        const nonce = await v3Proxy.getPriceNonce();
        console.log("getPriceNonce:", nonce.toString(), "(V3 function works!)");
    } catch (e) {
        console.log("Error verifying:", e.message);
    }

    console.log("\n" + "=".repeat(60));
    console.log("V3 UPGRADE COMPLETE!");
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
