const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 ANALYZING POOL CREATION FLOW");
    console.log("================================");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
        
        console.log("📋 Pool Creation Steps Analysis:");
        console.log("1. PoolManager.createPool() called");
        console.log("2. Validates parameters");
        console.log("3. Calls opinionCore.getOpinionDetails()");
        console.log("4. Creates pool record");
        console.log("5. Transfers USDC");
        console.log("6. Calls feeManager.handlePoolCreationFee()");
        
        // Check if the error is coming from OpinionCore
        console.log("\n🔍 Testing OpinionCore.getOpinionDetails(3):");
        try {
            const opinion3 = await opinionCore.getOpinionDetails(3);
            console.log("   ✅ OpinionCore.getOpinionDetails(3) works");
            console.log("   Question:", opinion3.question);
            console.log("   Current answer:", opinion3.currentAnswer);
        } catch (error) {
            console.log("   ❌ OpinionCore.getOpinionDetails(3) failed:", error.message);
            if (error.data === "0xe2517d3f0000000000000000000000003b4584e690109484059d95d7904dd9feba246612642c46ab335d3b181002a9ff7422458ab758616f830ebcce9faed69a65e8dbc1") {
                console.log("   🎯 FOUND IT! Error is coming from OpinionCore!");
            }
        }
        
        // Check FeeManager
        console.log("\n🔍 Testing FeeManager access:");
        try {
            const feeManagerAddr = await poolManager.feeManager();
            console.log("   FeeManager address:", feeManagerAddr);
            
            const feeManager = await ethers.getContractAt("FeeManager", feeManagerAddr);
            
            // Try to call a simple function
            const totalFees = await feeManager.getAccumulatedFees(ethers.ZeroAddress);
            console.log("   ✅ FeeManager accessible");
            
        } catch (feeError) {
            console.log("   ❌ FeeManager error:", feeError.message);
            if (feeError.data === "0xe2517d3f0000000000000000000000003b4584e690109484059d95d7904dd9feba246612642c46ab335d3b181002a9ff7422458ab758616f830ebcce9faed69a65e8dbc1") {
                console.log("   🎯 FOUND IT! Error is coming from FeeManager!");
            }
        }
        
        // Let's look at the specific line in PoolManager where it might be failing
        console.log("\n🔍 Checking specific failure points:");
        
        // Check if it's the getOpinionDetails call
        console.log("   Testing OpinionCore connection from PoolManager...");
        const opinionCoreFromPool = await poolManager.opinionCore();
        console.log("   OpinionCore from PoolManager:", opinionCoreFromPool);
        
        // Test if we can call through the PoolManager's reference
        try {
            const testContract = await ethers.getContractAt("OpinionCore", opinionCoreFromPool);
            const testOpinion = await testContract.getOpinionDetails(3);
            console.log("   ✅ Can access OpinionCore through PoolManager's reference");
        } catch (testError) {
            console.log("   ❌ Cannot access OpinionCore through PoolManager:", testError.message);
            if (testError.data && testError.data.includes("e2517d3f")) {
                console.log("   🎯 FOUND THE ISSUE! OpinionCore call failing!");
            }
        }
        
        // Check if it's a role/permission issue
        console.log("\n🔍 Checking roles and permissions:");
        const [deployer] = await ethers.getSigners();
        
        // Check if PoolManager has proper roles in OpinionCore
        try {
            // This might not exist, but let's try
            const hasRole = await opinionCore.hasRole ? await opinionCore.hasRole(ethers.ZeroHash, POOL_MANAGER_ADDRESS) : false;
            console.log("   PoolManager has role in OpinionCore:", hasRole);
        } catch (roleError) {
            console.log("   Role check not applicable");
        }
        
        console.log("\n💡 HYPOTHESIS:");
        console.log("   The error 0xe2517d3f contains the PoolManager address");
        console.log("   This suggests OpinionCore is rejecting calls FROM the PoolManager");
        console.log("   Possible causes:");
        console.log("   1. OpinionCore doesn't recognize PoolManager as authorized");
        console.log("   2. There's a mismatch in the contract integration");
        console.log("   3. OpinionCore has a restriction we're hitting");
        
        // Let's create a minimal reproduction
        console.log("\n🧪 MINIMAL REPRODUCTION TEST:");
        console.log("   Creating the exact same call that PoolManager makes...");
        
        const contribution = ethers.parseUnits("2", 6);
        const deadline = Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60);
        
        console.log("   Parameters:");
        console.log("   - Opinion ID: 3");
        console.log("   - Contribution:", ethers.formatUnits(contribution, 6), "USDC");
        console.log("   - Deadline:", new Date(deadline * 1000).toLocaleString());
        
        // The issue might be in the PoolManager createPool function itself
        // Let's check if there are any low-level calls or delegate calls
        
    } catch (error) {
        console.error("❌ Analysis failed:", error.message);
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