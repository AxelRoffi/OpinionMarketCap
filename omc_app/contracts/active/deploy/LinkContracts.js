const { ethers } = require("hardhat");
require('dotenv').config();

/**
 * LINK CONTRACTS SCRIPT
 *
 * All contracts are deployed, this script only does the linking.
 */

const DEPLOYED = {
    validationLibrary: "0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5",
    feeManager: "0x31D604765CD76Ff098A283881B2ca57e7F703199",
    poolManager: "0xF7f8fB9df7CCAa7fe438A921A51aC1e67749Fb5e",
    opinionAdmin: "0x4F0A1938E8707292059595275F9BBD067A301FD2",
    opinionExtensions: "0x2a5a4Dc8AE4eF69a15D9974df54f3f38B3e883aA",
    opinionCore: "0x7b5d97fb78fbf41432F34f46a901C6da7754A726"
};

async function main() {
    console.log("🔗 Linking OpinionMarketCap Contracts...\n");

    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);

    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH\n");

    console.log("📦 Contract Addresses:");
    Object.entries(DEPLOYED).forEach(([name, addr]) => {
        console.log(`- ${name}: ${addr}`);
    });
    console.log("");

    // Get contract instances
    const poolManager = await ethers.getContractAt("PoolManager", DEPLOYED.poolManager);
    const opinionAdmin = await ethers.getContractAt("OpinionAdmin", DEPLOYED.opinionAdmin);
    const opinionExtensions = await ethers.getContractAt("OpinionExtensions", DEPLOYED.opinionExtensions);

    // Check current state
    console.log("📋 Checking current state...");

    try {
        const currentPoolCore = await poolManager.opinionCore();
        console.log("   PoolManager.opinionCore:", currentPoolCore);

        const currentAdminCore = await opinionAdmin.coreContract();
        console.log("   OpinionAdmin.coreContract:", currentAdminCore);

        const currentExtCore = await opinionExtensions.coreContract();
        console.log("   OpinionExtensions.coreContract:", currentExtCore);
    } catch (e) {
        console.log("   Could not read current state");
    }
    console.log("");

    // Link contracts
    console.log("🔗 Linking contracts to OpinionCore...\n");

    // Link PoolManager
    console.log("1️⃣ Setting OpinionCore in PoolManager...");
    try {
        const tx1 = await poolManager.setOpinionCore(DEPLOYED.opinionCore, {
            gasLimit: 100000
        });
        console.log("   Tx hash:", tx1.hash);
        await tx1.wait();
        console.log("   ✅ PoolManager linked!\n");
    } catch (e) {
        if (e.message.includes("already set") || e.message.includes("same")) {
            console.log("   ⏭️ Already linked, skipping\n");
        } else {
            console.log("   ❌ Error:", e.message, "\n");
        }
    }

    // Link OpinionAdmin
    console.log("2️⃣ Setting coreContract in OpinionAdmin...");
    try {
        const tx2 = await opinionAdmin.setCoreContract(DEPLOYED.opinionCore, {
            gasLimit: 100000
        });
        console.log("   Tx hash:", tx2.hash);
        await tx2.wait();
        console.log("   ✅ OpinionAdmin linked!\n");
    } catch (e) {
        if (e.message.includes("already set") || e.message.includes("same")) {
            console.log("   ⏭️ Already linked, skipping\n");
        } else {
            console.log("   ❌ Error:", e.message, "\n");
        }
    }

    // Link OpinionExtensions
    console.log("3️⃣ Setting coreContract in OpinionExtensions...");
    try {
        const tx3 = await opinionExtensions.setCoreContract(DEPLOYED.opinionCore, {
            gasLimit: 100000
        });
        console.log("   Tx hash:", tx3.hash);
        await tx3.wait();
        console.log("   ✅ OpinionExtensions linked!\n");
    } catch (e) {
        if (e.message.includes("already set") || e.message.includes("same")) {
            console.log("   ⏭️ Already linked, skipping\n");
        } else {
            console.log("   ❌ Error:", e.message, "\n");
        }
    }

    // Verify final state
    console.log("✅ Verifying final state...");
    const finalPoolCore = await poolManager.opinionCore();
    const finalAdminCore = await opinionAdmin.coreContract();
    const finalExtCore = await opinionExtensions.coreContract();

    console.log("   PoolManager.opinionCore:", finalPoolCore);
    console.log("   OpinionAdmin.coreContract:", finalAdminCore);
    console.log("   OpinionExtensions.coreContract:", finalExtCore);
    console.log("");

    const allLinked =
        finalPoolCore.toLowerCase() === DEPLOYED.opinionCore.toLowerCase() &&
        finalAdminCore.toLowerCase() === DEPLOYED.opinionCore.toLowerCase() &&
        finalExtCore.toLowerCase() === DEPLOYED.opinionCore.toLowerCase();

    if (allLinked) {
        console.log("🎉 ALL CONTRACTS LINKED SUCCESSFULLY!\n");

        // Save final deployment info
        const deploymentInfo = {
            network: "base-mainnet",
            chainId: 8453,
            deployedAt: new Date().toISOString(),
            contracts: DEPLOYED,
            configuration: {
                usdcToken: process.env.USDC_TOKEN_ADDRESS,
                treasury: process.env.TREASURY_ADDRESS,
                admin: process.env.ADMIN_ADDRESS
            }
        };

        const fs = require('fs');
        fs.writeFileSync('./deployments/base-mainnet-final.json', JSON.stringify(deploymentInfo, null, 2));
        console.log("💾 Saved to ./deployments/base-mainnet-final.json\n");

        console.log("📊 FINAL DEPLOYMENT:");
        console.log("====================");
        console.log(`ValidationLibrary: ${DEPLOYED.validationLibrary}`);
        console.log(`FeeManager:        ${DEPLOYED.feeManager}`);
        console.log(`PoolManager:       ${DEPLOYED.poolManager}`);
        console.log(`OpinionAdmin:      ${DEPLOYED.opinionAdmin}`);
        console.log(`OpinionExtensions: ${DEPLOYED.opinionExtensions}`);
        console.log(`OpinionCore:       ${DEPLOYED.opinionCore}`);
        console.log("");
        console.log("🚀 OpinionMarketCap is LIVE on Base Mainnet!");
    } else {
        console.log("⚠️ Some contracts may not be linked correctly. Please check.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
