const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 CHECKING OPINION AND POOL MANAGER STATE");
    console.log("==========================================");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
        
        console.log("📋 Cross-Contract Verification:");
        
        // Check if OpinionCore recognizes the PoolManager
        const opinionCorePoolManager = await opinionCore.poolManager();
        console.log("   OpinionCore's PoolManager:", opinionCorePoolManager);
        console.log("   Expected PoolManager:", POOL_MANAGER_ADDRESS);
        console.log("   Addresses match:", opinionCorePoolManager.toLowerCase() === POOL_MANAGER_ADDRESS.toLowerCase());
        
        // Check if PoolManager recognizes OpinionCore
        const poolManagerOpinionCore = await poolManager.opinionCore();
        console.log("   PoolManager's OpinionCore:", poolManagerOpinionCore);
        console.log("   Expected OpinionCore:", OPINION_CORE_ADDRESS);
        console.log("   Addresses match:", poolManagerOpinionCore.toLowerCase() === OPINION_CORE_ADDRESS.toLowerCase());
        
        console.log("\n📋 Opinion #3 State Check:");
        
        // Get opinion details from both contracts
        const opinion3 = await opinionCore.getOpinionDetails(3);
        console.log("   Question:", opinion3.question);
        console.log("   Current answer:", opinion3.currentAnswer);
        console.log("   Is active:", !opinion3.isOwnershipTransferred);
        console.log("   Owner:", opinion3.currentAnswerOwner);
        console.log("   Creator:", opinion3.creator);
        
        // Check if opinion is tradeable/available
        console.log("\n📋 Opinion Trading State:");
        try {
            const nextPrice = opinion3.nextPrice;
            console.log("   Next price:", ethers.formatUnits(nextPrice, 6), "USDC");
            console.log("   Available for trading: ✅");
        } catch (priceError) {
            console.log("   Available for trading: ❌");
            console.log("   Price error:", priceError.message);
        }
        
        // Try calling getOpinionDetails from PoolManager perspective
        console.log("\n📋 PoolManager's View of Opinion:");
        try {
            // This will test if PoolManager can read from OpinionCore
            const poolManagerView = await poolManager.opinionCore();
            const opinionFromPool = await ethers.getContractAt("OpinionCore", poolManagerView);
            const opinion3FromPool = await opinionFromPool.getOpinionDetails(3);
            
            console.log("   PoolManager can read opinion: ✅");
            console.log("   Question from PoolManager:", opinion3FromPool.question);
            console.log("   Current answer from PoolManager:", opinion3FromPool.currentAnswer);
            
        } catch (poolViewError) {
            console.log("   PoolManager can read opinion: ❌");
            console.log("   Error:", poolViewError.message);
        }
        
        // Check if there are any issues with the contract states
        console.log("\n📋 Contract State Issues:");
        
        // Check if PoolManager is paused or has restrictions
        try {
            const poolCount = await poolManager.poolCount();
            console.log("   PoolManager functional: ✅ (pool count:", poolCount.toString() + ")");
        } catch (poolError) {
            console.log("   PoolManager functional: ❌");
            console.log("   Error:", poolError.message);
        }
        
        // Check if OpinionCore is paused
        try {
            const nextOpinionId = await opinionCore.nextOpinionId();
            console.log("   OpinionCore functional: ✅ (next opinion:", nextOpinionId.toString() + ")");
        } catch (opinionError) {
            console.log("   OpinionCore functional: ❌");
            console.log("   Error:", opinionError.message);
        }
        
        console.log("\n🔍 Final Analysis:");
        
        if (opinionCorePoolManager.toLowerCase() !== POOL_MANAGER_ADDRESS.toLowerCase()) {
            console.log("❌ CRITICAL: OpinionCore not connected to correct PoolManager");
        } else if (poolManagerOpinionCore.toLowerCase() !== OPINION_CORE_ADDRESS.toLowerCase()) {
            console.log("❌ CRITICAL: PoolManager not connected to correct OpinionCore");
        } else {
            console.log("✅ Contract connections look correct");
            console.log("❓ Issue might be in contract logic or gas estimation");
        }
        
        // Try to estimate gas for the pool creation
        console.log("\n⛽ Gas Estimation Test:");
        try {
            const [deployer] = await ethers.getSigners();
            const contributionAmount = ethers.parseUnits("1", 6);
            const deadline = Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60);
            
            const gasEstimate = await poolManager.createPool.estimateGas(
                3,
                "Different answer for testing",
                deadline,
                contributionAmount,
                "Gas Test Pool",
                "",
                { from: deployer.address }
            );
            
            console.log("   Gas estimation: ✅");
            console.log("   Estimated gas:", gasEstimate.toString());
            
        } catch (gasError) {
            console.log("   Gas estimation: ❌");
            console.log("   Gas error:", gasError.message);
            
            if (gasError.data) {
                console.log("   Gas error data:", gasError.data);
            }
        }
        
    } catch (error) {
        console.error("❌ State check failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });