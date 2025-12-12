// DEPLOY OPINIONCORE FINAL - No Moderation Version
const { ethers } = require("hardhat");

const EXISTING_CONTRACTS = {
    feeManager: "0x64997bd18520d93e7f0da87c69582d06b7f265d5", // Working FeeManager
    poolManager: "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259", // Existing PoolManager
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Real Base USDC
    treasury: "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d", // Your treasury
    adminSafe: "0xd90341dC9F724ae29f02Eadb64525cd8C0C834c1" // Your Admin Safe
};

async function deployOpinionCore() {
    console.log("🚀 DEPLOYING OPINIONCORE - FULL FEATURES (NO MODERATION)");
    console.log("=".repeat(60));
    
    const [deployer] = await ethers.getSigners();
    console.log(`📍 Deployer: ${deployer.address}`);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.004")) {
        throw new Error("❌ Need at least 0.004 ETH for deployment");
    }
    
    console.log(`\n✅ Using existing contracts:`);
    console.log(`   FeeManager:  ${EXISTING_CONTRACTS.feeManager}`);
    console.log(`   PoolManager: ${EXISTING_CONTRACTS.poolManager}`);
    console.log(`   USDC:        ${EXISTING_CONTRACTS.usdc}`);
    console.log(`   Treasury:    ${EXISTING_CONTRACTS.treasury}`);
    
    // Deploy PriceCalculator library first
    console.log(`\n🔷 STEP 1: Deploy PriceCalculator Library`);
    const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
    const priceCalculator = await PriceCalculator.deploy();
    await priceCalculator.waitForDeployment();
    const priceCalculatorAddress = await priceCalculator.getAddress();
    console.log(`   ✅ PriceCalculator: ${priceCalculatorAddress}`);
    
    // Deploy OpinionCore with library linking
    console.log(`\n🔷 STEP 2: Deploy OpinionCoreNoMod (23.397 KB)`);
    const OpinionCore = await ethers.getContractFactory("contracts/core/OpinionCoreNoMod.sol:OpinionCoreSimplified", {
        libraries: {
            PriceCalculator: priceCalculatorAddress
        }
    });
    
    const opinionCore = await OpinionCore.deploy();
    await opinionCore.waitForDeployment();
    const opinionCoreAddress = await opinionCore.getAddress();
    console.log(`   ✅ OpinionCoreNoMod: ${opinionCoreAddress}`);
    
    // Initialize OpinionCore
    console.log(`\n🔷 STEP 3: Initialize OpinionCore`);
    await opinionCore.initialize(
        EXISTING_CONTRACTS.usdc,
        EXISTING_CONTRACTS.feeManager,
        EXISTING_CONTRACTS.poolManager,
        EXISTING_CONTRACTS.treasury
    );
    console.log(`   ✅ OpinionCore initialized`);
    
    // Configure basic parameters
    console.log(`\n🔷 STEP 4: Configure Parameters`);
    
    await opinionCore.setMinimumPrice(ethers.parseUnits("1", 6)); // 1 USDC
    console.log(`   ✅ Minimum price: 1 USDC`);
    
    await opinionCore.setQuestionCreationFee(ethers.parseUnits("1", 6)); // 1 USDC
    console.log(`   ✅ Creation fee: 1 USDC`);
    
    await opinionCore.setInitialAnswerPrice(ethers.parseUnits("1", 6)); // 1 USDC
    console.log(`   ✅ Initial answer price: 1 USDC`);
    
    await opinionCore.setAbsoluteMaxPriceChange(300); // 300%
    console.log(`   ✅ Max price change: 300%`);
    
    await opinionCore.setMaxTradesPerBlock(5); // Light rate limiting
    console.log(`   ✅ Rate limiting: 5 trades/block`);
    
    // Connect to PoolManager
    console.log(`\n🔷 STEP 5: Connect PoolManager`);
    const poolManager = await ethers.getContractAt("PoolManager", EXISTING_CONTRACTS.poolManager);
    
    console.log(`   Setting OpinionCore in PoolManager...`);
    await poolManager.setOpinionCore(opinionCoreAddress);
    console.log(`   ✅ PoolManager connected`);
    
    // Grant roles
    console.log(`\n🔷 STEP 6: Grant Roles`);
    
    const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
    const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
    
    console.log(`   Granting ADMIN_ROLE to Safe...`);
    await opinionCore.grantRole(ADMIN_ROLE, EXISTING_CONTRACTS.adminSafe);
    
    console.log(`   Granting POOL_MANAGER_ROLE to PoolManager...`);
    await opinionCore.grantRole(POOL_MANAGER_ROLE, EXISTING_CONTRACTS.poolManager);
    
    console.log(`   ✅ Roles granted`);
    
    // Enable public creation
    console.log(`\n🔷 STEP 7: Enable Public Creation`);
    await opinionCore.togglePublicCreation();
    console.log(`   ✅ Public creation enabled`);
    
    // Final summary
    console.log(`\n🎉 DEPLOYMENT COMPLETE!`);
    console.log("=".repeat(60));
    console.log(`📋 CONTRACT ADDRESSES:`);
    console.log(`   OpinionCore:    ${opinionCoreAddress}`);
    console.log(`   PriceCalculator: ${priceCalculatorAddress}`);
    console.log(`   PoolManager:     ${EXISTING_CONTRACTS.poolManager} (existing)`);
    console.log(`   FeeManager:      ${EXISTING_CONTRACTS.feeManager} (existing)`);
    console.log(`   USDC:            ${EXISTING_CONTRACTS.usdc}`);
    console.log(`   Treasury:        ${EXISTING_CONTRACTS.treasury}`);
    console.log(`   Admin Safe:      ${EXISTING_CONTRACTS.adminSafe}`);
    
    console.log(`\n🚀 FEATURES:`);
    console.log(`   ✅ Full opinion creation with IPFS/links`);
    console.log(`   ✅ Answer trading with dynamic pricing`);
    console.log(`   ✅ Question ownership transfer/sales`);
    console.log(`   ✅ Pool integration`);
    console.log(`   ✅ Admin controls`);
    console.log(`   ✅ Rate limiting`);
    console.log(`   ✅ Extension system`);
    console.log(`   ✅ Categories management`);
    console.log(`   ⚠️  Moderation: Placeholder (can be upgraded)`);
    
    console.log(`\n💰 ESTIMATED COST: ~$8-12 USD`);
    console.log(`\n🎯 READY FOR FRONTEND INTEGRATION!`);
    
    return {
        opinionCore: opinionCoreAddress,
        priceCalculator: priceCalculatorAddress,
        poolManager: EXISTING_CONTRACTS.poolManager,
        feeManager: EXISTING_CONTRACTS.feeManager
    };
}

if (require.main === module) {
    deployOpinionCore()
        .then((addresses) => {
            console.log("\n📄 Save these addresses for frontend:");
            console.log(JSON.stringify(addresses, null, 2));
            process.exit(0);
        })
        .catch((error) => {
            console.error(`\n❌ DEPLOYMENT FAILED: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { deployOpinionCore };