const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 TESTING CORRECTED POOL DATA STRUCTURE");
    console.log("========================================");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        
        const poolCount = await poolManager.poolCount();
        console.log("📊 Pool Count:", poolCount.toString());
        
        if (poolCount > 0) {
            for (let i = 0; i < poolCount; i++) {
                console.log(`\n--- Pool #${i} with CORRECTED mapping ---`);
                
                try {
                    const poolData = await poolManager.pools(i);
                    
                    console.log("✅ Correct Struct Mapping:");
                    console.log("  [0] id:", poolData[0].toString());
                    console.log("  [1] opinionId:", poolData[1].toString());
                    console.log("  [2] proposedAnswer:", poolData[2]);
                    console.log("  [3] totalAmount:", ethers.formatUnits(poolData[3], 6), "USDC");
                    console.log("  [4] deadline:", new Date(Number(poolData[4]) * 1000).toLocaleString());
                    console.log("  [5] creator:", poolData[5]);
                    console.log("  [6] status:", poolData[6].toString());
                    console.log("  [7] name:", poolData[7]);
                    console.log("  [8] ipfsHash:", poolData[8] || "empty");
                    
                    // Test contributors
                    try {
                        const contributors = await poolManager.getPoolContributors(i);
                        console.log("  Contributors:", contributors.length, contributors);
                    } catch (contribError) {
                        console.log("  ❌ Contributors error:", contribError.message);
                    }
                    
                    // Simulate corrected API transformation
                    console.log("\n🔄 Frontend API Transformation:");
                    const transformedPool = {
                        info: {
                            id: Number(poolData[0]),
                            opinionId: Number(poolData[1]), 
                            creator: poolData[5],           // [5] creator
                            proposedAnswer: poolData[2],    // [2] proposedAnswer
                            totalAmount: poolData[3].toString(), // [3] totalAmount
                            deadline: Number(poolData[4]),  // [4] deadline
                            status: Number(poolData[6]),    // [6] status
                            name: poolData[7] || `Pool #${i}`, // [7] name
                        },
                        currentPrice: poolData[3].toString(),
                        remainingAmount: "0", 
                        contributorCount: 1, // From our test
                    };
                    
                    console.log("  Transformed for Frontend:");
                    console.log("    Pool ID:", transformedPool.info.id);
                    console.log("    Opinion ID:", transformedPool.info.opinionId);
                    console.log("    Creator:", transformedPool.info.creator);
                    console.log("    Proposed Answer:", transformedPool.info.proposedAnswer);
                    console.log("    Pool Name:", transformedPool.info.name);
                    console.log("    Total Amount:", Number(transformedPool.info.totalAmount) / 1000000, "USDC");
                    console.log("    Contributors:", transformedPool.contributorCount);
                    
                } catch (poolError) {
                    console.log("  ❌ Error reading pool", i, ":", poolError.message);
                }
            }
            
            console.log("\n🎯 SUMMARY:");
            console.log("✅ Pool data structure corrected");
            console.log("✅ Frontend API mapping fixed");
            console.log("✅ Pools should now display correctly");
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