const { ethers } = require("hardhat");

async function main() {
    console.log("🔄 RESTORING ORIGINAL POOL FEES");
    console.log("================================");
    
    const [deployer] = await ethers.getSigners();
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    
    try {
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_ADDRESS);
        
        console.log("📋 Current Fees:");
        const currentCreationFee = await poolManager.poolCreationFee();
        const currentContributionFee = await poolManager.poolContributionFee();
        
        console.log("   Creation fee:", ethers.formatUnits(currentCreationFee, 6), "USDC");
        console.log("   Contribution fee:", ethers.formatUnits(currentContributionFee, 6), "USDC");
        
        // Check admin rights
        const ADMIN_ROLE = await poolManager.ADMIN_ROLE();
        const hasAdminRole = await poolManager.hasRole(ADMIN_ROLE, deployer.address);
        
        if (hasAdminRole) {
            console.log("\n🔄 Restoring to original design values...");
            
            // Restore creation fee to 5 USDC (original anti-spam design)
            const originalCreationFee = ethers.parseUnits("5", 6);
            const creationFeeTx = await poolManager.setPoolCreationFee(originalCreationFee);
            await creationFeeTx.wait();
            console.log("✅ Pool creation fee restored to 5 USDC");
            
            // Restore contribution fee to 1 USDC (original design)
            const originalContributionFee = ethers.parseUnits("1", 6);
            const contributionFeeTx = await poolManager.setPoolContributionFee(originalContributionFee);
            await contributionFeeTx.wait();
            console.log("✅ Pool contribution fee restored to 1 USDC");
            
            // Verify restoration
            const restoredCreationFee = await poolManager.poolCreationFee();
            const restoredContributionFee = await poolManager.poolContributionFee();
            
            console.log("\n📋 Restored Fees (Original Design):");
            console.log("   Creation fee:", ethers.formatUnits(restoredCreationFee, 6), "USDC");
            console.log("   Contribution fee:", ethers.formatUnits(restoredContributionFee, 6), "USDC");
            console.log("   Minimum contribution: 1.0 USDC (hardcoded)");
            
            const totalMinimum = Number(ethers.formatUnits(restoredCreationFee, 6)) + 
                               Number(ethers.formatUnits(restoredContributionFee, 6)) + 1.0;
            console.log("   TOTAL MINIMUM NEEDED:", totalMinimum, "USDC");
            
            console.log("\n💡 Why This Design is Smart:");
            console.log("   • 5 USDC creation fee prevents spam pools");
            console.log("   • Higher barrier ensures serious engagement");
            console.log("   • Quality control - only committed users participate");
            console.log("   • Economic alignment - skin in the game");
            
            // Check user balance vs requirements
            const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
            const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
            const userBalance = await usdcToken.balanceOf(deployer.address);
            const userBalanceFormatted = Number(ethers.formatUnits(userBalance, 6));
            
            console.log("\n💰 User Balance Check:");
            console.log("   Current balance:", userBalanceFormatted, "USDC");
            console.log("   Required for pool:", totalMinimum, "USDC");
            console.log("   Can create pool:", userBalanceFormatted >= totalMinimum ? "✅" : "❌");
            
            if (userBalanceFormatted < totalMinimum) {
                console.log("\n💡 Options for Testing:");
                console.log("   1. Get more testnet USDC from faucet");
                console.log("   2. Test with a different wallet that has more USDC");
                console.log("   3. For development only: temporarily reduce fees");
                console.log("   4. Focus on frontend validation first");
                
                console.log("\n🔗 Base Sepolia USDC Faucets:");
                console.log("   • Check Base Discord for faucet links");
                console.log("   • Use testnet bridges from other chains");
                console.log("   • Request from Base community");
            }
            
        } else {
            console.log("❌ No admin rights to restore fees");
        }
        
        console.log("\n✅ ORIGINAL DESIGN RESTORED");
        console.log("Your anti-spam fee structure is back in place!");
        
    } catch (error) {
        console.error("❌ Fee restoration failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });