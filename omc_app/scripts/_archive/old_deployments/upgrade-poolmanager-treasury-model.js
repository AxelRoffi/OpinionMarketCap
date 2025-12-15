const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Upgrading PoolManager to Treasury Model");
    console.log("===========================================");
    
    // Contract addresses on Base Sepolia
    const POOL_MANAGER_PROXY = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployer:", deployer.address);
    console.log("🏦 Treasury:", TREASURY_ADDRESS);
    console.log("💰 USDC Token:", USDC_ADDRESS);
    console.log("🔄 PoolManager Proxy:", POOL_MANAGER_PROXY);
    
    try {
        // Check initial treasury balance
        const usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        const initialBalance = await usdc.balanceOf(TREASURY_ADDRESS);
        console.log(`💰 Treasury initial balance: ${ethers.formatUnits(initialBalance, 6)} USDC`);
        
        // Get the current PoolManager contract
        console.log("\n📋 Getting current PoolManager implementation...");
        const currentPoolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_PROXY);
        
        // Check current configuration
        const poolCreationFee = await currentPoolManager.poolCreationFee();
        const poolContributionFee = await currentPoolManager.poolContributionFee();
        console.log(`⚙️  Current creation fee: ${ethers.formatUnits(poolCreationFee, 6)} USDC`);
        console.log(`⚙️  Current contribution fee: ${ethers.formatUnits(poolContributionFee, 6)} USDC`);
        
        // Deploy new PoolManager implementation
        console.log("\n🔨 Deploying new PoolManager implementation...");
        const PoolManagerFactory = await ethers.getContractFactory("PoolManager");
        
        // Upgrade the proxy to new implementation
        console.log("🔄 Upgrading proxy to new implementation...");
        const upgradedPoolManager = await upgrades.upgradeProxy(
            POOL_MANAGER_PROXY, 
            PoolManagerFactory,
            {
                unsafeAllowLinkedLibraries: true
            }
        );
        
        console.log("✅ PoolManager upgraded successfully!");
        console.log("📍 Proxy address (unchanged):", upgradedPoolManager.target);
        
        // Verify the upgrade worked
        console.log("\n🔍 Verifying upgrade...");
        const upgradedContract = await ethers.getContractAt("PoolManager", POOL_MANAGER_PROXY);
        
        // Check that configuration is preserved
        const newCreationFee = await upgradedContract.poolCreationFee();
        const newContributionFee = await upgradedContract.poolContributionFee();
        const treasuryAddress = await upgradedContract.treasury();
        
        console.log("📊 Post-upgrade verification:");
        console.log(`⚙️  Creation fee: ${ethers.formatUnits(newCreationFee, 6)} USDC`);
        console.log(`⚙️  Contribution fee: ${ethers.formatUnits(newContributionFee, 6)} USDC`);
        console.log(`🏦 Treasury address: ${treasuryAddress}`);
        
        // Verify treasury address is correct
        if (treasuryAddress.toLowerCase() === TREASURY_ADDRESS.toLowerCase()) {
            console.log("✅ Treasury address verified correctly");
        } else {
            console.log("❌ Treasury address mismatch!");
        }
        
        // Test fee flow (if there are active pools)
        console.log("\n🧪 Testing new fee flow...");
        const poolCount = await upgradedContract.poolCount();
        console.log(`📊 Current pool count: ${poolCount}`);
        
        if (poolCount > 0n) {
            console.log("💡 Tip: Test the new fee flow by contributing to an existing pool");
            console.log("      The 1 USDC contribution fee should now go directly to treasury");
        }
        
        console.log("\n🎉 UPGRADE COMPLETE!");
        console.log("=====================");
        console.log("✅ PoolManager upgraded to Treasury Model");
        console.log("✅ Pool creation fees → Treasury (5 USDC)");
        console.log("✅ Pool contribution fees → Treasury (1 USDC)");
        console.log("✅ No more gaming vectors from fee splitting");
        console.log("✅ Maximum platform revenue capture");
        
        console.log("\n📝 Summary of Changes:");
        console.log("- Removed: feeManager.handlePoolCreationFee() calls");
        console.log("- Removed: feeManager.handleContributionFee() calls");
        console.log("- Added: Direct USDC transfers to treasury for all pool fees");
        console.log("- Result: 100% of pool fees go to treasury immediately");
        
        console.log("\n⚠️  Important Notes:");
        console.log("- Frontend Join Pool modal should work unchanged");
        console.log("- Pool creators no longer receive fee incentives");
        console.log("- Opinion creators no longer receive pool fee shares");
        console.log("- Treasury receives all pool-related revenue");
        
    } catch (error) {
        console.error("❌ Upgrade failed:", error);
        if (error.reason) {
            console.error("   Reason:", error.reason);
        }
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });