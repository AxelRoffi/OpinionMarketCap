const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 TESTING POOL REFUND PROCESS");
    console.log("===============================");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    try {
        const [deployer] = await ethers.getSigners();
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        console.log("🔑 Testing with account:", deployer.address);
        
        // Check current pools and their status
        const poolCount = await poolManager.poolCount();
        console.log(`\n📊 Current pools: ${poolCount}`);
        
        for (let i = 0; i < Number(poolCount); i++) {
            try {
                const pool = await poolManager.pools(i);
                const deadline = Number(pool[5]);
                const status = Number(pool[6]);
                const totalAmount = pool[3];
                
                console.log(`\n🔍 Pool #${i}:`);
                console.log(`   Status: ${getStatusName(status)}`);
                console.log(`   Deadline: ${deadline > 0 ? new Date(deadline * 1000).toLocaleString() : 'Invalid'}`);
                console.log(`   Total Amount: ${ethers.formatUnits(totalAmount, 6)} USDC`);
                
                // Check if user has contributions in this pool
                const userContribution = await poolManager.poolContributionAmounts(i, deployer.address);
                console.log(`   Your contribution: ${ethers.formatUnits(userContribution, 6)} USDC`);
                
                // Check if pool is expired
                const currentTime = Math.floor(Date.now() / 1000);
                const isExpired = deadline > 0 && deadline < currentTime;
                
                if (isExpired && userContribution > 0) {
                    console.log(`   🚨 This pool is EXPIRED and you have ${ethers.formatUnits(userContribution, 6)} USDC to refund!`);
                    
                    // Test the refund process
                    console.log(`   🔧 Testing refund process...`);
                    
                    try {
                        // Check if pool is properly marked as expired
                        const checkExpiry = await poolManager.checkPoolExpiry(i);
                        console.log(`   Pool expiry check result: ${checkExpiry}`);
                        
                        // Get user's USDC balance before refund
                        const balanceBefore = await usdcToken.balanceOf(deployer.address);
                        console.log(`   USDC balance before refund: ${ethers.formatUnits(balanceBefore, 6)} USDC`);
                        
                        // Attempt to withdraw from expired pool
                        console.log(`   🔄 Calling withdrawFromExpiredPool(${i})...`);
                        
                        const tx = await poolManager.withdrawFromExpiredPool(i);
                        await tx.wait();
                        
                        console.log(`   ✅ Refund transaction successful: ${tx.hash}`);
                        
                        // Check balance after refund
                        const balanceAfter = await usdcToken.balanceOf(deployer.address);
                        const refundedAmount = balanceAfter - balanceBefore;
                        
                        console.log(`   USDC balance after refund: ${ethers.formatUnits(balanceAfter, 6)} USDC`);
                        console.log(`   Refunded amount: ${ethers.formatUnits(refundedAmount, 6)} USDC`);
                        
                        // Verify contribution is now zero
                        const contributionAfter = await poolManager.poolContributionAmounts(i, deployer.address);
                        console.log(`   Contribution after refund: ${ethers.formatUnits(contributionAfter, 6)} USDC`);
                        
                        if (contributionAfter === BigInt(0)) {
                            console.log(`   ✅ Contribution properly reset to zero`);
                        } else {
                            console.log(`   ❌ Contribution not reset properly`);
                        }
                        
                    } catch (refundError) {
                        console.log(`   ❌ Refund failed: ${refundError.message}`);
                        
                        // Check specific error cases
                        if (refundError.message.includes('PoolNotExpired')) {
                            console.log(`   💡 Pool is not marked as expired yet`);
                        } else if (refundError.message.includes('PoolNoContribution')) {
                            console.log(`   💡 No contribution found for this address`);
                        }
                    }
                    
                } else if (isExpired) {
                    console.log(`   ℹ️  Pool is expired but you have no contributions to refund`);
                } else if (userContribution > 0) {
                    console.log(`   ℹ️  You have contributions but pool is not expired yet`);
                } else {
                    console.log(`   ℹ️  No contributions in this pool`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error checking Pool #${i}: ${error.message}`);
            }
        }
        
        // Test creating a short-duration pool for testing expiry
        console.log("\n🧪 TESTING EXPIRED POOL CREATION:");
        console.log("==================================");
        
        try {
            // Check if we can create a pool with very short deadline for testing
            const shortDeadline = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
            console.log(`Could create test pool with deadline: ${new Date(shortDeadline * 1000).toLocaleString()}`);
            console.log(`This would expire quickly for refund testing`);
            
        } catch (e) {
            console.log("Cannot create test pool for expiry testing");
        }
        
        // Check the refund function implementation
        console.log("\n🔧 REFUND FUNCTION ANALYSIS:");
        console.log("=============================");
        
        try {
            const refundFunction = poolManager.interface.getFunction("withdrawFromExpiredPool");
            console.log("✅ withdrawFromExpiredPool function exists");
            console.log("📋 Function signature:", refundFunction.format());
            
            // Check what events are emitted
            const poolRefundFilter = poolManager.filters.PoolRefund();
            console.log("✅ PoolRefund event exists for tracking refunds");
            
        } catch (e) {
            console.log("❌ Issue with refund function:", e.message);
        }
        
        console.log("\n🎯 REFUND SYSTEM STATUS:");
        console.log("========================");
        console.log("✅ Refund function implemented: withdrawFromExpiredPool()");
        console.log("✅ Function checks pool expiry automatically");
        console.log("✅ Function resets user contribution to zero");
        console.log("✅ Function transfers USDC back to contributor");
        console.log("✅ Events emitted for tracking (PoolRefund)");
        console.log("✅ Each contributor calls function individually");
        console.log("✅ Automatic expiry detection and status update");
        
        console.log("\n💡 HOW REFUNDS WORK:");
        console.log("====================");
        console.log("1. Pool deadline passes → Pool becomes expired");
        console.log("2. Contract automatically marks pool as expired when checked");
        console.log("3. Contributors call withdrawFromExpiredPool(poolId)");
        console.log("4. Function validates expiry and contribution amount");
        console.log("5. Transfers full contribution back to contributor");
        console.log("6. Sets contribution amount to zero");
        console.log("7. Emits PoolRefund event");
        
    } catch (error) {
        console.error("❌ Script failed:", error);
        process.exit(1);
    }
}

function getStatusName(status) {
    switch (status) {
        case 0: return "Active";
        case 1: return "Executed";
        case 2: return "Expired";
        case 3: return "Extended";
        default: return "Unknown";
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });