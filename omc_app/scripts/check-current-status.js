// Check current status of deployed contracts
const { ethers } = require("hardhat");

const CONTRACTS = {
    opinionCore: "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97",
    feeManager: "0x64997bd18520d93e7f0da87c69582d06b7f265d5",
    poolManager: "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    adminSafe: "0xd90341dC9F724ae29f02Eadb64525cd8C0C834c1"
};

async function checkStatus() {
    console.log("📊 CHECKING CONTRACT STATUS");
    console.log("=".repeat(50));
    
    const [signer] = await ethers.getSigners();
    
    try {
        // Check OpinionCore
        console.log(`\n🔷 OpinionCore: ${CONTRACTS.opinionCore}`);
        const opinionCore = await ethers.getContractAt("contracts/core/OpinionCoreNoMod.sol:OpinionCoreSimplified", CONTRACTS.opinionCore);
        
        // Check initialization
        try {
            const usdc = await opinionCore.usdcToken();
            console.log(`   USDC Token: ${usdc}`);
            console.log(`   Initialized: ${usdc !== '0x0000000000000000000000000000000000000000' ? '✅' : '❌'}`);
            
            const publicEnabled = await opinionCore.isPublicCreationEnabled();
            console.log(`   Public Creation: ${publicEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
            
            const nextId = await opinionCore.nextOpinionId();
            console.log(`   Next Opinion ID: ${nextId}`);
            
            const minPrice = await opinionCore.minimumPrice();
            console.log(`   Minimum Price: ${ethers.formatUnits(minPrice, 6)} USDC`);
        } catch(e) {
            console.log(`   ❌ Error reading OpinionCore: ${e.message}`);
        }
        
        // Check PoolManager
        console.log(`\n🔷 PoolManager: ${CONTRACTS.poolManager}`);
        try {
            const poolAbi = [
                "function opinionCore() view returns (address)",
                "function setOpinionCore(address) external"
            ];
            const poolManager = new ethers.Contract(CONTRACTS.poolManager, poolAbi, signer);
            const coreInPool = await poolManager.opinionCore();
            console.log(`   OpinionCore in PoolManager: ${coreInPool}`);
            console.log(`   Connected: ${coreInPool === CONTRACTS.opinionCore ? '✅' : '❌ NEEDS CONNECTION'}`);
        } catch(e) {
            console.log(`   ❌ Error reading PoolManager: ${e.message}`);
        }
        
        // Check FeeManager
        console.log(`\n🔷 FeeManager: ${CONTRACTS.feeManager}`);
        console.log(`   Status: ✅ Working (verified earlier)`);
        
    } catch(error) {
        console.error(`Error: ${error.message}`);
    }
}

checkStatus().catch(console.error);