const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 STEP-BY-STEP POOL CREATION DEBUG");
    console.log("====================================");
    
    const [deployer] = await ethers.getSigners();
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    console.log("📋 STEP 1: Contract Status Check");
    console.log("=================================");
    
    try {
        // Connect to contracts
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
        const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        console.log("✅ Connected to contracts");
        console.log("   PoolManager:", POOL_MANAGER_ADDRESS);
        console.log("   OpinionCore:", OPINION_CORE_ADDRESS);
        console.log("   USDC Token:", USDC_ADDRESS);
        
        // Check if contracts are live
        const poolCount = await poolManager.poolCount();
        const nextOpinionId = await opinionCore.nextOpinionId();
        const deployerBalance = await usdcToken.balanceOf(deployer.address);
        
        console.log("   Pool count:", poolCount.toString());
        console.log("   Next opinion ID:", nextOpinionId.toString());
        console.log("   Deployer USDC balance:", ethers.formatUnits(deployerBalance, 6), "USDC");
        
        console.log("\n📋 STEP 2: Recent Transaction Analysis");
        console.log("======================================");
        
        // Get recent blocks to check for failed transactions
        const currentBlock = await ethers.provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 100); // Last 100 blocks
        
        console.log("   Current block:", currentBlock);
        console.log("   Checking blocks:", fromBlock, "to", currentBlock);
        
        // Check for any PoolManager related transactions
        const poolManagerCode = await ethers.provider.getCode(POOL_MANAGER_ADDRESS);
        console.log("   PoolManager deployed:", poolManagerCode !== "0x" ? "✅" : "❌");
        
        // Check for recent PoolCreated events
        try {
            const poolCreatedFilter = poolManager.filters.PoolCreated();
            const poolEvents = await poolManager.queryFilter(poolCreatedFilter, fromBlock, currentBlock);
            
            console.log("   Recent PoolCreated events:", poolEvents.length);
            poolEvents.forEach((event, i) => {
                console.log(`     Event ${i + 1}:`);
                console.log("       Block:", event.blockNumber);
                console.log("       Tx:", event.transactionHash);
                console.log("       Pool ID:", event.args?.poolId?.toString() || "unknown");
                console.log("       Opinion ID:", event.args?.opinionId?.toString() || "unknown");
            });
            
        } catch (eventError) {
            console.log("   ❌ Error checking events:", eventError.message.slice(0, 100));
        }
        
        console.log("\n📋 STEP 3: Pool Creation Requirements Check");
        console.log("===========================================");
        
        // Check opinion #3 exists
        try {
            const opinion3 = await opinionCore.getOpinionDetails(3);
            console.log("✅ Opinion #3 exists:");
            console.log("   Question:", opinion3.question.slice(0, 50) + "...");
            console.log("   Current answer:", opinion3.currentAnswer.slice(0, 50) + "...");
            console.log("   Next price:", ethers.formatUnits(opinion3.nextPrice, 6), "USDC");
            console.log("   Current owner:", opinion3.currentAnswerOwner);
            
        } catch (error) {
            console.log("❌ Opinion #3 not found:", error.message.slice(0, 100));
            return;
        }
        
        // Check pool creation fees
        const poolCreationFee = await poolManager.poolCreationFee();
        const poolContributionFee = await poolManager.poolContributionFee();
        
        console.log("   Pool creation fee:", ethers.formatUnits(poolCreationFee, 6), "USDC");
        console.log("   Pool contribution fee:", ethers.formatUnits(poolContributionFee, 6), "USDC");
        
        // Calculate total needed
        const minContribution = ethers.parseUnits("1", 6); // 1 USDC minimum
        const totalNeeded = poolCreationFee + poolContributionFee + minContribution;
        console.log("   Total needed:", ethers.formatUnits(totalNeeded, 6), "USDC");
        console.log("   User has enough:", deployerBalance >= totalNeeded ? "✅" : "❌");
        
        console.log("\n📋 STEP 4: Permission and Role Check");
        console.log("====================================");
        
        // Check if deployer can create pools directly (should be able to)
        const ADMIN_ROLE = await poolManager.ADMIN_ROLE();
        const hasAdminRole = await poolManager.hasRole(ADMIN_ROLE, deployer.address);
        console.log("   Deployer has ADMIN_ROLE:", hasAdminRole);
        
        // Check if address has any roles
        const DEFAULT_ADMIN_ROLE = await poolManager.DEFAULT_ADMIN_ROLE();
        const hasDefaultAdmin = await poolManager.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
        console.log("   Deployer has DEFAULT_ADMIN_ROLE:", hasDefaultAdmin);
        
        console.log("\n📋 STEP 5: Manual Pool Creation Test");
        console.log("====================================");
        
        // Check USDC allowance first
        const allowance = await usdcToken.allowance(deployer.address, POOL_MANAGER_ADDRESS);
        console.log("   Current allowance:", ethers.formatUnits(allowance, 6), "USDC");
        
        if (allowance < totalNeeded) {
            console.log("   Setting allowance...");
            const approveTx = await usdcToken.approve(POOL_MANAGER_ADDRESS, totalNeeded);
            await approveTx.wait();
            console.log("   ✅ Allowance set");
        }
        
        // Try to create pool manually with minimal parameters
        try {
            console.log("   Attempting manual pool creation...");
            
            const poolTx = await poolManager.createPool(
                3, // Opinion ID
                "Manual test pool creation", // Proposed answer
                Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now
                ethers.parseUnits("1", 6), // 1 USDC contribution
                "Debug Test Pool", // Name
                "" // No IPFS hash
            );
            
            console.log("   Transaction sent:", poolTx.hash);
            console.log("   Waiting for confirmation...");
            
            const receipt = await poolTx.wait();
            console.log("   ✅ Pool created successfully!");
            console.log("   Gas used:", receipt.gasUsed.toString());
            console.log("   Block:", receipt.blockNumber);
            
            // Check new pool count
            const newPoolCount = await poolManager.poolCount();
            console.log("   New pool count:", newPoolCount.toString());
            
            if (newPoolCount > poolCount) {
                const newPoolId = newPoolCount - BigInt(1);
                const newPool = await poolManager.pools(newPoolId);
                console.log("   ✅ Pool details verified:");
                console.log("     Pool ID:", newPoolId.toString());
                console.log("     Opinion ID:", newPool[1].toString());
                console.log("     Proposed answer:", newPool[3].slice(0, 50) + "...");
                console.log("     Target amount:", ethers.formatUnits(newPool[4], 6), "USDC");
            }
            
        } catch (poolError) {
            console.log("   ❌ Manual pool creation failed:", poolError.message);
            if (poolError.data) {
                console.log("   Error data:", poolError.data);
            }
            
            // Try to decode the error
            if (poolError.message.includes("execution reverted")) {
                console.log("   This is a contract revert - checking common issues:");
                console.log("     - Insufficient USDC balance?", deployerBalance < totalNeeded);
                console.log("     - Insufficient allowance?", allowance < totalNeeded);
                console.log("     - Opinion doesn't exist?", "checked above");
                console.log("     - Invalid parameters?", "using minimal valid params");
            }
        }
        
        console.log("\n🎯 DIAGNOSIS COMPLETE");
        console.log("=====================");
        
        if (poolCount === BigInt(0)) {
            console.log("❌ NO POOLS EXIST - Pool creation is failing");
            console.log("   Likely causes:");
            console.log("   1. Contract deployment issue");
            console.log("   2. Permission/role configuration");
            console.log("   3. USDC token setup");
            console.log("   4. Frontend using wrong parameters");
        } else {
            console.log("✅ Pool creation works from script");
            console.log("   Issue is likely in frontend:");
            console.log("   1. Transaction getting stuck/rejected");
            console.log("   2. Wrong parameters being sent");
            console.log("   3. Gas estimation failure");
            console.log("   4. Wallet/MetaMask issues");
        }
        
    } catch (error) {
        console.error("❌ Debug script failed:", error.message);
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