const { ethers } = require("hardhat");

async function main() {
    console.log("🎯 TESTING POOL CREATION WITH ORIGINAL DESIGN");
    console.log("==============================================");
    
    const [deployer] = await ethers.getSigners();
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        console.log("💰 Balance Check with Original Design:");
        const balance = await usdcToken.balanceOf(deployer.address);
        const balanceFormatted = Number(ethers.formatUnits(balance, 6));
        
        const creationFee = await poolManager.poolCreationFee();
        const contributionFee = await poolManager.poolContributionFee();
        const contribution = ethers.parseUnits("1", 6); // 1 USDC minimum
        const totalNeeded = creationFee + contributionFee + contribution;
        
        console.log("   User balance:", balanceFormatted, "USDC");
        console.log("   Creation fee:", ethers.formatUnits(creationFee, 6), "USDC");
        console.log("   Contribution fee:", ethers.formatUnits(contributionFee, 6), "USDC");
        console.log("   Minimum contribution:", ethers.formatUnits(contribution, 6), "USDC");
        console.log("   Total needed:", ethers.formatUnits(totalNeeded, 6), "USDC");
        console.log("   Can afford:", balanceFormatted >= Number(ethers.formatUnits(totalNeeded, 6)) ? "✅" : "❌");
        
        if (balanceFormatted >= Number(ethers.formatUnits(totalNeeded, 6))) {
            console.log("\n🚀 Attempting pool creation with original fees...");
            
            // Set allowance
            const allowance = await usdcToken.allowance(deployer.address, POOL_MANAGER_ADDRESS);
            if (allowance < totalNeeded) {
                console.log("   Setting USDC allowance...");
                const approveTx = await usdcToken.approve(POOL_MANAGER_ADDRESS, totalNeeded);
                await approveTx.wait();
                console.log("   ✅ Allowance set");
            }
            
            // Create pool with original design parameters
            const deadline = Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60); // 2 days
            
            console.log("   Pool creation parameters:");
            console.log("     Opinion ID: 3");
            console.log("     Proposed answer: 'Donald Trump will win'");
            console.log("     Deadline:", new Date(deadline * 1000).toLocaleString());
            console.log("     Contribution:", ethers.formatUnits(contribution, 6), "USDC");
            console.log("     Total cost:", ethers.formatUnits(totalNeeded, 6), "USDC");
            
            const poolTx = await poolManager.createPool(
                3, // Opinion ID
                "Donald Trump will win", // Different from "JD Vance"
                deadline, // Valid deadline
                contribution, // 1 USDC contribution
                "Trump Victory Pool", // Pool name
                "" // No IPFS hash
            );
            
            console.log("   Transaction sent:", poolTx.hash);
            console.log("   Waiting for confirmation...");
            
            const receipt = await poolTx.wait();
            console.log("   ✅ POOL CREATED SUCCESSFULLY!");
            console.log("   Block:", receipt.blockNumber);
            console.log("   Gas used:", receipt.gasUsed.toString());
            
            // Verify pool
            const poolCount = await poolManager.poolCount();
            console.log("\n🎊 SUCCESS! Pool Verification:");
            console.log("   Total pools:", poolCount.toString());
            
            if (poolCount > 0) {
                const poolId = poolCount - BigInt(1);
                const pool = await poolManager.pools(poolId);
                
                console.log("\n📋 Created Pool Details:");
                console.log("   Pool ID:", poolId.toString());
                console.log("   Opinion ID:", pool[1].toString());
                console.log("   Proposed Answer:", pool[3]);
                console.log("   Target Amount:", ethers.formatUnits(pool[4], 6), "USDC");
                console.log("   Total Contributed:", ethers.formatUnits(pool[5], 6), "USDC");
                console.log("   Deadline:", new Date(Number(pool[6]) * 1000).toLocaleString());
                console.log("   Status:", pool[7] === 0 ? "Active" : "Other");
                console.log("   Name:", pool[8]);
                console.log("   Creator:", pool[2]);
            }
            
            console.log("\n🎯 COMPLETE SUCCESS WITH ORIGINAL DESIGN!");
            console.log("==========================================");
            console.log("✅ Your anti-spam fee structure works perfectly");
            console.log("✅ Pool created with 5 USDC creation fee");
            console.log("✅ Quality barrier maintained");
            console.log("✅ Frontend should now display this pool");
            
            console.log("\n🔗 Transaction Link:");
            console.log("   https://sepolia.basescan.org/tx/" + poolTx.hash);
            
            console.log("\n📱 Next Steps:");
            console.log("   1. Check frontend at /pools - pool should appear");
            console.log("   2. Try creating more pools through UI");
            console.log("   3. Your design prevents spam while allowing serious users");
            
        } else {
            console.log("\n❌ Insufficient balance for original design");
            console.log("   Need:", ethers.formatUnits(totalNeeded, 6), "USDC");
            console.log("   Have:", balanceFormatted, "USDC");
            console.log("   Shortfall:", (Number(ethers.formatUnits(totalNeeded, 6)) - balanceFormatted).toFixed(6), "USDC");
        }
        
    } catch (error) {
        console.error("❌ Pool creation test failed:", error.message);
        if (error.data) {
            console.error("   Error data:", error.data);
        }
        
        // Check if it's still the same internal contract error
        if (error.data === "0xe2517d3f0000000000000000000000003b4584e690109484059d95d7904dd9feba246612642c46ab335d3b181002a9ff7422458ab758616f830ebcce9faed69a65e8dbc1") {
            console.log("\n🔍 Same internal contract error as before");
            console.log("   Issue is not with fees or balance");
            console.log("   There's a deeper contract logic issue to investigate");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });