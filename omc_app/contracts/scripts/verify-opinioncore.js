// Verify OpinionCore on BaseScan
const { run } = require("hardhat");

async function verifyContract() {
    const OPINION_CORE = "0xC47bFEc4D53C51bF590beCEA7dC935116E210E97";
    const PRICE_CALCULATOR = "0x2f3ee828ef6D105a3b4B88AA990C9fBF280f12B7";
    
    console.log("🔍 VERIFYING OPINIONCORE ON BASESCAN");
    console.log("=".repeat(50));
    
    try {
        // First, let's try to verify OpinionCore
        console.log("\n🔷 Verifying OpinionCore...");
        console.log(`   Address: ${OPINION_CORE}`);
        console.log(`   Contract: OpinionCoreNoMod (OpinionCoreSimplified)`);
        
        await run("verify:verify", {
            address: OPINION_CORE,
            contract: "contracts/core/OpinionCoreNoMod.sol:OpinionCoreSimplified",
            constructorArguments: [],
            libraries: {
                PriceCalculator: PRICE_CALCULATOR
            }
        });
        
        console.log("   ✅ OpinionCore verified!");
        
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("   ⚠️  Contract already verified");
        } else if (error.message.includes("constructor arguments")) {
            console.log("\n   ❌ Constructor arguments mismatch");
            console.log("   Trying alternative approach...");
            
            // Try without constructor args since it's upgradeable
            try {
                await run("verify:verify", {
                    address: OPINION_CORE,
                    contract: "contracts/core/OpinionCoreNoMod.sol:OpinionCoreSimplified"
                });
                console.log("   ✅ Verified without constructor args!");
            } catch (e) {
                console.log(`   ❌ Error: ${e.message}`);
            }
        } else {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
    
    // Also verify PriceCalculator if needed
    console.log("\n🔷 Verifying PriceCalculator Library...");
    console.log(`   Address: ${PRICE_CALCULATOR}`);
    
    try {
        await run("verify:verify", {
            address: PRICE_CALCULATOR,
            contract: "contracts/core/libraries/PriceCalculator.sol:PriceCalculator",
            constructorArguments: []
        });
        console.log("   ✅ PriceCalculator verified!");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("   ⚠️  Library already verified");
        } else {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
    
    console.log("\n📝 NEXT STEPS:");
    console.log("1. Check BaseScan for verification status");
    console.log("2. If auto-verify fails, use manual verification");
    console.log("3. You'll need to provide:");
    console.log("   - Exact compiler version: 0.8.20");
    console.log("   - Optimization: Yes, runs: 1");
    console.log("   - Contract source code");
    console.log("   - Library addresses");
}

verifyContract()
    .then(() => {
        console.log("\n✅ Verification process completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    });