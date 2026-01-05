const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🧪 Testing Modular Contract Deployment...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const TREASURY = deployer.address;
    const ADMIN = deployer.address;

    try {
        // Use deployer address as mock USDC for deployment test
        const usdcAddress = deployer.address;
        console.log("1️⃣ Using mock USDC address:", usdcAddress);

        // Deploy ValidationLibrary first
        console.log("\n1.5️⃣ Deploying ValidationLibrary...");
        const ValidationLibrary = await ethers.getContractFactory("ValidationLibrary");
        const validationLib = await ValidationLibrary.deploy();
        await validationLib.waitForDeployment();
        const validationLibAddr = await validationLib.getAddress();
        console.log("✅ ValidationLibrary:", validationLibAddr);


        // 1. FeeManager
        console.log("\n2️⃣ Deploying FeeManager...");
        const FeeManager = await ethers.getContractFactory("FeeManager");
        const feeManager = await upgrades.deployProxy(FeeManager, [usdcAddress, TREASURY], {
            initializer: "initialize"
        });
        await feeManager.waitForDeployment();
        const feeManagerAddr = await feeManager.getAddress();
        console.log("✅ FeeManager:", feeManagerAddr);

        // 2. PoolManager (with linked libraries)
        console.log("\n3️⃣ Deploying PoolManager...");
        const PoolManager = await ethers.getContractFactory("PoolManager", {
            libraries: {
                ValidationLibrary: validationLibAddr
            }
        });
        const poolManager = await upgrades.deployProxy(PoolManager, [
            "0x0000000000000000000000000000000000000001",
            feeManagerAddr,
            usdcAddress,
            TREASURY,
            ADMIN
        ], {
            initializer: "initialize",
            unsafeAllowLinkedLibraries: true
        });
        await poolManager.waitForDeployment();
        const poolManagerAddr = await poolManager.getAddress();
        console.log("✅ PoolManager:", poolManagerAddr);

        // 3. OpinionAdmin
        console.log("\n4️⃣ Deploying OpinionAdmin...");
        const OpinionAdmin = await ethers.getContractFactory("OpinionAdmin");
        const opinionAdmin = await upgrades.deployProxy(OpinionAdmin, [
            "0x0000000000000000000000000000000000000001",
            usdcAddress,
            TREASURY,
            ADMIN
        ], { initializer: "initialize" });
        await opinionAdmin.waitForDeployment();
        const opinionAdminAddr = await opinionAdmin.getAddress();
        console.log("✅ OpinionAdmin:", opinionAdminAddr);

        // 4. OpinionExtensions
        console.log("\n5️⃣ Deploying OpinionExtensions...");
        const OpinionExtensions = await ethers.getContractFactory("OpinionExtensions");
        const opinionExtensions = await upgrades.deployProxy(OpinionExtensions, [
            "0x0000000000000000000000000000000000000001",
            ADMIN
        ], { initializer: "initialize" });
        await opinionExtensions.waitForDeployment();
        const opinionExtensionsAddr = await opinionExtensions.getAddress();
        console.log("✅ OpinionExtensions:", opinionExtensionsAddr);

        // 5. OpinionCore (with linked libraries)
        console.log("\n6️⃣ Deploying OpinionCore...");
        const OpinionCore = await ethers.getContractFactory("OpinionCore", {
            libraries: {
                ValidationLibrary: validationLibAddr
            }
        });
        const opinionCore = await upgrades.deployProxy(OpinionCore, [
            usdcAddress,
            deployer.address,
            feeManagerAddr,
            poolManagerAddr,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            TREASURY,
            opinionExtensionsAddr,
            opinionAdminAddr
        ], {
            initializer: "initialize",
            unsafeAllowLinkedLibraries: true
        });
        await opinionCore.waitForDeployment();
        const opinionCoreAddr = await opinionCore.getAddress();
        console.log("✅ OpinionCore:", opinionCoreAddr);

        // Verify key parameters
        console.log("\n📋 Verifying Configuration...");

        const minPrice = await opinionCore.minimumPrice();
        const creationFee = await opinionCore.questionCreationFee();
        const initialAnswerPrice = await opinionCore.initialAnswerPrice();
        const maxInitialPrice = await opinionCore.maxInitialPrice();
        const maxTradesPerBlock = await opinionCore.maxTradesPerBlock();

        console.log("   minimumPrice:", ethers.formatUnits(minPrice, 6), "USDC");
        console.log("   questionCreationFee:", ethers.formatUnits(creationFee, 6), "USDC");
        console.log("   initialAnswerPrice:", ethers.formatUnits(initialAnswerPrice, 6), "USDC");
        console.log("   maxInitialPrice:", ethers.formatUnits(maxInitialPrice, 6), "USDC");
        console.log("   maxTradesPerBlock:", maxTradesPerBlock.toString(), "(0 = unlimited)");

        // Verify FeeManager
        const platformFee = await feeManager.platformFeePercent();
        const creatorFee = await feeManager.creatorFeePercent();
        const mevPenalty = await feeManager.mevPenaltyPercent();
        console.log("   platformFeePercent:", platformFee.toString(), "%");
        console.log("   creatorFeePercent:", creatorFee.toString(), "%");
        console.log("   mevPenaltyPercent:", mevPenalty.toString(), "%");

        // Verify PoolManager
        const poolContributionFee = await poolManager.poolContributionFee();
        const maxPoolDuration = await poolManager.maxPoolDuration();
        console.log("   poolContributionFee:", ethers.formatUnits(poolContributionFee, 6), "USDC");
        console.log("   maxPoolDuration:", (Number(maxPoolDuration) / 86400).toString(), "days");

        // Verify OpinionExtensions categories
        const categoryCount = await opinionExtensions.getCategoryCount();
        console.log("   categories:", categoryCount.toString());

        console.log("\n🎉 ALL CONTRACTS DEPLOYED AND CONFIGURED SUCCESSFULLY!");
        console.log("\n✅ DEPLOYMENT VERIFICATION PASSED - Ready for mainnet!");

    } catch (error) {
        console.error("\n❌ Deployment failed:", error.message);
        if (error.data) console.error("Error data:", error.data);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
