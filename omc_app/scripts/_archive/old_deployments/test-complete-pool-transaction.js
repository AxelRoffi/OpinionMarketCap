const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing completePool Transaction for Pool #7...");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const poolId = 7;
    
    // Get contracts
    const PoolManager = await ethers.getContractFactory("PoolManager");
    const poolManager = PoolManager.attach(POOL_MANAGER_ADDRESS);
    
    const USDC = await ethers.getContractFactory("MockERC20");
    const usdcToken = USDC.attach(USDC_ADDRESS);
    
    // Get signer (deployer for testing)
    const [deployer] = await ethers.getSigners();
    console.log("🔍 Testing with address:", deployer.address);
    
    try {
        // Get current pool state
        const poolDetails = await poolManager.getPoolDetails(poolId);
        const [info, currentPrice, remainingAmount, timeRemaining] = poolDetails;
        
        console.log("\n📊 Pool #7 Current State:");
        console.log("Remaining amount:", ethers.formatUnits(remainingAmount, 6), "USDC");
        console.log("Pool status:", info.status.toString(), "(0=Active)");
        console.log("Time remaining:", Number(timeRemaining), "seconds");
        
        // Check user balance
        const userBalance = await usdcToken.balanceOf(deployer.address);
        console.log("User USDC balance:", ethers.formatUnits(userBalance, 6), "USDC");
        
        // Calculate total required (remaining + 1 USDC fee)
        const contributionFee = 1_000_000n; // 1 USDC in 6 decimals
        const totalRequired = remainingAmount + contributionFee;
        console.log("Total required:", ethers.formatUnits(totalRequired, 6), "USDC");
        
        // Check if user has enough balance
        const hasEnoughBalance = userBalance >= totalRequired;
        console.log("Has enough balance:", hasEnoughBalance);
        
        if (!hasEnoughBalance) {
            console.log("❌ Insufficient balance for completion");
            return;
        }
        
        // Check allowance
        const allowance = await usdcToken.allowance(deployer.address, POOL_MANAGER_ADDRESS);
        console.log("Current allowance:", ethers.formatUnits(allowance, 6), "USDC");
        
        const hasEnoughAllowance = allowance >= totalRequired;
        console.log("Has enough allowance:", hasEnoughAllowance);
        
        if (!hasEnoughAllowance) {
            console.log("\n🔧 Approving USDC for pool completion...");
            const approveTx = await usdcToken.approve(POOL_MANAGER_ADDRESS, totalRequired);
            console.log("Approve transaction:", approveTx.hash);
            await approveTx.wait();
            console.log("✅ Approval confirmed");
        }
        
        console.log("\n🚀 Testing completePool transaction...");
        
        // Estimate gas for completePool
        try {
            const gasEstimate = await poolManager.completePool.estimateGas(poolId);
            console.log("Estimated gas:", gasEstimate.toString());
        } catch (gasError) {
            console.error("❌ Gas estimation failed:", gasError.reason || gasError.message);
            
            // Try to get more specific error
            try {
                await poolManager.completePool.staticCall(poolId);
            } catch (staticError) {
                console.error("❌ Static call failed:", staticError.reason || staticError.message);
                console.log("This tells us exactly why the transaction would fail.");
            }
            return;
        }
        
        // Execute the completePool transaction
        console.log("🔄 Executing completePool transaction...");
        const completeTx = await poolManager.completePool(poolId);
        console.log("Transaction hash:", completeTx.hash);
        console.log("Waiting for confirmation...");
        
        const receipt = await completeTx.wait();
        console.log("✅ Transaction confirmed!");
        console.log("Gas used:", receipt.gasUsed.toString());
        
        // Check pool state after completion
        const poolDetailsAfter = await poolManager.getPoolDetails(poolId);
        const [infoAfter, , remainingAfter] = poolDetailsAfter;
        
        console.log("\n📈 Pool State After Completion:");
        console.log("New status:", infoAfter.status.toString(), "(1=Executed should be the result)");
        console.log("Remaining amount:", ethers.formatUnits(remainingAfter, 6), "USDC");
        
        if (infoAfter.status.toString() === "1") {
            console.log("🎉 Pool successfully completed and executed!");
        } else {
            console.log("⚠️ Pool completion didn't trigger execution");
        }
        
    } catch (error) {
        console.error("❌ Error testing completePool:", error.message);
        
        // Check if it's a revert with a reason
        if (error.reason) {
            console.error("Revert reason:", error.reason);
        }
        
        // Check for common issues
        if (error.message.includes("allowance")) {
            console.log("💡 Issue: Insufficient allowance for USDC transfer");
        } else if (error.message.includes("balance")) {
            console.log("💡 Issue: Insufficient USDC balance");
        } else if (error.message.includes("deadline")) {
            console.log("💡 Issue: Pool deadline has passed");
        } else if (error.message.includes("status")) {
            console.log("💡 Issue: Pool is not in active status");
        }
        
        throw error;
    }
}

main()
    .then(() => {
        console.log("\n✅ completePool transaction test completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Test failed:", error.message);
        process.exit(1);
    });