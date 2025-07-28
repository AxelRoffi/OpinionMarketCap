const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 CHECKING POOL EXISTENCE ON BLOCKCHAIN");
    console.log("========================================");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        
        // Check pool count
        const poolCount = await poolManager.poolCount();
        console.log("📊 Pool Count:", poolCount.toString());
        
        if (poolCount > 0) {
            console.log("\n📋 Pool Details:");
            
            for (let i = 0; i < poolCount; i++) {
                console.log(`\n--- Pool #${i} ---`);
                
                try {
                    const pool = await poolManager.pools(i);
                    
                    console.log("  Pool ID:", pool[0].toString());
                    console.log("  Opinion ID:", pool[1].toString());
                    console.log("  Creator:", pool[2]);
                    console.log("  Proposed Answer:", pool[3]);
                    console.log("  Target Amount:", ethers.formatUnits(pool[4], 6), "USDC");
                    console.log("  Current Amount:", ethers.formatUnits(pool[5], 6), "USDC");
                    console.log("  Deadline:", new Date(Number(pool[6]) * 1000).toLocaleString());
                    console.log("  Status:", pool[7].toString());
                    console.log("  Name:", pool[8] || "No name");
                    console.log("  IPFS Hash:", pool[9] || "No IPFS");
                    
                    // Check contributors
                    try {
                        const contributors = await poolManager.getPoolContributors(i);
                        console.log("  Contributors:", contributors.length);
                        if (contributors.length > 0) {
                            console.log("  Contributor addresses:", contributors);
                        }
                    } catch (contribError) {
                        console.log("  Contributors: Could not fetch -", contribError.message);
                    }
                    
                } catch (poolError) {
                    console.log("  ❌ Error reading pool", i, ":", poolError.message);
                }
            }
        } else {
            console.log("❌ No pools found on blockchain");
        }
        
        // Check what transaction created the pool
        console.log("\n🔍 Recent Pool Creation Events:");
        try {
            // Get PoolCreated events
            const filter = poolManager.filters.PoolCreated();
            const events = await poolManager.queryFilter(filter, -1000); // Last 1000 blocks
            
            console.log("Found", events.length, "PoolCreated events");
            events.forEach((event, index) => {
                console.log(`Event ${index + 1}:`);
                console.log("  Block:", event.blockNumber);
                console.log("  Transaction:", event.transactionHash);
                console.log("  Args:", event.args);
            });
            
        } catch (eventError) {
            console.log("Could not fetch events:", eventError.message);
        }
        
    } catch (error) {
        console.error("❌ Error checking pools:", error.message);
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