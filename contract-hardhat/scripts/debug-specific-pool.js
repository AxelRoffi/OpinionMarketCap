const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Debugging Pool #7 Completion Issue...");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const poolId = 7;
    
    // Get the PoolManager contract
    const PoolManager = await ethers.getContractFactory("PoolManager");
    const poolManager = PoolManager.attach(POOL_MANAGER_ADDRESS);
    
    try {
        // Get detailed pool information
        console.log("\n📊 Pool #7 Details:");
        const poolDetails = await poolManager.getPoolDetails(poolId);
        
        const [info, currentPrice, remainingAmount, timeRemaining] = poolDetails;
        
        console.log("Pool Info:", {
            id: info.id.toString(),
            opinionId: info.opinionId.toString(), 
            status: info.status.toString(),
            totalAmount: ethers.formatUnits(info.totalAmount, 6) + " USDC",
            targetPrice: ethers.formatUnits(info.targetPrice, 6) + " USDC",
            deadline: new Date(Number(info.deadline) * 1000).toISOString(),
            creator: info.creator,
            proposedAnswer: info.proposedAnswer
        });
        
        console.log("Calculated Values:", {
            currentPrice: ethers.formatUnits(currentPrice, 6) + " USDC",
            remainingAmount: ethers.formatUnits(remainingAmount, 6) + " USDC",
            timeRemaining: Number(timeRemaining) + " seconds",
            remainingAmountWei: remainingAmount.toString()
        });
        
        // Calculate tolerance values
        const targetPriceWei = info.targetPrice;
        const totalAmountWei = info.totalAmount;
        const tolerance = targetPriceWei / 10000n; // 0.01%
        
        console.log("\n🎯 Completion Analysis:");
        console.log("Target Price (wei):", targetPriceWei.toString());
        console.log("Current Amount (wei):", totalAmountWei.toString());
        console.log("Remaining (wei):", remainingAmount.toString());
        console.log("Tolerance (wei):", tolerance.toString());
        console.log("Tolerance (USDC):", ethers.formatUnits(tolerance, 6));
        
        // Check completion scenarios
        const withinTolerance = totalAmountWei >= (targetPriceWei - tolerance);
        const isMicroAmount = remainingAmount < 10000n; // < 0.01 USDC
        
        console.log("\n✅ Fix Analysis:");
        console.log("Is within tolerance (0.01%):", withinTolerance);
        console.log("Is micro amount (< 0.01 USDC):", isMicroAmount);
        console.log("Should auto-complete:", withinTolerance);
        console.log("Should allow free completion:", isMicroAmount);
        
        // Calculate completion percentage
        const completionPercent = (Number(totalAmountWei) * 100) / Number(targetPriceWei);
        console.log("Current completion:", completionPercent.toFixed(6) + "%");
        
        if (!withinTolerance && !isMicroAmount) {
            console.log("\n💡 Regular Completion Required:");
            const contributionFee = 1_000_000n; // 1 USDC
            const totalRequired = remainingAmount + contributionFee;
            console.log("Amount needed:", ethers.formatUnits(remainingAmount, 6) + " USDC");
            console.log("Plus fee:", ethers.formatUnits(contributionFee, 6) + " USDC");
            console.log("Total required:", ethers.formatUnits(totalRequired, 6) + " USDC");
        }
        
        // Test what happens if we try to execute the pool completion logic manually
        console.log("\n🧪 Testing Completion Logic:");
        
        // This simulates what happens in _checkAndExecutePoolIfReady
        const wouldComplete = totalAmountWei >= (targetPriceWei - tolerance);
        console.log("Contract completion logic result:", wouldComplete);
        
        if (wouldComplete) {
            console.log("🎉 Pool should auto-complete with the fix!");
        } else {
            console.log("⚠️ Pool requires manual completion via completePool()");
        }
        
    } catch (error) {
        console.error("❌ Error debugging pool:", error.message);
        throw error;
    }
}

main()
    .then(() => {
        console.log("\n✅ Pool debugging completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Debug failed:", error);
        process.exit(1);
    });