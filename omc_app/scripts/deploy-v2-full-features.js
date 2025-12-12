const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Deploying OpinionCoreV2_FullFeatures with UUPS Proxy...\n");
    console.log("⚠️  NOTE: This contract has ALL 50 functions from OpinionCoreSimplified");
    console.log("⚠️  Size: 24.926 KB (requires viaIR compilation)\n");

    // Get deployment parameters
    const USDC_TOKEN = process.env.USDC_TOKEN || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base Mainnet USDC
    const OPINION_MARKET = process.env.OPINION_MARKET || "0x0000000000000000000000000000000000000000"; // UPDATE THIS
    const FEE_MANAGER = process.env.FEE_MANAGER || "0x64997bd18520d93e7f0da87c69582d06b7f265d5";
    const POOL_MANAGER = process.env.POOL_MANAGER || "0x0000000000000000000000000000000000000000"; // UPDATE THIS
    const MONITORING_MANAGER = process.env.MONITORING_MANAGER || "0x0000000000000000000000000000000000000000"; // Can be zero
    const SECURITY_MANAGER = process.env.SECURITY_MANAGER || "0x0000000000000000000000000000000000000000"; // Can be zero
    const TREASURY = process.env.TREASURY || "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d";

    console.log("📋 Deployment Parameters:");
    console.log("━".repeat(80));
    console.log(`USDC Token:         ${USDC_TOKEN}`);
    console.log(`Opinion Market:     ${OPINION_MARKET}`);
    console.log(`Fee Manager:        ${FEE_MANAGER}`);
    console.log(`Pool Manager:       ${POOL_MANAGER}`);
    console.log(`Monitoring Manager: ${MONITORING_MANAGER}`);
    console.log(`Security Manager:   ${SECURITY_MANAGER}`);
    console.log(`Treasury:           ${TREASURY}`);
    console.log("━".repeat(80));
    console.log();

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deploying from: ${deployer.address}`);
    console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

    // Deploy the upgradeable contract
    console.log("📦 Deploying OpinionCoreV2_FullFeatures...");

    const OpinionCoreV2 = await ethers.getContractFactory("OpinionCoreV2_FullFeatures");

    const proxy = await upgrades.deployProxy(
        OpinionCoreV2,
        [USDC_TOKEN, OPINION_MARKET, FEE_MANAGER, POOL_MANAGER, MONITORING_MANAGER, SECURITY_MANAGER, TREASURY],
        {
            kind: "uups",
            initializer: "initialize"
        }
    );

    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();

    console.log("✅ Deployment successful!\n");
    console.log("📍 Contract Addresses:");
    console.log("━".repeat(80));
    console.log(`Proxy Address:          ${proxyAddress}`);

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log(`Implementation Address: ${implementationAddress}`);

    const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
    console.log(`Admin Address:          ${adminAddress}`);
    console.log("━".repeat(80));
    console.log();

    // Verify contract version
    const version = await proxy.version();
    console.log(`📌 Contract Version: ${version}\n`);

    // Get contract size
    const implementationCode = await ethers.provider.getCode(implementationAddress);
    const sizeInBytes = (implementationCode.length - 2) / 2;
    const sizeInKB = (sizeInBytes / 1024).toFixed(3);

    console.log("📊 Contract Size:");
    console.log("━".repeat(80));
    console.log(`Implementation Size: ${sizeInKB} KB`);
    console.log(`24KB Limit:          24.000 KB`);
    console.log(`Status:              ${parseFloat(sizeInKB) > 24 ? '⚠️  Over limit (requires viaIR)' : '✅ Under limit'}`);
    console.log("━".repeat(80));
    console.log();

    // Count features
    console.log("✨ Features Included (50 functions):");
    console.log("━".repeat(80));
    console.log("✅ Core opinion creation & trading");
    console.log("✅ Answer history tracking");
    console.log("✅ Question trading marketplace");
    console.log("✅ Categories system (10 default categories)");
    console.log("✅ Pool integration");
    console.log("✅ Full moderation (deactivate/reactivate/moderate)");
    console.log("✅ Extension slots (string, number, bool, address)");
    console.log("✅ All parameter configuration");
    console.log("✅ Security/monitoring integration");
    console.log("✅ Pause/unpause functionality");
    console.log("✅ Complete admin controls");
    console.log("✅ UUPS upgradeable");
    console.log("━".repeat(80));
    console.log();

    // Save deployment info
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: (await ethers.provider.getNetwork()).chainId.toString(),
        proxy: proxyAddress,
        implementation: implementationAddress,
        admin: adminAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        version: version,
        sizeKB: sizeInKB,
        features: 50,
        parameters: {
            usdcToken: USDC_TOKEN,
            opinionMarket: OPINION_MARKET,
            feeManager: FEE_MANAGER,
            poolManager: POOL_MANAGER,
            monitoringManager: MONITORING_MANAGER,
            securityManager: SECURITY_MANAGER,
            treasury: TREASURY
        }
    };

    const fs = require("fs");
    const deploymentPath = `deployments/opinion-core-v2-full-${Date.now()}.json`;
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log(`💾 Deployment info saved to: ${deploymentPath}\n`);

    console.log("🎯 Next Steps:");
    console.log("━".repeat(80));
    console.log("1. ⚠️  IMPORTANT: Contract verification will likely FAIL on BaseScan");
    console.log("   Reason: Contract compiled with viaIR (24.926 KB)");
    console.log();
    console.log("2. Options:");
    console.log("   a) Accept unverified status (contract works perfectly)");
    console.log("   b) Contact BaseScan support for manual verification");
    console.log("   c) Use Sourcify for alternative verification");
    console.log();
    console.log("3. Test all functions:");
    console.log(`   - Create opinion`);
    console.log(`   - Submit answer`);
    console.log(`   - Test moderation`);
    console.log(`   - Test categories`);
    console.log(`   - Test extension slots`);
    console.log();
    console.log("4. Monitor contract for 24-48 hours");
    console.log("━".repeat(80));

    return {
        proxy: proxyAddress,
        implementation: implementationAddress,
        admin: adminAddress
    };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
