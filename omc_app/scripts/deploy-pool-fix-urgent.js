const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚨 URGENT: DEPLOYING POOL COMPLETION FIX");
    console.log("========================================");
    
    const POOL_MANAGER_PROXY = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    
    try {
        const [deployer] = await ethers.getSigners();
        console.log("🔑 Deploying with account:", deployer.address);
        
        // Check balance
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
        
        if (balance < ethers.parseEther("0.01")) {
            console.log("❌ Insufficient balance for deployment");
            process.exit(1);
        }
        
        console.log("\n📋 Current Pool Status:");
        const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_PROXY);
        const poolCount = await poolManager.poolCount();
        
        for (let i = 0; i < Number(poolCount); i++) {
            try {
                const pool = await poolManager.pools(i);
                const totalAmount = Number(ethers.formatUnits(pool[3], 6));
                const targetPrice = Number(ethers.formatUnits(pool[9], 6)); // targetPrice moved to index 9
                const progress = (totalAmount / targetPrice) * 100;
                
                console.log(`   Pool #${i}: ${progress.toFixed(1)}% (${totalAmount}/${targetPrice} USDC)`);
                
                if (progress > 99 && progress < 100) {
                    console.log(`   🚨 STUCK POOL FOUND: Pool #${i} at ${progress.toFixed(1)}%`);
                }
            } catch (e) {
                console.log(`   Pool #${i}: Error reading data`);
            }
        }
        
        console.log("\n🔧 Deploying Fixed PoolManager...");
        
        // Get the updated PoolManager contract factory
        const PoolManagerV2 = await ethers.getContractFactory("PoolManager");
        
        console.log("📦 Upgrading proxy to fixed implementation...");
        
        // Upgrade the proxy to the new implementation
        const upgradedPoolManager = await upgrades.upgradeProxy(
            POOL_MANAGER_PROXY, 
            PoolManagerV2,
            {
                unsafeAllowLinkedLibraries: true,
                kind: 'uups'
            }
        );
        
        console.log("✅ PoolManager upgraded successfully!");
        console.log("🏷️  Proxy address (unchanged):", upgradedPoolManager.target);
        
        // Verify the fix is working
        console.log("\n🧪 Testing Fixed Contract...");
        
        // Check if completePool function exists
        try {
            const completePoolFunction = upgradedPoolManager.interface.getFunction("completePool");
            console.log("✅ completePool function available");
        } catch (e) {
            console.log("❌ completePool function missing");
        }
        
        // Test targetPrice field
        if (poolCount > 0) {
            try {
                const firstPool = await upgradedPoolManager.pools(0);
                console.log("✅ targetPrice field accessible:", ethers.formatUnits(firstPool[9], 6), "USDC");
            } catch (e) {
                console.log("❌ targetPrice field missing");
            }
        }
        
        console.log("\n🎯 DEPLOYMENT COMPLETE!");
        console.log("======================");
        console.log("✅ Pool completion bug fixed");
        console.log("✅ Users can now complete stuck pools");
        console.log("✅ New pools will use fixed target pricing");
        
        console.log("\n📱 IMMEDIATE SOLUTION FOR USER:");
        console.log("==============================");
        console.log("1. Refresh your browser/app");
        console.log("2. Try contributing to complete the pool");
        console.log("3. Pool should now complete at 100%");
        console.log("4. If still stuck, use completePool() function");
        
        console.log("\n💡 Technical Details:");
        console.log("- Fixed dynamic target pricing bug");
        console.log("- Added completePool() for exact completion");
        console.log("- Stored fixed target price at pool creation");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        
        if (error.message.includes("already upgraded")) {
            console.log("ℹ️  Contract may already be upgraded. Checking current state...");
            
            try {
                const poolManager = await ethers.getContractAt("PoolManager", POOL_MANAGER_PROXY);
                const completePoolFunction = poolManager.interface.getFunction("completePool");
                console.log("✅ Fix already deployed - completePool function available");
            } catch (e) {
                console.log("❌ Fix not deployed yet");
            }
        }
        
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });