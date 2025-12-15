const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Fixing Pool Manager Role Issue...");
    
    const OPINION_CORE_ADDRESS = "0xB2D35055550e2D49E5b2C21298528579A8bF7D2f";
    const POOL_MANAGER_ADDRESS = "0x3B4584e690109484059D95d7904dD9fEbA246612";
    
    // Get signer (deployer)
    const [deployer] = await ethers.getSigners();
    console.log("🔍 Working with address:", deployer.address);
    
    // Connect to deployed contract directly using minimal ABI
    const opinionCoreABI = [
        "function hasRole(bytes32 role, address account) view returns (bool)",
        "function grantRole(bytes32 role, address account)",
        "function POOL_MANAGER_ROLE() view returns (bytes32)",
        "function ADMIN_ROLE() view returns (bytes32)"
    ];
    const opinionCore = new ethers.Contract(OPINION_CORE_ADDRESS, opinionCoreABI, deployer);
    
    try {
        // Check current role status
        const POOL_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("POOL_MANAGER_ROLE"));
        console.log("Pool Manager Role:", POOL_MANAGER_ROLE);
        
        const hasRole = await opinionCore.hasRole(POOL_MANAGER_ROLE, POOL_MANAGER_ADDRESS);
        console.log("\\n📊 Current Role Status:");
        console.log("PoolManager has POOL_MANAGER_ROLE:", hasRole);
        
        if (!hasRole) {
            console.log("\\n🚀 Granting POOL_MANAGER_ROLE to PoolManager...");
            const grantTx = await opinionCore.grantRole(POOL_MANAGER_ROLE, POOL_MANAGER_ADDRESS);
            console.log("Grant transaction:", grantTx.hash);
            
            await grantTx.wait();
            console.log("✅ Role granted successfully!");
            
            // Verify the role was granted
            const hasRoleAfter = await opinionCore.hasRole(POOL_MANAGER_ROLE, POOL_MANAGER_ADDRESS);
            console.log("Verification - PoolManager has role:", hasRoleAfter);
        } else {
            console.log("✅ PoolManager already has the required role!");
        }
        
        // Also check if deployer has admin role to grant permissions
        const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
        const deployerHasAdmin = await opinionCore.hasRole(ADMIN_ROLE, deployer.address);
        console.log("\\n🔑 Permission Check:");
        console.log("Deployer has ADMIN_ROLE:", deployerHasAdmin);
        
        // Check DEFAULT_ADMIN_ROLE as fallback
        const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
        const deployerHasDefaultAdmin = await opinionCore.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
        console.log("Deployer has DEFAULT_ADMIN_ROLE:", deployerHasDefaultAdmin);
        
    } catch (error) {
        console.error("❌ Error fixing role:", error.message);
        throw error;
    }
}

main()
    .then(() => {
        console.log("\\n✅ Pool Manager role fix completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Role fix failed:", error);
        process.exit(1);
    });