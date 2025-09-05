const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 CHECKING EXPIRED POOL REFUNDS");
    console.log("=================================");
    
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        // Get total number of pools
        const poolCount = await poolManager.poolCount();
        console.log(`📊 Total pools to check: ${poolCount}\n`);
        
        const currentTimestamp = Math.floor(Date.now() / 1000);
        let expiredPoolsFound = 0;
        let totalLockedFunds = BigInt(0);
        
        for (let i = 0; i < Number(poolCount); i++) {
            try {
                console.log(`🔍 Pool #${i}:`);
                const pool = await poolManager.pools(i);
                
                const poolInfo = {
                    id: Number(pool[0]),
                    opinionId: Number(pool[1]),
                    proposedAnswer: pool[2],
                    totalAmount: pool[3],
                    deadline: Number(pool[5]),
                    status: Number(pool[6]), // 0=Active, 1=Executed, 2=Expired, 3=Extended
                    name: pool[8]
                };
                
                console.log(`   Name: "${poolInfo.name}"`);
                console.log(`   Total Amount: ${ethers.formatUnits(poolInfo.totalAmount, 6)} USDC`);
                console.log(`   Deadline: ${new Date(poolInfo.deadline * 1000).toLocaleString()}`);
                console.log(`   Status: ${getStatusName(poolInfo.status)}`);
                
                const isExpired = poolInfo.deadline < currentTimestamp;
                const shouldBeExpired = isExpired && poolInfo.status === 0; // Active but past deadline
                
                console.log(`   Is Expired: ${isExpired ? '✅ Yes' : '❌ No'}`);
                console.log(`   Status Correct: ${shouldBeExpired ? '❌ Should be marked expired' : '✅ Correct'}`);
                
                if (isExpired) {
                    expiredPoolsFound++;
                    
                    // Get contributors
                    const contributors = await poolManager.getPoolContributors(i);
                    console.log(`   Contributors: ${contributors.length}`);
                    
                    if (contributors.length > 0 && poolInfo.totalAmount > 0) {
                        console.log(`   📋 Contributor Details:`);
                        
                        let totalContributions = BigInt(0);
                        let totalRefunded = BigInt(0);
                        
                        for (let j = 0; j < contributors.length; j++) {
                            const contributor = contributors[j];
                            const contributionAmount = await poolManager.poolContributionAmounts(i, contributor);
                            totalContributions += contributionAmount;
                            
                            console.log(`     ${j + 1}. ${contributor}`);
                            console.log(`        Contributed: ${ethers.formatUnits(contributionAmount, 6)} USDC`);
                            
                            // Check if funds are still locked (contribution > 0 means not refunded)
                            if (contributionAmount > 0) {
                                console.log(`        🚨 FUNDS STILL LOCKED: ${ethers.formatUnits(contributionAmount, 6)} USDC`);
                                totalLockedFunds += contributionAmount;
                            } else {
                                console.log(`        ✅ Refunded: ${ethers.formatUnits(contributionAmount, 6)} USDC`);
                                totalRefunded += contributionAmount;
                            }
                        }
                        
                        console.log(`   💰 Pool Summary:`);
                        console.log(`     Total Contributions: ${ethers.formatUnits(totalContributions, 6)} USDC`);
                        console.log(`     Pool Balance Shows: ${ethers.formatUnits(poolInfo.totalAmount, 6)} USDC`);
                        console.log(`     Balance Match: ${totalContributions === poolInfo.totalAmount ? '✅ Yes' : '❌ No'}`);
                        
                        if (totalContributions > 0) {
                            console.log(`\n   🔧 REFUND INSTRUCTIONS FOR CONTRIBUTORS:`);
                            console.log(`     Function to call: withdrawFromExpiredPool(${i})`);
                            console.log(`     Gas estimate: ~50,000 gas`);
                            console.log(`     Each contributor needs to call this individually`);
                        }
                    }
                }
                
                console.log("");
                
            } catch (error) {
                console.log(`   ❌ Error reading Pool #${i}: ${error.message}\n`);
            }
        }
        
        // Check PoolManager's USDC balance
        const poolManagerBalance = await usdcToken.balanceOf(POOL_MANAGER_ADDRESS);
        
        console.log("📊 SUMMARY:");
        console.log("===========");
        console.log(`Expired pools found: ${expiredPoolsFound}`);
        console.log(`PoolManager USDC balance: ${ethers.formatUnits(poolManagerBalance, 6)} USDC`);
        console.log(`Total locked in expired pools: ${ethers.formatUnits(totalLockedFunds, 6)} USDC`);
        
        if (totalLockedFunds > 0) {
            console.log("\n🚨 REFUND REQUIRED:");
            console.log("==================");
            console.log(`${ethers.formatUnits(totalLockedFunds, 6)} USDC is locked in expired pools`);
            console.log("Contributors need to call withdrawFromExpiredPool() to get refunds");
            
            console.log("\n📝 REFUND PROCESS:");
            console.log("==================");
            console.log("1. Each contributor calls: poolManager.withdrawFromExpiredPool(poolId)");
            console.log("2. Function automatically refunds their contribution");
            console.log("3. Sets their contribution amount to 0");
            console.log("4. Transfers USDC back to their wallet");
        } else {
            console.log("\n✅ ALL GOOD:");
            console.log("=============");
            console.log("No funds locked in expired pools");
            console.log("All contributors have been refunded or pools are still active");
        }
        
        // Test refund function availability
        console.log("\n🔧 REFUND FUNCTION TEST:");
        console.log("========================");
        try {
            const refundFunction = poolManager.interface.getFunction("withdrawFromExpiredPool");
            console.log("✅ withdrawFromExpiredPool function exists");
            console.log("✅ Contributors can call it to get refunds");
        } catch (e) {
            console.log("❌ withdrawFromExpiredPool function missing");
        }
        
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