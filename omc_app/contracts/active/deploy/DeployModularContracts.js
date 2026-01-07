const { ethers, upgrades } = require("hardhat");
require('dotenv').config();

/**
 * Deployment script for modular OpinionMarketCap contracts
 * Deploys 5 contracts + ValidationLibrary, ensuring all are under 24KB limit
 *
 * Compatible with ethers v6 / hardhat-ethers
 */

async function main() {
    console.log("🚀 Starting Modular OpinionMarketCap Deployment...\n");

    // Get deployment parameters
    const [deployer] = await ethers.getSigners();
    const deployerBalance = await ethers.provider.getBalance(deployer.address);

    console.log("Deployer address:", deployer.address);
    console.log("Deployer balance:", ethers.formatEther(deployerBalance), "ETH\n");

    // Load addresses from environment variables
    const USDC_TOKEN = process.env.USDC_TOKEN_ADDRESS;
    const TREASURY = process.env.TREASURY_ADDRESS;
    const ADMIN = process.env.ADMIN_ADDRESS;

    // Validate environment variables
    if (!USDC_TOKEN || !TREASURY || !ADMIN) {
        console.error("❌ Missing required environment variables:");
        console.error("- USDC_TOKEN_ADDRESS:", USDC_TOKEN || "MISSING");
        console.error("- TREASURY_ADDRESS:", TREASURY || "MISSING");
        console.error("- ADMIN_ADDRESS:", ADMIN || "MISSING");
        process.exit(1);
    }

    // Validate addresses are not placeholders
    if (TREASURY.includes("YOUR_") || ADMIN.includes("YOUR_")) {
        console.error("❌ Please replace placeholder addresses in .env file!");
        process.exit(1);
    }

    console.log("📋 Deployment Configuration:");
    console.log("- USDC Token:", USDC_TOKEN);
    console.log("- Treasury:", TREASURY);
    console.log("- Final Admin:", ADMIN);
    console.log("- Deployer (initial admin):", deployer.address);
    console.log("");

    const deployedContracts = {};
    let totalGasUsed = 0n;

    // Use deployer as initial admin for deployment, then transfer to final admin
    const INITIAL_ADMIN = deployer.address;

    try {
        // ========== STEP 1: Deploy ValidationLibrary ==========
        console.log("1️⃣ Deploying ValidationLibrary...");
        const ValidationLibrary = await ethers.getContractFactory("ValidationLibrary");
        const validationLibrary = await ValidationLibrary.deploy();
        await validationLibrary.waitForDeployment();

        const validationLibraryAddress = await validationLibrary.getAddress();
        deployedContracts.validationLibrary = validationLibraryAddress;

        console.log("✅ ValidationLibrary deployed at:", validationLibraryAddress);
        console.log("");

        // ========== STEP 2: Deploy FeeManager ==========
        console.log("2️⃣ Deploying FeeManager...");
        const FeeManager = await ethers.getContractFactory("FeeManager");
        const feeManager = await upgrades.deployProxy(FeeManager, [USDC_TOKEN, TREASURY], {
            initializer: "initialize"
        });
        await feeManager.waitForDeployment();

        const feeManagerAddress = await feeManager.getAddress();
        deployedContracts.feeManager = feeManagerAddress;

        console.log("✅ FeeManager deployed at:", feeManagerAddress);
        console.log("");

        // ========== STEP 3: Deploy PoolManager ==========
        console.log("3️⃣ Deploying PoolManager...");
        const PoolManager = await ethers.getContractFactory("PoolManager", {
            libraries: {
                ValidationLibrary: validationLibraryAddress
            }
        });
        const poolManager = await upgrades.deployProxy(PoolManager, [
            ethers.ZeroAddress, // OpinionCore (placeholder - will be set later)
            feeManagerAddress,
            USDC_TOKEN,
            TREASURY,
            INITIAL_ADMIN // Use deployer as initial admin
        ], {
            initializer: "initialize",
            unsafeAllowLinkedLibraries: true
        });
        await poolManager.waitForDeployment();

        const poolManagerAddress = await poolManager.getAddress();
        deployedContracts.poolManager = poolManagerAddress;

        console.log("✅ PoolManager deployed at:", poolManagerAddress);
        console.log("");

        // ========== STEP 4: Deploy OpinionAdmin ==========
        console.log("4️⃣ Deploying OpinionAdmin...");
        const OpinionAdmin = await ethers.getContractFactory("OpinionAdmin");
        const opinionAdmin = await upgrades.deployProxy(OpinionAdmin, [
            ethers.ZeroAddress, // OpinionCore (placeholder - will be set later)
            USDC_TOKEN,
            TREASURY,
            INITIAL_ADMIN // Use deployer as initial admin
        ], {
            initializer: "initialize"
        });
        await opinionAdmin.waitForDeployment();

        const opinionAdminAddress = await opinionAdmin.getAddress();
        deployedContracts.opinionAdmin = opinionAdminAddress;

        console.log("✅ OpinionAdmin deployed at:", opinionAdminAddress);
        console.log("");

        // ========== STEP 5: Deploy OpinionExtensions ==========
        console.log("5️⃣ Deploying OpinionExtensions...");
        const OpinionExtensions = await ethers.getContractFactory("OpinionExtensions");
        const opinionExtensions = await upgrades.deployProxy(OpinionExtensions, [
            ethers.ZeroAddress, // OpinionCore (placeholder - will be set later)
            INITIAL_ADMIN // Use deployer as initial admin
        ], {
            initializer: "initialize"
        });
        await opinionExtensions.waitForDeployment();

        const opinionExtensionsAddress = await opinionExtensions.getAddress();
        deployedContracts.opinionExtensions = opinionExtensionsAddress;

        console.log("✅ OpinionExtensions deployed at:", opinionExtensionsAddress);
        console.log("");

        // ========== STEP 6: Deploy OpinionCore ==========
        console.log("6️⃣ Deploying OpinionCore...");
        const OpinionCore = await ethers.getContractFactory("OpinionCore", {
            libraries: {
                ValidationLibrary: validationLibraryAddress
            }
        });
        const opinionCore = await upgrades.deployProxy(OpinionCore, [
            USDC_TOKEN,
            deployer.address, // Opinion market contract (deployer initially)
            feeManagerAddress,
            poolManagerAddress,
            ethers.ZeroAddress, // Monitoring manager (optional)
            ethers.ZeroAddress, // Security manager (optional)
            TREASURY,
            opinionExtensionsAddress,
            opinionAdminAddress
        ], {
            initializer: "initialize",
            unsafeAllowLinkedLibraries: true
        });
        await opinionCore.waitForDeployment();

        const opinionCoreAddress = await opinionCore.getAddress();
        deployedContracts.opinionCore = opinionCoreAddress;

        console.log("✅ OpinionCore deployed at:", opinionCoreAddress);
        console.log("");

        // ========== STEP 7: Link Contracts ==========
        console.log("7️⃣ Linking contracts (setting OpinionCore address)...\n");

        // Update PoolManager with correct OpinionCore address
        console.log("   Setting OpinionCore in PoolManager...");
        const setPoolManagerCoreTx = await poolManager.setOpinionCore(opinionCoreAddress);
        await setPoolManagerCoreTx.wait();
        console.log("   ✅ PoolManager linked to OpinionCore");

        // Update OpinionAdmin with correct OpinionCore address (uses setCoreContract)
        console.log("   Setting coreContract in OpinionAdmin...");
        const setAdminCoreTx = await opinionAdmin.setCoreContract(opinionCoreAddress);
        await setAdminCoreTx.wait();
        console.log("   ✅ OpinionAdmin linked to OpinionCore");

        // Update OpinionExtensions with correct OpinionCore address (uses setCoreContract)
        console.log("   Setting coreContract in OpinionExtensions...");
        const setExtensionsCoreTx = await opinionExtensions.setCoreContract(opinionCoreAddress);
        await setExtensionsCoreTx.wait();
        console.log("   ✅ OpinionExtensions linked to OpinionCore");

        console.log("\n✅ All contracts linked successfully!");
        console.log("");

        // ========== STEP 8: Grant Admin Roles ==========
        console.log("8️⃣ Granting admin roles to Admin EOA...\n");

        const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
        const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

        // Grant ADMIN_ROLE to Admin EOA on OpinionCore
        if (ADMIN !== deployer.address) {
            console.log("   Granting ADMIN_ROLE on OpinionCore to:", ADMIN);
            const grantAdminCoreTx = await opinionCore.grantRole(ADMIN_ROLE, ADMIN);
            await grantAdminCoreTx.wait();

            console.log("   Granting ADMIN_ROLE on FeeManager to:", ADMIN);
            const grantAdminFeeTx = await feeManager.grantRole(ADMIN_ROLE, ADMIN);
            await grantAdminFeeTx.wait();

            console.log("   Granting ADMIN_ROLE on PoolManager to:", ADMIN);
            const grantAdminPoolTx = await poolManager.grantRole(ADMIN_ROLE, ADMIN);
            await grantAdminPoolTx.wait();

            console.log("   ✅ Admin roles granted");
        } else {
            console.log("   Deployer is Admin - no additional role grants needed");
        }
        console.log("");

        // ========== DEPLOYMENT SUMMARY ==========
        console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉\n");
        console.log("📊 Deployment Summary:");
        console.log("========================");
        console.log(`ValidationLibrary: ${deployedContracts.validationLibrary}`);
        console.log(`FeeManager:        ${deployedContracts.feeManager}`);
        console.log(`PoolManager:       ${deployedContracts.poolManager}`);
        console.log(`OpinionAdmin:      ${deployedContracts.opinionAdmin}`);
        console.log(`OpinionExtensions: ${deployedContracts.opinionExtensions}`);
        console.log(`OpinionCore:       ${deployedContracts.opinionCore}`);
        console.log("");

        // ========== CONTRACT SIZE VERIFICATION ==========
        console.log("📏 Contract Size Verification:");
        console.log("===============================");

        const contracts = [
            { name: "ValidationLibrary", address: validationLibraryAddress },
            { name: "FeeManager", address: feeManagerAddress },
            { name: "PoolManager", address: poolManagerAddress },
            { name: "OpinionAdmin", address: opinionAdminAddress },
            { name: "OpinionExtensions", address: opinionExtensionsAddress },
            { name: "OpinionCore", address: opinionCoreAddress }
        ];

        for (const contract of contracts) {
            const code = await ethers.provider.getCode(contract.address);
            const sizeKB = (code.length / 2 - 1) / 1024;
            const status = sizeKB < 24 ? "✅" : "❌";
            console.log(`${contract.name}: ${sizeKB.toFixed(2)} KB ${status}`);
        }
        console.log("");

        // ========== SAVE DEPLOYMENT INFO ==========
        const deploymentInfo = {
            network: (await ethers.provider.getNetwork()).name,
            chainId: Number((await ethers.provider.getNetwork()).chainId),
            deployedAt: new Date().toISOString(),
            deployer: deployer.address,
            contracts: deployedContracts,
            configuration: {
                usdcToken: USDC_TOKEN,
                treasury: TREASURY,
                admin: ADMIN
            },
            features: {
                modularArchitecture: true,
                uupsUpgradeable: true,
                contractSizes: "All contracts under 24KB",
                initialPrice: "1-100 USDC",
                categories: 40,
                poolSystem: "100 USDC threshold, free contributions",
                fees: "2% platform + 3% creator"
            }
        };

        const fs = require('fs');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `./deployments/deployment-${deploymentInfo.network}-${timestamp}.json`;

        fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
        console.log(`💾 Deployment info saved to ${filename}`);
        console.log("");

        // ========== VERIFICATION COMMANDS ==========
        console.log("🔍 Contract Verification Commands:");
        console.log("===================================");
        console.log(`npx hardhat verify --network base ${validationLibraryAddress}`);
        console.log("");
        console.log("For proxy contracts, use hardhat-upgrades verify:");
        console.log(`npx hardhat verify --network base ${feeManagerAddress}`);
        console.log("");

        // ========== NEXT STEPS ==========
        console.log("🔧 Next Steps:");
        console.log("===============");
        console.log("1. Verify contracts on BaseScan");
        console.log("2. Test contract interactions");
        console.log("3. Update frontend with new contract addresses");
        console.log("4. Transfer admin roles if needed (transferFullAdmin)");
        console.log("");
        console.log("🚀 Modular OpinionMarketCap is ready for production!");

    } catch (error) {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script execution failed:");
        console.error(error);
        process.exit(1);
    });
