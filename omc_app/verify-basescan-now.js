const { run } = require("hardhat");

async function main() {
    console.log("🔧 Verifying OpinionCoreSimplified on BaseScan...\n");
    
    const CONTRACT_ADDRESS = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";
    const PRICE_CALCULATOR = "0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7";
    
    try {
        // First attempt - with full contract path
        console.log("📤 Attempting verification with full contract path...");
        await run("verify:verify", {
            address: CONTRACT_ADDRESS,
            contract: "contracts/core/OpinionCoreNoMod.sol:OpinionCoreSimplified",
            libraries: {
                PriceCalculator: PRICE_CALCULATOR
            },
            // Force verification even if already done
            force: true,
            // These parameters match your deployment
            constructorArguments: [],
        });
        
        console.log("✅ Verification successful!");
        console.log(`📋 View at: https://basescan.org/address/${CONTRACT_ADDRESS}#code`);
        
    } catch (error) {
        console.log("⚠️  First attempt failed, trying alternative approach...\n");
        
        try {
            // Second attempt - let hardhat figure out the contract
            await run("verify:verify", {
                address: CONTRACT_ADDRESS,
                constructorArguments: [],
                libraries: {
                    PriceCalculator: PRICE_CALCULATOR
                },
                force: true
            });
            
            console.log("✅ Verification successful with auto-detection!");
            
        } catch (error2) {
            console.error("❌ Verification failed:", error2.message);
            
            // If it's already verified on Sourcify but not BaseScan
            if (error2.message.includes("already been verified")) {
                console.log("\n📝 Contract is verified on Sourcify but not BaseScan.");
                console.log("Try these manual steps:");
                console.log("\n1. Go to: https://basescan.org/verifyContract");
                console.log("2. Enter contract address:", CONTRACT_ADDRESS);
                console.log("3. Select 'Via Sourcify' option if available");
                console.log("4. Or use 'Import from Sourcify' if that option exists");
            }
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });