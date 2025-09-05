const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 DEBUGGING FRONTEND POOLS ISSUE");
    console.log("==================================");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    
    try {
        console.log("1. Testing contract connection...");
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        
        console.log("2. Getting pool count...");
        const poolCount = await poolManager.poolCount();
        console.log("   Pool Count:", poolCount.toString());
        
        if (poolCount > 0) {
            console.log("3. Testing individual pool reads...");
            
            for (let i = 0; i < poolCount; i++) {
                console.log(`\n--- Testing Pool #${i} ---`);
                
                try {
                    const poolData = await poolManager.pools(i);
                    console.log("✅ Raw pool data:", {
                        id: poolData[0].toString(),
                        opinionId: poolData[1].toString(), 
                        proposedAnswer: poolData[2],
                        totalAmount: ethers.formatUnits(poolData[3], 6),
                        deadline: poolData[4].toString(),
                        creator: poolData[5],
                        status: poolData[6].toString(),
                        name: poolData[7],
                        ipfsHash: poolData[8]
                    });
                    
                } catch (poolError) {
                    console.log("❌ Pool read error:", poolError.message);
                }
                
                try {
                    const contributors = await poolManager.getPoolContributors(i);
                    console.log("✅ Contributors:", contributors.length, contributors);
                } catch (contribError) {
                    console.log("❌ Contributors error:", contribError.message);
                }
            }
        }
        
        console.log("\n4. Testing the exact API endpoint call...");
        
        // Test what the frontend API would do
        for (let i = 0; i < poolCount; i++) {
            try {
                console.log(`\n--- API Test Pool #${i} ---`);
                const poolData = await poolManager.pools(i);
                const contributors = await poolManager.getPoolContributors(i);
                
                const transformedPool = {
                    info: {
                        id: poolData[0],
                        opinionId: poolData[1], 
                        creator: poolData[5],
                        proposedAnswer: poolData[2],
                        totalAmount: poolData[3].toString(),
                        deadline: Number(poolData[4]),
                        status: Number(poolData[6]),
                        name: poolData[7] || `Pool #${i}`,
                    },
                    currentPrice: poolData[3].toString(),
                    remainingAmount: "0",
                    contributorCount: contributors.length,
                };
                
                console.log("✅ API Response would be:", {
                    success: true,
                    pool: transformedPool
                });
                
            } catch (apiError) {
                console.log("❌ API simulation failed:", apiError.message);
            }
        }
        
        console.log("\n5. DEBUGGING FRONTEND LOGIC:");
        console.log("============================");
        console.log("The frontend should:");
        console.log("1. Call useReadContract with poolCount function");
        console.log("2. Get poolCount =", poolCount.toString());
        console.log("3. Make", poolCount.toString(), "API calls to /api/pools/details");
        console.log("4. Transform the data and display pool cards");
        console.log("");
        console.log("If showing empty state, check:");
        console.log("- Is poolCount being read correctly?");
        console.log("- Are API calls being made?");
        console.log("- Are API calls succeeding?");
        console.log("- Is pools array being populated?");
        
    } catch (error) {
        console.error("❌ Debug failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });