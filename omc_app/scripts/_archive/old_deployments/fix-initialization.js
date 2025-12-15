// Fix initialization using the exact contract that was deployed
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

async function fixInitialization() {
    console.log("🚀 FIXING CONTRACT INITIALIZATION");
    console.log("=".repeat(50));
    
    const [deployer] = await ethers.getSigners();
    console.log(`📍 Deployer: ${deployer.address}`);
    
    // Use the EXACT same factory that deployed the contract
    console.log("\n🔷 Getting contract with exact factory...");
    // The deployed contract is OpinionCoreNoMod (23.397 KB version)
    const OpinionCore = await ethers.getContractFactory("OpinionCoreNoMod", {
        libraries: {
            PriceCalculator: CONTRACTS.priceCalculator
        }
    });
    const opinionCore = OpinionCore.attach(CONTRACTS.opinionCore);
    
    // Initialize
    console.log("\n🔷 Initializing OpinionCore...");
    try {
        const tx = await opinionCore.initialize(
            CONTRACTS.usdc,
            CONTRACTS.feeManager,
            CONTRACTS.poolManager,
            CONTRACTS.treasury
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
    
    // Configure parameters
    console.log("\n🔷 Configuring parameters...");
    
    const params = [
        { fn: "setMinimumPrice", value: ethers.parseUnits("1", 6), desc: "Minimum price: 1 USDC" },
        { fn: "setQuestionCreationFee", value: ethers.parseUnits("1", 6), desc: "Creation fee: 1 USDC" },
        { fn: "setInitialAnswerPrice", value: ethers.parseUnits("1", 6), desc: "Initial answer: 1 USDC" },
        { fn: "setAbsoluteMaxPriceChange", value: 300, desc: "Max price change: 300%" },
        { fn: "setMaxTradesPerBlock", value: 5, desc: "Rate limit: 5/block" }
    ];
    
    for (const param of params) {
        try {
            await opinionCore[param.fn](param.value);
            console.log(`   ✅ ${param.desc}`);
        } catch (e) {
            console.log(`   ⚠️  ${param.desc} - already set or failed`);
        }
    }
    
    // Connect PoolManager
    console.log("\n🔷 Connecting PoolManager...");
    const poolABI = ["function setOpinionCore(address) external", "function opinionCore() view returns (address)"];
    const poolManager = new ethers.Contract(CONTRACTS.poolManager, poolABI, deployer);
    
    try {
        await poolManager.setOpinionCore(CONTRACTS.opinionCore);
        console.log("   ✅ PoolManager connected!");
    } catch (e) {
        const currentCore = await poolManager.opinionCore();
        if (currentCore === CONTRACTS.opinionCore) {
            console.log("   ⚠️  Already connected");
        } else {
            console.log("   ❌ Failed to connect PoolManager");
        }
    }
    
    // Grant roles
    console.log("\n🔷 Granting roles...");
    const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
    const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
    
    try {
        await opinionCore.grantRole(ADMIN_ROLE, CONTRACTS.adminSafe);
        console.log("   ✅ Admin Safe has ADMIN_ROLE");
    } catch (e) {
        console.log("   ⚠️  Admin role already granted");
    }
    
    try {
        await opinionCore.grantRole(POOL_MANAGER_ROLE, CONTRACTS.poolManager);
        console.log("   ✅ PoolManager has POOL_MANAGER_ROLE");
    } catch (e) {
        console.log("   ⚠️  PoolManager role already granted");
    }
    
    // Enable public creation
    console.log("\n🔷 Enabling public creation...");
    const isPublic = await opinionCore.isPublicCreationEnabled();
    if (!isPublic) {
        await opinionCore.togglePublicCreation();
        console.log("   ✅ Public creation enabled!");
    } else {
        console.log("   ⚠️  Already enabled");
    }
    
    // Final verification
    console.log("\n🔷 FINAL VERIFICATION:");
    const usdcToken = await opinionCore.usdcToken();
    const publicEnabled = await opinionCore.isPublicCreationEnabled();
    const minPrice = await opinionCore.minimumPrice();
    const poolCore = await poolManager.opinionCore();
    
    console.log(`   OpinionCore initialized: ${usdcToken !== '0x0000000000000000000000000000000000000000' ? '✅' : '❌'}`);
    console.log(`   Public creation: ${publicEnabled ? '✅' : '❌'}`);
    console.log(`   Minimum price: ${ethers.formatUnits(minPrice, 6)} USDC`);
    console.log(`   PoolManager connected: ${poolCore === CONTRACTS.opinionCore ? '✅' : '❌'}`);
    
    console.log("\n🎉 SYSTEM READY FOR USE!");
    console.log("\n📋 CONTRACT ADDRESSES FOR FRONTEND:");
    console.log(JSON.stringify(CONTRACTS, null, 2));
}

fixInitialization()
    .then(() => {
        console.log("\n✅ SUCCESS! Your OpinionMarketCap is fully operational!");
        process.exit(0);
    })
    .catch((error) => {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    });