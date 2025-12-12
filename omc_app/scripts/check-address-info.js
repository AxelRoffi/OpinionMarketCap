// Check address information
const { ethers } = require("hardhat");

async function checkAddress() {
    const ADMIN_SAFE = ethers.getAddress("0xd90341dC9F724ae29f02Eadb64525cd8C0C834c1");
    
    console.log("🔍 CHECKING ADDRESS INFORMATION");
    console.log("=".repeat(50));
    
    const [signer] = await ethers.getSigners();
    
    try {
        // Check if address exists
        const balance = await ethers.provider.getBalance(ADMIN_SAFE);
        console.log(`\n🔷 Address: ${ADMIN_SAFE}`);
        console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
        
        // Check if it's a contract
        const code = await ethers.provider.getCode(ADMIN_SAFE);
        const isContract = code !== "0x";
        console.log(`   Is Contract: ${isContract ? '✅' : '❌'}`);
        
        if (!isContract) {
            console.log(`\n❌ PROBLEM: This is an EOA, not a Gnosis Safe!`);
            console.log(`\n🔧 SOLUTION OPTIONS:`);
            console.log(`   1. Check if you have access to this EOA (${ADMIN_SAFE})`);
            console.log(`   2. Grant admin rights to your deployer instead`);
            console.log(`   3. Grant admin rights to a new Safe you control`);
        } else {
            console.log(`\n✅ This is a contract (could be a Safe)`);
            
            // Try to detect Safe
            try {
                const safe = new ethers.Contract(ADMIN_SAFE, [
                    "function VERSION() view returns (string)",
                    "function getOwners() view returns (address[])"
                ], signer);
                
                const version = await safe.VERSION();
                console.log(`   Safe Version: ${version}`);
                
                const owners = await safe.getOwners();
                console.log(`   Owners: ${owners.length}`);
                owners.forEach((owner, i) => {
                    console.log(`     ${i + 1}. ${owner}`);
                });
                
            } catch (e) {
                console.log(`   ⚠️  Could not read Safe info: ${e.message.substring(0, 50)}...`);
            }
        }
        
        // Check current deployer admin status
        console.log(`\n🔷 Checking Current Admin Status:`);
        const OPINION_CORE = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";
        const coreABI = [
            "function hasRole(bytes32,address) view returns (bool)",
            "function ADMIN_ROLE() view returns (bytes32)",
            "function DEFAULT_ADMIN_ROLE() view returns (bytes32)"
        ];
        
        const core = new ethers.Contract(OPINION_CORE, coreABI, signer);
        const ADMIN_ROLE = await core.ADMIN_ROLE();
        const DEFAULT_ADMIN_ROLE = await core.DEFAULT_ADMIN_ROLE();
        
        const deployerHasAdmin = await core.hasRole(ADMIN_ROLE, signer.address);
        const deployerHasDefaultAdmin = await core.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
        const safeHasAdmin = await core.hasRole(ADMIN_ROLE, ADMIN_SAFE);
        
        console.log(`   Deployer has ADMIN_ROLE: ${deployerHasAdmin ? '✅' : '❌'}`);
        console.log(`   Deployer has DEFAULT_ADMIN_ROLE: ${deployerHasDefaultAdmin ? '✅' : '❌'}`);
        console.log(`   Safe has ADMIN_ROLE: ${safeHasAdmin ? '✅' : '❌'}`);
        
        if (deployerHasAdmin || deployerHasDefaultAdmin) {
            console.log(`\n🎉 GOOD NEWS: Your deployer still has admin access!`);
            console.log(`   You can manage the contracts directly with your deployer.`);
        } else if (safeHasAdmin && !isContract) {
            console.log(`\n🚨 PROBLEM: Safe has admin rights but Safe is just an EOA`);
            console.log(`   You need to find the private key for ${ADMIN_SAFE}`);
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

checkAddress().catch(console.error);