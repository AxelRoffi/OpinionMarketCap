const { ethers } = require("hardhat");

async function main() {
    console.log("🚨 URGENT: FIXING EXISTING POOLS WITH ZERO TARGET PRICE");
    console.log("========================================================");
    
    const POOL_MANAGER_PROXY = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
    
    try {
        const [deployer] = await ethers.getSigners();
        console.log("🔑 Using account:", deployer.address);
        
        // Check admin role
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_PROXY);
        const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
        
        const ADMIN_ROLE = await poolManager.ADMIN_ROLE();
        const hasAdminRole = await poolManager.hasRole(ADMIN_ROLE, deployer.address);
        
        console.log("🔑 Has ADMIN role:", hasAdminRole);
        
        if (!hasAdminRole) {
            console.log("❌ Account does not have ADMIN role - cannot fix pools directly");
            console.log("📋 Manual workaround needed...");
            
            // Instead, let's provide the user with the exact amount to contribute
            const poolCount = await poolManager.poolCount();
            console.log(`\n📊 Analyzing ${poolCount} pools for manual fix:\n`);
            
            for (let i = 0; i < Number(poolCount); i++) {
                try {
                    const pool = await poolManager.pools(i);
                    const poolInfo = {
                        id: Number(pool[0]),
                        opinionId: Number(pool[1]),
                        proposedAnswer: pool[2],
                        totalAmount: pool[3],
                        deadline: Number(pool[5]),
                        status: Number(pool[6]),
                        targetPrice: pool[9] // targetPrice is now at index 9
                    };
                    
                    console.log(`Pool #${i}:`);
                    console.log(`  Opinion ID: ${poolInfo.opinionId}`);
                    console.log(`  Proposed Answer: "${poolInfo.proposedAnswer}"`);
                    console.log(`  Current Amount: ${ethers.formatUnits(poolInfo.totalAmount, 6)} USDC`);
                    console.log(`  Stored Target Price: ${ethers.formatUnits(poolInfo.targetPrice, 6)} USDC`);
                    
                    // Get current opinion price
                    try {
                        const opinion = await opinionCore.getOpinionDetails(poolInfo.opinionId);
                        const currentPrice = opinion.nextPrice;
                        console.log(`  Current Opinion Price: ${ethers.formatUnits(currentPrice, 6)} USDC`);
                        
                        if (Number(poolInfo.targetPrice) === 0) {
                            console.log(`  🚨 BROKEN POOL: targetPrice is 0!`);
                            console.log(`  🔧 MANUAL FIX: User should contribute ${ethers.formatUnits(currentPrice - poolInfo.totalAmount, 6)} USDC`);
                            console.log(`  💡 This pool needs: ${ethers.formatUnits(currentPrice - poolInfo.totalAmount, 6)} USDC to complete`);
                        } else {
                            const remaining = poolInfo.targetPrice - poolInfo.totalAmount;
                            console.log(`  ✅ Working pool - needs ${ethers.formatUnits(remaining, 6)} USDC to complete`);
                        }
                        
                    } catch (e) {
                        console.log(`  ❌ Could not get opinion details: ${e.message}`);
                    }
                    
                    console.log("");
                    
                } catch (error) {
                    console.log(`  ❌ Error reading Pool #${i}: ${error.message}`);
                }
            }
            
            console.log("\n🔧 MANUAL WORKAROUND FOR USER:");
            console.log("==============================");
            console.log("Since pools have targetPrice = 0, the completePool() function won't work.");
            console.log("Instead, the user should:");
            console.log("1. Use regular 'Join Pool' button");
            console.log("2. Contribute the amount shown above");
            console.log("3. This should complete the pool manually");
            
            return;
        }
        
        // If we have admin role, we could try to fix pools directly
        // But for now, let's provide manual instructions
        
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