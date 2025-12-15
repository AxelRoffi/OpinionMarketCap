// Initialize and configure all contracts
const { ethers } = require("hardhat");

const CONTRACTS = {
    opinionCore: "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97",
    feeManager: "0x64997bd18520d93e7f0da87c69582d06b7f265d5",
    poolManager: "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    treasury: "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d",
    adminSafe: "0xd90341dC9F724ae29f02Eadb64525cd8C0C834c1"
};

async function initializeAndConfigure() {
    console.log("🚀 INITIALIZING AND CONFIGURING CONTRACTS");
    console.log("=".repeat(50));
    
    const [deployer] = await ethers.getSigners();
    console.log(`📍 Deployer: ${deployer.address}`);
    
    // Get OpinionCore contract with proper ABI
    const OpinionCoreFactory = await ethers.getContractFactory("OpinionCoreNoMod", {
        libraries: {
            PriceCalculator: "0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7"
        }
    });
    const opinionCore = OpinionCoreFactory.attach(CONTRACTS.opinionCore);
    
    // Step 1: Initialize OpinionCore
    console.log(`\n🔷 STEP 1: Initialize OpinionCore`);
    const tx = await opinionCore.initialize(
        CONTRACTS.usdc,
        CONTRACTS.feeManager,
        CONTRACTS.poolManager,
        CONTRACTS.treasury
    );
    await tx.wait();
    console.log(`   ✅ OpinionCore initialized!`);
    
    // Step 2: Configure parameters
    console.log(`\n🔷 STEP 2: Configure Parameters`);
    
    console.log(`   Setting minimum price...`);
    await opinionCore.setMinimumPrice(ethers.parseUnits("1", 6));
    console.log(`   ✅ Minimum price: 1 USDC`);
    
    console.log(`   Setting creation fee...`);
    await opinionCore.setQuestionCreationFee(ethers.parseUnits("1", 6));
    console.log(`   ✅ Creation fee: 1 USDC`);
    
    console.log(`   Setting initial answer price...`);
    await opinionCore.setInitialAnswerPrice(ethers.parseUnits("1", 6));
    console.log(`   ✅ Initial answer price: 1 USDC`);
    
    console.log(`   Setting max price change...`);
    await opinionCore.setAbsoluteMaxPriceChange(300);
    console.log(`   ✅ Max price change: 300%`);
    
    console.log(`   Setting rate limiting...`);
    await opinionCore.setMaxTradesPerBlock(5);
    console.log(`   ✅ Rate limiting: 5 trades/block`);
    
    // Step 3: Connect PoolManager
    console.log(`\n🔷 STEP 3: Connect PoolManager to OpinionCore`);
    const poolAbi = ["function setOpinionCore(address) external"];
    const poolManager = new ethers.Contract(CONTRACTS.poolManager, poolAbi, deployer);
    await poolManager.setOpinionCore(CONTRACTS.opinionCore);
    console.log(`   ✅ PoolManager connected!`);
    
    // Step 4: Grant roles
    console.log(`\n🔷 STEP 4: Grant Roles`);
    
    const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
    const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
    
    console.log(`   Granting ADMIN_ROLE to Safe...`);
    await opinionCore.grantRole(ADMIN_ROLE, CONTRACTS.adminSafe);
    console.log(`   ✅ Admin Safe has ADMIN_ROLE`);
    
    console.log(`   Granting POOL_MANAGER_ROLE to PoolManager...`);
    await opinionCore.grantRole(POOL_MANAGER_ROLE, CONTRACTS.poolManager);
    console.log(`   ✅ PoolManager has POOL_MANAGER_ROLE`);
    
    // Step 5: Enable public creation
    console.log(`\n🔷 STEP 5: Enable Public Creation`);
    await opinionCore.togglePublicCreation();
    console.log(`   ✅ Public creation enabled!`);
    
    // Final verification
    console.log(`\n🔷 FINAL VERIFICATION`);
    const publicEnabled = await opinionCore.isPublicCreationEnabled();
    const nextId = await opinionCore.nextOpinionId();
    const minPrice = await opinionCore.minimumPrice();
    
    console.log(`   Public Creation: ${publicEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
    console.log(`   Next Opinion ID: ${nextId}`);
    console.log(`   Minimum Price: ${ethers.formatUnits(minPrice, 6)} USDC`);
    
    // Summary
    console.log(`\n🎉 SYSTEM READY!`);
    console.log("=".repeat(50));
    console.log(`📋 CONTRACT ADDRESSES FOR FRONTEND:`);
    console.log(JSON.stringify({
        opinionCore: CONTRACTS.opinionCore,
        feeManager: CONTRACTS.feeManager,
        poolManager: CONTRACTS.poolManager,
        usdc: CONTRACTS.usdc,
        treasury: CONTRACTS.treasury,
        adminSafe: CONTRACTS.adminSafe
    }, null, 2));
    
    console.log(`\n✅ ALL FEATURES AVAILABLE:`);
    console.log(`   - Opinion creation with IPFS/links`);
    console.log(`   - Answer trading with dynamic pricing`);
    console.log(`   - Question ownership transfer/sales`);
    console.log(`   - Pool integration`);
    console.log(`   - Extension system`);
    console.log(`   - Categories management`);
    console.log(`   - Admin controls`);
    console.log(`   - Public creation enabled`);
    console.log(`\n⚠️  Moderation: Placeholder functions (can upgrade later)`);
}

initializeAndConfigure()
    .then(() => {
        console.log("\n✅ SUCCESS! Your OpinionMarketCap is ready!");
        process.exit(0);
    })
    .catch((error) => {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    });