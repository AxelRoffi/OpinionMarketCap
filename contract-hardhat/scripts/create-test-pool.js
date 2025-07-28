const { ethers } = require("hardhat");

async function main() {
    console.log("🏊 CREATING TEST POOL");
    console.log("=====================");
    
    const [deployer] = await ethers.getSigners();
    console.log("🔗 Using account:", deployer.address);
    
    // Contract addresses
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    try {
        // Connect to contracts
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        // Check USDC balance
        const balance = await usdcToken.balanceOf(deployer.address);
        console.log("💰 USDC balance:", ethers.formatUnits(balance, 6), "USDC");
        
        // Check allowance
        const allowance = await usdcToken.allowance(deployer.address, POOL_MANAGER_ADDRESS);
        console.log("🔓 PoolManager allowance:", ethers.formatUnits(allowance, 6), "USDC");
        
        // Set allowance if needed
        if (allowance < ethers.parseUnits("50", 6)) {
            console.log("Setting up allowance...");
            await usdcToken.approve(POOL_MANAGER_ADDRESS, ethers.parseUnits("50", 6));
            console.log("✅ Allowance set");
        }
        
        // Get current pool count
        const currentPoolCount = await poolManager.poolCount();
        console.log("📊 Current pool count:", currentPoolCount.toString());
        
        // Create pool for opinion #1 (should exist)
        console.log("\n🏗️ Creating pool for Opinion #1...");
        
        // Pool creation needs: 5 USDC fee + contribution = total needed
        // User has 5.744 USDC, so use 0.5 USDC contribution (total: 5.5 USDC)
        const poolCreationTx = await poolManager.createPool(
            1, // Opinion ID #1
            "Actually, this opinion is wrong", // Proposed answer
            Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days deadline
            ethers.parseUnits("0.5", 6), // 0.5 USDC initial contribution (safe amount)
            "Test Pool for Opinion #1", // Pool name
            "" // No IPFS hash
        );
        
        const receipt = await poolCreationTx.wait();
        console.log("✅ Pool created successfully!");
        console.log("   Transaction hash:", receipt.hash);
        console.log("   Gas used:", receipt.gasUsed.toString());
        
        // Check new pool count
        const newPoolCount = await poolManager.poolCount();
        console.log("📊 New pool count:", newPoolCount.toString());
        
        if (newPoolCount > currentPoolCount) {
            const poolId = newPoolCount - BigInt(1); // Last created pool (0-indexed)
            console.log("\n📋 Pool Details:");
            console.log("   Pool ID:", poolId.toString());
            
            try {
                const pool = await poolManager.pools(poolId);
                console.log("   Opinion ID:", pool[1].toString());
                console.log("   Creator:", pool[2]);
                console.log("   Proposed Answer:", pool[3]);
                console.log("   Target Amount:", ethers.formatUnits(pool[4], 6), "USDC");
                console.log("   Current Contributed:", ethers.formatUnits(pool[5], 6), "USDC");
                console.log("   Deadline:", new Date(Number(pool[6]) * 1000).toLocaleString());
                console.log("   Status:", pool[7] === 0 ? "Active" : pool[7] === 1 ? "Executed" : "Expired");
                console.log("   Name:", pool[8]);
                
                // Test the API endpoint format
                console.log("\n🔗 API Test Data:");
                console.log("   Pool for API:", JSON.stringify({
                    info: {
                        id: Number(pool[0]),
                        opinionId: Number(pool[1]),
                        creator: pool[2],
                        proposedAnswer: pool[3],
                        totalAmount: pool[4].toString(),
                        deadline: Number(pool[6]),
                        status: Number(pool[7]),
                        name: pool[8],
                    },
                    currentPrice: pool[4].toString(),
                    remainingAmount: (pool[4] - pool[5]).toString(),
                    contributorCount: 1
                }, null, 2));
                
            } catch (error) {
                console.log("❌ Error reading pool details:", error.message);
            }
        }
        
        console.log("\n🎯 POOL CREATION COMPLETE!");
        console.log("===========================");
        console.log("✅ Pool created successfully");
        console.log("✅ Ready for frontend testing");
        console.log("🔗 View on BaseScan: https://sepolia.basescan.org/tx/" + receipt.hash);
        console.log("\n📱 Next: Check frontend at http://localhost:3000/pools");
        
    } catch (error) {
        console.error("❌ Pool creation failed:", error.message);
        if (error.data) {
            console.error("   Error data:", error.data);
        }
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });