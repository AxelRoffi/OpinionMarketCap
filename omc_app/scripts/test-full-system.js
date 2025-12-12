// Test the full system to ensure everything works
const { ethers } = require("hardhat");

const CONTRACTS = {
    opinionCore: "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97",
    feeManager: "0x64997bd18520d93e7f0da87c69582d06b7f265d5",
    poolManager: "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    treasury: "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d"
};

async function testFullSystem() {
    console.log("🧪 FULL SYSTEM TEST");
    console.log("=".repeat(60));
    
    const [deployer] = await ethers.getSigners();
    console.log(`Testing with: ${deployer.address}`);
    
    // Get contract instances
    const opinionABI = [
        "function isPublicCreationEnabled() view returns (bool)",
        "function minimumPrice() view returns (uint96)",
        "function questionCreationFee() view returns (uint96)",
        "function nextOpinionId() view returns (uint256)",
        "function usdcToken() view returns (address)",
        "function feeManager() view returns (address)",
        "function treasury() view returns (address)",
        "function hasRole(bytes32,address) view returns (bool)",
        "function ADMIN_ROLE() view returns (bytes32)",
        "function POOL_MANAGER_ROLE() view returns (bytes32)",
        "function getAvailableCategories() view returns (string[])",
        "function createOpinion(string,string,string,uint96,string[]) external",
        "function getOpinionDetails(uint256) view returns (tuple(uint256,address,string,string[],address,bool,bool,uint96,uint96,uint256,uint256,bool,string,string,uint256,uint256))"
    ];
    
    const opinionCore = new ethers.Contract(CONTRACTS.opinionCore, opinionABI, deployer);
    
    console.log("\n📋 SYSTEM STATUS CHECK");
    console.log("=".repeat(40));
    
    // 1. Check initialization
    console.log("\n1️⃣ Initialization Check:");
    const usdcToken = await opinionCore.usdcToken();
    const feeManager = await opinionCore.feeManager();
    const treasury = await opinionCore.treasury();
    
    console.log(`   USDC Token: ${usdcToken === CONTRACTS.usdc ? '✅' : '❌'} ${usdcToken}`);
    console.log(`   FeeManager: ${feeManager === CONTRACTS.feeManager ? '✅' : '❌'} ${feeManager}`);
    console.log(`   Treasury: ${treasury === CONTRACTS.treasury ? '✅' : '❌'} ${treasury}`);
    
    // 2. Check configuration
    console.log("\n2️⃣ Configuration Check:");
    const publicEnabled = await opinionCore.isPublicCreationEnabled();
    const minPrice = await opinionCore.minimumPrice();
    const creationFee = await opinionCore.questionCreationFee();
    const nextId = await opinionCore.nextOpinionId();
    
    console.log(`   Public Creation: ${publicEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
    console.log(`   Minimum Price: ${ethers.formatUnits(minPrice, 6)} USDC`);
    console.log(`   Creation Fee: ${ethers.formatUnits(creationFee, 6)} USDC`);
    console.log(`   Next Opinion ID: ${nextId}`);
    
    // 3. Check roles
    console.log("\n3️⃣ Role Check:");
    const ADMIN_ROLE = await opinionCore.ADMIN_ROLE();
    const POOL_MANAGER_ROLE = await opinionCore.POOL_MANAGER_ROLE();
    
    const deployerHasAdmin = await opinionCore.hasRole(ADMIN_ROLE, deployer.address);
    const poolHasRole = await opinionCore.hasRole(POOL_MANAGER_ROLE, CONTRACTS.poolManager);
    
    console.log(`   Deployer has ADMIN: ${deployerHasAdmin ? '✅' : '❌'}`);
    console.log(`   PoolManager has ROLE: ${poolHasRole ? '✅' : '❌'}`);
    
    // 4. Check categories
    console.log("\n4️⃣ Categories Check:");
    try {
        const categories = await opinionCore.getAvailableCategories();
        console.log(`   Available Categories: ${categories.length} found`);
        console.log(`   Categories: ${categories.slice(0, 3).join(', ')}...`);
    } catch (e) {
        console.log(`   ❌ Error reading categories: ${e.message.substring(0, 50)}`);
    }
    
    // 5. Test opinion creation (dry run)
    console.log("\n5️⃣ Opinion Creation Test (Dry Run):");
    console.log("   Would create opinion with:");
    console.log("   - Question: 'Will Bitcoin reach $100k in 2025?'");
    console.log("   - Answer: 'Yes, institutional adoption'");
    console.log("   - Price: 1 USDC");
    console.log("   - Categories: ['Crypto']");
    
    // Check USDC balance
    const usdcABI = ["function balanceOf(address) view returns (uint256)"];
    const usdc = new ethers.Contract(CONTRACTS.usdc, usdcABI, deployer);
    const usdcBalance = await usdc.balanceOf(deployer.address);
    console.log(`   Deployer USDC Balance: ${ethers.formatUnits(usdcBalance, 6)} USDC`);
    
    if (usdcBalance >= ethers.parseUnits("1", 6)) {
        console.log("   ✅ Has enough USDC to create opinion");
    } else {
        console.log("   ❌ Need at least 1 USDC to create opinion");
    }
    
    // Summary
    console.log("\n🎯 SYSTEM READINESS");
    console.log("=".repeat(40));
    
    const isReady = 
        usdcToken === CONTRACTS.usdc &&
        feeManager === CONTRACTS.feeManager &&
        treasury === CONTRACTS.treasury &&
        publicEnabled &&
        deployerHasAdmin;
    
    if (isReady) {
        console.log("✅ SYSTEM IS FULLY OPERATIONAL!");
        console.log("\nYou can now:");
        console.log("1. Create opinions (need USDC)");
        console.log("2. Trade answers");
        console.log("3. Transfer ownership");
        console.log("4. Manage admin functions");
        
        console.log("\n📝 CONTRACT ADDRESSES FOR FRONTEND:");
        console.log(JSON.stringify({
            opinionCore: CONTRACTS.opinionCore,
            feeManager: CONTRACTS.feeManager,
            poolManager: CONTRACTS.poolManager,
            usdc: CONTRACTS.usdc,
            treasury: CONTRACTS.treasury
        }, null, 2));
        
    } else {
        console.log("⚠️  SYSTEM NEEDS CONFIGURATION");
        console.log("Check the failed items above");
    }
}

testFullSystem()
    .then(() => {
        console.log("\n✅ Test completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    });