const { ethers } = require("hardhat");

async function main() {
    console.log("📋 EXACT POOL CREATION REQUIREMENTS FROM SMART CONTRACT");
    console.log("========================================================");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
        
        console.log("🔍 1. FINANCIAL REQUIREMENTS:");
        console.log("==============================");
        
        // Get current fees
        const poolCreationFee = await poolManager.poolCreationFee();
        const poolContributionFee = await poolManager.poolContributionFee();
        
        console.log("   Pool Creation Fee:", ethers.formatUnits(poolCreationFee, 6), "USDC");
        console.log("   Pool Contribution Fee:", ethers.formatUnits(poolContributionFee, 6), "USDC");
        console.log("   Minimum Contribution: 1.0 USDC (hardcoded in contract)");
        
        const minTotal = Number(ethers.formatUnits(poolCreationFee, 6)) + 
                        Number(ethers.formatUnits(poolContributionFee, 6)) + 1.0;
        console.log("   TOTAL MINIMUM NEEDED:", minTotal, "USDC");
        console.log("   (Creation fee + Contribution fee + Minimum contribution)");
        
        console.log("\n🔍 2. TIME REQUIREMENTS:");
        console.log("========================");
        
        const minPoolDuration = await poolManager.minPoolDuration();
        const maxPoolDuration = await poolManager.maxPoolDuration();
        
        console.log("   Minimum Duration:", minPoolDuration.toString(), "seconds");
        console.log("   Minimum Duration:", Math.floor(Number(minPoolDuration) / (24 * 60 * 60)), "days");
        console.log("   Maximum Duration:", maxPoolDuration.toString(), "seconds");
        console.log("   Maximum Duration:", Math.floor(Number(maxPoolDuration) / (24 * 60 * 60)), "days");
        
        console.log("\n🔍 3. TEXT REQUIREMENTS:");
        console.log("========================");
        
        console.log("   Max Pool Name Length: 30 characters");
        console.log("   Max Answer Length: 50 characters");
        console.log("   Max IPFS Hash Length: 64 characters");
        console.log("   Proposed Answer: Must be different from current answer");
        
        console.log("\n🔍 4. PERMISSION REQUIREMENTS:");
        console.log("==============================");
        
        const [deployer] = await ethers.getSigners();
        const ADMIN_ROLE = await poolManager.ADMIN_ROLE();
        const hasAdminRole = await poolManager.hasRole(ADMIN_ROLE, deployer.address);
        
        console.log("   Anyone can create pools: ✅ (no special permissions needed)");
        console.log("   Current user has ADMIN role:", hasAdminRole);
        
        console.log("\n🔍 5. CURRENT CONTRACT STATE:");
        console.log("=============================");
        
        const poolCount = await poolManager.poolCount();
        const nextOpinionId = await opinionCore.nextOpinionId();
        
        console.log("   Current pool count:", poolCount.toString());
        console.log("   Available opinions: 1 to", (Number(nextOpinionId) - 1).toString());
        
        // Test Opinion #3 specifically
        console.log("\n🔍 6. OPINION #3 SPECIFIC REQUIREMENTS:");
        console.log("=======================================");
        
        try {
            const opinion3 = await opinionCore.getOpinionDetails(3);
            console.log("   ✅ Opinion #3 exists");
            console.log("   Question:", opinion3.question);
            console.log("   Current Answer:", opinion3.currentAnswer);
            console.log("   Next Price:", ethers.formatUnits(opinion3.nextPrice, 6), "USDC");
            console.log("   Owner:", opinion3.currentAnswerOwner);
            console.log("   Is Active:", !opinion3.isOwnershipTransferred);
            
            console.log("\n   Requirements for Opinion #3 pool:");
            console.log("   • Proposed answer ≠ '" + opinion3.currentAnswer + "'");
            console.log("   • Deadline ≥ 1 day from now");  
            console.log("   • Contribution ≥ 1.0 USDC");
            console.log("   • Total cost ≥", minTotal, "USDC");
            
        } catch (error) {
            console.log("   ❌ Opinion #3 not found");
        }
        
        console.log("\n🔍 7. VALIDATION SUMMARY:");
        console.log("=========================");
        
        console.log("   Required for pool creation:");
        console.log("   1. ✅ Valid opinion ID (1, 2, or 3)");
        console.log("   2. ✅ Proposed answer ≠ current answer");  
        console.log("   3. ✅ Proposed answer length ≤ 50 chars");
        console.log("   4. ✅ Pool name length ≤ 30 chars");
        console.log("   5. ✅ Deadline ≥ 1 day, ≤ 30 days");
        console.log("   6. ✅ Initial contribution ≥ 1.0 USDC");
        console.log("   7. ✅ Total USDC balance ≥", minTotal, "USDC");
        console.log("   8. ✅ USDC allowance ≥", minTotal, "USDC");
        console.log("   9. ❓ No internal contract conflicts");
        
        console.log("\n📝 FOR FRONTEND VALIDATION:");
        console.log("============================");
        console.log("   Minimum contribution: 1.0 USDC");
        console.log("   Creation fee:", ethers.formatUnits(poolCreationFee, 6), "USDC");
        console.log("   Contribution fee:", ethers.formatUnits(poolContributionFee, 6), "USDC");
        console.log("   Total user needs:", minTotal, "USDC");
        console.log("   Minimum deadline: 2 days from now (safe buffer)");
        console.log("   Maximum answer length: 50 characters");
        console.log("   Maximum pool name length: 30 characters");
        
    } catch (error) {
        console.error("❌ Requirements check failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });