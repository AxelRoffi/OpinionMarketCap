const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Deploying MinimalOpinionCoreUpgradeable with UUPS Proxy...\n");

    // Get deployment parameters
    const USDC_TOKEN = process.env.USDC_TOKEN || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base Mainnet USDC
    const FEE_MANAGER = process.env.FEE_MANAGER || "0x64997bd18520d93e7f0da87c69582d06b7f265d5"; // Your FeeManager
    const TREASURY = process.env.TREASURY || "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d"; // Your Treasury

    console.log("📋 Deployment Parameters:");
    console.log("━".repeat(60));
    console.log(`USDC Token:    ${USDC_TOKEN}`);
    console.log(`Fee Manager:   ${FEE_MANAGER}`);
    console.log(`Treasury:      ${TREASURY}`);
    console.log("━".repeat(60));
    console.log();

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deploying from: ${deployer.address}`);
    console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

    // Deploy the upgradeable contract
    console.log("📦 Deploying MinimalOpinionCoreUpgradeable...");

    const MinimalOpinionCore = await ethers.getContractFactory("MinimalOpinionCoreUpgradeable");

    const proxy = await upgrades.deployProxy(
        MinimalOpinionCore,
        [USDC_TOKEN, FEE_MANAGER, TREASURY],
        {
            kind: "uups",
            initializer: "initialize"
        }
    );

    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();

    console.log("✅ Deployment successful!\n");
    console.log("📍 Contract Addresses:");
    console.log("━".repeat(60));
    console.log(`Proxy Address:          ${proxyAddress}`);

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log(`Implementation Address: ${implementationAddress}`);

    const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
    console.log(`Admin Address:          ${adminAddress}`);
    console.log("━".repeat(60));
    console.log();

    // Verify contract version
    const version = await proxy.version();
    console.log(`📌 Contract Version: ${version}\n`);

    // Get contract size
    const implementationCode = await ethers.provider.getCode(implementationAddress);
    const sizeInBytes = (implementationCode.length - 2) / 2; // Remove '0x' and convert hex to bytes
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);

    console.log("📊 Contract Size:");
    console.log("━".repeat(60));
    console.log(`Implementation Size: ${sizeInKB} KB`);
    console.log(`24KB Limit:          24.00 KB`);
    console.log(`Remaining Space:     ${(24 - parseFloat(sizeInKB)).toFixed(2)} KB`);
    console.log("━".repeat(60));
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
        parameters: {
            usdcToken: USDC_TOKEN,
            feeManager: FEE_MANAGER,
            treasury: TREASURY
        }
    };

    const fs = require("fs");
    const deploymentPath = `deployments/minimal-opinion-core-${Date.now()}.json`;
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log(`💾 Deployment info saved to: ${deploymentPath}\n`);

    console.log("🎯 Next Steps:");
    console.log("━".repeat(60));
    console.log("1. Verify implementation on BaseScan:");
    console.log(`   npx hardhat verify --network base-mainnet ${implementationAddress}`);
    console.log();
    console.log("2. Test core functions:");
    console.log(`   - Create opinion`);
    console.log(`   - Submit answer`);
    console.log(`   - Get opinion details`);
    console.log();
    console.log("3. Monitor contract for 24-48 hours");
    console.log();
    console.log("4. Plan V2 upgrade (add answer history)");
    console.log("━".repeat(60));

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
