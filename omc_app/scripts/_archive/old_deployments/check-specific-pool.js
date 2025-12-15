const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 CHECKING POOL FOR OPINION #3");
    console.log("================================");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
    
    try {
        // Connect to contracts
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
        
        console.log("📋 Contract Addresses:");
        console.log("   PoolManager:", POOL_MANAGER_ADDRESS);
        console.log("   OpinionCore:", OPINION_CORE_ADDRESS);
        
        // 1. Check total pool count
        console.log("\n📊 POOL STATISTICS:");
        const poolCount = await poolManager.poolCount();
        console.log("   Total pools created:", poolCount.toString());
        
        if (poolCount === BigInt(0)) {
            console.log("❌ NO POOLS FOUND - Pool creation may have failed");
            return;
        }
        
        // 2. Check all pools
        console.log("\n🏊 ALL POOLS:");
        console.log("=============");
        
        for (let i = 0; i < Number(poolCount); i++) {
            try {
                console.log(`\n📋 Pool #${i}:`);
                const pool = await poolManager.pools(i);
                
                console.log("   Opinion ID:", pool[1].toString());
                console.log("   Creator:", pool[2]);
                console.log("   Proposed Answer:", pool[3]);
                console.log("   Target Amount:", ethers.formatUnits(pool[4], 6), "USDC");
                console.log("   Total Contributed:", ethers.formatUnits(pool[5], 6), "USDC");
                console.log("   Deadline:", new Date(Number(pool[6]) * 1000).toLocaleString());
                console.log("   Status:", pool[7] === 0 ? "Active" : pool[7] === 1 ? "Executed" : "Expired");
                console.log("   Name:", pool[8] || `Pool #${i}`);
                console.log("   IPFS Hash:", pool[9] || "(none)");
                
                // Check contributors
                const contributors = await poolManager.poolContributors(i);
                console.log("   Contributors:", contributors.length);
                if (contributors.length > 0) {
                    console.log("   Contributor addresses:", contributors);
                }
                
                // If this is for Opinion #3, mark it
                if (Number(pool[1]) === 3) {
                    console.log("   🎯 THIS IS THE POOL FOR OPINION #3!");
                }
                
            } catch (error) {
                console.log(`❌ Error reading Pool #${i}:`, error.message);
            }
        }
        
        // 3. Specifically check Opinion #3
        console.log("\n🎯 OPINION #3 ANALYSIS:");
        console.log("=======================");
        
        try {
            const opinion3 = await opinionCore.getOpinionDetails(3);
            console.log("   Question:", opinion3.question);
            console.log("   Current Answer:", opinion3.currentAnswer);
            console.log("   Current Price:", ethers.formatUnits(opinion3.nextPrice, 6), "USDC");
            console.log("   Current Owner:", opinion3.currentAnswerOwner);
            console.log("   Creator:", opinion3.creator);
            
        } catch (error) {
            console.log("❌ Opinion #3 not found:", error.message);
        }
        
        // 4. Check pools by opinion ID (if function exists)
        console.log("\n🔍 POOLS BY OPINION:");
        try {
            const poolsForOpinion3 = await poolManager.opinionPools(3);
            console.log("   Pools for Opinion #3:", poolsForOpinion3.map(id => Number(id)));
        } catch (error) {
            console.log("   opinionPools function not available or no pools found");
        }
        
        // 5. Test API endpoint data format
        if (poolCount > 0) {
            console.log("\n🔗 API ENDPOINT TEST DATA:");
            console.log("===========================");
            
            const firstPool = await poolManager.pools(0);
            const contributors = await poolManager.poolContributors(0);
            
            const apiFormat = {
                info: {
                    id: Number(firstPool[0]),
                    opinionId: Number(firstPool[1]),
                    creator: firstPool[2],
                    proposedAnswer: firstPool[3],
                    totalAmount: firstPool[4].toString(),
                    deadline: Number(firstPool[6]),
                    status: Number(firstPool[7]),
                    name: firstPool[8] || `Pool #0`,
                },
                currentPrice: firstPool[4].toString(),
                remainingAmount: (firstPool[4] - firstPool[5]).toString(),
                contributorCount: contributors.length
            };
            
            console.log("   Sample API Response:");
            console.log(JSON.stringify({ success: true, pool: apiFormat }, null, 2));
        }
        
        // 6. Recent events check
        console.log("\n📡 RECENT EVENTS:");
        console.log("=================");
        
        try {
            const currentBlock = await ethers.provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 5000);
            
            // Check for pool creation events
            const poolCreatedFilter = poolManager.filters.PoolCreated();
            const poolEvents = await poolManager.queryFilter(poolCreatedFilter, fromBlock, currentBlock);
            
            if (poolEvents.length > 0) {
                console.log(`✅ Found ${poolEvents.length} PoolCreated events:`);
                poolEvents.forEach((event, index) => {
                    console.log(`   Event #${index + 1}:`);
                    console.log("     Pool ID:", event.args.poolId?.toString() || "unknown");
                    console.log("     Creator:", event.args.creator || "unknown");
                    console.log("     Opinion ID:", event.args.opinionId?.toString() || "unknown");
                    console.log("     Block:", event.blockNumber);
                    console.log("     Tx Hash:", event.transactionHash);
                });
            } else {
                console.log("❌ No PoolCreated events found in recent blocks");
            }
            
        } catch (eventError) {
            console.log("❌ Error checking events:", eventError.message);
        }
        
        // 7. Summary and next steps
        console.log("\n🎯 SUMMARY:");
        console.log("===========");
        
        if (poolCount > 0) {
            console.log("✅ Pools exist on blockchain");
            console.log("✅ PoolManager contract working");
            console.log("✅ Data structure correct for API");
            console.log("\n🔧 If pools don't appear in frontend:");
            console.log("   1. Check browser network requests to /api/pools/details");
            console.log("   2. Verify frontend is calling correct contract address");
            console.log("   3. Check for JavaScript errors in browser console");
            console.log("   4. Verify API route is working with test request");
        } else {
            console.log("❌ No pools found - creation failed");
            console.log("   Check transaction success and gas fees");
        }
        
        console.log("\n📱 Test API manually:");
        console.log(`   curl -X POST http://localhost:3000/api/pools/details -H "Content-Type: application/json" -d '{"poolId":0}'`);
        
    } catch (error) {
        console.error("❌ Script failed:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });