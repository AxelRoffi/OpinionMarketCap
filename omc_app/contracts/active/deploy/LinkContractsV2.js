const { ethers } = require("hardhat");
require('dotenv').config();

/**
 * LINK CONTRACTS V2 - with manual nonce management
 */

const DEPLOYED = {
    poolManager: "0xF7f8fB9df7CCAa7fe438A921A51aC1e67749Fb5e",
    opinionAdmin: "0x4F0A1938E8707292059595275F9BBD067A301FD2",
    opinionExtensions: "0x2a5a4Dc8AE4eF69a15D9974df54f3f38B3e883aA",
    opinionCore: "0x7b5d97fb78fbf41432F34f46a901C6da7754A726"
};

async function main() {
    console.log("🔗 Linking Contracts V2...\n");

    const [deployer] = await ethers.getSigners();

    // Get current nonce from network
    const currentNonce = await ethers.provider.getTransactionCount(deployer.address, "latest");
    const pendingNonce = await ethers.provider.getTransactionCount(deployer.address, "pending");

    console.log("Deployer:", deployer.address);
    console.log("Current nonce (confirmed):", currentNonce);
    console.log("Pending nonce:", pendingNonce);
    console.log("");

    // Get fee data
    const feeData = await ethers.provider.getFeeData();
    console.log("Gas price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei\n");

    // Get contracts
    const opinionAdmin = await ethers.getContractAt("OpinionAdmin", DEPLOYED.opinionAdmin);
    const opinionExtensions = await ethers.getContractAt("OpinionExtensions", DEPLOYED.opinionExtensions);

    // Check current state
    const currentAdminCore = await opinionAdmin.coreContract();
    const currentExtCore = await opinionExtensions.coreContract();

    console.log("Current state:");
    console.log("  OpinionAdmin.coreContract:", currentAdminCore);
    console.log("  OpinionExtensions.coreContract:", currentExtCore);
    console.log("");

    let nonce = pendingNonce;

    // Only link if not already linked
    if (currentAdminCore === ethers.ZeroAddress) {
        console.log("1️⃣ Linking OpinionAdmin...");
        try {
            const tx1 = await opinionAdmin.setCoreContract(DEPLOYED.opinionCore, {
                nonce: nonce,
                gasLimit: 150000,
                gasPrice: feeData.gasPrice * 2n // Double gas price to replace pending tx
            });
            console.log("   Tx:", tx1.hash);
            console.log("   Waiting for confirmation...");
            await tx1.wait();
            console.log("   ✅ Done!\n");
            nonce++;
        } catch (e) {
            console.log("   ❌ Error:", e.shortMessage || e.message, "\n");
            nonce++;
        }
    } else {
        console.log("1️⃣ OpinionAdmin already linked ✅\n");
    }

    if (currentExtCore === ethers.ZeroAddress) {
        console.log("2️⃣ Linking OpinionExtensions...");
        try {
            const tx2 = await opinionExtensions.setCoreContract(DEPLOYED.opinionCore, {
                nonce: nonce,
                gasLimit: 150000,
                gasPrice: feeData.gasPrice * 2n
            });
            console.log("   Tx:", tx2.hash);
            console.log("   Waiting for confirmation...");
            await tx2.wait();
            console.log("   ✅ Done!\n");
        } catch (e) {
            console.log("   ❌ Error:", e.shortMessage || e.message, "\n");
        }
    } else {
        console.log("2️⃣ OpinionExtensions already linked ✅\n");
    }

    // Final verification
    console.log("🔍 Final verification...");
    const finalAdmin = await opinionAdmin.coreContract();
    const finalExt = await opinionExtensions.coreContract();

    console.log("  OpinionAdmin.coreContract:", finalAdmin);
    console.log("  OpinionExtensions.coreContract:", finalExt);

    if (finalAdmin.toLowerCase() === DEPLOYED.opinionCore.toLowerCase() &&
        finalExt.toLowerCase() === DEPLOYED.opinionCore.toLowerCase()) {
        console.log("\n🎉 ALL CONTRACTS LINKED SUCCESSFULLY!");

        // Save deployment
        const fs = require('fs');
        const deployment = {
            network: "base-mainnet",
            chainId: 8453,
            timestamp: new Date().toISOString(),
            contracts: {
                validationLibrary: "0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5",
                feeManager: "0x31D604765CD76Ff098A283881B2ca57e7F703199",
                poolManager: DEPLOYED.poolManager,
                opinionAdmin: DEPLOYED.opinionAdmin,
                opinionExtensions: DEPLOYED.opinionExtensions,
                opinionCore: DEPLOYED.opinionCore
            },
            config: {
                usdc: process.env.USDC_TOKEN_ADDRESS,
                treasury: process.env.TREASURY_ADDRESS,
                admin: process.env.ADMIN_ADDRESS
            }
        };
        fs.writeFileSync('./deployments/base-mainnet-final.json', JSON.stringify(deployment, null, 2));
        console.log("\n💾 Deployment saved to ./deployments/base-mainnet-final.json");
        console.log("\n🚀 OpinionMarketCap is LIVE on Base Mainnet!");
    } else {
        console.log("\n⚠️ Linking incomplete. Check transactions on BaseScan.");
    }
}

main().catch(console.error);
