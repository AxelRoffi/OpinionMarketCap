// Direct check of deployed contract
const { ethers } = require("hardhat");

const OPINION_CORE = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";

async function directCheck() {
    console.log("🔍 DIRECT CONTRACT CHECK");
    console.log("=".repeat(50));
    
    const [signer] = await ethers.getSigners();
    
    // Try basic functions that should exist
    const basicABI = [
        "function usdcToken() view returns (address)",
        "function nextOpinionId() view returns (uint256)",
        "function isPublicCreationEnabled() view returns (bool)",
        "function minimumPrice() view returns (uint96)",
        "function initialize(address,address,address,address) external",
        "function togglePublicCreation() external",
        "function setMinimumPrice(uint96) external",
        "function ADMIN_ROLE() view returns (bytes32)"
    ];
    
    const contract = new ethers.Contract(OPINION_CORE, basicABI, signer);
    
    console.log("\n🔷 Reading Contract State:");
    try {
        const usdcToken = await contract.usdcToken();
        console.log(`   USDC Token: ${usdcToken}`);
        console.log(`   Initialized: ${usdcToken !== '0x0000000000000000000000000000000000000000' ? '✅ YES' : '❌ NO'}`);
        
        const nextId = await contract.nextOpinionId();
        console.log(`   Next Opinion ID: ${nextId}`);
        
        const publicEnabled = await contract.isPublicCreationEnabled();
        console.log(`   Public Creation: ${publicEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
        
        const minPrice = await contract.minimumPrice();
        console.log(`   Minimum Price: ${ethers.formatUnits(minPrice, 6)} USDC`);
        
        const adminRole = await contract.ADMIN_ROLE();
        console.log(`   Admin Role: ${adminRole}`);
        
        console.log("\n🔷 What to do:");
        if (usdcToken === '0x0000000000000000000000000000000000000000') {
            console.log("   1. Initialize the contract");
            console.log("   2. Set parameters");
            console.log("   3. Connect PoolManager");
        } else {
            console.log("   Contract is already initialized!");
            console.log("   1. Just set parameters if needed");
            console.log("   2. Connect PoolManager");
            console.log("   3. Enable public creation");
        }
        
    } catch (error) {
        console.log(`\n❌ Error: ${error.message}`);
        console.log("\nThis might mean the contract has a different ABI.");
    }
}

directCheck().catch(console.error);