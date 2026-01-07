const { ethers, upgrades } = require("hardhat");
require('dotenv').config();

/**
 * RESUME DEPLOYMENT SCRIPT
 *
 * This script resumes the deployment from where it failed.
 * It reuses already deployed contracts and only deploys OpinionCore + linking.
 *
 * Already deployed on Base Mainnet (2025-01-07):
 * - ValidationLibrary: 0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5
 * - FeeManager: 0x31D604765CD76Ff098A283881B2ca57e7F703199
 * - PoolManager: 0xF7f8fB9df7CCAa7fe438A921A51aC1e67749Fb5e
 * - OpinionAdmin: 0x4F0A1938E8707292059595275F9BBD067A301FD2
 * - OpinionExtensions: 0x2a5a4Dc8AE4eF69a15D9974df54f3f38B3e883aA
 */

// Already deployed contract addresses
const DEPLOYED = {
    validationLibrary: "0xd65aeE5b31D1837767eaf23E76e82e5Ba375d1a5",
    feeManager: "0x31D604765CD76Ff098A283881B2ca57e7F703199",
    poolManager: "0xF7f8fB9df7CCAa7fe438A921A51aC1e67749Fb5e",
    opinionAdmin: "0x4F0A1938E8707292059595275F9BBD067A301FD2",
    opinionExtensions: "0x2a5a4Dc8AE4eF69a15D9974df54f3f38B3e883aA"
};

async function main() {
    console.log("🔄 RESUMING OpinionMarketCap Deployment...\n");

    const [deployer] = await ethers.getSigners();
    const deployerBalance = await ethers.provider.getBalance(deployer.address);

    console.log("Deployer address:", deployer.address);
    console.log("Deployer balance:", ethers.formatEther(deployerBalance), "ETH\n");

    // Load configuration
    const USDC_TOKEN = process.env.USDC_TOKEN_ADDRESS;
    const TREASURY = process.env.TREASURY_ADDRESS;
    const ADMIN = process.env.ADMIN_ADDRESS;

    console.log("📋 Configuration:");
    console.log("- USDC Token:", USDC_TOKEN);
    console.log("- Treasury:", TREASURY);
    console.log("- Admin:", ADMIN);
    console.log("");

    console.log("📦 Already Deployed Contracts:");
    console.log("- ValidationLibrary:", DEPLOYED.validationLibrary);
    console.log("- FeeManager:", DEPLOYED.feeManager);
    console.log("- PoolManager:", DEPLOYED.poolManager);
    console.log("- OpinionAdmin:", DEPLOYED.opinionAdmin);
    console.log("- OpinionExtensions:", DEPLOYED.opinionExtensions);
    console.log("");

    try {
        // ========== STEP 1: Deploy OpinionCore ==========
        console.log("1️⃣ Deploying OpinionCore...");
        const OpinionCore = await ethers.getContractFactory("OpinionCore", {
            libraries: {
                ValidationLibrary: DEPLOYED.validationLibrary
            }
        });

        const opinionCore = await upgrades.deployProxy(OpinionCore, [
            USDC_TOKEN,
            deployer.address,
            DEPLOYED.feeManager,
            DEPLOYED.poolManager,
            ethers.ZeroAddress, // Monitoring manager (optional)
            ethers.ZeroAddress, // Security manager (optional)
            TREASURY,
            DEPLOYED.opinionExtensions,
            DEPLOYED.opinionAdmin
        ], {
            initializer: "initialize",
            unsafeAllowLinkedLibraries: true
        });
        await opinionCore.waitForDeployment();

        const opinionCoreAddress = await opinionCore.getAddress();
        console.log("✅ OpinionCore deployed at:", opinionCoreAddress);
        console.log("");

        // ========== STEP 2: Link Contracts ==========
        console.log("2️⃣ Linking contracts...\n");

        // Get contract instances
        const poolManager = await ethers.getContractAt("PoolManager", DEPLOYED.poolManager);
        const opinionAdmin = await ethers.getContractAt("OpinionAdmin", DEPLOYED.opinionAdmin);
        const opinionExtensions = await ethers.getContractAt("OpinionExtensions", DEPLOYED.opinionExtensions);

        // Link PoolManager
        console.log("   Setting OpinionCore in PoolManager...");
        const tx1 = await poolManager.setOpinionCore(opinionCoreAddress);
        await tx1.wait();
        console.log("   ✅ PoolManager linked");

        // Link OpinionAdmin
        console.log("   Setting coreContract in OpinionAdmin...");
        const tx2 = await opinionAdmin.setCoreContract(opinionCoreAddress);
        await tx2.wait();
        console.log("   ✅ OpinionAdmin linked");

        // Link OpinionExtensions
        console.log("   Setting coreContract in OpinionExtensions...");
        const tx3 = await opinionExtensions.setCoreContract(opinionCoreAddress);
        await tx3.wait();
        console.log("   ✅ OpinionExtensions linked");

        console.log("\n✅ All contracts linked successfully!");
        console.log("");

        // ========== DEPLOYMENT SUMMARY ==========
        console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉\n");
        console.log("📊 Final Contract Addresses:");
        console.log("================================");
        console.log(`ValidationLibrary: ${DEPLOYED.validationLibrary}`);
        console.log(`FeeManager:        ${DEPLOYED.feeManager}`);
        console.log(`PoolManager:       ${DEPLOYED.poolManager}`);
        console.log(`OpinionAdmin:      ${DEPLOYED.opinionAdmin}`);
        console.log(`OpinionExtensions: ${DEPLOYED.opinionExtensions}`);
        console.log(`OpinionCore:       ${opinionCoreAddress}`);
        console.log("");

        // Save deployment info
        const deploymentInfo = {
            network: "base-mainnet",
            chainId: 8453,
            deployedAt: new Date().toISOString(),
            deployer: deployer.address,
            contracts: {
                validationLibrary: DEPLOYED.validationLibrary,
                feeManager: DEPLOYED.feeManager,
                poolManager: DEPLOYED.poolManager,
                opinionAdmin: DEPLOYED.opinionAdmin,
                opinionExtensions: DEPLOYED.opinionExtensions,
                opinionCore: opinionCoreAddress
            },
            configuration: {
                usdcToken: USDC_TOKEN,
                treasury: TREASURY,
                admin: ADMIN
            }
        };

        const fs = require('fs');
        const filename = './deployments/base-mainnet-deployment.json';
        fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
        console.log(`💾 Deployment info saved to ${filename}`);
        console.log("");

        console.log("🔧 Next Steps:");
        console.log("===============");
        console.log("1. Verify contracts on BaseScan");
        console.log("2. Update frontend with contract addresses");
        console.log("3. Test a small transaction");
        console.log("");
        console.log("🚀 OpinionMarketCap is live on Base Mainnet!");

    } catch (error) {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:");
        console.error(error);
        process.exit(1);
    });
