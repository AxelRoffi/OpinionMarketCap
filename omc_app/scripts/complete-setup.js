// Complete the setup
const { ethers } = require("hardhat");

async function completeSetup() {
    const OPINION_CORE = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";
    const POOL_MANAGER = "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259";
    const ADMIN_SAFE = "0xd90341dC9F724ae29f02Eadb64525cd8C0C834c1";
    
    console.log("🔧 COMPLETING SETUP");
    console.log("=".repeat(50));
    
    const [deployer] = await ethers.getSigners();
    
    // Enable public creation
    console.log("\n🔷 Enabling public creation...");
    const coreABI = [
        "function togglePublicCreation() external",
        "function isPublicCreationEnabled() view returns (bool)",
        "function grantRole(bytes32,address) external", 
        "function ADMIN_ROLE() view returns (bytes32)",
        "function POOL_MANAGER_ROLE() view returns (bytes32)"
    ];
    const core = new ethers.Contract(OPINION_CORE, coreABI, deployer);
    
    const isPublic = await core.isPublicCreationEnabled();
    if (!isPublic) {
        await core.togglePublicCreation();
        console.log("   ✅ Public creation enabled!");
    } else {
        console.log("   ⚠️  Already enabled");
    }
    
    // Grant roles
    console.log("\n🔷 Granting roles...");
    const ADMIN_ROLE = await core.ADMIN_ROLE();
    const POOL_MANAGER_ROLE = await core.POOL_MANAGER_ROLE();
    
    try {
        await core.grantRole(ADMIN_ROLE, ADMIN_SAFE);
        console.log("   ✅ Admin Safe has ADMIN_ROLE");
    } catch (e) {
        console.log("   ⚠️  Admin role already granted");
    }
    
    try {
        await core.grantRole(POOL_MANAGER_ROLE, POOL_MANAGER);
        console.log("   ✅ PoolManager has POOL_MANAGER_ROLE");
    } catch (e) {
        console.log("   ⚠️  PoolManager role already granted");
    }
    
    // Connect PoolManager
    console.log("\n🔷 Connecting PoolManager...");
    const poolABI = ["function setOpinionCore(address) external"];
    const pool = new ethers.Contract(POOL_MANAGER, poolABI, deployer);
    
    try {
        await pool.setOpinionCore(OPINION_CORE);
        console.log("   ✅ PoolManager connected!");
    } catch (e) {
        console.log("   ⚠️  PoolManager already connected or failed");
    }
    
    console.log("\n🎉 SETUP COMPLETE!");
}

completeSetup()
    .then(() => {
        console.log("\n✅ Done!");
        process.exit(0);
    })
    .catch((error) => {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    });