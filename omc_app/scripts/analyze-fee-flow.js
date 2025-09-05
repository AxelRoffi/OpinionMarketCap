const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 ANALYZING POOL FEE FLOW");
    console.log("==========================");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        
        console.log("📋 Current Fee Structure:");
        const creationFee = await poolManager.poolCreationFee();
        const contributionFee = await poolManager.poolContributionFee();
        
        console.log("   Pool Creation Fee:", ethers.formatUnits(creationFee, 6), "USDC");
        console.log("   Pool Contribution Fee:", ethers.formatUnits(contributionFee, 6), "USDC");
        
        console.log("\n🎯 DESIRED FEE BREAKDOWN:");
        console.log("   1. Pool Creation Fee: 5 USDC → Treasury");
        console.log("   2. Initial Contribution: X USDC → Pool");
        console.log("   3. Total Cost: 5 + X USDC");
        
        console.log("\n❓ CURRENT ISSUE:");
        console.log("   Frontend shows 'Initial Contribution: 1 USDC'");
        console.log("   But user expects this to mean:");
        console.log("   • 1 USDC goes to pool");
        console.log("   • 5 USDC creation fee separate");
        console.log("   • Total: 6 USDC");
        
        console.log("\n🔍 CHECKING CONTRACT IMPLEMENTATION:");
        
        // Let's examine what happens in createPool
        console.log("   Looking at PoolManager.createPool function...");
        console.log("   - poolCreationFee:", ethers.formatUnits(creationFee, 6), "USDC (should go to Treasury)");
        console.log("   - poolContributionFee:", ethers.formatUnits(contributionFee, 6), "USDC (unclear where this goes)");
        console.log("   - initialContribution: User input (should go to Pool)");
        
        console.log("\n📋 WHAT SHOULD HAPPEN:");
        console.log("   When user enters '2 USDC initial contribution':");
        console.log("   1. Charge 5 USDC creation fee → Treasury");
        console.log("   2. Take 2 USDC initial contribution → Pool");
        console.log("   3. Total charged: 7 USDC");
        console.log("   4. Pool gets 2 USDC toward target");
        
        console.log("\n🔧 FRONTEND FIX NEEDED:");
        console.log("   Current: 'Initial Contribution: 1 USDC' (confusing)");
        console.log("   Should be:");
        console.log("   - 'Pool Contribution: X USDC' (goes to pool)");
        console.log("   - 'Creation Fee: 5 USDC' (goes to treasury)");
        console.log("   - 'Total Cost: 5 + X USDC'");
        
        // Check treasury address
        const treasury = await poolManager.treasury();
        console.log("\n💰 Treasury Address:", treasury);
        
        console.log("\n❗ ACTION ITEMS:");
        console.log("1. Verify poolCreationFee goes to Treasury");
        console.log("2. Verify initialContribution goes to Pool");
        console.log("3. Clarify what poolContributionFee is for");
        console.log("4. Update frontend to show clear breakdown");
        console.log("5. Remove confusion about 'initial contribution'");
        
    } catch (error) {
        console.error("❌ Fee analysis failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });