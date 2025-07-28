const { ethers } = require("hardhat");

async function main() {
    console.log("🎯 GET EXACT POOL COMPLETION AMOUNT");
    console.log("===================================");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
        
        // Check Pool #2 specifically (the one in screenshot)
        console.log("🔍 Analyzing Pool #2:\n");
        
        const pool = await poolManager.pools(2);
        const poolInfo = {
            id: 2,
            opinionId: Number(pool[1]),
            proposedAnswer: pool[2],
            totalAmount: pool[3],
            targetPrice: pool[9] // targetPrice is at index 9 now
        };
        
        console.log("📊 Pool #2 Details:");
        console.log(`   Opinion ID: ${poolInfo.opinionId}`);
        console.log(`   Proposed Answer: "${poolInfo.proposedAnswer}"`);
        console.log(`   Current Contributions: ${ethers.formatUnits(poolInfo.totalAmount, 6)} USDC`);
        console.log(`   Stored Target Price: ${ethers.formatUnits(poolInfo.targetPrice, 6)} USDC`);
        
        // Get current opinion price (what the pool should target)
        const opinion = await opinionCore.getOpinionDetails(poolInfo.opinionId);
        const currentOpinionPrice = opinion.nextPrice;
        
        console.log(`   Current Opinion Price: ${ethers.formatUnits(currentOpinionPrice, 6)} USDC\n`);
        
        // Calculate what user needs to contribute
        const remainingToOpinionPrice = currentOpinionPrice - poolInfo.totalAmount;
        const poolFee = ethers.parseUnits("1", 6); // 1 USDC fee
        const totalUserNeeds = remainingToOpinionPrice + poolFee;
        
        console.log("💰 SOLUTION FOR USER:");
        console.log("====================");
        console.log(`✅ Pool #2 needs: ${ethers.formatUnits(remainingToOpinionPrice, 6)} USDC to complete`);
        console.log(`✅ Pool fee: ${ethers.formatUnits(poolFee, 6)} USDC`);
        console.log(`✅ Total user needs: ${ethers.formatUnits(totalUserNeeds, 6)} USDC`);
        
        console.log("\n🎯 USER INSTRUCTIONS:");
        console.log("======================");
        console.log("1. Refresh your browser");
        console.log("2. Your pool should show 'Finish Pool' button (green)");
        console.log(`3. Click 'Finish Pool' and contribute exactly ${ethers.formatUnits(remainingToOpinionPrice, 6)} USDC`);
        console.log("4. Pool will complete at 100%");
        
        console.log("\n⚠️  WHY completePool() FAILED:");
        console.log("===============================");
        console.log("- Pool #2 was created before the fix was deployed");
        console.log("- It has targetPrice = 0 in storage");
        console.log("- completePool() function requires valid stored targetPrice");
        console.log("- Solution: Use regular 'Join Pool' with exact amount shown above");
        
        console.log("\n🔧 TECHNICAL DETAILS:");
        console.log("======================");
        console.log("- Old pools: targetPrice = 0 (broken)");
        console.log("- New pools: targetPrice = stored value (working)");
        console.log("- Frontend now shows 'Finish Pool' for 99%+ old pools");
        console.log("- Frontend shows 'Complete Pool' for 99%+ new pools");
        
    } catch (error) {
        console.error("❌ Script failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });