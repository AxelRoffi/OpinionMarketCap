const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying Treasury Fee Flow After Upgrade");
    console.log("=============================================");
    
    // Contract addresses
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
    
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("👤 Testing with:", deployer.address);
    
    try {
        // Connect to contracts
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        // Check initial balances
        console.log("\n📊 Initial State:");
        const initialTreasuryBalance = await usdc.balanceOf(TREASURY_ADDRESS);
        const deployerBalance = await usdc.balanceOf(deployer.address);
        const poolCount = await poolManager.poolCount();
        
        console.log(`💰 Treasury Balance: ${ethers.formatUnits(initialTreasuryBalance, 6)} USDC`);
        console.log(`👤 Deployer Balance: ${ethers.formatUnits(deployerBalance, 6)} USDC`);
        console.log(`📊 Current Pool Count: ${poolCount}`);
        
        // Check if deployer has enough USDC for testing
        const requiredAmount = ethers.parseUnits("5", 6); // 5 USDC minimum
        if (deployerBalance < requiredAmount) {
            console.log("❌ Insufficient USDC for testing");
            console.log(`   Need at least ${ethers.formatUnits(requiredAmount, 6)} USDC`);
            return;
        }
        
        // Test: Contribute to an existing pool
        if (poolCount > 0n) {
            console.log("\n🧪 Testing Pool Contribution Fee Flow:");
            console.log("--------------------------------------");
            
            // Use the latest pool (pool 2)
            const poolId = poolCount - 1n;
            console.log(`📍 Testing with Pool #${poolId}`);
            
            // Get pool details
            const poolDetails = await poolManager.getPoolDetails(poolId);
            console.log(`📊 Pool Total Amount: ${ethers.formatUnits(poolDetails.info.totalAmount, 6)} USDC`);
            console.log(`📊 Target Price: ${ethers.formatUnits(poolDetails.currentPrice, 6)} USDC`);
            console.log(`📊 Remaining Needed: ${ethers.formatUnits(poolDetails.remainingAmount, 6)} USDC`);
            
            // Prepare contribution
            const contributionAmount = ethers.parseUnits("2", 6); // 2 USDC
            const contributionFee = ethers.parseUnits("1", 6);    // 1 USDC fee
            const totalRequired = contributionAmount + contributionFee;
            
            console.log(`💰 Contributing: ${ethers.formatUnits(contributionAmount, 6)} USDC`);
            console.log(`💰 Fee: ${ethers.formatUnits(contributionFee, 6)} USDC`);
            console.log(`💰 Total Required: ${ethers.formatUnits(totalRequired, 6)} USDC`);
            
            // Check allowance
            const currentAllowance = await usdc.allowance(deployer.address, POOL_MANAGER_ADDRESS);
            if (currentAllowance < totalRequired) {
                console.log("✅ Approving USDC...");
                const approveTx = await usdc.approve(POOL_MANAGER_ADDRESS, totalRequired);
                await approveTx.wait();
                console.log("✅ USDC approved");
            }
            
            // Record treasury balance before
            const treasuryBefore = await usdc.balanceOf(TREASURY_ADDRESS);
            console.log(`💰 Treasury before: ${ethers.formatUnits(treasuryBefore, 6)} USDC`);
            
            // Contribute to pool
            console.log("🔄 Contributing to pool...");
            const contributeTx = await poolManager.contributeToPool(poolId, contributionAmount);
            const receipt = await contributeTx.wait();
            
            console.log("✅ Contribution successful!");
            console.log(`📊 Transaction Hash: ${receipt.hash}`);
            
            // Check treasury balance after
            const treasuryAfter = await usdc.balanceOf(TREASURY_ADDRESS);
            const feeReceived = treasuryAfter - treasuryBefore;
            
            console.log(`💰 Treasury after: ${ethers.formatUnits(treasuryAfter, 6)} USDC`);
            console.log(`📈 Fee received: ${ethers.formatUnits(feeReceived, 6)} USDC`);
            
            // Verify the fee went to treasury
            if (feeReceived === contributionFee) {
                console.log("🎉 SUCCESS: Full 1 USDC fee went to treasury!");
                console.log("✅ Treasury model working perfectly!");
            } else {
                console.log("❌ ISSUE: Fee amount doesn't match expected");
                console.log(`   Expected: ${ethers.formatUnits(contributionFee, 6)} USDC`);
                console.log(`   Received: ${ethers.formatUnits(feeReceived, 6)} USDC`);
            }
            
            // Check pool state after contribution
            const newPoolDetails = await poolManager.getPoolDetails(poolId);
            console.log(`📊 Pool amount after: ${ethers.formatUnits(newPoolDetails.info.totalAmount, 6)} USDC`);
            
        } else {
            console.log("⚠️ No pools available for testing");
            console.log("   Create a pool first to test contribution fees");
        }
        
        // Final summary
        console.log("\n📊 Final Results:");
        console.log("==================");
        const finalTreasuryBalance = await usdc.balanceOf(TREASURY_ADDRESS);
        const totalGained = finalTreasuryBalance - initialTreasuryBalance;
        
        console.log(`💰 Treasury initial: ${ethers.formatUnits(initialTreasuryBalance, 6)} USDC`);
        console.log(`💰 Treasury final: ${ethers.formatUnits(finalTreasuryBalance, 6)} USDC`);
        console.log(`📈 Total gained: ${ethers.formatUnits(totalGained, 6)} USDC`);
        
        if (totalGained > 0) {
            console.log("🎉 VERIFICATION SUCCESSFUL!");
            console.log("✅ Treasury is receiving pool fees correctly");
        } else {
            console.log("⚠️ No fees were collected during this test");
        }
        
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
        if (error.reason) {
            console.error("   Reason:", error.reason);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });