// Check the mystery Safe signer address
const { ethers } = require("hardhat");

async function checkMysteryAddress() {
    const MYSTERY_ADDRESS = "0x7C91BaE430b526f2913969e306958cF66922426A";
    const OPINION_CORE = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";
    
    console.log("🔍 INVESTIGATING MYSTERY ADDRESS");
    console.log("=".repeat(50));
    
    const [signer] = await ethers.getSigners();
    
    console.log(`\n🔷 Mystery Address: ${MYSTERY_ADDRESS}`);
    
    try {
        // Check basic info
        const balance = await ethers.provider.getBalance(MYSTERY_ADDRESS);
        console.log(`   ETH Balance: ${ethers.formatEther(balance)} ETH`);
        
        // Check if it's a contract
        const code = await ethers.provider.getCode(MYSTERY_ADDRESS);
        const isContract = code !== "0x";
        console.log(`   Is Contract: ${isContract ? '✅' : '❌ EOA'}`);
        
        // Check if it has any admin rights on OpinionCore
        const coreABI = [
            "function hasRole(bytes32,address) view returns (bool)",
            "function ADMIN_ROLE() view returns (bytes32)",
            "function DEFAULT_ADMIN_ROLE() view returns (bytes32)"
        ];
        
        const core = new ethers.Contract(OPINION_CORE, coreABI, signer);
        const ADMIN_ROLE = await core.ADMIN_ROLE();
        const DEFAULT_ADMIN_ROLE = await core.DEFAULT_ADMIN_ROLE();
        
        const hasAdmin = await core.hasRole(ADMIN_ROLE, MYSTERY_ADDRESS);
        const hasDefaultAdmin = await core.hasRole(DEFAULT_ADMIN_ROLE, MYSTERY_ADDRESS);
        
        console.log(`\n🔷 Admin Rights on OpinionCore:`);
        console.log(`   Has ADMIN_ROLE: ${hasAdmin ? '✅' : '❌'}`);
        console.log(`   Has DEFAULT_ADMIN_ROLE: ${hasDefaultAdmin ? '✅' : '❌'}`);
        
        // Check known addresses
        console.log(`\n🔷 Checking Known Addresses:`);
        console.log(`   Is your deployer: ${MYSTERY_ADDRESS.toLowerCase() === signer.address.toLowerCase() ? '✅' : '❌'}`);
        console.log(`   Current signer: ${signer.address}`);
        
        // Search for this address in your files
        console.log(`\n🔷 Possible Sources:`);
        console.log(`   1. Check MetaMask for accounts with this address`);
        console.log(`   2. Check other wallets (Rainbow, Coinbase, etc.)`);
        console.log(`   3. Check hardware wallets (Ledger, Trezor)`);
        console.log(`   4. Check other browser profiles`);
        console.log(`   5. Check seed phrase backups`);
        
        // Check if this address appears in .env
        console.log(`\n🔷 Check your .env file for:`);
        console.log(`   - Private keys that might generate this address`);
        console.log(`   - Mnemonic phrases`);
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

checkMysteryAddress().catch(console.error);