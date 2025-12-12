// Final status check
const { ethers } = require("hardhat");

async function checkStatus() {
    const OPINION_CORE = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";
    const POOL_MANAGER = "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259";
    
    console.log("🔍 FINAL STATUS CHECK");
    console.log("=".repeat(50));
    
    const [signer] = await ethers.getSigners();
    
    // Check OpinionCore
    const coreABI = [
        "function usdcToken() view returns (address)",
        "function isPublicCreationEnabled() view returns (bool)",
        "function minimumPrice() view returns (uint96)",
        "function nextOpinionId() view returns (uint256)"
    ];
    
    const core = new ethers.Contract(OPINION_CORE, coreABI, signer);
    
    const usdc = await core.usdcToken();
    const publicEnabled = await core.isPublicCreationEnabled();
    const minPrice = await core.minimumPrice();
    const nextId = await core.nextOpinionId();
    
    console.log("\n🔷 OpinionCore Status:");
    console.log(`   Initialized: ${usdc !== ethers.ZeroAddress ? '✅' : '❌'}`);
    console.log(`   Public Creation: ${publicEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
    console.log(`   Minimum Price: ${ethers.formatUnits(minPrice, 6)} USDC`);
    console.log(`   Next Opinion ID: ${nextId}`);
    
    // Check PoolManager
    const poolABI = ["function opinionCore() view returns (address)"];
    const pool = new ethers.Contract(POOL_MANAGER, poolABI, signer);
    const poolCore = await pool.opinionCore();
    
    console.log("\n🔷 PoolManager Status:");
    console.log(`   Connected to OpinionCore: ${poolCore === OPINION_CORE ? '✅' : '❌'}`);
    
    console.log("\n🎯 SYSTEM STATUS:");
    const allGood = usdc !== ethers.ZeroAddress && publicEnabled && poolCore === OPINION_CORE;
    console.log(`   ${allGood ? '🎉 FULLY OPERATIONAL!' : '⚠️  Needs configuration'}`);
    
    if (allGood) {
        console.log("\n✅ YOUR OPINIONMARKETCAP IS READY FOR USE!");
        console.log("\n📋 CONTRACT ADDRESSES FOR FRONTEND:");
        console.log(JSON.stringify({
            opinionCore: OPINION_CORE,
            poolManager: POOL_MANAGER,
            feeManager: "0x64997bd18520d93e7f0da87c69582d06b7f265d5",
            usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            treasury: "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d"
        }, null, 2));
    }
}

checkStatus().catch(console.error);