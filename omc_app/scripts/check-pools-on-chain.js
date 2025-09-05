const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 CHECKING POOLS ON BLOCKCHAIN");
    console.log("==============================");
    
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
    const MOCK_POOL_MANAGER = "0x3E41d4F16Ccee680DBD4eAC54dE7Cc2E3D0cA1E3";
    
    // Connect to OpinionCore contract
    const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
    
    console.log("📋 Contract Addresses:");
    console.log("   OpinionCore:", OPINION_CORE_ADDRESS);
    console.log("   MockPoolManager:", MOCK_POOL_MANAGER);
    
    try {
        // Get next pool ID to see how many pools exist
        const nextPoolId = await opinionCore.nextPoolId();
        console.log("\n📊 Pool Statistics:");
        console.log("   Next Pool ID:", nextPoolId.toString());
        console.log("   Total Pools Created:", (Number(nextPoolId) - 1).toString());
        
        // Check each pool that exists
        if (Number(nextPoolId) > 1) {
            console.log("\n🏊 POOL DETAILS:");
            console.log("================");
            
            for (let i = 1; i < Number(nextPoolId); i++) {
                try {
                    const pool = await opinionCore.pools(i);
                    console.log(`\n📋 Pool #${i}:`);
                    console.log("   Creator:", pool.creator);
                    console.log("   Opinion ID:", pool.opinionId.toString());
                    console.log("   New Answer:", pool.newAnswer);
                    console.log("   Target Amount:", ethers.formatUnits(pool.targetAmount, 6), "USDC");
                    console.log("   Total Contributed:", ethers.formatUnits(pool.totalContributed, 6), "USDC");
                    console.log("   Deadline:", new Date(Number(pool.deadline) * 1000).toLocaleString());
                    console.log("   Executed:", pool.executed);
                    console.log("   Status:", pool.status); // 0=Active, 1=Executed, 2=Expired, 3=Extended
                    
                    // Get contributors count
                    const contributorsCount = await opinionCore.getPoolContributorsCount(i);
                    console.log("   Contributors:", contributorsCount.toString());
                    
                    // List contributors if any
                    if (Number(contributorsCount) > 0) {
                        console.log("   Contributor List:");
                        for (let j = 0; j < Number(contributorsCount); j++) {
                            const contributor = await opinionCore.getPoolContributor(i, j);
                            const contribution = await opinionCore.getUserContribution(i, contributor);
                            console.log(`     - ${contributor}: ${ethers.formatUnits(contribution, 6)} USDC`);
                        }
                    }
                    
                } catch (error) {
                    console.log(`❌ Error reading Pool #${i}:`, error.message);
                }
            }
        } else {
            console.log("\n❌ NO POOLS FOUND ON BLOCKCHAIN");
            console.log("   This means no pools have been successfully created yet.");
        }
        
        // Check if pools have been created recently by looking at events
        console.log("\n🔍 CHECKING RECENT POOL CREATION EVENTS:");
        console.log("========================================");
        
        try {
            // Get recent blocks to check for events
            const currentBlock = await ethers.provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 10000); // Check last 10000 blocks
            
            const poolCreatedFilter = opinionCore.filters.PoolCreated();
            const poolEvents = await opinionCore.queryFilter(poolCreatedFilter, fromBlock, currentBlock);
            
            if (poolEvents.length > 0) {
                console.log(`✅ Found ${poolEvents.length} PoolCreated events in recent blocks:`);
                poolEvents.forEach((event, index) => {
                    console.log(`   Event #${index + 1}:`);
                    console.log("     Pool ID:", event.args.poolId.toString());
                    console.log("     Creator:", event.args.creator);
                    console.log("     Opinion ID:", event.args.opinionId.toString());
                    console.log("     Block:", event.blockNumber);
                    console.log("     Tx Hash:", event.transactionHash);
                });
            } else {
                console.log("❌ No PoolCreated events found in recent blocks");
                console.log("   This confirms no pools have been created recently");
            }
            
        } catch (eventError) {
            console.log("❌ Error checking events:", eventError.message);
        }
        
        console.log("\n🎯 ANALYSIS COMPLETE");
        console.log("====================");
        
        if (Number(nextPoolId) === 1) {
            console.log("❌ FINDING: No pools exist on the blockchain");
            console.log("   - Pool creation may have failed silently in frontend");
            console.log("   - Check frontend pool creation implementation");
            console.log("   - Verify transaction receipts and error handling");
        } else {
            console.log("✅ FINDING: Pools exist on blockchain but may not appear in frontend");
            console.log("   - Check frontend pool fetching logic");
            console.log("   - Verify contract address in frontend configuration");
        }
        
    } catch (error) {
        console.error("❌ Error checking pools:", error.message);
        console.log("\n🔧 Possible Issues:");
        console.log("   - Contract address mismatch");
        console.log("   - Network connection problems"); 
        console.log("   - ABI compatibility issues");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });