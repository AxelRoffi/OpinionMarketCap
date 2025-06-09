const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Starting OpinionMarketCap V1 Deployment on Base Sepolia...");
    
    // ===== CONFIGURATION =====
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    const ADMIN_ADDRESS = deployer.address; // Use deployer as admin initially
    
    console.log("📝 Deployment Configuration:");
    console.log("- USDC Token:", USDC_ADDRESS);
    console.log("- Treasury:", TREASURY_ADDRESS);
    console.log("- Admin/Deployer:", ADMIN_ADDRESS);
    console.log("- Network:", (await ethers.provider.getNetwork()).name);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("- Deployer Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.01")) {
        throw new Error("❌ Insufficient balance! Need at least 0.01 ETH for deployment");
    }
    
    // ===== STEP 1: DEPLOY FEEMANAGER =====
    console.log("\n📦 Step 1: Deploying FeeManager...");
    const FeeManager = await ethers.getContractFactory("FeeManager");
    const feeManager = await FeeManager.deploy();
    await feeManager.waitForDeployment();
    
    const feeManagerAddress = await feeManager.getAddress();
    console.log("✅ FeeManager deployed at:", feeManagerAddress);
    
    // Initialize FeeManager
    console.log("🔧 Initializing FeeManager...");
    const initTx1 = await feeManager.initialize(USDC_ADDRESS, TREASURY_ADDRESS);
    await initTx1.wait();
    console.log("✅ FeeManager initialized");
    
    // ===== STEP 2: DEPLOY OPINIONCORE (with treasury trick) =====
    console.log("\n📦 Step 2: Deploying OpinionCore...");
    const OpinionCore = await ethers.getContractFactory("OpinionCore");
    const opinionCore = await OpinionCore.deploy();
    await opinionCore.waitForDeployment();
    
    const opinionCoreAddress = await opinionCore.getAddress();
    console.log("✅ OpinionCore deployed at:", opinionCoreAddress);
    
    // Initialize OpinionCore with treasury as temp poolManager
    console.log("🔧 Initializing OpinionCore (treasury as temp poolManager)...");
    const initTx2 = await opinionCore.initialize(
        USDC_ADDRESS,
        feeManagerAddress,
        TREASURY_ADDRESS, // 🎯 TRICK: Treasury as temp poolManager
        TREASURY_ADDRESS
    );
    await initTx2.wait();
    console.log("✅ OpinionCore initialized with temporary poolManager");
    
    // ===== STEP 3: DEPLOY POOLMANAGER =====
    console.log("\n📦 Step 3: Deploying PoolManager...");
    const PoolManager = await ethers.getContractFactory("PoolManager");
    const poolManager = await upgrades.deployProxy(PoolManager, [
        opinionCoreAddress,
        feeManagerAddress,
        USDC_ADDRESS,
        TREASURY_ADDRESS,
        ADMIN_ADDRESS
    ], { 
        initializer: 'initialize',
        kind: 'transparent' 
    });
    await poolManager.waitForDeployment();
    
    const poolManagerAddress = await poolManager.getAddress();
    console.log("✅ PoolManager deployed at:", poolManagerAddress);
    
    // ===== STEP 4: FIX CIRCULAR DEPENDENCY =====
    console.log("\n🔄 Step 4: Fixing circular dependency...");
    const fixTx = await opinionCore.setPoolManager(poolManagerAddress);
    await fixTx.wait();
    console.log("✅ Circular dependency resolved! OpinionCore now points to real PoolManager");
    
    // ===== STEP 5: DEPLOY OPINIONMARKET =====
    console.log("\n📦 Step 5: Deploying OpinionMarket...");
    const OpinionMarket = await ethers.getContractFactory("OpinionMarket");
    const opinionMarket = await upgrades.deployProxy(OpinionMarket, [
        USDC_ADDRESS,
        opinionCoreAddress,
        feeManagerAddress,
        poolManagerAddress,
        TREASURY_ADDRESS
    ], { 
        initializer: 'initialize',
        kind: 'uups' 
    });
    await opinionMarket.waitForDeployment();
    
    const opinionMarketAddress = await opinionMarket.getAddress();
    console.log("✅ OpinionMarket deployed at:", opinionMarketAddress);
    
    // ===== STEP 6: SETUP ROLES AND PERMISSIONS =====
    console.log("\n🔐 Step 6: Setting up roles and permissions...");
    
    // Grant MARKET_CONTRACT_ROLE to OpinionMarket
    console.log("- Granting MARKET_CONTRACT_ROLE to OpinionMarket...");
    const roleTx1 = await opinionCore.grantMarketContractRole(opinionMarketAddress);
    await roleTx1.wait();
    
    // Grant POOL_MANAGER_ROLE to PoolManager
    console.log("- Granting POOL_MANAGER_ROLE to PoolManager...");
    const poolManagerRole = await opinionCore.POOL_MANAGER_ROLE();
    const roleTx2 = await opinionCore.grantRole(poolManagerRole, poolManagerAddress);
    await roleTx2.wait();
    
    // Grant CORE_CONTRACT_ROLE to OpinionCore in FeeManager
    console.log("- Granting CORE_CONTRACT_ROLE to OpinionCore in FeeManager...");
    const roleTx3 = await feeManager.grantCoreContractRole(opinionCoreAddress);
    await roleTx3.wait();
    
    console.log("✅ All roles and permissions configured!");
    
    // ===== STEP 7: VERIFICATION =====
    console.log("\n🧪 Step 7: Deployment verification...");
    
    // Verify poolManager is correctly set
    const currentPoolManager = await opinionCore.poolManager();
    console.log("- PoolManager in OpinionCore:", currentPoolManager);
    console.log("- Expected PoolManager:", poolManagerAddress);
    
    // Verify market role
    const marketRole = await opinionCore.MARKET_CONTRACT_ROLE();
    const hasMarketRole = await opinionCore.hasRole(marketRole, opinionMarketAddress);
    console.log("- OpinionMarket has MARKET_CONTRACT_ROLE:", hasMarketRole);
    
    // Verify treasury
    const treasuryInCore = await opinionCore.treasury();
    const treasuryInFee = await feeManager.treasury();
    console.log("- Treasury in OpinionCore:", treasuryInCore);
    console.log("- Treasury in FeeManager:", treasuryInFee);
    
    // ===== DEPLOYMENT SUMMARY =====
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("📋 CONTRACT ADDRESSES:");
    console.log("- FeeManager:", feeManagerAddress);
    console.log("- OpinionCore:", opinionCoreAddress);
    console.log("- PoolManager:", poolManagerAddress);
    console.log("- OpinionMarket:", opinionMarketAddress);
    console.log("=".repeat(60));
    
    // Verify all systems
    const allGood = (
        currentPoolManager.toLowerCase() === poolManagerAddress.toLowerCase() &&
        hasMarketRole &&
        treasuryInCore.toLowerCase() === TREASURY_ADDRESS.toLowerCase() &&
        treasuryInFee.toLowerCase() === TREASURY_ADDRESS.toLowerCase()
    );
    
    if (allGood) {
        console.log("✅ ALL SYSTEMS VERIFIED - READY FOR PRODUCTION!");
    } else {
        console.log("❌ VERIFICATION FAILED - PLEASE CHECK CONFIGURATION");
    }
    
    // Save addresses for future use
    const deploymentInfo = {
        network: "baseSepolia",
        timestamp: new Date().toISOString(),
        walletAddress: ADMIN_ADDRESS,
        addresses: {
            feeManager: feeManagerAddress,
            opinionCore: opinionCoreAddress,
            poolManager: poolManagerAddress,
            opinionMarket: opinionMarketAddress,
            usdc: USDC_ADDRESS,
            treasury: TREASURY_ADDRESS,
            admin: ADMIN_ADDRESS
        },
        verification: {
            poolManagerSet: currentPoolManager.toLowerCase() === poolManagerAddress.toLowerCase(),
            marketRoleGranted: hasMarketRole,
            treasuryConfigured: treasuryInCore.toLowerCase() === TREASURY_ADDRESS.toLowerCase()
        }
    };
    
    console.log("\n📄 Deployment info saved to deployment-info.json");
    const fs = require('fs');
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    
    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });