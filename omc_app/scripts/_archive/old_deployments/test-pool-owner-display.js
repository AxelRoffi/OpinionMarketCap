const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Pool Owner Display Logic...");
    
    // Test the specific case mentioned by user
    const testCases = [
        {
            opinionId: 3,
            currentAnswer: "Hunter Biden",
            expectedPoolName: "Biden Family Power",
            currentAnswerOwner: "0x3B4584e690109484059D95d7904dD9fEbA246612" // PoolManager address
        }
    ];
    
    console.log("\\n📋 Expected Results:");
    testCases.forEach((testCase, index) => {
        console.log(`Test ${index + 1}:`);
        console.log(`  Opinion ID: ${testCase.opinionId}`);
        console.log(`  Current Answer: "${testCase.currentAnswer}"`);
        console.log(`  Answer Owner: ${testCase.currentAnswerOwner}`);
        console.log(`  Expected Display: "by ${testCase.expectedPoolName}"`);
        console.log(`  Current Display: "by Pool Manager" ❌`);
    });
    
    console.log("\\n🔍 API Data Structure Test:");
    
    // Test what the API returns
    try {
        const apiUrl = 'http://localhost:3001/api/pools-working';
        console.log(`Attempting to call: ${apiUrl}`);
        console.log("(Note: This would work if frontend is running)");
        
        // Simulate the expected API response structure
        const mockApiResponse = {
            pools: [
                {
                    info: {
                        id: "7",
                        opinionId: "3", 
                        name: "Biden Family Power",
                        status: 1, // executed
                        proposedAnswer: "Hunter Biden",
                        creator: "0x4Ab835D7db86Eb777AdBC4d182Bd2953C8E13D87"
                    }
                }
            ]
        };
        
        console.log("\\n📊 Mock API Response Structure:");
        console.log(JSON.stringify(mockApiResponse, null, 2));
        
        // Test the parsing logic
        const pools = mockApiResponse.pools;
        const poolInfos = pools.map((pool) => ({
            id: parseInt(pool.info?.id || pool.id),
            name: pool.info?.name || pool.name,
            status: parseInt(pool.info?.status || pool.status),
            opinionId: parseInt(pool.info?.opinionId || pool.opinionId),
            proposedAnswer: pool.info?.proposedAnswer || pool.proposedAnswer
        }));
        
        console.log("\\n🔍 Parsed Pool Data:");
        console.log(poolInfos);
        
        // Test the matching logic
        const opinionId = 3;
        const currentAnswer = "Hunter Biden";
        const POOL_MANAGER_ADDRESS = "0x3b4584e690109484059d95d7904dd9feba246612";
        
        console.log("\\n🎯 Matching Logic Test:");
        
        // Find executed pool that owns this answer
        const owningPool = poolInfos.find(pool => 
            pool.opinionId === opinionId && 
            pool.status === 1 && // 1 = executed
            pool.proposedAnswer.trim().toLowerCase() === currentAnswer.trim().toLowerCase()
        );
        
        console.log("Primary match result:", owningPool);
        
        if (owningPool) {
            console.log(`✅ Found matching pool: "${owningPool.name}"`);
            console.log(`   Should display: "by ${owningPool.name}"`);
        } else {
            console.log("❌ No exact match found");
            
            // Try fallback logic
            const fallbackPool = poolInfos.find(pool => 
                pool.opinionId === opinionId && 
                pool.status === 1 // 1 = executed
            );
            
            console.log("Fallback match result:", fallbackPool);
            
            if (fallbackPool) {
                console.log(`✅ Found fallback pool: "${fallbackPool.name}"`);
                console.log(`   Should display: "by ${fallbackPool.name}"`);
            } else {
                console.log("❌ No fallback pool found either");
            }
        }
        
    } catch (error) {
        console.error("Error testing API structure:", error.message);
    }
}

main()
    .then(() => {
        console.log("\\n✅ Pool owner display testing completed!");
        console.log("\\n💡 Action Required:");
        console.log("   - Test the frontend with console open to see debug logs");
        console.log("   - Check if pool data is loading correctly");
        console.log("   - Verify the fallback logic is working");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Testing failed:", error);
        process.exit(1);
    });