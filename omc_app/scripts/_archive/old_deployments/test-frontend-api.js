const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 TESTING FRONTEND API DATA FLOW");
    console.log("=================================");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        
        // Get pool count first
        const poolCount = await poolManager.poolCount();
        console.log("📊 Pool Count:", poolCount.toString());
        
        if (poolCount > 0) {
            console.log("\n🔍 Testing Pool Data Structure:");
            
            for (let i = 0; i < poolCount; i++) {
                console.log(`\n--- Pool #${i} Raw Data ---`);
                
                try {
                    const poolData = await poolManager.pools(i);
                    console.log("Raw pool data:", poolData);
                    
                    // Test each field according to the expected struct:
                    // struct Pool {
                    //     uint256 id;           // [0]
                    //     uint256 opinionId;    // [1]
                    //     address creator;      // [2]
                    //     string proposedAnswer; // [3]
                    //     uint96 targetAmount;  // [4]
                    //     uint96 totalContributed; // [5]
                    //     uint32 deadline;      // [6]
                    //     PoolStatus status;    // [7]
                    //     string name;          // [8]
                    //     string ipfsHash;      // [9]
                    // }
                    
                    console.log("Mapped structure:");
                    console.log("  [0] id:", poolData[0].toString());
                    console.log("  [1] opinionId:", poolData[1].toString());
                    console.log("  [2] creator:", poolData[2]);
                    console.log("  [3] proposedAnswer:", poolData[3]);
                    console.log("  [4] targetAmount:", ethers.formatUnits(poolData[4], 6), "USDC");
                    console.log("  [5] totalContributed:", ethers.formatUnits(poolData[5], 6), "USDC");
                    console.log("  [6] deadline:", new Date(Number(poolData[6]) * 1000).toLocaleString());
                    console.log("  [7] status:", poolData[7].toString());
                    console.log("  [8] name:", poolData[8]);
                    console.log("  [9] ipfsHash:", poolData[9] || "empty");
                    
                } catch (poolError) {
                    console.log("  ❌ Error reading pool", i, ":", poolError.message);
                }
                
                // Test contributors
                try {
                    const contributors = await poolManager.getPoolContributors(i);
                    console.log("  Contributors:", contributors.length, contributors);
                } catch (contribError) {
                    console.log("  ❌ Contributors error:", contribError.message);
                }
            }
        }
        
        console.log("\n🧪 SIMULATING FRONTEND API CALLS:");
        console.log("==================================");
        
        // Simulate what the frontend API would do
        for (let i = 0; i < poolCount; i++) {
            console.log(`\nSimulating API call for pool ${i}:`);
            
            try {
                const poolData = await poolManager.pools(i);
                const contributors = await poolManager.getPoolContributors(i);
                
                const transformedPool = {
                    info: {
                        id: poolData[0],
                        opinionId: poolData[1], 
                        creator: poolData[2],
                        proposedAnswer: poolData[3],
                        totalAmount: poolData[4].toString(),
                        deadline: Number(poolData[6]),
                        status: Number(poolData[7]),
                        name: poolData[8] || `Pool #${i}`,
                    },
                    currentPrice: poolData[4].toString(), 
                    remainingAmount: (poolData[4] - poolData[5]).toString(),
                    contributorCount: contributors.length,
                };
                
                console.log("Transformed pool data:", JSON.stringify(transformedPool, null, 2));
                
                // Test the frontend parsing
                console.log("\nFrontend would see:");
                console.log("  Pool ID:", Number(transformedPool.info.id));
                console.log("  Opinion ID:", Number(transformedPool.info.opinionId));
                console.log("  Creator:", transformedPool.info.creator);
                console.log("  Proposed Answer:", transformedPool.info.proposedAnswer);
                console.log("  Total Amount:", Number(transformedPool.info.totalAmount) / 1000000, "USDC");
                console.log("  Contributors:", transformedPool.contributorCount);
                
            } catch (apiError) {
                console.log("API simulation failed:", apiError.message);
            }
        }
        
    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });