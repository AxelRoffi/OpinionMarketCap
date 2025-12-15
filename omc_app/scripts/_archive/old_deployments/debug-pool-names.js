const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Debugging Pool Names in Smart Contract...");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    
    // Connect to PoolManager contract  
    const poolManagerABI = [
        "function poolCount() view returns (uint256)",
        "function getPoolDetails(uint256) view returns (tuple(uint256 id, uint256 opinionId, string proposedAnswer, uint96 totalAmount, uint32 deadline, address creator, uint8 status, string name, string ipfsHash, uint96 targetPrice), uint256, uint256, uint256)",
        "function pools(uint256) view returns (tuple(uint256 id, uint256 opinionId, string proposedAnswer, uint96 totalAmount, uint32 deadline, address creator, uint8 status, string name, string ipfsHash, uint96 targetPrice))"
    ];
    
    const [deployer] = await ethers.getSigners();
    const poolManager = new ethers.Contract(POOL_MANAGER_ADDRESS, poolManagerABI, deployer);
    
    try {
        // Get total number of pools
        const poolCount = await poolManager.poolCount();
        console.log(`\\n📊 Total pools: ${poolCount}`);
        
        // Check specific pools mentioned in screenshot (Pool IDs that exist)
        const maxPools = Math.min(Number(poolCount), 10);
        for (let poolId = 0; poolId < maxPools; poolId++) {
            try {
                console.log(`\\n🔍 Pool #${poolId}:`);
                
                // Get pool details using getPoolDetails (what the API uses)
                const poolDetails = await poolManager.getPoolDetails(poolId);
                const [info, currentPrice, remainingAmount, timeRemaining] = poolDetails;
                
                console.log(`  Name: "${info.name}"`);
                console.log(`  Proposed Answer: "${info.proposedAnswer}"`);
                console.log(`  Creator: ${info.creator}`);
                console.log(`  Status: ${info.status} (0=Active, 1=Executed, 2=Expired)`);
                console.log(`  Total Amount: ${ethers.formatUnits(info.totalAmount, 6)} USDC`);
                console.log(`  Target Price: ${ethers.formatUnits(info.targetPrice, 6)} USDC`);
                console.log(`  Opinion ID: ${info.opinionId}`);
                
                // Also check using direct pools mapping
                const directPoolData = await poolManager.pools(poolId);
                console.log(`  Direct mapping name: "${directPoolData.name}"`);
                
                // Calculate completion percentage
                const completion = info.targetPrice > 0 ? 
                    (Number(info.totalAmount) * 100) / Number(info.targetPrice) : 0;
                console.log(`  Completion: ${completion.toFixed(1)}%`);
                
            } catch (poolError) {
                console.log(`  ❌ Error fetching pool #${poolId}: ${poolError.message}`);
            }
        }
        
        // Look for specific pools that might match the screenshot
        console.log(`\\n🎯 Looking for pools with 'Hunter Biden' or 'AOC' answers:`);
        
        for (let poolId = 0; poolId < Number(poolCount); poolId++) {
            try {
                const poolDetails = await poolManager.getPoolDetails(poolId);
                const [info] = poolDetails;
                
                const answerLower = info.proposedAnswer.toLowerCase();
                if (answerLower.includes('hunter') || answerLower.includes('biden') || 
                    answerLower.includes('aoc') || answerLower.includes('ocasio')) {
                    
                    console.log(`\\n🎯 Found matching pool #${poolId}:`);
                    console.log(`  Name: "${info.name}"`);
                    console.log(`  Proposed Answer: "${info.proposedAnswer}"`);
                    console.log(`  Status: ${info.status}`);
                    
                    const completion = info.targetPrice > 0 ? 
                        (Number(info.totalAmount) * 100) / Number(info.targetPrice) : 0;
                    console.log(`  Completion: ${completion.toFixed(1)}%`);
                }
            } catch (e) {
                // Skip errors for non-existent pools
            }
        }
        
    } catch (error) {
        console.error("❌ Error debugging pool names:", error.message);
        throw error;
    }
}

main()
    .then(() => {
        console.log("\\n✅ Pool name debugging completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Debug failed:", error);
        process.exit(1);
    });