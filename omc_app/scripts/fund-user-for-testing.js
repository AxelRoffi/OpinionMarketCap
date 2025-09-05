const { ethers } = require("hardhat");

async function main() {
    console.log("💰 FUNDING USER FOR POOL TESTING");
    console.log("=================================");
    
    const [deployer] = await ethers.getSigners();
    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    // Connect to USDC contract
    const usdcToken = await ethers.getContractAt("IERC20", USDC_ADDRESS);
    
    console.log("📋 Current Status:");
    console.log("   Deployer:", deployer.address);
    
    const currentBalance = await usdcToken.balanceOf(deployer.address);
    console.log("   Current USDC balance:", ethers.formatUnits(currentBalance, 6), "USDC");
    
    // Check if there's a USDC faucet or minting function
    try {
        // Try to get more USDC from the contract (if it's a test token)
        console.log("\n🔍 Checking USDC contract functions...");
        
        // Check if contract has mint function (for testnet USDC)
        const contractCode = await ethers.provider.getCode(USDC_ADDRESS);
        console.log("   USDC contract code length:", contractCode.length);
        
        // Get contract owner to see if we can mint
        try {
            const owner = await usdcToken.owner();
            console.log("   USDC owner:", owner);
            console.log("   We are owner:", owner.toLowerCase() === deployer.address.toLowerCase());
            
            if (owner.toLowerCase() === deployer.address.toLowerCase()) {
                console.log("\n💰 Attempting to mint more USDC...");
                
                const mintAmount = ethers.parseUnits("20", 6); // 20 USDC
                const mintTx = await usdcToken.mint(deployer.address, mintAmount);
                await mintTx.wait();
                
                const newBalance = await usdcToken.balanceOf(deployer.address);
                console.log("✅ Minted USDC successfully!");
                console.log("   New balance:", ethers.formatUnits(newBalance, 6), "USDC");
            }
            
        } catch (ownerError) {
            console.log("   No owner function or not mintable");
        }
        
        // Alternative: Check if there's a faucet function
        try {
            const faucetTx = await usdcToken.faucet();
            await faucetTx.wait();
            console.log("✅ Faucet called successfully!");
            
            const newBalance = await usdcToken.balanceOf(deployer.address);
            console.log("   New balance:", ethers.formatUnits(newBalance, 6), "USDC");
            
        } catch (faucetError) {
            console.log("   No faucet function available");
        }
        
    } catch (error) {
        console.log("❌ Could not get more USDC:", error.message.slice(0, 100));
    }
    
    console.log("\n📋 FINAL STATUS:");
    const finalBalance = await usdcToken.balanceOf(deployer.address);
    console.log("   Final USDC balance:", ethers.formatUnits(finalBalance, 6), "USDC");
    
    const MINIMUM_NEEDED = 6.1; // 5 creation + 1 contribution + 0.1 minimum
    const hasEnough = Number(ethers.formatUnits(finalBalance, 6)) >= MINIMUM_NEEDED;
    
    console.log("   Minimum needed:", MINIMUM_NEEDED, "USDC");
    console.log("   Has enough for pool:", hasEnough ? "✅" : "❌");
    
    if (hasEnough) {
        console.log("\n🎯 USER IS READY FOR POOL CREATION!");
        console.log("   Try creating a pool with:");
        console.log("   - Contribution: 0.1 to 1.0 USDC");
        console.log("   - Deadline: At least 2 days from now");
        console.log("   - Total cost will be: contribution + 6 USDC fees");
    } else {
        console.log("\n❌ STILL INSUFFICIENT FUNDS");
        console.log("   Need to find another way to get testnet USDC");
        console.log("   Options:");
        console.log("   1. Use a Base Sepolia USDC faucet");
        console.log("   2. Reduce pool creation fees in contract");
        console.log("   3. Deploy a test USDC contract with minting");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });