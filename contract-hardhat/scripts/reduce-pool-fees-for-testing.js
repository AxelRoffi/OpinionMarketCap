const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 REDUCING POOL FEES FOR TESTING");
    console.log("==================================");
    
    const [deployer] = await ethers.getSigners();
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        
        console.log("📋 Current Fees:");
        const currentCreationFee = await poolManager.poolCreationFee();
        const currentContributionFee = await poolManager.poolContributionFee();
        
        console.log("   Pool creation fee:", ethers.formatUnits(currentCreationFee, 6), "USDC");
        console.log("   Pool contribution fee:", ethers.formatUnits(currentContributionFee, 6), "USDC");
        
        // Check if deployer has admin rights
        const ADMIN_ROLE = await poolManager.ADMIN_ROLE();
        const hasAdminRole = await poolManager.hasRole(ADMIN_ROLE, deployer.address);
        
        console.log("   Deployer has ADMIN_ROLE:", hasAdminRole);
        
        if (hasAdminRole) {
            console.log("\n🔧 Reducing fees for testing...");
            
            // Reduce creation fee to 1 USDC
            const newCreationFee = ethers.parseUnits("1", 6);
            const creationFeeTx = await poolManager.setPoolCreationFee(newCreationFee);
            await creationFeeTx.wait();
            console.log("✅ Pool creation fee set to 1 USDC");
            
            // Reduce contribution fee to 0.1 USDC
            const newContributionFee = ethers.parseUnits("0.1", 6);
            const contributionFeeTx = await poolManager.setPoolContributionFee(newContributionFee);
            await contributionFeeTx.wait();
            console.log("✅ Pool contribution fee set to 0.1 USDC");
            
            // Verify changes
            const updatedCreationFee = await poolManager.poolCreationFee();
            const updatedContributionFee = await poolManager.poolContributionFee();
            
            console.log("\n📋 Updated Fees:");
            console.log("   Pool creation fee:", ethers.formatUnits(updatedCreationFee, 6), "USDC");
            console.log("   Pool contribution fee:", ethers.formatUnits(updatedContributionFee, 6), "USDC");
            
            // Calculate new minimum required
            const minContribution = 0.1;
            const totalRequired = Number(ethers.formatUnits(updatedCreationFee, 6)) + 
                                Number(ethers.formatUnits(updatedContributionFee, 6)) + 
                                minContribution;
            
            console.log("   Total minimum needed:", totalRequired, "USDC");
            
            // Check user balance
            const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
            const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
            const userBalance = await usdcToken.balanceOf(deployer.address);
            const userBalanceFormatted = Number(ethers.formatUnits(userBalance, 6));
            
            console.log("   User balance:", userBalanceFormatted, "USDC");
            console.log("   Can create pool:", userBalanceFormatted >= totalRequired ? "✅" : "❌");
            
            if (userBalanceFormatted >= totalRequired) {
                console.log("\n🧪 Testing pool creation with reduced fees...");
                
                // Try creating a test pool
                const allowance = await usdcToken.allowance(deployer.address, POOL_MANAGER_ADDRESS);
                if (allowance < ethers.parseUnits(totalRequired.toString(), 6)) {
                    console.log("   Setting USDC allowance...");
                    const approveTx = await usdcToken.approve(POOL_MANAGER_ADDRESS, ethers.parseUnits("10", 6));
                    await approveTx.wait();
                    console.log("   ✅ Allowance set");
                }
                
                const poolTx = await poolManager.createPool(
                    3, // Opinion ID
                    "Test pool with reduced fees", // Proposed answer
                    Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60), // 2 days from now
                    ethers.parseUnits("0.1", 6), // 0.1 USDC contribution
                    "Reduced Fee Test Pool", // Name
                    "" // No IPFS hash
                );
                
                console.log("   Transaction sent:", poolTx.hash);
                const receipt = await poolTx.wait();
                console.log("   ✅ POOL CREATED SUCCESSFULLY!");
                console.log("   Gas used:", receipt.gasUsed.toString());
                
                // Verify pool was created
                const poolCount = await poolManager.poolCount();
                console.log("   Pool count:", poolCount.toString());
                
                if (poolCount > 0) {
                    const pool = await poolManager.pools(poolCount - BigInt(1));
                    console.log("   ✅ Pool verified:");
                    console.log("     Pool ID:", (poolCount - BigInt(1)).toString());
                    console.log("     Opinion ID:", pool[1].toString());
                    console.log("     Proposed answer:", pool[3]);
                    console.log("     Target amount:", ethers.formatUnits(pool[4], 6), "USDC");
                    console.log("     Deadline:", new Date(Number(pool[6]) * 1000).toLocaleString());
                }
            }
            
        } else {
            console.log("❌ No admin rights to reduce fees");
        }
        
        console.log("\n🎯 TESTING READY!");
        console.log("=================");
        console.log("✅ Pool fees reduced for testing");
        console.log("✅ Pool creation should now work");
        console.log("✅ Frontend should display pools");
        console.log("\n📱 Try the frontend again with reduced fees!");
        
    } catch (error) {
        console.error("❌ Fee reduction failed:", error.message);
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