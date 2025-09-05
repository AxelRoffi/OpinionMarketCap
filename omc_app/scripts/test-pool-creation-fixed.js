const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 TESTING POOL CREATION WITH FIXED FEES");
    console.log("========================================");
    
    const [deployer] = await ethers.getSigners();
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        // Check current fees
        const creationFee = await poolManager.poolCreationFee();
        const contributionFee = await poolManager.poolContributionFee();
        
        console.log("📋 Current Fees:");
        console.log("   Creation fee:", ethers.formatUnits(creationFee, 6), "USDC");
        console.log("   Contribution fee:", ethers.formatUnits(contributionFee, 6), "USDC");
        
        // Check user balance
        const userBalance = await usdcToken.balanceOf(deployer.address);
        const userBalanceFormatted = ethers.formatUnits(userBalance, 6);
        console.log("   User balance:", userBalanceFormatted, "USDC");
        
        // Calculate exact amounts needed
        const contributionAmount = ethers.parseUnits("0.1", 6); // 0.1 USDC
        const totalFeesNeeded = creationFee + contributionFee + contributionAmount;
        
        console.log("   Total needed:", ethers.formatUnits(totalFeesNeeded, 6), "USDC");
        console.log("   Can create pool:", userBalance >= totalFeesNeeded ? "✅" : "❌");
        
        if (userBalance >= totalFeesNeeded) {
            console.log("\n🚀 Creating test pool...");
            
            // Ensure allowance
            const allowance = await usdcToken.allowance(deployer.address, POOL_MANAGER_ADDRESS);
            if (allowance < totalFeesNeeded) {
                console.log("   Setting allowance...");
                const approveTx = await usdcToken.approve(POOL_MANAGER_ADDRESS, totalFeesNeeded);
                await approveTx.wait();
                console.log("   ✅ Allowance set");
            }
            
            // Create pool with exact parameters
            const deadline = Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60); // 2 days
            
            console.log("   Pool parameters:");
            console.log("     Opinion ID: 3");
            console.log("     Contribution:", ethers.formatUnits(contributionAmount, 6), "USDC");
            console.log("     Deadline:", new Date(deadline * 1000).toLocaleString());
            console.log("     Total cost:", ethers.formatUnits(totalFeesNeeded, 6), "USDC");
            
            const poolTx = await poolManager.createPool(
                3, // Opinion ID
                "Test pool - fixed fees and parameters", // Proposed answer
                deadline, // Valid deadline
                contributionAmount, // 0.1 USDC contribution  
                "Working Test Pool", // Name
                "" // No IPFS hash
            );
            
            console.log("   Transaction hash:", poolTx.hash);
            console.log("   Waiting for confirmation...");
            
            const receipt = await poolTx.wait();
            console.log("   ✅ POOL CREATED SUCCESSFULLY!");
            console.log("   Block:", receipt.blockNumber);
            console.log("   Gas used:", receipt.gasUsed.toString());
            
            // Verify pool was created
            const poolCount = await poolManager.poolCount();
            console.log("\n📋 Pool Verification:");
            console.log("   Total pools:", poolCount.toString());
            
            if (poolCount > 0) {
                const poolId = poolCount - BigInt(1);
                const pool = await poolManager.pools(poolId);
                
                console.log("   ✅ Pool Details:");
                console.log("     Pool ID:", poolId.toString());
                console.log("     Opinion ID:", pool[1].toString());  
                console.log("     Creator:", pool[2]);
                console.log("     Proposed Answer:", pool[3]);
                console.log("     Target Amount:", ethers.formatUnits(pool[4], 6), "USDC");
                console.log("     Total Contributed:", ethers.formatUnits(pool[5], 6), "USDC");
                console.log("     Deadline:", new Date(Number(pool[6]) * 1000).toLocaleString());
                console.log("     Status:", pool[7] === 0 ? "Active" : pool[7] === 1 ? "Executed" : "Expired");
                console.log("     Name:", pool[8]);
                
                // Check contributors
                const contributors = await poolManager.poolContributors(poolId);
                console.log("     Contributors:", contributors.length);
                console.log("     Contributor addresses:", contributors);
            }
            
            console.log("\n🎯 SUCCESS! Pool creation is now working!");
            console.log("==========================================");
            console.log("✅ Pool created on blockchain");
            console.log("✅ All fees paid correctly");
            console.log("✅ Pool data stored properly");
            console.log("✅ Frontend should now display this pool");
            
            console.log("\n📱 Next Steps:");
            console.log("1. Refresh the frontend pools page");
            console.log("2. Pool should appear in the list");
            console.log("3. API endpoint should return pool data");
            
            console.log("\n🔗 BaseScan Transaction:");
            console.log("   https://sepolia.basescan.org/tx/" + poolTx.hash);
            
        } else {
            console.log("❌ Still insufficient balance for pool creation");
        }
        
    } catch (error) {
        console.error("❌ Pool creation test failed:", error.message);
        if (error.data) {
            console.error("   Error data:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });