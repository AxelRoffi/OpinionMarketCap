const { ethers } = require("hardhat");

async function main() {
    console.log("🎯 FINAL POOL CREATION TEST");
    console.log("===========================");
    
    const [deployer] = await ethers.getSigners();
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        // Check requirements
        console.log("📋 Requirements Check:");
        const creationFee = await poolManager.poolCreationFee();
        const contributionFee = await poolManager.poolContributionFee();
        const userBalance = await usdcToken.balanceOf(deployer.address);
        
        console.log("   Creation fee:", ethers.formatUnits(creationFee, 6), "USDC");
        console.log("   Contribution fee:", ethers.formatUnits(contributionFee, 6), "USDC");
        console.log("   User balance:", ethers.formatUnits(userBalance, 6), "USDC");
        
        // Use MINIMUM 1 USDC contribution (hardcoded in contract)
        const contributionAmount = ethers.parseUnits("1", 6); // 1 USDC - minimum required
        const totalNeeded = creationFee + contributionFee + contributionAmount;
        
        console.log("   Required contribution: 1.0 USDC (hardcoded minimum)");
        console.log("   Total needed:", ethers.formatUnits(totalNeeded, 6), "USDC");
        console.log("   Can create pool:", userBalance >= totalNeeded ? "✅" : "❌");
        
        if (userBalance >= totalNeeded) {
            console.log("\n🚀 Creating pool with correct parameters...");
            
            // Set allowance
            const allowance = await usdcToken.allowance(deployer.address, POOL_MANAGER_ADDRESS);
            if (allowance < totalNeeded) {
                console.log("   Setting allowance...");
                const approveTx = await usdcToken.approve(POOL_MANAGER_ADDRESS, totalNeeded);
                await approveTx.wait();
                console.log("   ✅ Allowance set");
            }
            
            // Create pool with minimum valid parameters
            const deadline = Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60); // 2 days
            
            const poolTx = await poolManager.createPool(
                3, // Opinion ID #3
                "This opinion is incorrect - testing", // Proposed answer (different from current)
                deadline, // Valid deadline (2+ days)
                contributionAmount, // 1 USDC - meets minimum requirement
                "Final Test Pool", // Pool name
                "" // No IPFS hash
            );
            
            console.log("   Transaction sent:", poolTx.hash);
            console.log("   Waiting for confirmation...");
            
            const receipt = await poolTx.wait();
            console.log("   ✅ POOL CREATED SUCCESSFULLY!");
            console.log("   Block:", receipt.blockNumber);
            console.log("   Gas used:", receipt.gasUsed.toString());
            
            // Verify and display pool
            const poolCount = await poolManager.poolCount();
            console.log("\n🎊 SUCCESS! Pool Verification:");
            console.log("   Total pools now:", poolCount.toString());
            
            const poolId = poolCount - BigInt(1);
            const pool = await poolManager.pools(poolId);
            
            console.log("\n📋 Created Pool Details:");
            console.log("   Pool ID:", poolId.toString());
            console.log("   Opinion ID:", pool[1].toString());
            console.log("   Creator:", pool[2]);
            console.log("   Proposed Answer:", pool[3]);
            console.log("   Target Amount:", ethers.formatUnits(pool[4], 6), "USDC");
            console.log("   Total Contributed:", ethers.formatUnits(pool[5], 6), "USDC");
            console.log("   Deadline:", new Date(Number(pool[6]) * 1000).toLocaleString());
            console.log("   Status:", pool[7] === 0 ? "Active" : "Other");
            console.log("   Name:", pool[8]);
            
            console.log("\n🔗 Blockchain Links:");
            console.log("   Transaction: https://sepolia.basescan.org/tx/" + poolTx.hash);
            console.log("   PoolManager: https://sepolia.basescan.org/address/" + POOL_MANAGER_ADDRESS);
            
            console.log("\n🎯 COMPLETE SUCCESS!");
            console.log("====================");
            console.log("✅ Pool creation is working");
            console.log("✅ Pool exists on blockchain");
            console.log("✅ Frontend should now display this pool");
            console.log("✅ API endpoint should return pool data");
            
            console.log("\n📱 Frontend Testing:");
            console.log("1. Visit: http://localhost:3000/pools");
            console.log("2. Pool should appear in list");
            console.log("3. Pool details should be correct");
            console.log("4. Create more pools through UI");
            
            // Update frontend validation to match contract requirements
            console.log("\n🔧 Frontend Updates Needed:");
            console.log("1. Update minimum contribution to 1 USDC");
            console.log("2. Update fee calculation (1 USDC creation + 0.1 USDC contribution)");
            console.log("3. Total cost = contribution + 1.1 USDC fees");
            
        } else {
            console.log("❌ Still insufficient balance");
            console.log("   User needs at least:", ethers.formatUnits(totalNeeded, 6), "USDC");
        }
        
    } catch (error) {
        console.error("❌ Final test failed:", error.message);
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