// Check what address the private key generates
const { ethers } = require("ethers");

async function checkPrivateKey() {
    // Private key from .env (already exposed in output)
    const privateKey = "0x76978c950c2cd68f20a4ad08e7921bf0130e2e078a8a1d70956f989a624b2f01";
    
    console.log("🔍 CHECKING PRIVATE KEY");
    console.log("=".repeat(50));
    
    try {
        const wallet = new ethers.Wallet(privateKey);
        console.log(`\n🔷 Private key generates address: ${wallet.address}`);
        
        const expectedDeployer = "0x3E41d4F16Ccee680DBD4eAC54dE7Cc2E3D0cA1E3";
        console.log(`   Is deployer address: ${wallet.address === expectedDeployer ? '✅' : '❌'}`);
        
        // Check other potential addresses
        console.log(`\n🔷 Checking other accounts from same seed:`);
        console.log(`   Note: If you used a mnemonic/seed phrase,`);
        console.log(`   the Safe signer might be a different derivation path`);
        console.log(`   Common paths:`);
        console.log(`   - m/44'/60'/0'/0/0 (default)`);
        console.log(`   - m/44'/60'/0'/0/1 (second account)`);
        console.log(`   - m/44'/60'/0'/0/2 (third account)`);
        console.log(`   etc.`);
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

checkPrivateKey().catch(console.error);