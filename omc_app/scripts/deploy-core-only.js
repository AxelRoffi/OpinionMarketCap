// Deploy just OpinionCore using existing PriceCalculator library
const { ethers } = require("hardhat");

const EXISTING_CONTRACTS = {
    priceCalculator: "0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7", // Just deployed
    feeManager: "0x64997bd18520d93e7f0da87c69582d06b7f265d5",
    poolManager: "0xd6f4125e1976c5eee6fc684bdb68d1719ac34259",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    treasury: "0xA81A947CbC8a2441DEDA53687e573e1125F8F08d"
};

async function deployOpinionCore() {
    console.log("🚀 DEPLOY OPINIONCORE ONLY - Using Existing Library");
    console.log("=".repeat(50));
    
    const [deployer] = await ethers.getSigners();
    console.log(`📍 Deployer: ${deployer.address}`);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
    
    console.log(`\n✅ Using PriceCalculator: ${EXISTING_CONTRACTS.priceCalculator}`);
    
    // Deploy OpinionCore with library linking
    console.log(`\n🔷 Deploy OpinionCore (23.397 KB)`);
    const OpinionCore = await ethers.getContractFactory("contracts/core/OpinionCoreNoMod.sol:OpinionCoreSimplified", {
        libraries: {
            PriceCalculator: EXISTING_CONTRACTS.priceCalculator
        }
    });
    
    const opinionCore = await OpinionCore.deploy();
    await opinionCore.waitForDeployment();
    const opinionCoreAddress = await opinionCore.getAddress();
    console.log(`✅ OpinionCore: ${opinionCoreAddress}`);
    
    console.log(`\n🎉 DEPLOYMENT PART 1 COMPLETE!`);
    console.log(`📋 OpinionCore Address: ${opinionCoreAddress}`);
    console.log(`\nNext: Run configuration script to connect everything`);
    
    return opinionCoreAddress;
}

if (require.main === module) {
    deployOpinionCore()
        .then((address) => {
            console.log(`\n✅ SUCCESS: ${address}`);
            process.exit(0);
        })
        .catch((error) => {
            console.error(`\n❌ FAILED: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { deployOpinionCore };