// Debug PoolManager connection
const { ethers } = require("hardhat");

async function debugConnection() {
    const OPINION_CORE = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";
    const POOL_MANAGER = "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259";
    
    console.log("🔍 DEBUGGING POOL CONNECTION");
    console.log("=".repeat(50));
    
    const [deployer] = await ethers.getSigners();
    
    // Check PoolManager current state
    const poolABI = [
        "function opinionCore() view returns (address)",
        "function setOpinionCore(address) external"
    ];
    const pool = new ethers.Contract(POOL_MANAGER, poolABI, deployer);
    
    const currentCore = await pool.opinionCore();
    console.log(`\n🔷 PoolManager Status:`);
    console.log(`   Current OpinionCore: ${currentCore}`);
    console.log(`   Expected OpinionCore: ${OPINION_CORE}`);
    console.log(`   Connected: ${currentCore === OPINION_CORE ? '✅' : '❌'}`);
    
    if (currentCore !== OPINION_CORE) {
        console.log("\n🔷 Attempting to connect...");
        try {
            const tx = await pool.setOpinionCore(OPINION_CORE);
            await tx.wait();
            console.log("   ✅ Connection successful!");
            
            // Verify
            const newCore = await pool.opinionCore();
            console.log(`   New OpinionCore: ${newCore}`);
            console.log(`   Verified: ${newCore === OPINION_CORE ? '✅' : '❌'}`);
            
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            
            // Check if we have permission
            if (error.message.includes("AccessControl")) {
                console.log("\n🚨 ACCESS CONTROL ISSUE");
                console.log("   The deployer might not have permission to set OpinionCore");
                console.log("   This needs to be done by the PoolManager admin");
            }
        }
    }
}

debugConnection().catch(console.error);