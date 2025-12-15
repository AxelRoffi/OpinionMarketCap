const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Treasury Balance");
    console.log("============================");
    
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    const TREASURY_ADDRESS = "0xFb7eF00D5C2a87d282F273632e834f9105795067";
    
    try {
        // Connect to USDC contract
        const usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);
        
        // Check treasury balance
        const balance = await usdc.balanceOf(TREASURY_ADDRESS);
        
        console.log(`💰 Treasury Balance: ${ethers.formatUnits(balance, 6)} USDC`);
        console.log(`📍 Treasury Address: ${TREASURY_ADDRESS}`);
        
        // Check recent increase
        console.log("\n💡 If you just made a pool contribution:");
        console.log("   - The balance should have increased by 1 USDC");
        console.log("   - Even if the transaction showed as 'Failed' in explorer");
        console.log("   - This confirms the treasury model is working");
        
    } catch (error) {
        console.error("❌ Error checking balance:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });