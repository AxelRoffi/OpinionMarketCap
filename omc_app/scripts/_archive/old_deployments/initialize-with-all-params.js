// Initialize with all required parameters
const { ethers } = require("hardhat");

const CONTRACTS = {
    opinionCore: "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97",
    priceCalculator: "0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7",
    feeManager: "0x64997bd18520d93e7f0da87c69582d06b7f265d5",
    poolManager: "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    treasury: "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d",
    adminSafe: "0xd90341dC9F724ae29f02Eadb64525cd8C0C834c1"
};

async function initialize() {
    console.log("🚀 INITIALIZING WITH ALL PARAMETERS");
    console.log("=".repeat(50));
    
    const [deployer] = await ethers.getSigners();
    
    // Initialize requires 7 parameters:
    // 1. _usdcToken
    // 2. _opinionMarket (we'll use deployer address)
    // 3. _feeManager
    // 4. _poolManager
    // 5. _monitoringManager (we'll use address(0))
    // 6. _securityManager (we'll use address(0))
    // 7. _treasury
    
    const initABI = [
        "function initialize(address,address,address,address,address,address,address) external",
        "function usdcToken() view returns (address)",
        "function isPublicCreationEnabled() view returns (bool)",
        "function togglePublicCreation() external",
        "function setMinimumPrice(uint96) external",
        "function setQuestionCreationFee(uint96) external",
        "function setInitialAnswerPrice(uint96) external",
        "function setAbsoluteMaxPriceChange(uint256) external",
        "function setMaxTradesPerBlock(uint256) external",
        "function grantRole(bytes32,address) external",
        "function ADMIN_ROLE() view returns (bytes32)",
        "function POOL_MANAGER_ROLE() view returns (bytes32)"
    ];
    
    const opinionCore = new ethers.Contract(CONTRACTS.opinionCore, initABI, deployer);
    
    console.log("\n🔷 Initializing OpinionCore...");
    try {
        const tx = await opinionCore.initialize(
            CONTRACTS.usdc,              // _usdcToken
            deployer.address,            // _opinionMarket (using deployer)
            CONTRACTS.feeManager,        // _feeManager
            CONTRACTS.poolManager,       // _poolManager
            ethers.ZeroAddress,          // _monitoringManager (not needed)
            ethers.ZeroAddress,          // _securityManager (not needed)
            CONTRACTS.treasury           // _treasury
        );
        await tx.wait();
        console.log("   ✅ OpinionCore initialized!");
    } catch (error) {
        if (error.message.includes("Initializable")) {
            console.log("   ⚠️  Already initialized");
        } else {
            throw error;
        }
    }
    
    // Check if initialized
    const usdcToken = await opinionCore.usdcToken();
    console.log(`   USDC Token: ${usdcToken}`);
    console.log(`   Initialized: ${usdcToken !== ethers.ZeroAddress ? '✅' : '❌'}`);
    
    // Configure parameters
    console.log("\n🔷 Setting parameters...");
    await opinionCore.setMinimumPrice(ethers.parseUnits("1", 6));
    console.log("   ✅ Min price: 1 USDC");
    
    await opinionCore.setQuestionCreationFee(ethers.parseUnits("1", 6));
    console.log("   ✅ Creation fee: 1 USDC");
    
    await opinionCore.setInitialAnswerPrice(ethers.parseUnits("1", 6));
    console.log("   ✅ Initial answer: 1 USDC");
    
    await opinionCore.setAbsoluteMaxPriceChange(300);
    console.log("   ✅ Max change: 300%");
    
    await opinionCore.setMaxTradesPerBlock(5);
    console.log("   ✅ Rate limit: 5/block");
    
    // Grant roles
    console.log("\n🔷 Granting roles...");
    const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
    const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
    
    await opinionCore.grantRole(ADMIN_ROLE, CONTRACTS.adminSafe);
    console.log("   ✅ Admin Safe has ADMIN_ROLE");
    
    await opinionCore.grantRole(POOL_MANAGER_ROLE, CONTRACTS.poolManager);
    console.log("   ✅ PoolManager has POOL_MANAGER_ROLE");
    
    // Enable public creation
    console.log("\n🔷 Enabling public creation...");
    await opinionCore.togglePublicCreation();
    console.log("   ✅ Public creation enabled!");
    
    // Connect PoolManager
    console.log("\n🔷 Connecting PoolManager...");
    const poolABI = ["function setOpinionCore(address) external"];
    const poolManager = new ethers.Contract(CONTRACTS.poolManager, poolABI, deployer);
    await poolManager.setOpinionCore(CONTRACTS.opinionCore);
    console.log("   ✅ PoolManager connected!");
    
    // Final check
    console.log("\n🔷 FINAL STATUS:");
    const publicEnabled = await opinionCore.isPublicCreationEnabled();
    console.log(`   Public creation: ${publicEnabled ? '✅ ENABLED' : '❌'}`);
    
    console.log("\n🎉 COMPLETE! Your system is ready!");
    console.log("\n📋 CONTRACT ADDRESSES:");
    console.log(JSON.stringify(CONTRACTS, null, 2));
}

initialize()
    .then(() => {
        console.log("\n✅ SUCCESS!");
        process.exit(0);
    })
    .catch((error) => {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    });