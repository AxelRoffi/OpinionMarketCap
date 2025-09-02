const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Diagnosing Pool #7 completePool Revert...");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const poolId = 7;
    
    // Get contracts
    const PoolManager = await ethers.getContractFactory("PoolManager");
    const poolManager = PoolManager.attach(POOL_MANAGER_ADDRESS);
    
    const USDC = await ethers.getContractFactory("MockERC20");
    const usdcToken = USDC.attach(USDC_ADDRESS);
    
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("🔍 Diagnosing with address:", deployer.address);
    
    try {
        // Get current pool state
        const poolDetails = await poolManager.getPoolDetails(poolId);
        const [info, currentPrice, remainingAmount, timeRemaining] = poolDetails;
        
        console.log("\n📊 Detailed Pool Analysis:");
        console.log("Pool ID:", poolId);
        console.log("Pool Status:", info.status.toString());
        console.log("Current Amount:", ethers.formatUnits(info.totalAmount, 6), "USDC");
        console.log("Target Price:", ethers.formatUnits(info.targetPrice, 6), "USDC");
        console.log("Remaining Amount:", ethers.formatUnits(remainingAmount, 6), "USDC");
        console.log("Deadline:", new Date(Number(info.deadline) * 1000).toISOString());
        console.log("Current Time:", new Date().toISOString());
        console.log("Time Remaining:", Number(timeRemaining), "seconds");
        
        // Check each condition that could cause revert
        console.log("\n🔍 Checking Revert Conditions:");
        
        // 1. Pool ID validation
        const poolCount = await poolManager.poolCount();
        console.log("Total pools:", poolCount.toString());
        console.log("Pool ID valid:", poolId < poolCount);
        
        // 2. Pool status check
        console.log("Pool is active:", info.status.toString() === "0");
        
        // 3. Deadline check
        const currentTime = Math.floor(Date.now() / 1000);
        const deadlineRemaining = Number(info.deadline) - currentTime;
        console.log("Current timestamp:", currentTime);
        console.log("Pool deadline:", Number(info.deadline));
        console.log("Deadline passed:", currentTime > Number(info.deadline));
        
        // 4. Already funded check  
        console.log("Target >= current:", info.targetPrice <= info.totalAmount);
        console.log("Remaining is zero:", remainingAmount === 0n);
        
        // 5. User balance and allowance
        const userBalance = await usdcToken.balanceOf(deployer.address);
        const contributionFee = 1_000_000n;
        const totalRequired = remainingAmount + contributionFee;
        const allowance = await usdcToken.allowance(deployer.address, POOL_MANAGER_ADDRESS);
        
        console.log("User balance:", ethers.formatUnits(userBalance, 6), "USDC");
        console.log("Total required:", ethers.formatUnits(totalRequired, 6), "USDC");
        console.log("Current allowance:", ethers.formatUnits(allowance, 6), "USDC");
        console.log("Sufficient balance:", userBalance >= totalRequired);
        console.log("Sufficient allowance:", allowance >= totalRequired);
        
        // Try to call with different parameters to isolate the issue
        console.log("\n🧪 Testing different scenarios:");
        
        // Test with a tiny amount to see if the function works at all
        try {
            console.log("Testing contributeToPool with 1 USDC...");
            await poolManager.contributeToPool.staticCall(poolId, 1_000_000n);
            console.log("✅ contributeToPool would work");
        } catch (contributeError) {
            console.log("❌ contributeToPool would fail:", contributeError.reason || contributeError.message);
        }
        
        // Check if the issue is with the enhanced completePool logic
        const remainingAmountNumber = Number(remainingAmount);
        const isMicroAmount = remainingAmountNumber < 10000; // < 0.01 USDC
        
        console.log("\n🔧 Enhanced Logic Check:");
        console.log("Remaining amount (wei):", remainingAmount.toString());
        console.log("Is micro amount (<0.01 USDC):", isMicroAmount);
        
        if (isMicroAmount) {
            console.log("🎯 This should trigger micro-amount free completion");
        } else {
            console.log("💰 This should require normal payment completion");
        }
        
        // Try to identify the exact revert reason by testing the contract state
        console.log("\n🕵️ Exact Error Detection:");
        
        try {
            const result = await poolManager.completePool.staticCall(poolId);
            console.log("✅ Static call succeeded:", result);
        } catch (exactError) {
            console.log("❌ Exact error:");
            console.log("Message:", exactError.message);
            console.log("Reason:", exactError.reason);
            console.log("Code:", exactError.code);
            console.log("Data:", exactError.data);
            
            // Parse the error data to get custom error
            if (exactError.data && exactError.data.startsWith('0x')) {
                console.log("Raw error data:", exactError.data);
                
                // Try to decode common errors
                const errorSelectors = {
                    '0x8581d45f': 'PoolInvalidPoolId(uint256)',
                    '0x8c7b8c9a': 'PoolNotActive(uint256,uint8)',
                    '0x15dd4fce': 'PoolDeadlinePassed(uint256,uint256)',
                    '0xb2b9b5c3': 'PoolAlreadyFunded(uint256)',
                    '0x13be252b': 'InsufficientAllowance(uint256,uint256)'
                };
                
                const selector = exactError.data.slice(0, 10);
                if (errorSelectors[selector]) {
                    console.log("Decoded error:", errorSelectors[selector]);
                }
            }
        }
        
    } catch (error) {
        console.error("❌ Error in diagnosis:", error.message);
        throw error;
    }
}

main()
    .then(() => {
        console.log("\n✅ Pool revert diagnosis completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Diagnosis failed:", error);
        process.exit(1);
    });