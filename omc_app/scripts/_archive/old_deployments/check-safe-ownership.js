// Check Safe ownership and control
const { ethers } = require("hardhat");

async function checkSafeOwnership() {
    const ADMIN_SAFE = "0xd90341dC9F724ae29f02Eadb64525cd8C0C834c1";
    const DEPLOYER = "0x3E41d4F16Ccee680DBD4eAC54dE7Cc2E3D0cA1E3";
    
    console.log("🔍 CHECKING SAFE OWNERSHIP");
    console.log("=".repeat(50));
    
    const [signer] = await ethers.getSigners();
    
    // Gnosis Safe ABI for basic functions
    const safeABI = [
        "function getOwners() view returns (address[])",
        "function getThreshold() view returns (uint256)",
        "function isOwner(address owner) view returns (bool)"
    ];
    
    try {
        const safe = new ethers.Contract(ADMIN_SAFE, safeABI, signer);
        
        console.log(`\n🔷 Safe Address: ${ADMIN_SAFE}`);
        
        const owners = await safe.getOwners();
        const threshold = await safe.getThreshold();
        
        console.log(`   Threshold: ${threshold}/${owners.length}`);
        console.log(`   Owners:`);
        
        for (let i = 0; i < owners.length; i++) {
            const owner = owners[i];
            console.log(`     ${i + 1}. ${owner}`);
            
            // Check if this is the deployer
            if (owner.toLowerCase() === DEPLOYER.toLowerCase()) {
                console.log(`        ✅ This is your deployer address!`);
            }
            
            // Check if this is a common address you might have
            if (owner.toLowerCase() === signer.address.toLowerCase()) {
                console.log(`        ✅ This is your current signer!`);
            }
        }
        
        // Check if deployer is an owner
        const deployerIsOwner = await safe.isOwner(DEPLOYER);
        console.log(`\n   Deployer (${DEPLOYER}) is owner: ${deployerIsOwner ? '✅' : '❌'}`);
        
        // Check current signer
        const currentIsOwner = await safe.isOwner(signer.address);
        console.log(`   Current signer (${signer.address}) is owner: ${currentIsOwner ? '✅' : '❌'}`);
        
        console.log(`\n🔷 Recovery Options:`);
        
        if (deployerIsOwner) {
            console.log(`   1. ✅ Use deployer address to control Safe`);
        } else if (currentIsOwner) {
            console.log(`   1. ✅ Use current signer to control Safe`);
        } else {
            console.log(`   1. ❌ Need to find one of the owner addresses`);
            console.log(`   2. 🔧 Check if you have any of these addresses in:`);
            console.log(`      - MetaMask wallets`);
            console.log(`      - Hardware wallets`);
            console.log(`      - Other browser profiles`);
            console.log(`      - Mobile wallets`);
        }
        
    } catch (error) {
        console.log(`❌ Error checking Safe: ${error.message}`);
        console.log(`\nThis might mean:`);
        console.log(`1. The address is not a Gnosis Safe`);
        console.log(`2. The Safe has a different ABI`);
        console.log(`3. Network connection issues`);
    }
}

checkSafeOwnership().catch(console.error);