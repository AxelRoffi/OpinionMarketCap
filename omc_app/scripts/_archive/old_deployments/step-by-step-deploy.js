const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Step-by-Step Mainnet Deployment");
  console.log("=".repeat(40));

  try {
    // Step 1: Basic connection test
    console.log("1️⃣  Testing connection...");
    const [deployer] = await ethers.getSigners();
    console.log("   ✅ Deployer:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("   💰 Balance:", ethers.formatEther(balance), "ETH");

    // Step 2: Deploy FeeManager (we know this works)
    console.log("\n2️⃣  Deploying FeeManager...");
    const FeeManager = await ethers.getContractFactory("FeeManager");
    const feeManager = await upgrades.deployProxy(
      FeeManager,
      [
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
        "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d"  // Treasury Safe
      ],
      { initializer: 'initialize' }
    );
    
    await feeManager.waitForDeployment();
    const feeManagerAddress = await feeManager.getAddress();
    console.log("   ✅ FeeManager:", feeManagerAddress);

    // Step 3: Deploy PoolManager
    console.log("\n3️⃣  Deploying PoolManager...");
    const PoolManager = await ethers.getContractFactory("PoolManager");
    const poolManager = await upgrades.deployProxy(
      PoolManager,
      [
        ethers.ZeroAddress, // OpinionCore - will update later
        feeManagerAddress,
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
        "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d", // Treasury Safe
        "0xd903412900e87D71BF3A420cc57757E86326B1C8"  // Admin Safe
      ],
      { initializer: 'initialize' }
    );
    
    await poolManager.waitForDeployment();
    const poolManagerAddress = await poolManager.getAddress();
    console.log("   ✅ PoolManager:", poolManagerAddress);

    // Step 4: Deploy OpinionCoreSimplified (the big one)
    console.log("\n4️⃣  Deploying OpinionCore (this may take a while)...");
    console.log("   📏 Size: 24.115 KiB (slightly over 24KB limit)");
    console.log("   ⚡ Attempting proxy deployment...");
    
    const OpinionCore = await ethers.getContractFactory("OpinionCoreSimplified");
    const opinionCore = await upgrades.deployProxy(
      OpinionCore,
      [
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
        feeManagerAddress,
        poolManagerAddress,
        ethers.ZeroAddress, // MonitoringManager (optional)
        ethers.ZeroAddress, // SecurityManager (optional)
        "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d"  // Treasury Safe
      ],
      { initializer: 'initialize' }
    );
    
    console.log("   ⏳ Waiting for OpinionCore deployment...");
    await opinionCore.waitForDeployment();
    const opinionCoreAddress = await opinionCore.getAddress();
    console.log("   ✅ OpinionCore:", opinionCoreAddress);

    // Step 5: Configure contracts
    console.log("\n5️⃣  Configuring contracts...");
    await poolManager.setOpinionCore(opinionCoreAddress);
    console.log("   ✅ PoolManager configured");

    // Quick parameter setup
    await opinionCore.setParameter(0, "1000000"); // minimumPrice = 1 USDC
    await opinionCore.setParameter(6, "1000000"); // questionCreationFee = 1 USDC
    await opinionCore.setParameter(7, "1000000"); // initialAnswerPrice = 1 USDC
    console.log("   ✅ Parameters configured");

    // Grant roles
    const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
    await opinionCore.grantRole(POOL_MANAGER_ROLE, poolManagerAddress);
    console.log("   ✅ Roles configured");

    // Final summary
    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(40));
    console.log("📊 Contract Addresses:");
    console.log(`   OpinionCore: ${opinionCoreAddress}`);
    console.log(`   FeeManager:  ${feeManagerAddress}`);
    console.log(`   PoolManager: ${poolManagerAddress}`);
    
    console.log("\n👑 Admin Controls:");
    console.log("   Admin Safe:    0xd903412900e87D71BF3A420cc57757E86326B1C8");
    console.log("   Treasury Safe: 0xA81A947CbC8a2441DEDA53687e573e1125F8F08d");
    
    const finalBalance = await ethers.provider.getBalance(deployer.address);
    console.log(`\n💰 Remaining Balance: ${ethers.formatEther(finalBalance)} ETH`);
    
    // Save results
    const fs = require('fs');
    const deploymentData = {
      network: "base-mainnet",
      timestamp: new Date().toISOString(),
      contracts: {
        opinionCore: opinionCoreAddress,
        feeManager: feeManagerAddress,
        poolManager: poolManagerAddress
      },
      admin: "0xd903412900e87D71BF3A420cc57757E86326B1C8",
      treasury: "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d",
      deployer: deployer.address
    };
    
    fs.writeFileSync('mainnet-deployment.json', JSON.stringify(deploymentData, null, 2));
    console.log("\n💾 Deployment data saved to mainnet-deployment.json");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    if (error.reason) console.error("Reason:", error.reason);
  }
}

main().catch(console.error);