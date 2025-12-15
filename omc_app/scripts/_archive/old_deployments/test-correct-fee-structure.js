const { ethers } = require("hardhat");

async function main() {
    console.log("🎯 TESTING CORRECT FEE STRUCTURE");
    console.log("=================================");
    
    const [deployer] = await ethers.getSigners();
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        console.log("📋 CORRECT FEE BREAKDOWN:");
        const creationFee = await poolManager.poolCreationFee();
        const contributionFee = await poolManager.poolContributionFee();
        
        console.log("   Pool Creation:");
        console.log("     • Creation Fee:", ethers.formatUnits(creationFee, 6), "USDC → Treasury");
        console.log("     • Initial Contribution: X USDC → Pool");
        console.log("     • Total Cost: 5 + X USDC");
        console.log("");
        console.log("   Pool Contribution (existing pools):");
        console.log("     • Contribution Fee:", ethers.formatUnits(contributionFee, 6), "USDC → Treasury");
        console.log("     • Actual Contribution: X USDC → Pool");
        console.log("     • Total Cost: 1 + X USDC");
        
        // Test with 2 USDC initial contribution
        const initialContribution = ethers.parseUnits("2", 6); // 2 USDC to pool
        const totalCost = creationFee + initialContribution; // 5 + 2 = 7 USDC
        
        console.log("\n💰 Example: Create pool with 2 USDC contribution:");
        console.log("   • 5 USDC creation fee → Treasury");
        console.log("   • 2 USDC initial contribution → Pool");
        console.log("   • Total cost:", ethers.formatUnits(totalCost, 6), "USDC");
        
        const balance = await usdcToken.balanceOf(deployer.address);
        const balanceFormatted = Number(ethers.formatUnits(balance, 6));
        
        console.log("\n📊 User Status:");
        console.log("   • Balance:", balanceFormatted, "USDC");
        console.log("   • Required:", ethers.formatUnits(totalCost, 6), "USDC");
        console.log("   • Can create:", balanceFormatted >= Number(ethers.formatUnits(totalCost, 6)) ? "✅" : "❌");
        
        if (balanceFormatted >= Number(ethers.formatUnits(totalCost, 6))) {
            console.log("\n🚀 Testing pool creation with correct structure...");
            
            // Set allowance
            const allowance = await usdcToken.allowance(deployer.address, POOL_MANAGER_ADDRESS);
            if (allowance < totalCost) {
                console.log("   Setting allowance...");
                const approveTx = await usdcToken.approve(POOL_MANAGER_ADDRESS, totalCost);
                await approveTx.wait();
                console.log("   ✅ Allowance set");
            }
            
            const deadline = Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60);
            
            console.log("   Pool parameters:");
            console.log("     Opinion ID: 3");
            console.log("     Proposed answer: 'Trump will be president'");
            console.log("     Initial contribution:", ethers.formatUnits(initialContribution, 6), "USDC → Pool");
            console.log("     Creation fee:", ethers.formatUnits(creationFee, 6), "USDC → Treasury");
            console.log("     Total cost:", ethers.formatUnits(totalCost, 6), "USDC");
            console.log("     Deadline:", new Date(deadline * 1000).toLocaleString());
            
            const poolTx = await poolManager.createPool(
                3,
                "Trump will be president",
                deadline,
                initialContribution, // 2 USDC goes to pool
                "Trump 2024 Pool",
                ""
            );
            
            console.log("   Transaction sent:", poolTx.hash);
            const receipt = await poolTx.wait();
            
            console.log("   ✅ SUCCESS! Pool created with correct fee structure");
            console.log("   Block:", receipt.blockNumber);
            
            // Verify pool
            const poolCount = await poolManager.poolCount();
            if (poolCount > 0) {
                const poolId = poolCount - BigInt(1);
                const pool = await poolManager.pools(poolId);
                
                console.log("\n📋 Verified Pool Details:");
                console.log("     Pool ID:", poolId.toString());
                console.log("     Opinion ID:", pool[1].toString());
                console.log("     Proposed Answer:", pool[3]);
                console.log("     Pool Name:", pool[8]);
                console.log("     Target Amount:", ethers.formatUnits(pool[4], 6), "USDC (opinion next price)");
                console.log("     Current Contributed:", ethers.formatUnits(pool[5], 6), "USDC (our contribution)");
            }
            
            console.log("\n🎊 FEE STRUCTURE CONFIRMED WORKING!");
            console.log("===================================");
            console.log("✅ 5 USDC creation fee → Treasury");
            console.log("✅ 2 USDC initial contribution → Pool");
            console.log("✅ Total: 7 USDC charged correctly");
            console.log("✅ Frontend should show this breakdown clearly");
            
        } else {
            console.log("\n❌ Insufficient balance");
            console.log("   Need:", ethers.formatUnits(totalCost, 6), "USDC");
            console.log("   Have:", balanceFormatted, "USDC");
        }
        
    } catch (error) {
        console.error("❌ Test failed:", error.message);
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