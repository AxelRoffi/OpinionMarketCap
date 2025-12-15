const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🏊 DEPLOYING REAL POOLMANAGER CONTRACT");
    console.log("=====================================");
    
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying with account:", deployer.address);
    
    // Contract addresses from existing deployment
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
    const FEE_MANAGER_ADDRESS = "0xc8f879d86266C334eb9699963ca0703aa1189d8F";
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
    
    console.log("🔗 Using existing contracts:");
    console.log("   OpinionCore:", OPINION_CORE_ADDRESS);
    console.log("   FeeManager:", FEE_MANAGER_ADDRESS);
    console.log("   USDC Token:", USDC_ADDRESS);
    console.log("   Treasury:", TREASURY_ADDRESS);
    
    try {
        // 1. Deploy PoolManager as upgradeable proxy
        console.log("\n🚀 Step 1: Deploying PoolManager...");
        
        const PoolManager = await ethers.getContractFactory("PoolManager");
        
        const poolManager = await upgrades.deployProxy(
            PoolManager,
            [
                OPINION_CORE_ADDRESS,
                FEE_MANAGER_ADDRESS,
                USDC_ADDRESS,
                TREASURY_ADDRESS,
                deployer.address  // admin address
            ],
            {
                initializer: 'initialize',
                kind: 'uups'
            }
        );
        
        await poolManager.waitForDeployment();
        const poolManagerAddress = await poolManager.getAddress();
        
        console.log("✅ PoolManager deployed to:", poolManagerAddress);
        
        // 2. Set up roles
        console.log("\n🔐 Step 2: Setting up roles...");
        
        // Grant ADMIN_ROLE to OpinionCore (needed for pool creation)
        const ADMIN_ROLE = await poolManager.ADMIN_ROLE();
        await poolManager.grantRole(ADMIN_ROLE, OPINION_CORE_ADDRESS);
        console.log("✅ Granted ADMIN_ROLE to OpinionCore");
        
        // Grant MODERATOR_ROLE to deployer (for pool management)
        const MODERATOR_ROLE = await poolManager.MODERATOR_ROLE();
        await poolManager.grantRole(MODERATOR_ROLE, deployer.address);
        console.log("✅ Granted MODERATOR_ROLE to deployer");
        
        // 3. Update OpinionCore to use real PoolManager
        console.log("\n🔄 Step 3: Updating OpinionCore...");
        
        const opinionCore = await ethers.getContractAt("OpinionCore", OPINION_CORE_ADDRESS);
        
        // Check current pool manager
        const currentPoolManager = await opinionCore.poolManager();
        console.log("   Current PoolManager:", currentPoolManager);
        console.log("   New PoolManager:", poolManagerAddress);
        
        if (currentPoolManager.toLowerCase() !== poolManagerAddress.toLowerCase()) {
            // Update OpinionCore to use real PoolManager
            await opinionCore.setPoolManager(poolManagerAddress);
            console.log("✅ Updated OpinionCore to use real PoolManager");
        } else {
            console.log("✅ OpinionCore already using correct PoolManager");
        }
        
        // 4. Verify setup
        console.log("\n🔍 Step 4: Verifying setup...");
        
        // Check PoolManager initialization
        const opinionCoreFromPool = await poolManager.opinionCore();
        const feeManagerFromPool = await poolManager.feeManager();
        const usdcFromPool = await poolManager.usdcToken();
        const treasuryFromPool = await poolManager.treasury();
        
        console.log("   PoolManager OpinionCore:", opinionCoreFromPool);
        console.log("   PoolManager FeeManager:", feeManagerFromPool);
        console.log("   PoolManager USDC:", usdcFromPool);
        console.log("   PoolManager Treasury:", treasuryFromPool);
        
        // Check pool count
        const poolCount = await poolManager.poolCount();
        console.log("   Pool Count:", poolCount.toString());
        
        // Check roles
        const hasAdminRole = await poolManager.hasRole(ADMIN_ROLE, OPINION_CORE_ADDRESS);
        const hasModeratorRole = await poolManager.hasRole(MODERATOR_ROLE, deployer.address);
        
        console.log("   OpinionCore has ADMIN_ROLE:", hasAdminRole);
        console.log("   Deployer has MODERATOR_ROLE:", hasModeratorRole);
        
        // 5. Update configuration file
        console.log("\n📝 Step 5: Updating configuration...");
        
        const fs = require('fs');
        const configPath = './deployed-addresses-new-working.json';
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Update pool manager address
        config.contracts.poolManager = poolManagerAddress;
        config.contracts.mockPoolManager = poolManagerAddress; // Replace mock with real
        
        // Add deployment timestamp
        config.poolManagerDeployedAt = new Date().toISOString();
        
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log("✅ Updated configuration file");
        
        // 6. Summary
        console.log("\n🎯 DEPLOYMENT COMPLETE!");
        console.log("=======================");
        console.log("✅ Real PoolManager deployed:", poolManagerAddress);
        console.log("✅ OpinionCore updated to use real PoolManager");
        console.log("✅ Roles configured correctly");
        console.log("✅ Configuration file updated");
        
        console.log("\n📋 Contract Addresses:");
        console.log("   OpinionCore:", OPINION_CORE_ADDRESS);
        console.log("   PoolManager:", poolManagerAddress);
        console.log("   FeeManager:", FEE_MANAGER_ADDRESS);
        console.log("   USDC Token:", USDC_ADDRESS);
        console.log("   Treasury:", TREASURY_ADDRESS);
        
        console.log("\n🔗 BaseScan Links:");
        console.log("   PoolManager: https://sepolia.basescan.org/address/" + poolManagerAddress);
        console.log("   OpinionCore: https://sepolia.basescan.org/address/" + OPINION_CORE_ADDRESS);
        
        console.log("\n✨ Ready for pool creation and management!");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        if (error.data) {
            console.error("   Error data:", error.data);
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